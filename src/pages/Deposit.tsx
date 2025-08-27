import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Copy, Upload, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import usdtQrCode from '@/assets/usdt-qr-code.png';

interface Plan {
  id: string;
  name: string;
  deposit_usd: number;
  payout_per_drop_usd: number;
  drops_count: number;
  total_return_usd: number;
}

interface ConversionRate {
  country_code: string;
  currency: string;
  currency_symbol: string;
  rate_to_usd: number;
}

const Deposit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedPlanId = searchParams.get('plan');

  const [plan, setPlan] = useState<Plan | null>(null);
  const [conversionRates, setConversionRates] = useState<ConversionRate[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [localAmount, setLocalAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Crypto deposit form
  const [txHash, setTxHash] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const usdtAddress = '0x34FEcfBE68b7DC59aebdF42373aac8c9DdEcBd83';

  useEffect(() => {
    loadDepositData();
  }, [selectedPlanId]);

  const loadDepositData = async () => {
    try {
      // Load plan details
      if (selectedPlanId) {
        const { data: planData, error: planError } = await supabase
          .from('plans')
          .select('*')
          .eq('id', selectedPlanId)
          .single();

        if (planError) throw planError;
        setPlan(planData);
      }

      // Load conversion rates
      const { data: ratesData, error: ratesError } = await supabase
        .from('conversion_rates')
        .select('*')
        .order('country_code');

      if (ratesError) throw ratesError;
      setConversionRates(ratesData || []);

    } catch (error) {
      console.error('Error loading deposit data:', error);
      toast.error('Failed to load deposit information');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedRate = () => {
    return conversionRates.find(rate => rate.country_code === selectedCountry);
  };

  const getUSDAmount = () => {
    if (!plan) return 0;
    return plan.deposit_usd / 100; // Convert cents to dollars
  };

  const getLocalAmountFromUSD = () => {
    const rate = getSelectedRate();
    if (!rate) return '';
    const usdAmount = getUSDAmount();
    return (usdAmount * rate.rate_to_usd).toFixed(2);
  };

  const getUSDFromLocal = () => {
    const rate = getSelectedRate();
    if (!rate || !localAmount) return 0;
    return parseFloat(localAmount) / rate.rate_to_usd;
  };

  const handleBasePayment = async () => {
    if (!plan || !selectedCountry) {
      toast.error('Please select a country');
      return;
    }

    setSubmitting(true);
    try {
      // This would call the Base payment API through Edge Function
      // For now, we'll show a placeholder
      toast.info('Base payment integration coming soon!');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCryptoDeposit = async () => {
    if (!plan || !txHash || !screenshot) {
      toast.error('Please provide transaction hash and screenshot');
      return;
    }

    setSubmitting(true);
    try {
      // Upload screenshot to Supabase Storage
      const fileExt = screenshot.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('deposit-screenshots')
        .upload(fileName, screenshot);

      if (uploadError) throw uploadError;

      // Create deposit record
      const { error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: user?.id,
          plan_id: plan.id,
          amount_usd_cents: plan.deposit_usd,
          method: 'crypto_manual',
          status: 'pending',
          tx_hash: txHash,
          screenshot_url: uploadData.path
        });

      if (depositError) throw depositError;

      toast.success('Deposit submitted for verification! You will be notified once approved.');
      navigate('/wallet');

    } catch (error) {
      console.error('Error submitting crypto deposit:', error);
      toast.error('Failed to submit deposit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(usdtAddress);
    toast.success('Address copied to clipboard!');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading deposit information...</div>
        </div>
      </Layout>
    );
  }

  if (!plan) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Plan not found</h2>
            <Button onClick={() => navigate('/plans')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plans
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen bg-background">
        <div className="p-6 pt-12">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/plans')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Make Deposit</h1>
          </div>

          {/* Plan Summary */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle>Investment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-semibold">{plan.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-lg">${getUSDAmount().toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Return</p>
                  <p className="font-semibold">${(plan.payout_per_drop_usd / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Drops</p>
                  <p className="font-semibold">{plan.drops_count} times</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Tabs defaultValue="base" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="base" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Card/Bank
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                USDT (BEP20)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="base" className="mt-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Pay with Card or Bank</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="country">Select Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {conversionRates.map(rate => (
                          <SelectItem key={rate.country_code} value={rate.country_code}>
                            {rate.country_code} - {rate.currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCountry && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>Amount ({getSelectedRate()?.currency}):</span>
                        <span className="font-semibold text-lg">
                          {getSelectedRate()?.currency_symbol}{getLocalAmountFromUSD()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Equivalent USD:</span>
                        <span className="font-semibold">${getUSDAmount().toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Rate: 1 USD = {getSelectedRate()?.rate_to_usd} {getSelectedRate()?.currency}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    variant="primary_gradient"
                    onClick={handleBasePayment}
                    disabled={!selectedCountry || submitting}
                  >
                    {submitting ? 'Processing...' : 'Pay Now'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto" className="mt-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>USDT (BEP20) Deposit</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Send exactly ${getUSDAmount().toFixed(2)} USDT to the address below
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* QR Code */}
                  <div className="text-center">
                    <img 
                      src={usdtQrCode} 
                      alt="USDT BEP20 QR Code" 
                      className="w-48 h-48 mx-auto mb-4 rounded-lg"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <Label>USDT (BEP20) Address</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={usdtAddress}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button size="icon" variant="outline" onClick={copyAddress}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ⚠️ Only send USDT on BNB Chain (BEP20) network
                    </p>
                  </div>

                  {/* Verification Form */}
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="txHash">Transaction Hash</Label>
                      <Input
                        id="txHash"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        placeholder="Enter transaction hash"
                      />
                    </div>

                    <div>
                      <Label htmlFor="screenshot">Upload Screenshot</Label>
                      <Input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a screenshot of your transaction
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      variant="primary_gradient"
                      onClick={handleCryptoDeposit}
                      disabled={!txHash || !screenshot || submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit for Verification'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Deposit;
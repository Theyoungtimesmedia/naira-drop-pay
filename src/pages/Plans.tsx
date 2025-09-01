import { useState, useEffect } from 'react';
import { Lock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

interface Plan {
  id: string;
  name: string;
  deposit_usd: number;
  payout_per_drop_usd: number;
  drops_count: number;
  total_return_usd: number;
  is_locked: boolean;
  sort_order: number;
}

const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load investment plans');
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const formatDecimal = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getReturnPercentage = (deposit: number, totalReturn: number) => {
    return Math.round(((totalReturn - deposit) / deposit) * 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading plans...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="p-6 pt-12">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground mb-2">Investment Plans</h1>
              <div className="bg-info/10 border border-info/20 rounded-lg px-3 py-1">
                <span className="text-sm font-medium text-info">Luno Rise</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Choose a plan and start earning daily returns on your investment
            </p>

            <div className="bg-info/10 border border-info/20 rounded-lg p-4 mt-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <span className="text-info mr-2">💰</span>
                Deposit Instructions
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Earn instant 5% cash back</strong> when you deposit with USDT</li>
                <li>• Only supported network is <strong>USDT BEP20</strong></li>
                <li>• Send USDT BEP20 from any of your wallets to our address</li>
                <li>• Ensure you use the matching network which is <strong>BEP20</strong></li>
                <li>• Minimum deposit is <strong>$5</strong></li>
                <li>• Any deposit(s) made below minimum will not be credited</li>
              </ul>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mt-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <span className="text-warning mr-2">⚡</span>
                Withdrawal Instructions
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Withdrawal time:</strong> 10am - 6pm daily</li>
                <li>• <strong>Minimum withdrawal:</strong> $2</li>
                <li>• <strong>Withdrawal commissions:</strong></li>
                <li className="ml-4">- In Naira: 15%</li>
                <li className="ml-4">- In USD: 8%</li>
                <li>• <strong>Processing time:</strong> 24hrs maximum</li>
                <li>• Please provide correct banking/USDT wallet information</li>
              </ul>
              <div className="mt-3 p-3 bg-primary/10 rounded border border-primary/20">
                <p className="text-sm font-medium">
                  <span className="text-primary">USDT Rate:</span> ₦1,600 per USD
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  We encourage USD deposits to reduce fees (5% bonus vs 15% Naira fee)
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {plans.map((plan) => {
              const returnPercentage = getReturnPercentage(plan.deposit_usd, plan.total_return_usd);
              
              return (
                <Card key={plan.id} className="relative overflow-hidden bg-card border shadow-sm hover:shadow-md transition-all duration-200">
                  {plan.is_locked && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        Coming Soon
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-foreground">{plan.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs bg-primary/10 text-primary border-primary/20">
                          +{returnPercentage}% Return
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Deposit Amount</p>
                        <p className="text-xl font-bold text-foreground">
                          {formatUSD(plan.deposit_usd)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Total Return</p>
                        <p className="text-xl font-bold text-secondary">
                          {formatUSD(plan.total_return_usd)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-2 border-t border-border/50">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Per Drop</p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatDecimal(plan.payout_per_drop_usd)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Total Drops</p>
                        <p className="text-sm font-semibold text-foreground">
                          {plan.drops_count} times
                        </p>
                      </div>
                    </div>

                    <div className="pt-3">
                      <Button
                        className="w-full h-11"
                        variant={plan.is_locked ? "outline" : "default"}
                        size="default"
                        disabled={plan.is_locked}
                        onClick={() => navigate(`/deposit?plan=${plan.id}`)}
                      >
                        {plan.is_locked ? (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Coming Soon
                          </>
                        ) : (
                          <>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Invest Now
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Choose an investment plan that suits your budget</li>
              <li>• Receive daily returns every 22 hours automatically</li>
              <li>• Withdraw your earnings anytime (minimum $2)</li>
              <li>• 8% fee for USD withdrawals, 15% for Naira</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Plans;
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownLeft } from 'lucide-react';
import Layout from '@/components/Layout';

interface WalletData {
  available: number;
  pending: number;
  total_earned: number;
}

const Withdrawal = () => {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      const { data: walletResult, error: walletError } = await supabase
        .from('wallets')
        .select('available_cents, pending_cents, total_earned_cents')
        .eq('user_id', user.id)
        .single();

      if (walletError) throw walletError;

      setWalletData({
        available: walletResult.available_cents,
        pending: walletResult.pending_cents,
        total_earned: walletResult.total_earned_cents
      });
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading withdrawal page...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground mb-2">Withdraw Funds</h1>
              <div className="bg-info/10 border border-info/20 rounded-lg px-3 py-1">
                <span className="text-sm font-medium text-info">Luno Rise</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Withdraw your earnings safely and securely
            </p>
          </div>

          {/* Balance Display */}
          {walletData && (
            <Card className="mb-6 bg-gradient-success text-success-foreground">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <ArrowDownLeft className="mr-2 h-4 w-4" />
                  Available to Withdraw
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {formatUSD(walletData.available)}
                </div>
                <p className="text-sm opacity-90">Ready for withdrawal</p>
              </CardContent>
            </Card>
          )}

          {/* Withdrawal Instructions */}
          <div className="space-y-4">
            <Card className="border-l-4 border-orange-500 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-700 flex items-center">
                  ⚡ Withdrawal Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-orange-600">
                  <li>• <strong>Withdrawal time:</strong> 10am - 6pm daily</li>
                  <li>• <strong>Minimum withdrawal:</strong> $2</li>
                  <li>• <strong>Processing time:</strong> 24hrs maximum</li>
                  <li>• Please provide correct banking/USDT wallet information</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-yellow-500 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-700">
                  💰 Withdrawal Commissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-yellow-600">
                  <li>• <strong>Naira withdrawals:</strong> 15% commission</li>
                  <li>• <strong>USD/USDT withdrawals:</strong> 8% commission</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-green-500 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">
                  📋 Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-green-600">
                  <li>• Double-check your withdrawal details before submitting</li>
                  <li>• We recommend USD deposits to save on fees (5% bonus vs 15% Naira fee)</li>
                  <li>• All withdrawals are processed manually for security</li>
                  <li>• Contact support if you don't receive funds within 24 hours</li>
                </ul>
              </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700">
                <strong>Current USDT Rate:</strong> ₦1,600 per USD
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Rates are updated daily and may vary at the time of processing
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Withdrawal;
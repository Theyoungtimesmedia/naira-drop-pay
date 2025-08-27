import { useState, useEffect } from 'react';
import { Plus, TrendingDown, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

interface WalletData {
  available_cents: number;
  pending_cents: number;
  total_earned_cents: number;
}

interface Transaction {
  id: string;
  type: string;
  amount_cents: number;
  meta: any;
  created_at: string;
}

const Wallet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      // Load wallet data
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (walletError) throw walletError;
      setWallet(walletData);

      // Load recent transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (transactionError) throw transactionError;
      setTransactions(transactionData || []);

    } catch (error) {
      console.error('Error loading wallet:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'income':
      case 'referral':
      case 'welcome_bonus':
        return '+';
      case 'withdrawal':
        return '-';
      default:
        return '';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'income':
      case 'referral':
      case 'welcome_bonus':
        return 'text-secondary';
      case 'withdrawal':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  const isEmpty = wallet?.available_cents === 0 && wallet?.pending_cents === 0 && wallet?.total_earned_cents <= 100;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading wallet...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="p-6 pt-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Wallet</h1>
            <p className="text-muted-foreground">
              Manage your balance and track your earnings
            </p>
          </div>

          {isEmpty ? (
            // Empty state for new users
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start Your Investment Journey</h3>
                <p className="text-muted-foreground mb-6">
                  Make your first deposit and start earning daily returns
                </p>
                <Button 
                  variant="primary_gradient" 
                  size="lg"
                  onClick={() => navigate('/plans')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Make First Deposit
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Balance Cards */}
              <div className="grid gap-6 mb-8">
                <Card className="bg-gradient-success text-secondary-foreground shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Available Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">
                      {wallet ? formatUSD(wallet.available_cents) : '$0.00'}
                    </div>
                    <p className="text-sm opacity-90">Ready to withdraw or reinvest</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-warning text-warning-foreground shadow-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        {wallet ? formatUSD(wallet.pending_cents) : '$0.00'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-info text-info-foreground shadow-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        {wallet ? formatUSD(wallet.total_earned_cents) : '$0.00'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <Button
                  variant="success"
                  className="h-12"
                  onClick={() => navigate('/plans')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
                <Button
                  variant="outline"
                  className="h-12"
                  onClick={() => navigate('/withdraw')}
                  disabled={(wallet?.available_cents || 0) < 200} // min $2
                >
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </div>

              {/* Recent Transactions */}
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/transactions')}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No transactions yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex justify-between items-center py-2">
                          <div>
                            <p className="font-medium capitalize">
                              {transaction.type.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                            {getTransactionIcon(transaction.type)}{formatUSD(Math.abs(transaction.amount_cents))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
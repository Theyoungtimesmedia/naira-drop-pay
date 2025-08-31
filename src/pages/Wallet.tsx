import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Plus, Wallet as WalletIcon, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import WithdrawalModal from '@/components/WithdrawalModal';

interface WalletData {
  available: number;
  pending: number;
  total_earned: number;
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
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      // Load wallet data
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

      // Load recent transactions
      const { data: transactionsResult, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('id, type, amount_cents, meta, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (transactionsError) throw transactionsError;

      setTransactions(transactionsResult || []);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getTransactionIcon = (type: string): string => {
    switch (type) {
      case 'deposit':
      case 'income':
      case 'welcome_bonus':
      case 'referral':
        return '+';
      case 'withdrawal':
      case 'fee':
        return '-';
      default:
        return '';
    }
  };

  const getTransactionColor = (type: string): string => {
    switch (type) {
      case 'deposit':
      case 'income':
      case 'welcome_bonus':
      case 'referral':
        return 'text-success';
      case 'withdrawal':
      case 'fee':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading wallet...</div>
        </div>
      </Layout>
    );
  }

  if (!walletData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-6 space-y-6">
            <div className="text-center py-12">
              <WalletIcon className="h-16 w-16 mx-auto mb-4 text-primary-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">Welcome to Your Wallet</h2>
              <p className="text-primary-foreground/70 mb-6">
                Start your investment journey today and watch your money grow!
              </p>
              <Button
                variant="success"
                size="lg"
                onClick={() => navigate('/plans')}
              >
                <Plus className="mr-2 h-5 w-5" />
                Make Your First Deposit
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Wallet</h1>
              <div className="bg-info/10 border border-info/20 rounded-lg px-3 py-1 mt-2 inline-block">
                <span className="text-sm font-medium text-info">Luno Rise</span>
              </div>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid gap-6">
            <Card className="bg-gradient-success text-success-foreground shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <WalletIcon className="mr-2 h-4 w-4" />
                  Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  {formatUSD(walletData.available)}
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
                    {formatUSD(walletData.pending)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-info text-info-foreground shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {formatUSD(walletData.total_earned)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => navigate('/plans')}
              className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Deposit
            </Button>
            <WithdrawalModal
              isOpen={showWithdrawModal}
              onClose={() => setShowWithdrawModal(false)}
              availableBalance={walletData.available}
              onSuccess={loadWalletData}
            />
            <Button
              variant="primary_gradient"
              onClick={() => setShowWithdrawModal(true)}
              className="w-full"
            >
              Withdraw
            </Button>
          </div>

          {/* Recent Transactions */}
          <Card className="bg-card border-0 shadow-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-card-foreground">Recent Transactions</CardTitle>
                <Link to="/transactions">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium text-card-foreground capitalize">
                          {transaction.type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`font-bold ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}{formatUSD(Math.abs(transaction.amount_cents))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
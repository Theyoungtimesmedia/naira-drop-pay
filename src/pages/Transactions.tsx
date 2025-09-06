import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpRight, ArrowDownLeft, Plus, Minus, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount_cents: number;
  balance_after_cents: number | null;
  reference_id?: string | null;
  meta: any;
  created_at: string;
}

interface TransactionMeta {
  description?: string;
  drop_number?: number;
  income_event_id?: string;
  processed_at_utc?: string;
  withdrawal_id?: string;
  deposit_id?: string;
}

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // Check URL params for initial filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam && ['deposit', 'withdrawal', 'income', 'referral', 'fee'].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadTransactions();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('transaction-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'wallet_transactions',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New transaction:', payload);
            setTransactions(prev => [payload.new as Transaction, ...prev]);
            toast.success('New transaction received!');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('wallet_transactions')
        .select('id, user_id, type, amount_cents, balance_after_cents, meta, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const formatUSD = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case 'income':
        return <Plus className="h-4 w-4 text-success" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case 'fee':
        return <Minus className="h-4 w-4 text-warning" />;
      case 'welcome_bonus':
        return <Plus className="h-4 w-4 text-primary" />;
      case 'referral':
        return <Plus className="h-4 w-4 text-secondary" />;
      default:
        return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'income':
      case 'welcome_bonus':
      case 'referral':
        return 'text-success';
      case 'withdrawal':
        return 'text-destructive';
      case 'fee':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Badge variant="secondary">Deposit</Badge>;
      case 'income':
        return <Badge variant="default">Income</Badge>;
      case 'withdrawal':
        return <Badge variant="destructive">Withdrawal</Badge>;
      case 'fee':
        return <Badge variant="outline">Fee</Badge>;
      case 'welcome_bonus':
        return <Badge variant="secondary">Welcome Bonus</Badge>;
      case 'referral':
        return <Badge variant="secondary">Referral</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getTransactionDescription = (transaction: Transaction): string => {
    const meta: TransactionMeta = transaction.meta || {};
    
    switch (transaction.type) {
      case 'income':
        return `Drop #${meta.drop_number || 'N/A'} - Investment Income`;
      case 'deposit':
        return meta.description || 'Investment Deposit';
      case 'withdrawal':
        return 'Withdrawal Request';
      case 'welcome_bonus':
        return meta.description || 'Welcome Bonus';
      case 'referral':
        return 'Referral Bonus';
      case 'fee':
        return 'Transaction Fee';
      default:
        return meta.description || 'Transaction';
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['Date', 'Type', 'Description', 'Amount', 'Balance After'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        new Date(tx.created_at).toLocaleDateString(),
        tx.type,
        `"${getTransactionDescription(tx)}"`,
        (tx.amount_cents / 100).toFixed(2),
        tx.balance_after_cents ? (tx.balance_after_cents / 100).toFixed(2) : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luno-rise-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Transactions exported successfully');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">Loading transactions...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Transaction History</h1>
              <div className="bg-info/10 border border-info/20 rounded-lg px-3 py-1 mt-2 inline-block">
                <span className="text-sm font-medium text-info">Luno Rise</span>
              </div>
            </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="referral">Referrals</SelectItem>
                <SelectItem value="fee">Fees</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={transactions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* WhatsApp and Telegram Links - Only for active investors */}
        {transactions.some(tx => tx.type === 'income') && (
          <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Join Our Community</h3>
              <p className="text-sm mb-4 text-white/90">
                Connect with other investors in our exclusive groups!
              </p>
              <div className="flex gap-4">
                <a
                  href="https://chat.whatsapp.com/CfVnW6ViF6i37gCw808zli?mode=ems_copy_c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <span className="mr-2">📱</span>
                    Join WhatsApp
                  </Button>
                </a>
                <a
                  href="https://t.me/+ZmRBijE1mCk1YzBk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <span className="mr-2">✈️</span>
                    Join Telegram
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No transactions found</p>
                <p className="text-sm">Your transaction history will appear here once you start investing.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-full">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{getTransactionDescription(transaction)}</h3>
                          {getStatusBadge(transaction.type)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                        {transaction.balance_after_cents && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Balance after: {formatUSD(transaction.balance_after_cents)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'withdrawal' || transaction.type === 'fee' ? '-' : '+'}
                        {formatUSD(Math.abs(transaction.amount_cents))}
                      </p>
                      {transaction.reference_id && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          Ref: {transaction.reference_id.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Real-time indicator */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3 inline mr-1" />
            Real-time updates enabled
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Transactions;
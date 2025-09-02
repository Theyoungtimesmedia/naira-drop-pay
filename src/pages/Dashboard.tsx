import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Bell } from 'lucide-react';
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

interface ProfileData {
  phone: string;
  country: string;
  referral_code: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [nextDrop, setNextDrop] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load wallet data
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (walletError) throw walletError;
      setWallet(walletData);

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('phone, country, referral_code')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load next income drop
      const { data: nextDropData } = await supabase
        .from('income_events')
        .select('due_at')
        .eq('user_id', user?.id)
        .eq('processed_bool', false)
        .order('due_at', { ascending: true })
        .limit(1)
        .single();

      if (nextDropData) {
        setNextDrop(new Date(nextDropData.due_at));
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getTimeUntilDrop = () => {
    if (!nextDrop) return null;
    
    const now = new Date();
    const diff = nextDrop.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  const timeUntilDrop = getTimeUntilDrop();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
          <div className="text-primary-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-primary text-primary-foreground">
        {/* Header */}
        <div className="p-6 pt-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Welcome Back!</h1>
              <p className="text-primary-foreground/80">{profile?.phone || 'Loading...'}</p>
              <p className="text-sm text-primary-foreground/60">{profile?.country}</p>
            </div>
            <div className="text-right">
              <div className="bg-info/10 border border-info/20 rounded-lg px-3 py-1 mb-2">
                <span className="text-sm font-medium text-primary-foreground">Luno Rise</span>
              </div>
              <Button size="icon" variant="ghost" className="text-primary-foreground">
                <Bell className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Next Income Drop Countdown */}
          {timeUntilDrop && (
            <Card className="bg-card/10 border-primary-foreground/20 backdrop-blur-sm mb-6">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">Next Income Drop In:</h3>
                <div className="flex justify-center space-x-4">
                  <div className="bg-primary-foreground/20 rounded-lg p-3 min-w-[60px]">
                    <div className="text-2xl font-bold">{timeUntilDrop.hours}</div>
                    <div className="text-sm">Hours</div>
                  </div>
                  <div className="bg-primary-foreground/20 rounded-lg p-3 min-w-[60px]">
                    <div className="text-2xl font-bold">{timeUntilDrop.minutes}</div>
                    <div className="text-sm">Min</div>
                  </div>
                  <div className="bg-primary-foreground/20 rounded-lg p-3 min-w-[60px]">
                    <div className="text-2xl font-bold">{timeUntilDrop.seconds}</div>
                    <div className="text-sm">Sec</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Balance */}
          <Card className="bg-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Account Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {wallet ? formatUSD(wallet.available_cents) : '$0.00'}
                  </div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {wallet ? formatUSD(wallet.pending_cents) : '$0.00'}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">
                    {wallet ? formatUSD(wallet.total_earned_cents) : '$0.00'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button
                  variant="success"
                  className="w-full"
                  onClick={() => navigate('/plans')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
                <Button
                  variant="warning"
                  className="w-full"
                  onClick={() => navigate('/wallet')}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Referral Section */}
          {profile?.referral_code && (
            <Card className="bg-card border-0 shadow-card mt-6">
              <CardHeader>
                <CardTitle className="text-card-foreground">Invite Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your referral code and earn 20% of their first deposit!
                </p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-muted p-2 rounded text-sm">
                    {profile.referral_code}
                  </code>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(profile.referral_code);
                      toast.success('Referral code copied!');
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
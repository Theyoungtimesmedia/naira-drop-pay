import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

interface ReferralData {
  id: string;
  referred_user_phone: string;
  total_invested: number;
  referral_count: number;
  bonus_earned: number;
  join_date: string;
}

interface TeamStats {
  total_referrals: number;
  total_team_investment: number;
  total_bonus_earned: number;
  active_investors: number;
}

const MyTeam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    total_referrals: 0,
    total_team_investment: 0,
    total_bonus_earned: 0,
    active_investors: 0
  });
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadTeamData();
    }
  }, [user]);

  const loadTeamData = async () => {
    try {
      // Get user profile for referral code
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, full_name')
        .eq('user_id', user?.id)
        .single();
      
      setUserProfile(profile);

      // Get referral data with user details
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_id,
          bonus_cents,
          created_at,
          deposit_id
        `)
        .eq('referrer_id', user?.id);

      if (referralError) throw referralError;

      // Get detailed info for each referral
      const referralDetails: ReferralData[] = [];
      let totalTeamInvestment = 0;
      let totalBonusEarned = 0;
      let activeInvestors = 0;

      for (const referral of referralData || []) {
        // Get referred user profile
        const { data: referredProfile } = await supabase
          .from('profiles')
          .select('phone, created_at')
          .eq('user_id', referral.referred_id)
          .single();

        // Get total deposits for this user
        const { data: deposits } = await supabase
          .from('deposits')
          .select('amount_usd_cents')
          .eq('user_id', referral.referred_id)
          .eq('status', 'confirmed');

        // Get referral count for this user (how many people they referred)
        const { data: theirReferrals } = await supabase
          .from('referrals')
          .select('id')
          .eq('referrer_id', referral.referred_id);

        const totalInvested = deposits?.reduce((sum, d) => sum + d.amount_usd_cents, 0) || 0;
        const hasActiveInvestment = (deposits?.length || 0) > 0;
        
        if (hasActiveInvestment) activeInvestors++;
        totalTeamInvestment += totalInvested;

        referralDetails.push({
          id: referral.id,
          referred_user_phone: referredProfile?.phone ? 
            `${referredProfile.phone.slice(0, 3)}****${referredProfile.phone.slice(-3)}` : 
            'Unknown',
          total_invested: totalInvested,
          referral_count: theirReferrals?.length || 0,
          bonus_earned: referral.bonus_cents,
          join_date: referral.created_at
        });
      }

      // Calculate total bonus earned
      totalBonusEarned = referralData?.reduce((sum, r) => sum + r.bonus_cents, 0) || 0;

      setReferrals(referralDetails);
      setTeamStats({
        total_referrals: referralData?.length || 0,
        total_team_investment: totalTeamInvestment,
        total_bonus_earned: totalBonusEarned,
        active_investors: activeInvestors
      });

    } catch (error) {
      console.error('Error loading team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const copyReferralLink = () => {
    if (userProfile?.referral_code) {
      const referralLink = `${window.location.origin}/auth/register?ref=${userProfile.referral_code}`;
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    }
  };

  const copyReferralCode = () => {
    if (userProfile?.referral_code) {
      navigator.clipboard.writeText(userProfile.referral_code);
      toast.success('Referral code copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Layout showBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading team data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen bg-background">
        <div className="p-6 pt-12">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/profile')} 
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">My Team</h1>
          </div>

          {/* Referral Info */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Invite Friends & Earn 20%
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Share your referral link or code with friends</li>
                  <li>• When they make a deposit, you earn 20% bonus</li>
                  <li>• Bonus is credited immediately to your wallet</li>
                  <li>• No limit on referrals - invite unlimited friends!</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium">Your Referral Link:</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input 
                      value={`${window.location.origin}/auth/register?ref=${userProfile?.referral_code || ''}`}
                      readOnly 
                      className="flex-1 p-2 border rounded text-sm bg-muted"
                    />
                    <Button size="sm" onClick={copyReferralLink}>
                      Copy Link
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Your Referral Code:</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input 
                      value={userProfile?.referral_code || ''}
                      readOnly 
                      className="flex-1 p-2 border rounded text-sm bg-muted font-mono"
                    />
                    <Button size="sm" onClick={copyReferralCode}>
                      Copy Code
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {teamStats.total_referrals}
                </div>
                <div className="text-sm text-muted-foreground">Total Referrals</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">
                  {teamStats.active_investors}
                </div>
                <div className="text-sm text-muted-foreground">Active Investors</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">
                  {formatUSD(teamStats.total_team_investment)}
                </div>
                <div className="text-sm text-muted-foreground">Team Investment</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary">
                  {formatUSD(teamStats.total_bonus_earned)}
                </div>
                <div className="text-sm text-muted-foreground">Bonus Earned</div>
              </CardContent>
            </Card>
          </div>

          {/* Team Members */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-2">No referrals yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start inviting friends to build your team!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referrals.map((referral) => (
                    <div 
                      key={referral.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{referral.referred_user_phone}</span>
                            {referral.total_invested > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Invested:</span>
                              <span className="ml-2 font-medium">
                                {formatUSD(referral.total_invested)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Their Team:</span>
                              <span className="ml-2 font-medium">
                                {referral.referral_count}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground mt-2">
                            Joined: {new Date(referral.join_date).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium text-success">
                            +{formatUSD(referral.bonus_earned)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Bonus Earned
                          </div>
                        </div>
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

export default MyTeam;
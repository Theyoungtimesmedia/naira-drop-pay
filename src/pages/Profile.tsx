import { useState, useEffect } from 'react';
import { Camera, Edit2, LogOut, Copy, Wallet, FileText, Users, CreditCard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { CountrySelector } from '@/components/CountrySelector';

interface Profile {
  phone: string;
  country: string;
  referral_code: string;
}

interface WalletData {
  available_cents: number;
  pending_cents: number;  
  total_earned_cents: number;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('phone, country, referral_code')
        .eq('user_id', user?.id)
        .single();

      if (profileError) {
        // If no profile exists, this shouldn't happen with the trigger, but create one as fallback
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: user?.id,
              phone: user?.user_metadata?.phone || user?.phone || '',
              country: user?.user_metadata?.country || ''
            })
            .select('phone, country, referral_code')
            .single();
          
          if (!createError) {
            setProfile(newProfile);
            return;
          }
        }
        throw profileError;
      }
      setProfile(profileData);

      // Load wallet data
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (walletError) throw walletError;
      setWallet(walletData);

    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: profile.phone,
          country: profile.country,
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully!');
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const formatUSD = (cents: number) => `USDT ${(cents / 100).toFixed(2)}`;

  const getInitials = (phone: string) => {
    return phone ? phone.slice(-2) : 'U';
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast.success('Referral code copied!');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-primary-foreground">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-primary-foreground">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary text-primary-foreground">
      {/* Header */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">Tel: {profile.phone}</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="text-lg font-semibold">ID: TGW001407</div>
          <div className="text-primary-foreground/80">
            Hello, dear User (No VIP Level Yet)
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-white text-gray-900 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-semibold">Recharge Balance</div>
              <div className="text-sm text-gray-600">
                {wallet ? formatUSD(wallet.pending_cents) : 'USDT 0.00'}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white text-gray-900 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-semibold">Withdrawable Balance</div>
              <div className="text-sm text-gray-600">
                {wallet ? formatUSD(wallet.available_cents) : 'USDT 0.00'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Balance */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-semibold">Available Balance</div>
                <div className="text-2xl font-bold">
                  {wallet ? formatUSD(wallet.total_earned_cents) : 'USDT 0.00'}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
                  onClick={() => navigate('/plans')}
                >
                  Recharge
                </Button>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
                  onClick={() => navigate('/wallet')}
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-2 p-4 h-auto text-primary-foreground"
            onClick={() => navigate('/plans')}
          >
            <div className="bg-yellow-500 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs">My Investment</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-2 p-4 h-auto text-primary-foreground"
            onClick={() => navigate('/transactions')}
          >
            <div className="bg-yellow-500 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs">Transaction Details</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-2 p-4 h-auto text-primary-foreground"
          >
            <div className="bg-pink-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs">Online Service</span>
          </Button>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-between bg-white/10 backdrop-blur-sm border-white/20 rounded-xl p-4 h-auto text-primary-foreground"
            onClick={() => navigate('/wallet')}
          >
            <div className="flex items-center space-x-3">
              <Wallet className="h-5 w-5 text-orange-400" />
              <span>My Wallet</span>
            </div>
            <span>→</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between bg-white/10 backdrop-blur-sm border-white/20 rounded-xl p-4 h-auto text-primary-foreground"
            onClick={() => navigate('/transactions?filter=deposit')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-blue-400 rounded"></div>
              <span>Recharge Record</span>
            </div>
            <span>→</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between bg-white/10 backdrop-blur-sm border-white/20 rounded-xl p-4 h-auto text-primary-foreground"
            onClick={() => navigate('/transactions?filter=withdrawal')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-blue-400 rounded-full"></div>
              <span>Withdrawal Record</span>
            </div>
            <span>→</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between bg-white/10 backdrop-blur-sm border-white/20 rounded-xl p-4 h-auto text-primary-foreground"
            onClick={() => navigate('/my-team')}
          >
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-400" />
              <span>My Team</span>
            </div>
            <span>→</span>
          </Button>

          {/* Profile Edit Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl mt-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Profile Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="text-primary-foreground"
                >
                  {isEditMode ? 'Cancel' : <Edit2 className="h-4 w-4" />}
                </Button>
              </div>

              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="text-primary-foreground">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="bg-white/20 border-white/30 text-primary-foreground"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="country" className="text-primary-foreground">Country</Label>
                    <CountrySelector
                      value={profile.country}
                      onValueChange={(country) => setProfile({...profile, country})}
                      disabled={false}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full bg-secondary hover:bg-secondary-dark"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-primary-foreground/80">Phone:</span>
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-foreground/80">Country:</span>
                    <span>{profile.country}</span>
                  </div>
                  {profile.referral_code && (
                    <div className="flex justify-between items-center">
                      <span className="text-primary-foreground/80">Referral Code:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">{profile.referral_code}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={copyReferralCode}
                          className="text-primary-foreground p-1"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            variant="ghost" 
            className="w-full justify-between bg-red-500/20 backdrop-blur-sm border-red-400/30 rounded-xl p-4 h-auto text-red-200 mt-6"
            onClick={handleLogout}
          >
            <div className="flex items-center space-x-3">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </div>
            <span>→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
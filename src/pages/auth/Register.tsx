import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    country: '',
    referralCode: ''
  });

  const countries = [
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'AE', name: 'Dubai (UAE)', flag: '🇦🇪' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: 'OTHER', name: 'Other Countries', flag: '🌍' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Use phone as email for Supabase (since Supabase requires email)
      const email = `${formData.phone}@lunorise.app`;
      
      const { error } = await signUp(email, formData.password, {
        phone: formData.phone,
        country: formData.country,
        referral_code: formData.referralCode
      });

      if (error) {
        toast.error(error.message || 'Registration failed');
        return;
      }

      toast.success('Registration successful! Welcome to Luno Rise!');
      navigate('/profile');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Join Luno Rise and start earning today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="country">Select Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                  required
                >
                  <SelectTrigger className="bg-background z-50">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {countries.map(country => (
                      <SelectItem key={country.code} value={country.code} className="bg-background">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{country.flag}</span>
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+234 800 000 0000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                <Input
                  id="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, referralCode: e.target.value }))}
                  placeholder="Enter referral code"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="primary_gradient"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
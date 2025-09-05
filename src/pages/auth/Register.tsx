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
    { code: 'NG', name: 'Nigeria (+234)', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya (+254)', flag: '🇰🇪' },
    { code: 'UG', name: 'Uganda (+256)', flag: '🇺🇬' },
    { code: 'ZA', name: 'South Africa (+27)', flag: '🇿🇦' },
    { code: 'GH', name: 'Ghana (+233)', flag: '🇬🇭' },
    { code: 'IN', name: 'India (+91)', flag: '🇮🇳' },
    { code: 'AE', name: 'Dubai (+971)', flag: '🇦🇪' },
    { code: 'PH', name: 'Philippines (+63)', flag: '🇵🇭' },
    { code: 'GB', name: 'UK (+44)', flag: '🇬🇧' },
    { code: 'US', name: 'USA (+1)', flag: '🇺🇸' },
    { code: 'JP', name: 'Japan (+81)', flag: '🇯🇵' },
    { code: 'RU', name: 'Russia (+7)', flag: '🇷🇺' },
    { code: 'CN', name: 'China (+86)', flag: '🇨🇳' },
    { code: 'AU', name: 'Australia (+61)', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada (+1)', flag: '🇨🇦' },
    { code: 'DE', name: 'Germany (+49)', flag: '🇩🇪' },
    { code: 'FR', name: 'France (+33)', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy (+39)', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain (+34)', flag: '🇪🇸' },
    { code: 'BR', name: 'Brazil (+55)', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico (+52)', flag: '🇲🇽' },
    { code: 'AR', name: 'Argentina (+54)', flag: '🇦🇷' },
    { code: 'KR', name: 'South Korea (+82)', flag: '🇰🇷' },
    { code: 'OTHER', name: 'Other countries', flag: '🌍' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.phone, formData.password, {
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
                  placeholder="Enter phone number"
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
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
    // Africa
    { code: 'NG', name: 'Nigeria (+234)', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya (+254)', flag: '🇰🇪' },
    { code: 'UG', name: 'Uganda (+256)', flag: '🇺🇬' },
    { code: 'ZA', name: 'South Africa (+27)', flag: '🇿🇦' },
    { code: 'GH', name: 'Ghana (+233)', flag: '🇬🇭' },
    { code: 'EG', name: 'Egypt (+20)', flag: '🇪🇬' },
    { code: 'MA', name: 'Morocco (+212)', flag: '🇲🇦' },
    { code: 'TN', name: 'Tunisia (+216)', flag: '🇹🇳' },
    { code: 'DZ', name: 'Algeria (+213)', flag: '🇩🇿' },
    { code: 'ET', name: 'Ethiopia (+251)', flag: '🇪🇹' },
    { code: 'TZ', name: 'Tanzania (+255)', flag: '🇹🇿' },
    { code: 'RW', name: 'Rwanda (+250)', flag: '🇷🇼' },
    { code: 'SN', name: 'Senegal (+221)', flag: '🇸🇳' },
    { code: 'CI', name: 'Ivory Coast (+225)', flag: '🇨🇮' },
    { code: 'CM', name: 'Cameroon (+237)', flag: '🇨🇲' },
    { code: 'BF', name: 'Burkina Faso (+226)', flag: '🇧🇫' },
    { code: 'ML', name: 'Mali (+223)', flag: '🇲🇱' },
    { code: 'NE', name: 'Niger (+227)', flag: '🇳🇪' },
    { code: 'TD', name: 'Chad (+235)', flag: '🇹🇩' },
    { code: 'ZM', name: 'Zambia (+260)', flag: '🇿🇲' },
    { code: 'ZW', name: 'Zimbabwe (+263)', flag: '🇿🇼' },
    { code: 'MW', name: 'Malawi (+265)', flag: '🇲🇼' },
    { code: 'MZ', name: 'Mozambique (+258)', flag: '🇲🇿' },
    { code: 'BW', name: 'Botswana (+267)', flag: '🇧🇼' },
    { code: 'NA', name: 'Namibia (+264)', flag: '🇳🇦' },
    { code: 'SZ', name: 'Eswatini (+268)', flag: '🇸🇿' },
    { code: 'LS', name: 'Lesotho (+266)', flag: '🇱🇸' },
    { code: 'MG', name: 'Madagascar (+261)', flag: '🇲🇬' },
    { code: 'MU', name: 'Mauritius (+230)', flag: '🇲🇺' },
    { code: 'SC', name: 'Seychelles (+248)', flag: '🇸🇨' },
    
    // Asia
    { code: 'IN', name: 'India (+91)', flag: '🇮🇳' },
    { code: 'CN', name: 'China (+86)', flag: '🇨🇳' },
    { code: 'JP', name: 'Japan (+81)', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea (+82)', flag: '🇰🇷' },
    { code: 'ID', name: 'Indonesia (+62)', flag: '🇮🇩' },
    { code: 'PH', name: 'Philippines (+63)', flag: '🇵🇭' },
    { code: 'TH', name: 'Thailand (+66)', flag: '🇹🇭' },
    { code: 'VN', name: 'Vietnam (+84)', flag: '🇻🇳' },
    { code: 'MY', name: 'Malaysia (+60)', flag: '🇲🇾' },
    { code: 'SG', name: 'Singapore (+65)', flag: '🇸🇬' },
    { code: 'BD', name: 'Bangladesh (+880)', flag: '🇧🇩' },
    { code: 'PK', name: 'Pakistan (+92)', flag: '🇵🇰' },
    { code: 'LK', name: 'Sri Lanka (+94)', flag: '🇱🇰' },
    { code: 'MM', name: 'Myanmar (+95)', flag: '🇲🇲' },
    { code: 'KH', name: 'Cambodia (+855)', flag: '🇰🇭' },
    { code: 'LA', name: 'Laos (+856)', flag: '🇱🇦' },
    { code: 'NP', name: 'Nepal (+977)', flag: '🇳🇵' },
    { code: 'BT', name: 'Bhutan (+975)', flag: '🇧🇹' },
    { code: 'MV', name: 'Maldives (+960)', flag: '🇲🇻' },
    { code: 'AF', name: 'Afghanistan (+93)', flag: '🇦🇫' },
    { code: 'UZ', name: 'Uzbekistan (+998)', flag: '🇺🇿' },
    { code: 'KZ', name: 'Kazakhstan (+7)', flag: '🇰🇿' },
    { code: 'KG', name: 'Kyrgyzstan (+996)', flag: '🇰🇬' },
    { code: 'TJ', name: 'Tajikistan (+992)', flag: '🇹🇯' },
    { code: 'TM', name: 'Turkmenistan (+993)', flag: '🇹🇲' },
    { code: 'MN', name: 'Mongolia (+976)', flag: '🇲🇳' },
    
    // Middle East
    { code: 'AE', name: 'UAE (+971)', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia (+966)', flag: '🇸🇦' },
    { code: 'TR', name: 'Turkey (+90)', flag: '🇹🇷' },
    { code: 'IR', name: 'Iran (+98)', flag: '🇮🇷' },
    { code: 'IQ', name: 'Iraq (+964)', flag: '🇮🇶' },
    { code: 'IL', name: 'Israel (+972)', flag: '🇮🇱' },
    { code: 'JO', name: 'Jordan (+962)', flag: '🇯🇴' },
    { code: 'LB', name: 'Lebanon (+961)', flag: '🇱🇧' },
    { code: 'SY', name: 'Syria (+963)', flag: '🇸🇾' },
    { code: 'KW', name: 'Kuwait (+965)', flag: '🇰🇼' },
    { code: 'QA', name: 'Qatar (+974)', flag: '🇶🇦' },
    { code: 'BH', name: 'Bahrain (+973)', flag: '🇧🇭' },
    { code: 'OM', name: 'Oman (+968)', flag: '🇴🇲' },
    { code: 'YE', name: 'Yemen (+967)', flag: '🇾🇪' },
    { code: 'PS', name: 'Palestine (+970)', flag: '🇵🇸' },
    
    // Europe
    { code: 'GB', name: 'United Kingdom (+44)', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany (+49)', flag: '🇩🇪' },
    { code: 'FR', name: 'France (+33)', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy (+39)', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain (+34)', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands (+31)', flag: '🇳🇱' },
    { code: 'BE', name: 'Belgium (+32)', flag: '🇧🇪' },
    { code: 'CH', name: 'Switzerland (+41)', flag: '🇨🇭' },
    { code: 'AT', name: 'Austria (+43)', flag: '🇦🇹' },
    { code: 'SE', name: 'Sweden (+46)', flag: '🇸🇪' },
    { code: 'NO', name: 'Norway (+47)', flag: '🇳🇴' },
    { code: 'DK', name: 'Denmark (+45)', flag: '🇩🇰' },
    { code: 'FI', name: 'Finland (+358)', flag: '🇫🇮' },
    { code: 'PL', name: 'Poland (+48)', flag: '🇵🇱' },
    { code: 'CZ', name: 'Czech Republic (+420)', flag: '🇨🇿' },
    { code: 'SK', name: 'Slovakia (+421)', flag: '🇸🇰' },
    { code: 'HU', name: 'Hungary (+36)', flag: '🇭🇺' },
    { code: 'RO', name: 'Romania (+40)', flag: '🇷🇴' },
    { code: 'BG', name: 'Bulgaria (+359)', flag: '🇧🇬' },
    { code: 'HR', name: 'Croatia (+385)', flag: '🇭🇷' },
    { code: 'SI', name: 'Slovenia (+386)', flag: '🇸🇮' },
    { code: 'RS', name: 'Serbia (+381)', flag: '🇷🇸' },
    { code: 'BA', name: 'Bosnia (+387)', flag: '🇧🇦' },
    { code: 'ME', name: 'Montenegro (+382)', flag: '🇲🇪' },
    { code: 'MK', name: 'North Macedonia (+389)', flag: '🇲🇰' },
    { code: 'AL', name: 'Albania (+355)', flag: '🇦🇱' },
    { code: 'GR', name: 'Greece (+30)', flag: '🇬🇷' },
    { code: 'CY', name: 'Cyprus (+357)', flag: '🇨🇾' },
    { code: 'MT', name: 'Malta (+356)', flag: '🇲🇹' },
    { code: 'IS', name: 'Iceland (+354)', flag: '🇮🇸' },
    { code: 'IE', name: 'Ireland (+353)', flag: '🇮🇪' },
    { code: 'PT', name: 'Portugal (+351)', flag: '🇵🇹' },
    { code: 'RU', name: 'Russia (+7)', flag: '🇷🇺' },
    { code: 'UA', name: 'Ukraine (+380)', flag: '🇺🇦' },
    { code: 'BY', name: 'Belarus (+375)', flag: '🇧🇾' },
    { code: 'MD', name: 'Moldova (+373)', flag: '🇲🇩' },
    { code: 'LT', name: 'Lithuania (+370)', flag: '🇱🇹' },
    { code: 'LV', name: 'Latvia (+371)', flag: '🇱🇻' },
    { code: 'EE', name: 'Estonia (+372)', flag: '🇪🇪' },
    
    // North America
    { code: 'US', name: 'United States (+1)', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada (+1)', flag: '🇨🇦' },
    { code: 'MX', name: 'Mexico (+52)', flag: '🇲🇽' },
    { code: 'GT', name: 'Guatemala (+502)', flag: '🇬🇹' },
    { code: 'BZ', name: 'Belize (+501)', flag: '🇧🇿' },
    { code: 'SV', name: 'El Salvador (+503)', flag: '🇸🇻' },
    { code: 'HN', name: 'Honduras (+504)', flag: '🇭🇳' },
    { code: 'NI', name: 'Nicaragua (+505)', flag: '🇳🇮' },
    { code: 'CR', name: 'Costa Rica (+506)', flag: '🇨🇷' },
    { code: 'PA', name: 'Panama (+507)', flag: '🇵🇦' },
    { code: 'CU', name: 'Cuba (+53)', flag: '🇨🇺' },
    { code: 'JM', name: 'Jamaica (+1)', flag: '🇯🇲' },
    { code: 'HT', name: 'Haiti (+509)', flag: '🇭🇹' },
    { code: 'DO', name: 'Dominican Republic (+1)', flag: '🇩🇴' },
    { code: 'PR', name: 'Puerto Rico (+1)', flag: '🇵🇷' },
    { code: 'TT', name: 'Trinidad & Tobago (+1)', flag: '🇹🇹' },
    { code: 'BB', name: 'Barbados (+1)', flag: '🇧🇧' },
    
    // South America
    { code: 'BR', name: 'Brazil (+55)', flag: '🇧🇷' },
    { code: 'AR', name: 'Argentina (+54)', flag: '🇦🇷' },
    { code: 'CO', name: 'Colombia (+57)', flag: '🇨🇴' },
    { code: 'PE', name: 'Peru (+51)', flag: '🇵🇪' },
    { code: 'VE', name: 'Venezuela (+58)', flag: '🇻🇪' },
    { code: 'CL', name: 'Chile (+56)', flag: '🇨🇱' },
    { code: 'EC', name: 'Ecuador (+593)', flag: '🇪🇨' },
    { code: 'BO', name: 'Bolivia (+591)', flag: '🇧🇴' },
    { code: 'PY', name: 'Paraguay (+595)', flag: '🇵🇾' },
    { code: 'UY', name: 'Uruguay (+598)', flag: '🇺🇾' },
    { code: 'GY', name: 'Guyana (+592)', flag: '🇬🇾' },
    { code: 'SR', name: 'Suriname (+597)', flag: '🇸🇷' },
    { code: 'GF', name: 'French Guiana (+594)', flag: '🇬🇫' },
    
    // Oceania
    { code: 'AU', name: 'Australia (+61)', flag: '🇦🇺' },
    { code: 'NZ', name: 'New Zealand (+64)', flag: '🇳🇿' },
    { code: 'FJ', name: 'Fiji (+679)', flag: '🇫🇯' },
    { code: 'PG', name: 'Papua New Guinea (+675)', flag: '🇵🇬' },
    { code: 'SB', name: 'Solomon Islands (+677)', flag: '🇸🇧' },
    { code: 'NC', name: 'New Caledonia (+687)', flag: '🇳🇨' },
    { code: 'PF', name: 'French Polynesia (+689)', flag: '🇵🇫' },
    { code: 'WS', name: 'Samoa (+685)', flag: '🇼🇸' },
    { code: 'TO', name: 'Tonga (+676)', flag: '🇹🇴' },
    { code: 'VU', name: 'Vanuatu (+678)', flag: '🇻🇺' },
    { code: 'KI', name: 'Kiribati (+686)', flag: '🇰🇮' },
    { code: 'TV', name: 'Tuvalu (+688)', flag: '🇹🇻' },
    { code: 'NR', name: 'Nauru (+674)', flag: '🇳🇷' },
    { code: 'PW', name: 'Palau (+680)', flag: '🇵🇼' },
    { code: 'MH', name: 'Marshall Islands (+692)', flag: '🇲🇭' },
    { code: 'FM', name: 'Micronesia (+691)', flag: '🇫🇲' },
    
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
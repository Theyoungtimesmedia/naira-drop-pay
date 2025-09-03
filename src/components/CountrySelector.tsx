import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
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

interface CountrySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const CountrySelector = ({ value, onValueChange, disabled }: CountrySelectorProps) => {
  const [open, setOpen] = useState(false);

  const selectedCountry = countries.find(c => c.code === value);

  const handleSelect = (countryCode: string) => {
    onValueChange(countryCode);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal h-12 bg-background z-50"
          disabled={disabled}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select your country</span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-background z-50">
        <DialogHeader>
          <DialogTitle className="text-center">Select your country</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {countries.map((country) => (
            <button
              key={country.code}
              onClick={() => handleSelect(country.code)}
              className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors bg-background"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                  {value === country.code && (
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  )}
                </div>
                <span className="text-2xl">{country.flag}</span>
                <span className="font-medium">{country.name}</span>
              </div>
              {value === country.code && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </button>
          ))}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={() => setOpen(false)}
            className="px-8"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CountrySelector };
export default CountrySelector;
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
  { code: 'IN', name: 'India (+91)', flag: '🇮🇳' },
  { code: 'AE', name: 'Dubai (+971)', flag: '🇦🇪' },
  { code: 'PH', name: 'Philippines (+63)', flag: '🇵🇭' },
  { code: 'GB', name: 'UK (+44)', flag: '🇬🇧' },
  { code: 'US', name: 'USA (+1)', flag: '🇺🇸' },
  { code: 'JP', name: 'Japan (+81)', flag: '🇯🇵' },
  { code: 'RU', name: 'Russia (+7)', flag: '🇷🇺' },
  { code: 'CN', name: 'China (+86)', flag: '🇨🇳' },
  { code: 'AU', name: 'Australia (+61)', flag: '🇦🇺' },
  { code: 'NG', name: 'Nigeria (+234)', flag: '🇳🇬' },
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
export type Country = {
  callingCode: string;
  flag: string;
  id: 'AE' | 'SA' | 'IN' | 'SG';
  name: string;
  phoneLength: number;
};

export const countries: Country[] = [
  { id: 'AE', name: 'United Arab Emirates', callingCode: '+971', flag: '🇦🇪', phoneLength: 9 },
  { id: 'SA', name: 'Saudi Arabia', callingCode: '+966', flag: '🇸🇦', phoneLength: 9 },
  { id: 'IN', name: 'India', callingCode: '+91', flag: '🇮🇳', phoneLength: 10 },
  { id: 'SG', name: 'Singapore', callingCode: '+65', flag: '🇸🇬', phoneLength: 8 },
];

export const defaultCountry = countries[2];

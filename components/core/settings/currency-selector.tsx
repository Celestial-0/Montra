import { View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CurrencySelector() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Primary Currency</CardTitle>
      </CardHeader>
      <CardContent>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="INR (₹) - Indian Rupee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem label="INR (₹) - Indian Rupee" value="INR" />
            <SelectItem label="USD ($) - US Dollar" value="USD" />
            <SelectItem label="EUR (€) - Euro" value="EUR" />
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

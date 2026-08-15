import { View } from 'react-native';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ViewSortDropdown() {
  return (
    <View>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem label="Date (Newest First)" value="date-desc" />
          <SelectItem label="Amount (Highest First)" value="amount-desc" />
        </SelectContent>
      </Select>
    </View>
  );
}

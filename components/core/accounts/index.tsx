import { View } from 'react-native';
import { AccountList } from './account-list';

export function AccountsScreen() {
  return (
    <View className="flex-1 bg-background">
      <AccountList />
    </View>
  );
}

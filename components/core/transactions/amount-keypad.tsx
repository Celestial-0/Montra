import { Text, View } from 'react-native';

export function AmountKeypad({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <View className="items-center justify-center p-4">
      <Text className="text-4xl font-bold">₹{(value / 100).toFixed(2)}</Text>
    </View>
  );
}

import React from 'react';
import { View } from 'react-native';
import { TransactionList } from './transaction-list';

export function TransactionsScreen() {
  return (
    <View className="flex-1 bg-background">
      <TransactionList />
    </View>
  );
}

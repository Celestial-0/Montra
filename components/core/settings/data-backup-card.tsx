import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

export function DataBackupCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Local Database & Backup</CardTitle>
      </CardHeader>
      <CardContent className="gap-3">
        <Text className="text-muted-foreground text-xs">
          Montra stores all your financial facts locally in SQLite.
        </Text>
        <View className="flex-row gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Text>Export DB</Text>
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Text>Restore</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}

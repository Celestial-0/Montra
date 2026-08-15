import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Upload,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAccounts } from '@/hooks/use-accounts';
import { useImportStatement, useParseStatementPreview } from '@/hooks/use-import';
import { formatMoney } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { useImportStore } from '@/stores/import-store';

const SAMPLE_CSV = `Date,Narration,Type,Amount
2026-08-10,Grocery Mart Superstore,DR,2450.00
2026-08-11,Salary Deposit ACME Corp,CR,75000.00
2026-08-12,Electricity Bill Power Grid,DR,1850.50
2026-08-13,Coffee House Downtown,DR,350.00
2026-08-14,UPI Transfer to Friend,DR,1200.00`;

export function ImportWizardScreen() {
  const router = useRouter();
  const { data: accounts = [] } = useAccounts();
  const {
    selectedAccountId,
    setSelectedAccountId,
    step,
    setStep,
    rawFileContent,
    fileName,
    setRawFileContent,
    reset,
  } = useImportStore();

  const parsePreview = useParseStatementPreview();
  const importStatement = useImportStatement();

  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pick file via expo-document-picker
  const handlePickDocument = async () => {
    try {
      setErrorMsg(null);
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/json', 'text/comma-separated-values', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        // In web/native Expo, fetch the local URI to read text content
        const response = await fetch(file.uri);
        const text = await response.text();
        setRawFileContent(text, file.name);

        const rows = await parsePreview.mutateAsync({
          fileContent: text,
          fileType: file.name.endsWith('.json') ? 'json' : 'csv',
        });
        setPreviewRows(rows);
        setStep('preview');
        triggerHaptic('success');
      }
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to read file');
    }
  };

  const handleUseSampleCSV = async () => {
    try {
      setErrorMsg(null);
      setRawFileContent(SAMPLE_CSV, 'sample_statement.csv');
      const rows = await parsePreview.mutateAsync({
        fileContent: SAMPLE_CSV,
        fileType: 'csv',
      });
      setPreviewRows(rows);
      setStep('preview');
      triggerHaptic('success');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to parse sample');
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedAccountId) {
      setErrorMsg('Please select a target account for this statement.');
      return;
    }
    if (!rawFileContent) {
      setErrorMsg('No statement content found.');
      return;
    }

    try {
      const summary = await importStatement.mutateAsync({
        accountId: selectedAccountId,
        fileContent: rawFileContent,
        fileType: fileName?.endsWith('.json') ? 'json' : 'csv',
      });
      setImportSummary(summary);
      setStep('complete');
      triggerHaptic('success');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Import failed');
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-5 p-4 pb-28"
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View className="flex-row items-center justify-between pt-1">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 active:bg-accent"
        >
          <ArrowLeft size={16} className="text-foreground" />
          <Text className="text-xs font-semibold text-foreground">Back</Text>
        </Pressable>
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step {step === 'select_file' ? '1 of 3' : step === 'preview' ? '2 of 3' : '3 of 3'}
        </Text>
      </View>

      {errorMsg && (
        <View className="rounded-xl border border-destructive/30 bg-destructive/15 p-3.5">
          <Text className="text-xs font-medium text-destructive">{errorMsg}</Text>
        </View>
      )}

      {/* Step 1: File Selection & Target Account */}
      {step === 'select_file' && (
        <View className="gap-5">
          <View>
            <Text className="text-2xl font-extrabold tracking-tight text-foreground">
              Import Statement
            </Text>
            <Text className="mt-1 text-xs text-muted-foreground">
              Select target account and upload a CSV/JSON bank or UPI statement.
            </Text>
          </View>

          {/* Account Selector */}
          <View>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              1. Select Destination Account
            </Text>
            {accounts.length === 0 ? (
              <Text className="text-xs text-destructive">
                Please create a financial account first before importing statements.
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === String(acc.id);
                  return (
                    <Pressable
                      key={String(acc.id)}
                      onPress={() => {
                        setSelectedAccountId(String(acc.id));
                        triggerHaptic('selection');
                      }}
                      className={cn(
                        'rounded-xl border p-3 min-w-[120px]',
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card'
                      )}
                    >
                      <Text
                        className={cn(
                          'text-xs font-semibold',
                          isSelected ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        {acc.name}
                      </Text>
                      <Text className="text-[10px] text-muted-foreground">
                        {formatMoney(acc.currentBalance.amount, acc.currency)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Dropzone Card */}
          <View>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              2. Upload Statement File
            </Text>
            <Card className="rounded-2xl border-2 border-dashed border-border bg-card/60 p-8 items-center justify-center">
              <View className="rounded-full bg-primary/10 p-4">
                <Upload size={28} className="text-primary" />
              </View>
              <Text className="mt-3 text-sm font-bold text-foreground text-center">Choose Bank File</Text>
              <Text className="mt-1 text-center text-xs text-muted-foreground px-4">
                Supports Standard CSV format (Date, Narration, Type, Amount) and JSON payloads.
              </Text>
              <Button
                onPress={handlePickDocument}
                disabled={parsePreview.isPending || !selectedAccountId}
                className="mt-4 flex-row items-center gap-2 px-5"
              >
                {parsePreview.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <FileSpreadsheet size={16} color="white" />
                    <Text className="font-semibold text-primary-foreground">Browse Files</Text>
                  </>
                )}
              </Button>
            </Card>
          </View>

          {/* Sample CSV quick option */}
          <View className="items-center pt-2">
            <Pressable
              onPress={handleUseSampleCSV}
              disabled={!selectedAccountId}
              className="active:opacity-70"
            >
              <Text className="text-xs font-medium text-primary underline">
                Or test with sample 5-row statement CSV
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Step 2: Parse Preview & Confirmation */}
      {step === 'preview' && (
        <View className="gap-4">
          <View>
            <Text className="text-2xl font-extrabold tracking-tight text-foreground">
              Preview Rows
            </Text>
            <Text className="mt-1 text-xs text-muted-foreground">
              Found {previewRows.length} valid transactions in{' '}
              <Text className="font-semibold text-foreground">{fileName}</Text>.
            </Text>
          </View>

          {/* Rows List */}
          <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {previewRows.map((row, index) => {
                const isCR = row.direction === 'credit';
                return (
                  <View
                    key={index}
                    className={`flex-row items-center justify-between p-3.5 ${
                      index !== previewRows.length - 1 ? 'border-b border-border/50' : ''
                    }`}
                  >
                    <View className="flex-1 pr-3">
                      <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                        {row.narration}
                      </Text>
                      <Text className="text-[10px] text-muted-foreground">{row.date}</Text>
                    </View>
                    <Text
                      className={`text-xs font-bold ${
                        isCR ? 'text-income' : 'text-foreground'
                      }`}
                    >
                      {isCR ? '+' : '-'}
                      {formatMoney(row.amount)}
                    </Text>
                  </View>
                );
              })}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <View className="flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onPress={() => setStep('select_file')}
              className="flex-1 py-3"
            >
              <Text className="font-semibold text-foreground">Change File</Text>
            </Button>
            <Button
              onPress={handleConfirmImport}
              disabled={importStatement.isPending}
              className="flex-1 py-3"
            >
              {importStatement.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="font-semibold text-primary-foreground">Confirm Import</Text>
              )}
            </Button>
          </View>
        </View>
      )}

      {/* Step 3: Success Summary */}
      {step === 'complete' && importSummary && (
        <View className="gap-5 items-center py-6">
          <View className="rounded-full bg-income-muted/40 p-5 border border-income/30">
            <CheckCircle2 size={36} color="#22c55e" />
          </View>

          <View className="items-center">
            <Text className="text-2xl font-extrabold text-foreground">Import Successful!</Text>
            <Text className="mt-1 text-center text-xs text-muted-foreground">
              Your financial facts have been normalized and saved to the local database.
            </Text>
          </View>

          {/* Metrics Card */}
          <Card className="w-full rounded-2xl border-border bg-card shadow-sm">
            <CardContent className="gap-3 p-5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-muted-foreground">Imported Transactions</Text>
                <Text className="text-sm font-bold text-income">
                  {importSummary.importedCount} records
                </Text>
              </View>
              {importSummary.skippedDuplicateCount > 0 && (
                <View className="flex-row items-center justify-between border-t border-border/50 pt-2.5">
                  <Text className="text-xs text-muted-foreground">Duplicates Skipped</Text>
                  <Text className="text-sm font-bold text-muted-foreground">
                    {importSummary.skippedDuplicateCount} duplicates
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>

          <Button
            onPress={() => {
              reset();
              router.push('/(tabs)/transactions' as any);
            }}
            className="w-full py-3 mt-2"
          >
            <Text className="font-semibold text-primary-foreground">View In Transactions</Text>
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

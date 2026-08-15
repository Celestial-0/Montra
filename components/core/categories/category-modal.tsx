import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Tag as TagIcon, Trash2, X } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  useCategories,
  useCreateCategory,
  useCreateTag,
  useDeleteCategory,
  useDeleteTag,
  useUpdateCategory,
} from '@/hooks/use-categories';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';

const COLOR_PALETTE = [
  '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899',
  '#eab308', '#ef4444', '#06b6d4', '#22c55e', '#6366f1', '#6b7280'
];

export function CategoryModal() {
  const { modals, closeAddCategory } = useUIStore();
  const isOpen = modals.isAddCategoryOpen;
  const editingId = modals.editingCategoryId;

  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];
  const existingCat = categories.find((c) => String(c.id) === editingId);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createTag = useCreateTag();

  const [mode, setMode] = useState<'category' | 'tag'>('category');
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (existingCat && editingId) {
        setMode('category');
        setName(existingCat.name);
        setSelectedColor(existingCat.color ?? COLOR_PALETTE[0]);
      } else {
        setName('');
        setSelectedColor(COLOR_PALETTE[0]);
      }
      setErrorMsg(null);
    }
  }, [isOpen, editingId, existingCat]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a name.');
      return;
    }

    try {
      if (mode === 'category') {
        if (editingId && existingCat) {
          await updateCategory.mutateAsync({
            id: editingId,
            name: name.trim(),
            color: selectedColor,
          });
        } else {
          await createCategory.mutateAsync({
            name: name.trim(),
            color: selectedColor,
          });
        }
      } else {
        await createTag.mutateAsync({
          name: name.trim().replace(/^#/, ''),
          color: selectedColor,
        });
      }
      triggerHaptic('success');
      closeAddCategory();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    try {
      await deleteCategory.mutateAsync(editingId);
      triggerHaptic('impact');
      closeAddCategory();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to delete category');
    }
  };

  const isSaving = createCategory.isPending || updateCategory.isPending || deleteCategory.isPending || createTag.isPending;

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={closeAddCategory}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/60"
      >
        <View className="max-h-[90%] rounded-t-3xl border-t border-border bg-card p-6 shadow-2xl">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-primary/10 p-2">
                <TagIcon size={18} className="text-primary" />
              </View>
              <Text className="text-xl font-bold text-card-foreground">
                {editingId ? 'Edit Category' : mode === 'category' ? 'New Category' : 'New Tag'}
              </Text>
            </View>
            <Pressable
              onPress={closeAddCategory}
              className="rounded-full bg-secondary p-2 active:bg-accent"
            >
              <X size={20} className="text-muted-foreground" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-5 pb-6">
            {errorMsg && (
              <View className="rounded-lg bg-destructive/15 p-3 border border-destructive/30">
                <Text className="text-sm font-medium text-destructive">{errorMsg}</Text>
              </View>
            )}

            {/* Mode switch (if creating new) */}
            {!editingId && (
              <View className="flex-row rounded-xl bg-secondary p-1">
                <Pressable
                  onPress={() => setMode('category')}
                  className={cn(
                    'flex-1 items-center justify-center rounded-lg py-2',
                    mode === 'category' ? 'bg-card shadow-sm' : ''
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs font-semibold',
                      mode === 'category' ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    Category
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setMode('tag')}
                  className={cn(
                    'flex-1 items-center justify-center rounded-lg py-2',
                    mode === 'tag' ? 'bg-card shadow-sm' : ''
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs font-semibold',
                      mode === 'tag' ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    Contextual Tag
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Name */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {mode === 'category' ? 'Category Name' : 'Tag Label'}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={mode === 'category' ? 'e.g. Subscriptions, Freelance' : 'e.g. vacation, project-x'}
                placeholderTextColor="#9ca3af"
                className="rounded-xl border border-input bg-background px-4 py-3 text-base font-semibold text-foreground"
              />
            </View>

            {/* Color Picker */}
            <View>
              <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Color Tag
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {COLOR_PALETTE.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <Pressable
                      key={color}
                      onPress={() => {
                        setSelectedColor(color);
                        triggerHaptic('selection');
                      }}
                      style={{ backgroundColor: color }}
                      className={cn(
                        'h-8 w-8 rounded-full items-center justify-center',
                        isSelected ? 'border-2 border-foreground scale-110' : ''
                      )}
                    />
                  );
                })}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="mt-2 flex-row gap-3">
              {editingId && !existingCat?.isSystem && (
                <Button
                  variant="destructive"
                  onPress={handleDelete}
                  disabled={isSaving}
                  className="px-4"
                >
                  <Trash2 size={16} color="white" />
                </Button>
              )}
              <Button onPress={handleSave} disabled={isSaving} className="flex-1 py-3">
                <Text className="font-semibold text-primary-foreground">
                  {editingId ? 'Save Category' : `Create ${mode === 'category' ? 'Category' : 'Tag'}`}
                </Text>
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

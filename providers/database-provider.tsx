import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { initDatabase, MontraDatabase } from '@/infrastructure/database/client';
import { createRepositories, Repositories } from './repositories';
import { createUseCases, UseCases } from './use-cases';

interface DatabaseContextValue {
  readonly isReady: boolean;
  readonly db: MontraDatabase | null;
  readonly repositories: Repositories | null;
  readonly useCases: UseCases | null;
  readonly error: Error | null;
  readonly reload: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  isReady: false,
  db: null,
  repositories: null,
  useCases: null,
  error: null,
  reload: async () => {},
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<MontraDatabase | null>(null);
  const [repositories, setRepositories] = useState<Repositories | null>(null);
  const [useCases, setUseCases] = useState<UseCases | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = async () => {
    try {
      setIsReady(false);
      setError(null);
      const database = await initDatabase();
      const repos = createRepositories(database);
      const ucs = createUseCases(repos);

      setDb(database);
      setRepositories(repos);
      setUseCases(ucs);
      setIsReady(true);
    } catch (err) {
      console.error('Failed to initialize Montra local database:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-destructive mb-2 text-lg font-bold">Database Error</Text>
        <Text className="text-muted-foreground mb-4 text-center text-sm">{error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <DatabaseContext.Provider
      value={{
        isReady,
        db,
        repositories,
        useCases,
        error,
        reload: initialize,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext(): DatabaseContextValue {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
}

export function useUseCases(): UseCases {
  const { useCases } = useDatabaseContext();
  if (!useCases) {
    throw new Error('UseCases not initialized yet. Ensure DatabaseProvider is ready.');
  }
  return useCases;
}

export function useRepositories(): Repositories {
  const { repositories } = useDatabaseContext();
  if (!repositories) {
    throw new Error('Repositories not initialized yet. Ensure DatabaseProvider is ready.');
  }
  return repositories;
}

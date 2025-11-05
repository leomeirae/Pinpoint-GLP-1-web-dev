import { useEffect, useState, useRef } from 'react';
import { useAuth, useUser } from '@/lib/clerk';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useUserSync');

// Global state to prevent multiple simultaneous syncs
const syncState = {
  inProgress: false,
  syncedUserIds: new Set<string>(),
};

export function useUserSync() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setIsLoading(false);
      return;
    }

    // Se já sincronizou este usuário nesta sessão, não fazer nada
    if (hasSyncedRef.current || syncState.syncedUserIds.has(userId)) {
      setIsLoading(false);
      return;
    }

    // Se já tem uma sincronização em andamento, aguardar
    if (syncState.inProgress) {
      logger.debug('Sync already in progress, waiting...');
      const checkInterval = setInterval(() => {
        if (!syncState.inProgress) {
          clearInterval(checkInterval);
          setIsLoading(false);
          hasSyncedRef.current = true;
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    // Limpar timeout anterior se existir
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    retryCountRef.current = 0;

    const syncUser = async () => {
      // Prevenir múltiplas chamadas simultâneas
      if (syncState.inProgress) {
        logger.debug('Sync already in progress, skipping');
        setIsLoading(false);
        return;
      }

      syncState.inProgress = true;

      try {
        setIsLoading(true);
        setError(null);

        logger.info('Syncing user with Supabase', {
          userId,
          retryCount: retryCountRef.current,
          hasUser: !!user
        });

        // Se user ainda não estiver disponível, tentar novamente depois
        if (!user && retryCountRef.current < 5) {
          logger.debug('Clerk user not ready yet, waiting', {
            retryCount: retryCountRef.current
          });
          retryCountRef.current++;
          syncState.inProgress = false; // Liberar para retry
          retryTimeoutRef.current = setTimeout(() => {
            if (isSignedIn && userId && !hasSyncedRef.current) {
              syncUser();
            }
          }, 500);
          return;
        }

        // Se ainda não tem user após todas as tentativas, criar com dados mínimos
        if (!user) {
          logger.warn('Clerk user still not available after retries, creating with minimal data');
        }

        // Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', userId)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          logger.error('Error fetching user', fetchError);
          throw fetchError;
        }

        // If user doesn't exist, create it
        if (!existingUser) {
          logger.info('Creating user in Supabase', { userId });

          const userData = {
            clerk_id: userId,
            email: user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.local`,
            name: user?.fullName || user?.firstName || null,
          };

          logger.debug('User data to insert', { email: userData.email, name: userData.name });
          
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert(userData)
            .select()
            .single();

          if (insertError) {
            // Se erro é de duplicata (usuário já foi criado por outra chamada), ignorar
            if (insertError.code === '23505') {
              logger.info('User already exists (created by another call), continuing');
            } else {
              logger.error('Insert error', insertError, {
                code: insertError.code,
                message: insertError.message
              });
              throw insertError;
            }
          } else {
            logger.info('User created successfully in Supabase', { userId: newUser?.id });
          }
        } else {
          logger.info('User already exists in Supabase', { userId: existingUser.id });
          
          // Update user data if needed (só se user estiver disponível e dados mudaram)
          if (user) {
            const newEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '';
            const newName = user.fullName || user.firstName || null;
            
            // Só atualizar se os dados mudaram
            if (existingUser.email !== newEmail || existingUser.name !== newName) {
              const { error: updateError } = await supabase
                .from('users')
                .update({
                  email: newEmail,
                  name: newName,
                  updated_at: new Date().toISOString(),
                })
                .eq('clerk_id', userId);

              if (updateError) {
                logger.warn('Error updating user', updateError);
              } else {
                logger.info('User updated successfully');
              }
            }
          }
        }

        // Marcar como sincronizado
        syncState.syncedUserIds.add(userId);
        hasSyncedRef.current = true;

      } catch (err) {
        logger.error('Error syncing user', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to sync user';
        setError(errorMessage);
      } finally {
        syncState.inProgress = false;
        setIsLoading(false);
      }
    };

    syncUser();

    // Cleanup
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [isSignedIn, userId, user]);

  return { isLoading, error };
}

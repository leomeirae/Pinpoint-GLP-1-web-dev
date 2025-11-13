import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignOut } from '@clerk/clerk-expo';
import { Router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { clearUserCache } from '@/hooks/useUser';
import { clearSyncState } from '@/hooks/useUserSync';
import { createLogger } from '@/lib/logger';
import { trackEvent } from '@/lib/analytics';

const logger = createLogger('AuthUtils');

/**
 * List of AsyncStorage keys that should be cleared on logout
 */
const STORAGE_KEYS_TO_CLEAR = [
  '@mounjaro:onboarding_progress',
  '@mounjaro_tracker:theme_mode',
  '@mounjaro_tracker:selected_theme',
  '@mounjaro_tracker:accent_color',
  '@mounjaro:feature_flags',
] as const;

/**
 * Performs a complete sign-out process including cleanup of all user data
 *
 * This function handles:
 * 1. AsyncStorage cleanup (onboarding progress, theme preferences, etc.)
 * 2. User cache invalidation
 * 3. Sync state reset
 * 4. Supabase session termination
 * 5. Clerk authentication sign-out
 * 6. Navigation to welcome screen
 *
 * @param signOut - Clerk's signOut function
 * @param router - Expo Router instance for navigation
 * @throws Will throw an error if the sign-out process fails
 *
 * @example
 * ```typescript
 * const { signOut } = useAuth();
 * const router = useRouter();
 *
 * try {
 *   await performSignOut(signOut, router);
 * } catch (error) {
 *   Alert.alert('Error', 'Failed to sign out');
 * }
 * ```
 */
export async function performSignOut(
  signOut: SignOut,
  router: Router
): Promise<void> {
  try {
    logger.info('Starting sign out process');
    trackEvent('sign_out_started');

    // Step 1: Clear AsyncStorage (onboarding progress, theme preferences, etc.)
    try {
      await AsyncStorage.multiRemove([...STORAGE_KEYS_TO_CLEAR]);
      logger.info('AsyncStorage cleared successfully', {
        keys_cleared: STORAGE_KEYS_TO_CLEAR.length,
      });
    } catch (storageError) {
      // Non-critical error - log warning and continue
      logger.warn('AsyncStorage clear failed (non-critical)', storageError);
    }

    // Step 2: Clear user cache to prevent stale data
    clearUserCache();
    logger.info('User cache cleared');

    // Step 3: Clear sync state to reset sync tracking
    clearSyncState();
    logger.info('Sync state cleared');

    // Step 4: Clear Supabase session (if exists)
    try {
      await supabase.auth.signOut();
      logger.info('Supabase session cleared');
    } catch (supabaseError) {
      // Not critical if fails (we use Clerk as primary auth)
      logger.debug('Supabase signOut skipped (not using Supabase auth)', {
        error: supabaseError,
      });
    }

    // Step 5: Sign out from Clerk (primary authentication)
    await signOut();
    logger.info('Sign out successful from Clerk');
    trackEvent('sign_out_complete');

    // Step 6: Wait briefly to ensure all sessions are cleared
    // This prevents race conditions where navigation happens before cleanup completes
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Step 7: Navigate to welcome screen
    // Use replace to prevent back navigation to authenticated screens
    logger.info('Redirecting to welcome screen (carousel)');
    router.replace('/(auth)/welcome');

    // Log completion after navigation
    setTimeout(() => {
      logger.debug('Logout redirect completed');
    }, 1000);
  } catch (error) {
    logger.error('Error during sign out process', error as Error);
    trackEvent('sign_out_error', {
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error; // Re-throw to let caller handle UI feedback
  }
}

/**
 * Performs complete account deletion including all user data
 *
 * This function handles:
 * 1. Deletion of user record from Supabase (CASCADE deletes all related data)
 * 2. Complete AsyncStorage clear
 * 3. Cache invalidation
 * 4. Sync state reset
 * 5. Clerk sign-out
 * 6. Navigation to welcome screen
 *
 * @param userId - The Supabase user ID
 * @param signOut - Clerk's signOut function
 * @param router - Expo Router instance for navigation
 * @throws Will throw an error if the deletion process fails
 *
 * @example
 * ```typescript
 * const { user } = useUser();
 * const { signOut } = useAuth();
 * const router = useRouter();
 *
 * try {
 *   await performAccountDeletion(user.id, signOut, router);
 *   Alert.alert('Success', 'Account deleted successfully');
 * } catch (error) {
 *   Alert.alert('Error', 'Failed to delete account');
 * }
 * ```
 */
export async function performAccountDeletion(
  userId: string,
  signOut: SignOut,
  router: Router
): Promise<void> {
  try {
    logger.info('Starting account deletion process', { userId });
    trackEvent('account_deletion_started', { user_id: userId });

    // Step 1: Delete user record from Supabase
    // CASCADE will automatically delete all related data from:
    // - weight_logs, medication_applications, side_effects
    // - daily_streaks, achievements
    // - scheduled_notifications, subscriptions, settings, medications
    const { error: dbError } = await supabase.from('users').delete().eq('id', userId);

    if (dbError) {
      logger.error('Error deleting from Supabase', dbError);
      throw new Error(`Failed to delete user data: ${dbError.message}`);
    }
    logger.info('User data deleted from Supabase (all related data deleted via CASCADE)');

    // Step 2: Clear ALL local storage (more aggressive than sign-out)
    try {
      await AsyncStorage.clear();
      logger.info('All AsyncStorage cleared');
    } catch (storageError) {
      logger.warn('AsyncStorage clear failed (non-critical)', storageError);
    }

    // Step 3: Clear user cache
    clearUserCache();
    logger.info('User cache cleared');

    // Step 4: Clear sync state
    clearSyncState();
    logger.info('Sync state cleared');

    // Step 5: Sign out from Clerk (also clears session)
    await signOut();
    logger.info('User signed out from Clerk');

    // Step 6: Wait briefly for cleanup to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 7: Redirect to welcome screen
    logger.info('Redirecting to welcome screen');
    trackEvent('account_deletion_complete', { user_id: userId });
    router.replace('/(auth)/welcome');
  } catch (error) {
    logger.error('Error during account deletion', error as Error);
    trackEvent('account_deletion_failed', {
      user_id: userId,
      error: error instanceof Error ? error.message : 'unknown error',
    });
    throw error; // Re-throw to let caller handle UI feedback
  }
}

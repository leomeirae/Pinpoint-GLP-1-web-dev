import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@/lib/clerk';
import { supabase } from '@/lib/supabase';

export function useUserSync() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !userId || !user) {
      setIsLoading(false);
      return;
    }

    const syncUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Syncing user with Supabase...', userId);

        // Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching user:', fetchError);
          throw fetchError;
        }

        // If user doesn't exist, create it
        if (!existingUser) {
          console.log('Creating user in Supabase...');
          
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              clerk_id: userId,
              email: user.primaryEmailAddress?.emailAddress || '',
              name: user.fullName || user.firstName || null,
            })
            .select()
            .single();

          if (insertError) {
            console.error('Insert error:', insertError);
            throw insertError;
          }

          console.log('User created successfully in Supabase:', newUser);
        } else {
          console.log('User already exists in Supabase');
          
          // Update user data if needed
          const { error: updateError } = await supabase
            .from('users')
            .update({
              email: user.primaryEmailAddress?.emailAddress || '',
              name: user.fullName || user.firstName || null,
              updated_at: new Date().toISOString(),
            })
            .eq('clerk_id', userId);

          if (updateError) {
            console.warn('Error updating user:', updateError);
          } else {
            console.log('User updated successfully');
          }
        }
      } catch (err) {
        console.error('Error syncing user:', err);
        setError(err instanceof Error ? err.message : 'Failed to sync user');
      } finally {
        setIsLoading(false);
      }
    };

    syncUser();
  }, [isSignedIn, userId, user]);

  return { isLoading, error };
}

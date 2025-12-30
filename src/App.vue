<template>
  <router-view></router-view>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from './lib/supabase';

const router = useRouter();

onMounted(async () => {
  // Check if URL has Supabase auth hash (recovery, email confirmation, etc.)
  const hash = window.location.hash;
  
  if (hash && hash.includes('type=recovery')) {
    // This is a password reset link - redirect to our reset page
    // The hash contains the access_token that Supabase will use
    router.push('/reset-password' + hash);
  } else if (hash && hash.includes('type=signup')) {
    // Email confirmation - Supabase handles this automatically
    // Just redirect to login
    router.push('/login');
  }
  
  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      router.push('/reset-password');
    }
  });
});
</script>

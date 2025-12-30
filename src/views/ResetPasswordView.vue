<template>
  <div class="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-2 text-indigo-500">
          Nueva Contraseña
        </h1>
        <p class="text-gray-400">
          Ingresa tu nueva contraseña
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div class="relative">
            <label for="password" class="sr-only">Nueva Contraseña</label>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
              placeholder="Nueva contraseña"
            />
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-3 text-gray-500 hover:text-white focus:outline-none"
              tabindex="-1"
            >
              <i class="ph" :class="showPassword ? 'ph-eye-slash' : 'ph-eye'"></i>
            </button>
          </div>
          <div>
            <label for="confirmPassword" class="sr-only">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              autocomplete="new-password"
              class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Confirmar nueva contraseña"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-300"
          >
            {{ loading ? "Actualizando..." : "Actualizar Contraseña" }}
          </button>
        </div>

        <div
          v-if="errorMsg"
          class="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded"
        >
          {{ errorMsg }}
        </div>

        <div
          v-if="successMsg"
          class="text-green-500 text-sm text-center bg-green-900/20 p-2 rounded"
        >
          {{ successMsg }}
        </div>
      </form>

      <div class="text-center mt-8">
        <router-link to="/login" class="text-gray-500 text-sm hover:text-white">
          ← Volver al Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const router = useRouter();
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");
const showPassword = ref(false);

onMounted(async () => {
  // Check for recovery token in URL hash
  const hash = window.location.hash;
  
  if (hash && hash.includes('access_token')) {
    // Parse the hash fragment to get tokens
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // Set the session from the recovery tokens
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) {
        console.error('Error setting session:', error);
        errorMsg.value = "Error al procesar el link. Intenta solicitar otro reset.";
        return;
      }
      
      // Clear the hash from URL for cleaner look
      window.history.replaceState(null, '', window.location.pathname);
    }
  }
  
  // Now check if we have a valid session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    errorMsg.value = "Link inválido o expirado. Solicita un nuevo reset de contraseña.";
  }
});

const handleSubmit = async () => {
  if (password.value.length < 6) {
    errorMsg.value = "La contraseña debe tener al menos 6 caracteres.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMsg.value = "Las contraseñas no coinciden.";
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  successMsg.value = "";

  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value
    });

    if (error) {
      errorMsg.value = error.message;
    } else {
      successMsg.value = "¡Contraseña actualizada exitosamente!";
      
      Swal.fire({
        icon: 'success',
        title: '¡Listo!',
        text: 'Tu contraseña ha sido actualizada. Ya puedes iniciar sesión.',
        background: '#1f2937', color: '#fff'
      }).then(() => {
        router.push("/login");
      });
    }
  } catch (err) {
    console.error(err);
    errorMsg.value = err.message || "Ocurrió un error inesperado.";
  } finally {
    loading.value = false;
  }
};
</script>

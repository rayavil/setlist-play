<template>
  <div
    class="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6"
  >
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-indigo-500 mb-2">SetList Play</h1>
        <p class="text-gray-400">Inicia sesión para gestionar tus listas</p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="email" class="sr-only">Correo</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Correo electrónico"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Contraseña</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Contraseña"
            />
          </div>
          <div v-if="isRegistering">
            <label for="fullName" class="sr-only">Nombre Completo</label>
            <input
              id="fullName"
              v-model="fullName"
              type="text"
              required
              class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nombre Completo"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ loading ? "Procesando..." : (isRegistering ? "Registrarse" : "Ingresar") }}
          </button>
        </div>

        <!-- Toggle Login/Register -->
        <div class="text-center text-xs text-gray-500 mt-4">
          <button 
            type="button"
            @click="isRegistering = !isRegistering"
            class="text-indigo-400 hover:text-indigo-300 underline"
          >
            {{ isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate aquí" }}
          </button>
        </div>

        <div
          v-if="errorMsg"
          class="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded"
        >
          {{ errorMsg }}
        </div>
      </form>

      <div class="text-center mt-8">
        <router-link to="/" class="text-gray-500 text-sm hover:text-white"
          >← Volver al Inicio</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { supabase } from "../lib/supabase";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const router = useRouter();
const email = ref("");
const password = ref("");
const fullName = ref(""); // For registration
const isRegistering = ref(false);
const loading = ref(false);
const errorMsg = ref("");

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = "Por favor completa todos los campos.";
    return;
  }

  loading.value = true;
  errorMsg.value = "";

  try {
    let result;
    
    if (isRegistering.value) {
        // REGISTRATION
        result = await supabase.auth.signUp({
            email: email.value,
            password: password.value,
            options: {
                data: {
                    full_name: fullName.value,
                    // Role defaults to 'user' in trigger/DB, is_approved defaults to FALSE
                }
            }
        });

        if (result.error) throw result.error;

        // Success reg
        errorMsg.value = "";
        Swal.fire({
            icon: 'info',
            title: 'Registro exitoso',
            text: 'Tu cuenta ha sido creada. Espera a que un administrador apruebe tu acceso.',
            background: '#1f2937', color: '#fff'
        });
        isRegistering.value = false; // Switch back to login
    } else {
        // LOGIN
        result = await supabase.auth.signInWithPassword({
            email: email.value,
            password: password.value,
        });

        const { error, data } = result;

        if (error) {
            errorMsg.value = error.message;
        } else {
            // Check Approval Status
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_approved, role')
                .eq('id', data.session.user.id)
                .single();
            
            if (profile && profile.is_approved) {
                router.push("/");
            } else {
                // Not approved -> Logout
                await supabase.auth.signOut();
                Swal.fire({
                    icon: 'warning',
                    title: 'Cuenta Pendiente',
                    text: 'Tu cuenta aún no ha sido aprobada por un administrador.',
                    background: '#1f2937', color: '#fff'
                });
            }
        }
    }
  } catch (err) {
    console.error(err);
    errorMsg.value = err.message || "Ocurrió un error inesperado.";
  } finally {
    loading.value = false;
  }
};
</script>

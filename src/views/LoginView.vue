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
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ loading ? "Procesando..." : (isLoginMode ? "Ingresar" : "Crear Cuenta") }}
          </button>
        </div>

        <div class="text-center">
          <button
            type="button"
            @click="isLoginMode = !isLoginMode"
            class="text-sm text-indigo-400 hover:underline"
          >
            {{ isLoginMode ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia Sesión" }}
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

const router = useRouter();
const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");
const isLoginMode = ref(true); // Toggle between Login and Signup

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = "Por favor completa todos los campos.";
    return;
  }

  loading.value = true;
  errorMsg.value = "";

  try {
    let result;
    if (isLoginMode.value) {
      // LOGIN
      result = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });
    } else {
      // SIGNUP
      result = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            username: email.value.split('@')[0]
          }
        }
      });
    }

    const { error } = result;

    if (error) {
      errorMsg.value = error.message;
      if (error.message.includes("Anonymous")) {
        errorMsg.value += " (Error de configuración en Supabase: Email Provider deshabilitado)";
      }
    } else {
      if (isLoginMode.value) {
        router.push("/");
      } else {
        alert("Registro exitoso! Ya puedes iniciar sesión.");
        isLoginMode.value = true; // Switch back to login
      }
    }
  } catch (err) {
    console.error(err);
    errorMsg.value = "Ocurrió un error inesperado.";
  } finally {
    loading.value = false;
  }
};
</script>

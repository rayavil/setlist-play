<template>
  <div class="p-8">
    <h2 class="text-3xl font-bold mb-8">Resumen General</h2>

    <div v-if="loading" class="text-gray-500 animate-pulse">
      Cargando estadísticas...
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Users Card -->
      <div class="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-400 font-bold uppercase tracking-wider text-xs">
            Total Usuarios
          </h3>
          <i class="ph ph-users text-2xl text-indigo-500"></i>
        </div>
        <p class="text-4xl font-bold text-white">{{ stats.users }}</p>
      </div>

      <!-- Songs Card -->
      <div class="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-400 font-bold uppercase tracking-wider text-xs">
            Total Canciones
          </h3>
          <i class="ph ph-music-notes text-2xl text-purple-500"></i>
        </div>
        <p class="text-4xl font-bold text-white">{{ stats.songs }}</p>
      </div>

      <!-- Setlists Card -->
      <div class="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-400 font-bold uppercase tracking-wider text-xs">
            Total Setlists
          </h3>
          <i class="ph ph-playlist text-2xl text-green-500"></i>
        </div>
        <p class="text-4xl font-bold text-white">{{ stats.setlists }}</p>
      </div>
    </div>

    <div class="mt-10">
      <h3 class="text-xl font-bold mb-4">Acciones Rápidas</h3>
      <div class="flex gap-4">
        <button
          class="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
        >
          Limpiar Caché (Simulado)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";

const loading = ref(true);
const stats = ref({
  users: 0,
  songs: 0,
  setlists: 0,
});

onMounted(async () => {
  loading.value = true;

  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  const { count: songsCount } = await supabase
    .from("songs")
    .select("*", { count: "exact", head: true });
  const { count: setlistsCount } = await supabase
    .from("setlists")
    .select("*", { count: "exact", head: true });

  stats.value = {
    users: usersCount || 0,
    songs: songsCount || 0,
    setlists: setlistsCount || 0,
  };

  loading.value = false;
});
</script>

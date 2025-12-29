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

    <!-- Invite Friends Section -->
    <div class="mt-10 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6">
        <h3 class="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
            <i class="ph ph-share-network"></i> Invitar Amigos
        </h3>
        <p class="text-gray-400 mb-4 text-sm">Comparte este enlace para que tus amigos se registren en la plataforma.</p>
        
        <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1 bg-gray-950 border border-gray-800 rounded-lg flex items-center px-4 py-2">
                <span class="text-gray-500 text-sm truncate mr-2">{{ inviteUrl }}</span>
                <button 
                    @click="copyLink" 
                    class="ml-auto text-indigo-400 hover:text-white font-bold text-xs"
                >
                    {{ copied ? '¡Copiado!' : 'Copiar' }}
                </button>
            </div>
            
            <a 
                :href="whatsappLink" 
                target="_blank"
                class="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition"
            >
                <i class="ph ph-whatsapp-logo text-lg"></i> WhatsApp
            </a>
            
             <a 
                :href="emailLink"
                class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition"
            >
                <i class="ph ph-envelope text-lg"></i> Email
            </a>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "../lib/supabase";

const loading = ref(true);
const stats = ref({
  users: 0,
  songs: 0,
  setlists: 0,
});

// Invite System
const inviteUrl = window.location.origin + '/login';
const inviteText = "¡Hola! Únete a SetList Play para gestionar tus canciones y setlists. Regístrate aquí:";
const whatsappLink = computed(() => `https://wa.me/?text=${encodeURIComponent(inviteText + ' ' + inviteUrl)}`);
const emailLink = computed(() => `mailto:?subject=Invitación a SetList Play&body=${encodeURIComponent(inviteText + ' ' + inviteUrl)}`);

const copied = ref(false);
function copyLink() {
    navigator.clipboard.writeText(inviteUrl);
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
}

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

<template>
  <footer class="mt-auto pt-12 pb-8 border-t border-gray-900">
    <div class="max-w-4xl mx-auto px-6">
      <!-- Main Footer Content -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
        <!-- Brand -->
        <div class="flex items-center gap-3">
          <img src="/logo.PNG" alt="SetList Play" class="w-8 h-8 rounded-lg opacity-80" />
          <div>
            <span class="font-bold text-white">SetList Play</span>
            <p class="text-xs text-gray-500">Tu compañero musical</p>
          </div>
        </div>

        <!-- Donation Button -->
        <a 
          :href="donationLink" 
          target="_blank"
          class="donation-btn flex items-center gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-amber-500/30 active:scale-95"
        >
          <i class="ph ph-coffee text-lg"></i>
          <span>Invítame un café</span>
        </a>
      </div>

      <!-- Links Row -->
      <div class="flex flex-wrap justify-center gap-4 mb-6 text-sm">
        <router-link to="/help" class="text-gray-500 hover:text-indigo-400 transition flex items-center gap-1">
          <i class="ph ph-question"></i> Ayuda
        </router-link>
        <a href="mailto:contacto@setlistplay.com" class="text-gray-500 hover:text-indigo-400 transition flex items-center gap-1">
          <i class="ph ph-envelope"></i> Contacto
        </a>
        <a :href="githubLink" target="_blank" class="text-gray-500 hover:text-indigo-400 transition flex items-center gap-1">
          <i class="ph ph-github-logo"></i> GitHub
        </a>
      </div>

      <!-- Copyright -->
      <div class="text-center text-xs text-gray-600">
        <p class="mb-1">
          Hecho con <i class="ph ph-heart-fill text-red-500"></i> por 
          <a :href="authorLink" target="_blank" class="text-gray-400 hover:text-indigo-400 transition font-medium">{{ authorName }}</a>
        </p>
        <p>© {{ currentYear }} SetList Play. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

// Configuración - Actualiza estos valores con tus datos
const authorName = 'Ramon Avilez';
const authorLink = 'https://github.com/rayavil'; // Tu perfil de GitHub o sitio personal
const githubLink = 'https://github.com/rayavil/setlist-play';
const donationLink = 'https://buymeacoffee.com/setlistplay'; // Cambia a tu link de donación

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.donation-btn {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
  50% { box-shadow: 0 0 20px 4px rgba(245, 158, 11, 0.2); }
}
</style>

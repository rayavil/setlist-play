<template>
  <div class="min-h-screen bg-black text-white p-6 pb-24">
    <!-- Header -->
    <header class="flex justify-between items-center mb-8 max-w-3xl mx-auto w-full">
      <router-link to="/" class="flex items-center gap-2 text-gray-400 hover:text-white transition">
        <i class="ph ph-arrow-left"></i> Volver al Inicio
      </router-link>
      <h1 class="text-2xl font-bold bg-linear-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
        Centro de Ayuda
      </h1>
    </header>

    <main class="max-w-3xl mx-auto space-y-8">
      <!-- Intro Card -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
        <i class="ph ph-books text-4xl text-indigo-400 mb-3"></i>
        <h2 class="text-xl font-bold text-white mb-2">¿Cómo funciona SetList Play?</h2>
        <p class="text-gray-400 text-sm">
          Descubre cómo sacar el máximo provecho a la plataforma, tanto si eres líder de alabanza como si eres parte del equipo.
        </p>
      </div>

      <!-- Sections -->
      <div class="space-y-4">
        <HelpAccordion title="🎵 Gestión de Listas" icon="ph-playlist">
          <ul class="list-disc pl-5 space-y-2 text-gray-400 text-sm">
            <li><strong>Crear una Lista:</strong> Desde el inicio, pulsa "Nueva Lista". Dale un título y opcionalmente una fecha.</li>
            <li><strong>Añadir Canciones:</strong> Dentro de la lista, usa el botón "+" para crear una canción nueva o la "Lupa" para buscar una existente de tu biblioteca.</li>
            <li><strong>Exportar PDF:</strong> Tienes dos formatos: "Resumen" (tabla simple) y "Cancionero" (letras completas). Ideal para imprimir.</li>
          </ul>
        </HelpAccordion>

        <HelpAccordion title="📡 Modo En Vivo (Live Sync)" icon="ph-broadcast">
          <div class="text-gray-400 text-sm space-y-3">
            <p>El "Modo En Vivo" permite que todos vean la misma canción al mismo tiempo.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-indigo-900/10 p-3 rounded-lg border border-indigo-500/20">
                <strong class="text-indigo-300 block mb-1">Para el Líder (Tú)</strong>
                <p>Activa el switch "Modo En Vivo" en tu lista. Cualquier canción que toques se mostrará automáticamente en los dispositivos de tu equipo.</p>
              </div>
              <div class="bg-teal-900/10 p-3 rounded-lg border border-teal-500/20">
                <strong class="text-teal-300 block mb-1">Para el Músico</strong>
                <p>Solo deben entrar a tu lista. Si el modo en vivo está activo, verán un aviso "Sincronizado" y la canción cambiará sola.</p>
              </div>
            </div>
          </div>
        </HelpAccordion>

        <HelpAccordion title="🎹 Herramientas Musicales" icon="ph-piano-keys">
           <ul class="list-disc pl-5 space-y-2 text-gray-400 text-sm">
            <li><strong>Transposición Inteligente:</strong> Usa los botones (-) y (+) en la vista de canción para cambiar el tono. Los acordes [C] cambiarán automáticamente.</li>
            <li><strong>Metrónomo:</strong> Pulsa el icono del metrónomo. Puedes ajustar el BPM manualmente o usar "Tap Tempo".</li>
            <li><strong>Letras Inteligentes:</strong> Escribe los acordes entre corchetes, ej: <code>[C] [Am]</code>. El sistema los reconocerá para poder transportarlos.</li>
          </ul>
        </HelpAccordion>

        <HelpAccordion title="❓ Preguntas Frecuentes" icon="ph-question">
           <div class="space-y-4 text-sm">
             <div>
               <p class="font-bold text-white mb-1">¿Mi equipo necesita cuenta?</p>
               <p class="text-gray-400">No necesariamente. Si haces tu lista **Pública**, puedes compartir el enlace y ellos podrán verla sin registrarse (como modo "solo lectura").</p>
             </div>
             <div>
               <p class="font-bold text-white mb-1">¿Puedo borrar canciones?</p>
               <p class="text-gray-400">Sí. Puedes quitarlas de una lista específica o borrarlas permanentemente desde tu biblioteca si eres el creador.</p>
             </div>
              <div>
               <p class="font-bold text-white mb-1">¿Hay límite de listas?</p>
               <p class="text-gray-400">El plan gratuito permite hasta 10 listas activas. Puedes borrar las antiguas para crear nuevas.</p>
             </div>
           </div>
        </HelpAccordion>
      </div>
      
      <!-- Contact/Support Hint -->
      <div class="text-center pt-8 pb-4">
        <p class="text-gray-500 text-xs">
          ¿Tienes más dudas o encontraste un error?
          <a href="#" class="text-indigo-400 underline decoration-indigo-400/30">Contáctame</a>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import HelpAccordion from '../components/HelpAccordion.vue';
</script>

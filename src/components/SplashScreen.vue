<template>
  <div class="fixed inset-0 z-100 bg-gray-900 flex flex-col items-center justify-center text-white transition-opacity duration-700"
       :class="{ 'opacity-0 pointer-events-none': !visible }">
       
      <div class="text-center animate-in zoom-in duration-500">
          <i class="ph ph-music-notes-simple text-6xl text-indigo-500 mb-4 animate-bounce"></i>
          <h1 class="text-4xl font-black tracking-tighter mb-1 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              SetList Play
          </h1>
          <p class="text-gray-500 font-mono text-xs mb-8 tracking-widest">V 2.0.0 PRO</p>
          
          <div class="max-w-xs mx-auto mb-12 relative">
              <i class="ph ph-quotes text-gray-700 text-4xl absolute -top-4 -left-4"></i>
              <p class="text-gray-300 italic font-serif text-lg leading-relaxed">
                  "{{ quote.text }}"
              </p>
              <!-- Author removed for generic bible/worship quotes or kept if specific -->
          </div>
      </div>
      
      <div class="absolute bottom-12 text-center w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <p class="text-xs text-gray-400 tracking-widest mb-1 uppercase font-semibold">
              Desarrollado por <span class="text-indigo-400 font-black">Ray DEV</span>
          </p>
          <p class="text-[10px] text-gray-600 italic font-serif tracking-wider">"Hecho para adorar..."</p>
          
          <div class="w-10 h-0.5 bg-gray-800 mx-auto rounded-full overflow-hidden mt-4">
              <div class="h-full bg-indigo-500 animate-loading"></div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const visible = ref(true);

const quotes = [
    { text: "Dios habita en la alabanza de su pueblo." },
    { text: "Canten al Señor un cántico nuevo." },
    { text: "Mi corazón y mi carne cantan al Dios vivo." },
    { text: "Adora en espíritu y en verdad." },
    { text: "Tu fidelidad es grande, tu fidelidad incomparable es." },
    { text: "Todo lo que respira, alabe al Señor." }
];

const quote = quotes[Math.floor(Math.random() * quotes.length)];

onMounted(() => {
    // Show for 3 seconds then fade out
    setTimeout(() => {
        visible.value = false;
    }, 3000);
});
</script>

<style scoped>
@keyframes loading {
    0% { width: 0%; transform: translateX(-100%); }
    50% { width: 100%; transform: translateX(0%); }
    100% { width: 0%; transform: translateX(100%); }
}
.animate-loading {
    animation: loading 2s infinite ease-in-out;
}
</style>

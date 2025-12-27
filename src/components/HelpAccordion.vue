<template>
  <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300">
    <button 
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition bg-transparent border-0 cursor-pointer"
    >
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 text-indigo-400">
          <i :class="['ph', icon]"></i>
        </div>
        <span class="font-bold text-white">{{ title }}</span>
      </div>
      <i 
        class="ph ph-caret-down text-gray-400 transition-transform duration-300"
        :class="{ 'rotate-180': isOpen }"
      ></i>
    </button>
    
    <div 
      class="grid transition-[grid-template-rows] duration-300 ease-out"
      :class="isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="overflow-hidden">
         <div class="p-4 pt-0 border-t border-gray-800/50 mt-2">
            <slot></slot>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  title: String,
  icon: String
});

const isOpen = ref(false);
</script>

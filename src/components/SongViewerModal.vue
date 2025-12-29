<template>
<Transition name="fade">
    <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col"
    @click.self="closeModal"
    >
    <!-- Header -->
    <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur shrink-0">
        <div class="flex-1 min-w-0">
            <h2 class="text-xl font-bold text-white truncate flex items-center gap-2">
                <i class="ph ph-music-notes-simple text-indigo-400"></i>
                {{ song?.title }}
            </h2>
            <p class="text-xs text-gray-400 font-mono mt-0.5">
                {{ song?.artist || 'Autor desconocido' }} • {{ song?.bpm }} BPM
            </p>
        </div>
        
        <button
            @click="closeModal"
            class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xl hover:text-white transition active:bg-gray-700 ml-4"
        >
            &times;
        </button>
    </div>

    <!-- Controls Toolbar -->
    <div class="p-2 border-b border-gray-900 bg-gray-900/80 flex justify-center sticky top-0 z-10">
        <div class="flex items-center gap-1 bg-gray-800 rounded-lg border border-gray-700 p-1">
            <button
            @click="transposeLevel--"
            class="w-10 h-10 flex items-center justify-center text-gray-400 active:text-white active:scale-95 hover:bg-gray-700/50 rounded"
            >
            <i class="ph ph-minus"></i>
            </button>
            <div class="w-10 h-10 flex items-center justify-center font-bold text-white text-lg">
             {{ displayKey }}
            </div>
            <button
            @click="transposeLevel++"
            class="w-10 h-10 flex items-center justify-center text-gray-400 active:text-white active:scale-95 hover:bg-gray-700/50 rounded"
            >
            <i class="ph ph-plus"></i>
            </button>
        </div>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div class="max-w-2xl mx-auto">
            <SmartLyrics
                v-if="song"
                :rawContent="song.raw"
                :transposeLevel="transposeLevel"
                viewMode="full"
            />
        </div>
    </div>
    
    </div>
</Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import SmartLyrics from './SmartLyrics.vue';
import { useMusicTheory } from '../composables/useMusicTheory';

const props = defineProps({
    modelValue: Boolean,
    song: Object
});

const emit = defineEmits(['update:modelValue']);

const { processChord } = useMusicTheory();
const transposeLevel = ref(0);

// Reset transpose when opening different song
watch(() => props.song, () => {
    transposeLevel.value = 0;
});

const displayKey = computed(() => {
    if (!props.song) return '-';
    return processChord(props.song.key || 'C', transposeLevel.value);
});

function closeModal() {
    emit('update:modelValue', false);
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

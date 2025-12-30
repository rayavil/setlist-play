<template>
  <div class="smart-lyrics-container pb-40">
    <div v-for="(line, lIdx) in parsedLines" :key="lIdx" class="lyric-line" :class="viewModeClass">
        <!-- If it's a section header -->
        <div v-if="line.type === 'header'" class="section-header w-full text-xs font-black tracking-widest text-gray-500 border-b border-gray-800 mt-6 mb-2 pb-1">
            <i class="ph ph-music-notes mr-1 text-indigo-500"></i>{{ line.content }}
        </div>
        <!-- If it's an instruction -->
        <div v-else-if="line.type === 'instruction'" class="instruction-box bg-yellow-900/30 text-yellow-500 px-3 py-1 rounded border border-yellow-700/50 text-sm font-bold my-2 inline-block shadow-lg">
            {{ line.content }}
        </div>
        <!-- If it's a repeat line -->
        <div v-else-if="line.type === 'repeat'" class="repeat-line w-full flex items-center gap-2 my-2 px-3 py-2 bg-gray-900/50 border border-dashed border-gray-700 rounded-lg">
            <i class="ph ph-repeat text-gray-500"></i>
            <span class="font-mono text-sm text-gray-300">{{ line.content }}</span>
            <i class="ph ph-repeat text-gray-500"></i>
        </div>
        <!-- Standard Lyric Line -->
        <template v-else>
            <div v-for="(unit, uIdx) in line.units" :key="uIdx" class="chord-lyric-unit flex flex-col items-center justify-end mr-1">
                <div 
                    v-if="unit.chord && viewMode !== 'lyrics'" 
                    class="chord-badge mb-1 px-2 py-0.5 rounded text-sm font-bold shadow-md cursor-pointer transition active:scale-95 border border-white/10 min-w-[24px] text-center"
                    :class="[getChordColor(unit.chord), transposeLevel !== 0 ? 'ring-2 ring-pink-500' : '']"
                    @click="$emit('chord-click', unit.chord)"
                >
                    {{ unit.chord }}
                </div>
                <span 
                    v-if="viewMode !== 'chords'"
                    class="lyric-text text-xl text-gray-200 whitespace-pre leading-tight min-h-[1.5rem]"
                >
                    {{ unit.text || '&nbsp;' }}
                </span>
            </div>
        </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMusicTheory } from '../composables/useMusicTheory';

const props = defineProps({
  rawContent: { type: String, default: '' },
  transposeLevel: { type: Number, default: 0 },
  viewMode: { type: String, default: 'full' } // 'full', 'lyrics', 'chords'
});

const { processChord, getChordColor } = useMusicTheory();

const parsedLines = computed(() => {
    if (!props.rawContent) return [];
    
    return props.rawContent.split('\n').map(line => {
        const originalLine = line;
        line = line.trim();
        if (!line) return { type: 'empty' };
        
        // Detect LaCuerda-style headers: ---Intro---, ---Coro---, etc.
        const sectionMatch = line.match(/^-{2,}(.+?)-{2,}$/);
        if (sectionMatch) {
            return { type: 'header', content: sectionMatch[1].trim().toUpperCase() };
        }
        
        // Detect Headers (Verso, Coro, INTRO, etc.) - multiple formats
        const headerPatterns = [
            /^(intro|verso|estrofa|coro|puente|bridge|pre-coro|precoro|final|outro|instrumental)(\s*\d*):?$/i,
            /^(estrofa|verso)\s*\d+$/i
        ];
        if (!line.includes('[') && headerPatterns.some(p => p.test(line))) {
            return { type: 'header', content: line.replace(':', '').toUpperCase() };
        }
        
        // Fallback header: ALL CAPS short lines without chords
        if (!line.includes('[') && line === line.toUpperCase() && line.length < 25 && line.length > 2) {
            return { type: 'header', content: line.replace(':', '') };
        }
        
        // Detect repeat markers: // ... // (just chords, shown as repeat line)
        if (line.startsWith('//') && line.endsWith('//')) {
            const content = line.replace(/^\/\/\s*/, '').replace(/\s*\/\/$/, '').trim();
            if (content) {
                return { type: 'repeat', content: content };
            }
        }
        
        // Clean up inline repeat markers from lyrics
        line = line.replace(/^\/\/\s*/, '').replace(/\s*\/\/$/, '');
        
        // Detect Instructions (*, ())
        if (line.startsWith('*') || (line.startsWith('(') && line.endsWith(')') && line.length < 30)) {
            return { type: 'instruction', content: line.replace(/[*()]/g, '').toUpperCase() };
        }

        // Parse Chords/Lyrics
        const parts = line.split(/(\[.*?\])/);
        const units = [];
        let pendingChord = null;

        parts.forEach(part => {
            if (part.startsWith('[') && part.endsWith(']')) {
                if (pendingChord) {
                    units.push({ chord: processChord(pendingChord, props.transposeLevel), text: '' });
                }
                pendingChord = part.replace(/[\[\]]/g, '');
            } else {
                if (part === '') return;
                units.push({ chord: pendingChord ? processChord(pendingChord, props.transposeLevel) : null, text: part });
                pendingChord = null;
            }
        });
        if (pendingChord) {
             units.push({ chord: processChord(pendingChord, props.transposeLevel), text: '' });
        }
        
        return { type: 'line', units };
    });
});

const viewModeClass = computed(() => {
    return {
        'mode-lyrics': props.viewMode === 'lyrics',
        'mode-chords': props.viewMode === 'chords'
    }
});
</script>

<style scoped>
.lyric-line {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    width: 100%;
}
/* Reusing the solid logic from the prototype */
.mode-chords .lyric-text { display: none; }
.mode-lyrics .chord-badge { display: none; }
</style>

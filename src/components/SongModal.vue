<template>
<Transition name="fade">
    <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col"
    @click.self="closeModal"
    >
    <div class="flex-1 overflow-y-auto">
        <div
        class="min-h-full flex items-start sm:items-center justify-center p-4 py-8"
        >
        <div
            class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
        >
            <!-- Header -->
            <div
            class="p-4 border-b border-gray-800 flex justify-between items-center"
            >
            <div class="flex items-center gap-4">
                <h2 class="text-xl font-bold flex items-center gap-2">
                    <i class="ph ph-music-notes text-indigo-400"></i>
                    {{ songToEdit ? "Editar Canción" : "Nueva Canción" }}
                </h2>
                <!-- Mode Toggle (Only for New Songs) -->
                <div v-if="!songToEdit" class="flex bg-gray-800 rounded-lg p-0.5">
                    <button 
                        @click="mode = 'manual'"
                        class="px-3 py-1 text-xs font-bold rounded-md transition"
                        :class="mode === 'manual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'"
                    >Manual</button>
                    <button 
                        @click="mode = 'import'"
                        class="px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1"
                        :class="mode === 'import' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'"
                    ><i class="ph ph-globe"></i> Importar</button>
                </div>
            </div>
            
            <button
                @click="closeModal"
                class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xl hover:text-white transition active:bg-gray-700"
            >
                &times;
            </button>
            </div>

            <!-- Scrollable Body -->
            <div class="overflow-y-auto flex-1 custom-scrollbar">

            <!-- Import Mode Body -->
            <div v-if="mode === 'import'" class="p-6 space-y-4">
                <div class="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4">
                    <h3 class="font-bold text-indigo-300 mb-2 flex items-center gap-2">
                        <i class="ph ph-globe"></i> Importar desde URL
                    </h3>
                    <p class="text-sm text-gray-400 mb-4">
                        Pega el link de <strong>LaCuerda.net</strong> o similares para extraer la letra y acordes automáticamente.
                    </p>
                    <div class="flex gap-2">
                        <input 
                            v-model="importUrl" 
                            type="text" 
                            placeholder="https://acordes.lacuerda.net/..." 
                            class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-600"
                            @keyup.enter="handleImport"
                        >
                        <button 
                            @click="handleImport" 
                            :disabled="loadingImport || !importUrl"
                            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg disabled:opacity-50 flex items-center gap-2"
                        >
                            <i v-if="loadingImport" class="ph ph-spinner animate-spin"></i>
                            {{ loadingImport ? 'Leyendo...' : 'Importar' }}
                        </button>
                    </div>
                    <p v-if="importError" class="text-red-400 text-xs mt-2">
                        {{ importError }}
                    </p>
                </div>

                <div class="text-center text-gray-500 text-xs py-4">
                    <p>O puedes cambiar a modo <strong>Manual</strong> arriba para escribirla tú mismo.</p>
                </div>
            </div>

            <!-- Manual Form Body -->
            <div v-else class="p-4 space-y-5">
            <!-- Title -->
            <div class="flex gap-2">
                <div class="flex-1">
                <label
                    class="text-xs text-gray-400 block mb-1 font-bold uppercase tracking-wider"
                    >Título *</label
                >
                <input
                    v-model="form.title"
                    type="text"
                    class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Ej: Grande es el Señor"
                />
                </div>
            </div>

            <!-- Category Badges Selector -->
            <div>
                <label
                class="text-xs text-gray-400 block mb-2 font-bold uppercase tracking-wider"
                >Categoría</label
                >
                <div class="flex gap-2">
                <button
                    v-for="cat in ['Alabanza', 'Adoración', 'Especial']"
                    :key="cat"
                    @click="form.category = cat"
                    class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1"
                    :class="
                    form.category === cat
                        ? getCategoryClass(cat)
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    "
                >
                    {{ cat }}
                </button>
                <button
                    v-if="form.category"
                    @click="form.category = ''"
                    class="px-2 text-gray-500 text-lg hover:text-white"
                >
                    &times;
                </button>
                </div>
            </div>

            <!-- Key, BPM, Time Sig in Row -->
            <div class="grid grid-cols-3 gap-3">
                <div>
                <label class="text-xs text-gray-400 block mb-1 font-bold"
                    >Tono</label
                >
                <select
                    v-model="form.key"
                    class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white text-center font-bold"
                >
                    <option
                    v-for="k in keys"
                    :key="k"
                    :value="k"
                    >
                    {{ k }}
                    </option>
                </select>
                </div>
                <div>
                <label class="text-xs text-gray-400 block mb-1 font-bold"
                    >BPM</label
                >
                <input
                    v-model.number="form.bpm"
                    type="number"
                    class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white text-center font-bold"
                    placeholder="120"
                />
                </div>
                <div>
                <label class="text-xs text-gray-400 block mb-1 font-bold"
                    >Compás</label
                >
                <select
                    v-model="form.time_signature"
                    class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white text-center font-bold"
                >
                    <option value="4/4">4/4</option>
                    <option value="3/4">3/4</option>
                    <option value="6/8">6/8</option>
                    <option value="2/4">2/4</option>
                </select>
                </div>
            </div>

            <!-- Lyrics Textarea with Helpers -->
            <div>
                <label
                class="text-xs text-gray-400 block mb-1 font-bold uppercase tracking-wider"
                >Letra y Acordes</label
                >

                <!-- Quick Insert Toolbar -->
                <div class="flex flex-wrap gap-1.5 mb-2">
                <button
                    v-for="chord in ['[C]', '[G]', '[Am]', '[D]']"
                    :key="chord"
                    type="button"
                    @click="insertAtCursor(chord)"
                    class="px-3 py-2 bg-gray-800 hover:bg-indigo-900/50 text-gray-300 text-sm rounded-lg border border-gray-700 font-mono active:scale-95"
                >
                    {{ chord }}
                </button>
                <span class="border-l border-gray-700 mx-1"></span>
                <button
                    v-for="tag in ['Verso\n', 'Coro\n', 'Puente\n']"
                    :key="tag"
                    type="button"
                    @click="insertAtCursor(tag)"
                    class="px-3 py-2 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 text-xs rounded-lg border border-indigo-800 font-bold active:scale-95"
                >
                    {{ tag.trim() }}
                </button>
                <button
                    type="button"
                    @click="insertAtCursor('(x2)')"
                    class="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded-lg border border-gray-700 active:scale-95"
                >
                    (x2)
                </button>
                </div>

                <textarea
                ref="textareaRef"
                v-model="form.raw"
                class="w-full h-64 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white font-mono text-sm leading-relaxed focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
                placeholder="Escribe o pega tu canción aquí..."
                spellcheck="false"
                ></textarea>

                <!-- Format Help -->
                <p class="text-[10px] text-gray-500 mt-2 text-right">
                Usa [C] para acordes, {V} para etiquetas
                </p>
            </div>

            <!-- Metadata Fields (Link/Notes) -->
            <div class="space-y-3 pt-2 border-t border-gray-800">
                <div>
                <label class="text-xs text-gray-400 block mb-1 font-bold"
                    >Link de Referencia (YouTube/Spotify)</label
                >
                <input
                    v-model="form.original_link"
                    type="text"
                    class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="https://..."
                />
                </div>
                <div>
                <label class="text-xs text-gray-400 block mb-1 font-bold"
                    >Notas de Ejecución / Internas</label
                >
                <textarea
                    v-model="form.notes"
                    rows="2"
                    class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
                    placeholder="Intro suave, solo de guitarra al final..."
                ></textarea>
                </div>
            </div>
            </div> <!-- Close .p-4 -->
            </div> <!-- Close Scrollable Body -->

            <!-- Footer Actions -->
            <div class="p-4 border-t border-gray-800 grid grid-cols-2 gap-3">
            <button
                @click="closeModal"
                class="py-3 rounded-xl bg-gray-800 text-gray-300 font-bold text-center active:scale-95 transition"
            >
                Cancelar
            </button>
            <button
                @click="handleSave"
                :disabled="isSaving || !form.title"
                class="py-3 rounded-xl bg-indigo-600 text-white font-bold text-center disabled:opacity-50 active:scale-95 transition"
            >
                {{
                isSaving
                    ? "Guardando..."
                    : songToEdit
                    ? "Guardar"
                    : "Agregar"
                }}
            </button>
            </div>
            </div> <!-- End Manual Body (conditional wrapper needed check if I closed it?) -->
        </div>
        </div>
    </div>
</Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useSongImporter } from '../composables/useSongImporter';

const props = defineProps({
    modelValue: Boolean,
    songToEdit: Object, // Null for new song
    isSaving: Boolean
});

const emit = defineEmits(['update:modelValue', 'save']);

// Importer
const { fetchAndParse, loading: loadingImport, error: importError } = useSongImporter();
const mode = ref('manual'); // 'manual' | 'import'
const importUrl = ref('');

const form = ref({
    title: '',
    category: '',
    key: 'C',
    bpm: 120,
    time_signature: '4/4',
    raw: '',
    original_link: '',
    notes: ''
});

const textareaRef = ref(null);

const keys = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm'
];

watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        mode.value = 'manual'; // Reset mode
        importUrl.value = '';
        if (props.songToEdit) {
            form.value = { ...props.songToEdit };
        } else {
            resetForm();
        }
    }
});

async function handleImport() {
    if (!importUrl.value) return;
    
    const result = await fetchAndParse(importUrl.value);
    
    if (result) {
        // Success! Fill form and switch to manual
        form.value = {
            ...form.value,
            ...result,
            original_link: importUrl.value
        };
        mode.value = 'manual';
    }
}

function resetForm() {
    form.value = {
        title: '',
        category: '',
        key: 'C',
        bpm: 120,
        time_signature: '4/4',
        raw: '',
        original_link: '',
        notes: ''
    };
}

function closeModal() {
    emit('update:modelValue', false);
}

function handleSave() {
    emit('save', { ...form.value });
}

function insertAtCursor(text) {
    const el = textareaRef.value;
    if (!el) return;
    
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = form.value.raw;
    
    form.value.raw = val.substring(0, start) + text + val.substring(end);
    
    nextTick(() => {
        el.selectionStart = el.selectionEnd = start + text.length;
        el.focus();
    });
}

function getCategoryClass(cat) {
    switch (cat) {
        case 'Alabanza': return 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/20';
        case 'Adoración': return 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20';
        case 'Especial': return 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20';
        default: return '';
    }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

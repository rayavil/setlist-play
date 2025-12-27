<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <i class="ph ph-music-notes text-purple-400"></i> Gestión de Canciones
      </h2>
      <div class="relative">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar..."
          class="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-64 focus:ring-1 focus:ring-purple-500"
        />
      </div>
    </div>

    <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-950 text-gray-400">
          <tr>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">
              Título
            </th>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">Tono</th>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">BPM</th>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">
              Categoría
            </th>
            <th
              class="p-4 font-bold uppercase tracking-wider text-xs text-right"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr
            v-for="song in filteredSongs"
            :key="song.id"
            class="hover:bg-gray-800/50 transition"
          >
            <td class="p-4 font-bold text-white">{{ song.title }}</td>
            <td class="p-4 text-gray-300">
              <span class="bg-gray-800 px-2 py-0.5 rounded text-xs">{{
                song.key
              }}</span>
            </td>
            <td class="p-4 text-gray-500">{{ song.bpm }}</td>
            <td class="p-4 text-gray-300">
              <span
                v-if="song.category"
                class="text-[10px] uppercase font-bold text-gray-400 bg-gray-950 border border-gray-800 px-1.5 py-0.5 rounded"
                >{{ song.category }}</span
              >
              <span v-else class="text-gray-600">-</span>
            </td>
            <td class="p-4 text-right">
              <button
                @click="deleteSong(song)"
                class="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded transition"
              >
                <i class="ph ph-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="filteredSongs.length === 0 && !loading"
        class="p-8 text-center text-gray-500"
      >
        No se encontraron canciones.
      </div>
      <div v-if="loading" class="p-8 text-center text-gray-500 animate-pulse">
        Cargando...
      </div>
    </div>

    <div class="mt-4 flex justify-between items-center text-xs text-gray-500">
      <span
        >Mostrando {{ filteredSongs.length }} de
        {{ songs.length }} canciones</span
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "../lib/supabase";
import Swal from 'sweetalert2';

const songs = ref([]);
const loading = ref(true);
const search = ref("");

onMounted(async () => {
  fetchSongs();
});

async function fetchSongs() {
  loading.value = true;
  const { data } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200); // Limit for perf
  if (data) songs.value = data;
  loading.value = false;
}

const filteredSongs = computed(() => {
  if (!search.value) return songs.value;
  const q = search.value.toLowerCase();
  return songs.value.filter((s) => s.title.toLowerCase().includes(q));
});

async function deleteSong(song) {
    const result = await Swal.fire({
        title: `¿Eliminar "${song.title}"?`,
        text: "Esta acción es permanente y no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#374151',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#1f2937',
        color: '#fff'
    });

    if (!result.isConfirmed) return;
    
    const { error } = await supabase.from('songs').delete().eq('id', song.id);
    if (!error) {
        songs.value = songs.value.filter(s => s.id !== song.id);
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'success',
            title: 'Canción eliminada',
            background: '#1f2937',
            color: '#fff'
        });
    } else {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#1f2937', color: '#fff' });
    }
}
</script>

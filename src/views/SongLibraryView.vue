<template>
  <div class="min-h-screen bg-black text-white p-6 pb-24">
    <!-- Header -->
    <!-- Header -->
    <header class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 md:gap-0">
      <div class="flex items-center gap-3 w-full md:w-auto">
        <router-link
          to="/"
          class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition shrink-0"
        >
          <i class="ph ph-arrow-left text-xl"></i>
        </router-link>
        <h1 class="text-2xl font-bold flex items-center gap-2 truncate">
          <i class="ph ph-books text-indigo-400"></i> Biblioteca
        </h1>
        
        <!-- Add Button (Mobile Only placement available if needed, but keeping unified) -->
        <button
            @click="openAddSongModal"
            class="md:hidden ml-auto bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition active:scale-95"
            title="Agregar Canción"
        >
            <i class="ph ph-plus text-xl font-bold"></i>
        </button>
      </div>
      
      <div class="flex items-center gap-4 w-full md:w-auto">
          <div class="bg-gray-800 p-1 rounded-lg flex flex-1 md:flex-none">
            <button
              @click="currentTab = 'mine'"
              class="flex-1 md:flex-none justify-center px-4 py-2 rounded-md text-sm font-bold transition flex items-center gap-2"
              :class="currentTab === 'mine' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-700'"
            >
              <i class="ph ph-user"></i> Mis Canciones
            </button>
            <button
              @click="currentTab = 'global'"
              class="flex-1 md:flex-none justify-center px-4 py-2 rounded-md text-sm font-bold transition flex items-center gap-2"
              :class="currentTab === 'global' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-700'"
            >
              <i class="ph ph-globe-hemisphere-west"></i> Global
            </button>
          </div>

           <!-- Add Song Button (Desktop) -->
          <button
            @click="openAddSongModal"
            class="hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 rounded-full items-center justify-center shadow-lg transition active:scale-95"
            title="Agregar Canción"
          >
            <i class="ph ph-plus text-xl font-bold"></i>
          </button>
      </div>
    </header>

    <!-- Search Tool -->
    <div class="mb-6 relative">
        <i class="ph ph-magnifying-glass absolute left-4 top-3.5 text-gray-500 text-lg"></i>
        <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar por título, letra o artista..."
            class="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-base shadow-sm transition-all"
        />
    </div>

    <!-- Content List -->
    <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-20 bg-gray-900 rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="filteredSongs.length === 0" class="text-center py-12 text-gray-600">
        <div class="bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-700">
             <i class="ph ph-music-notes-simple text-3xl"></i>
        </div>
        <p class="text-lg font-medium">No se encontraron canciones.</p>
        <p class="text-sm">Intenta con otra búsqueda o cambia de pestaña.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div 
            v-for="song in filteredSongs" 
            :key="song.id"
            class="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-indigo-500/30 transition group relative"
        >
            <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-lg text-white truncate leading-tight">{{ song.title }}</h3>
                    <div class="flex items-center gap-2 mt-1 text-xs text-gray-400 font-mono">
                        <span class="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300 border border-gray-700">{{ song.key }}</span>
                        <span v-if="song.bpm">{{ song.bpm }} BPM</span>
                        <span v-if="song.artist" class="font-sans text-indigo-400">• {{ song.artist }}</span>
                    </div>
                </div>
                
                <!-- Setlist Usage Badge -->
                <div v-if="currentTab === 'mine' && getUsageCount(song.id) > 0" class="relative group/usage shrink-0 ml-2">
                    <span class="bg-indigo-900/30 text-indigo-400 text-[10px] font-bold px-2 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1 cursor-help">
                        <i class="ph ph-playlist"></i>
                        {{ getUsageCount(song.id) }}
                    </span>
                    <!-- Tooltip -->
                    <div class="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-xl z-20 hidden group-hover/usage:block">
                        <p class="text-[10px] text-gray-400 uppercase font-bold mb-1">En listas:</p>
                        <ul class="text-xs space-y-1">
                            <li v-for="listName in getUsageNames(song.id)" :key="listName" class="text-white truncate">• {{ listName }}</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center">
                 <!-- Actions -->
                 <div class="flex gap-2">
                    <!-- Add to Setlist -->
                    <button 
                        @click="openAddToSetlistModal(song)"
                        class="flex-1 md:flex-none justify-center text-xs bg-gray-800 hover:bg-indigo-900/50 text-gray-300 hover:text-indigo-300 border border-gray-700 px-3 py-2.5 rounded-lg transition flex items-center gap-1.5 active:scale-95"
                    >
                        <i class="ph ph-plus-circle text-base"></i> <span class="hidden sm:inline">Agregar a Lista</span><span class="sm:hidden">Lista</span>
                    </button>
                    
                     <!-- Clone (If Global) -->
                    <button 
                        v-if="currentTab === 'global'"
                        @click="cloneSong(song)"
                        class="flex-1 md:flex-none justify-center text-xs bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 px-3 py-2.5 rounded-lg transition flex items-center gap-1.5 active:scale-95"
                    >
                        <i class="ph ph-copy text-base"></i> Clonar
                    </button>

                    <!-- Edit/Delete (If Mine) -->
                    <div v-if="currentTab === 'mine'" class="flex gap-2">
                        <button 
                            @click="openEditSongModal(song)"
                            class="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-3 py-2.5 rounded-lg transition flex items-center gap-1.5 active:scale-95"
                            title="Editar"
                        >
                            <i class="ph ph-pencil-simple text-base"></i>
                        </button>
                        <button 
                            @click="deleteSong(song)"
                            class="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-3 py-2.5 rounded-lg transition flex items-center gap-1.5 active:scale-95"
                            title="Eliminar permanentemente"
                        >
                            <i class="ph ph-trash text-base"></i>
                        </button>
                        <button 
                            @click="deleteSong(song)"
                            class="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-3 py-2.5 rounded-lg transition flex items-center gap-1.5 active:scale-95"
                            title="Eliminar permanentemente"
                        >
                            <i class="ph ph-trash text-base"></i>
                        </button>
                    </div>

                    <!-- View Button (Eye) - For All Songs -->
                    <button 
                         @click="openViewerModal(song)"
                         class="text-xs bg-gray-800 hover:bg-gray-700 text-indigo-400 border border-gray-700 px-3 py-2.5 rounded-lg transition flex items-center gap-1.5 active:scale-95"
                         title="Ver Canción"
                    >
                         <i class="ph ph-eye text-base"></i>
                    </button>
                 </div>
                 
                 <!-- Meta -->
                 <div v-if="currentTab === 'global'" class="text-[10px] text-gray-500">
                    <i class="ph ph-user"></i> {{ song.profiles?.username || 'Anon' }}
                 </div>
            </div>
        </div>
    </div>

    <!-- ADD TO SETLIST MODAL -->
    <Transition name="fade">
        <div v-if="showAddModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
                <div class="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 class="font-bold">Agregar a Lista</h3>
                    <button @click="closeAddModal" class="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div class="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                    <p class="text-sm text-gray-400 mb-2">Selecciona una lista para agregar: <span class="text-indigo-400 font-bold">{{ selectedSong?.title }}</span></p>
                    
                    <button 
                        v-for="list in mySetlists" 
                        :key="list.id"
                        @click="addToSetlist(list)"
                        class="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 p-3 rounded-xl flex items-center gap-3 transition text-left group"
                    >
                         <div class="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition">
                            <i class="ph" :class="list.icon_name || 'ph-playlist'"></i>
                         </div>
                         <div>
                             <p class="font-bold text-sm">{{ list.title }}</p>
                             <p class="text-[10px] text-gray-500">{{ new Date(list.created_at).toLocaleDateString() }}</p>
                         </div>
                    </button>
                     <div v-if="mySetlists.length === 0" class="text-center py-4 text-gray-500 text-sm">
                        No tienes listas creadas.
                    </div>
                </div>
            </div>
        </div>
    </Transition>

    <!-- Song Modal -->
    <SongModal 
        v-model="showSongModal"
        :songToEdit="editingSong"
        :isSaving="isSaving"
        @save="handleSaveSong"
    />
    
    <!-- Song Viewer Modal -->
    <SongViewerModal
        v-model="showViewerModal"
        :song="viewingSong"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import SongModal from '../components/SongModal.vue';
import SongViewerModal from '../components/SongViewerModal.vue';

const loading = ref(true);
const songs = ref([]);
const searchQuery = ref('');
const currentTab = ref('mine'); // 'mine' | 'global'
const user = ref(null);

// Usage Data (Simple Map: songId -> [Setlist Names])
const usageMap = ref({});

// Add Song State
const showSongModal = ref(false);
const editingSong = ref(null); // Track which song is being edited
const isSaving = ref(false);

// Viewer State
const showViewerModal = ref(false);
const viewingSong = ref(null);

// Add To Setlist Logic
const showAddModal = ref(false);
const selectedSong = ref(null);
const mySetlists = ref([]);

onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    user.value = session?.user;
    if(user.value) {
        await fetchSongs();
        await fetchMySetlists();
    }
});

watch(currentTab, () => {
    fetchSongs();
});

async function fetchSongs() {
    loading.value = true;
    songs.value = [];
    usageMap.value = {};

    try {
        let query = supabase
            .from('songs')
            .select(`
                *,
                profiles(username),
                setlist_items(
                    setlist_id,
                    setlists(title)
                )
            `)
            .order('title', { ascending: true });

        if (currentTab.value === 'mine') {
            query = query.eq('owner_id', user.value.id);
        } else {
            // Global: Public songs, NOT mine
            query = query.eq('is_public', true).neq('owner_id', user.value.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Process usage metadata
        if (data) {
             songs.value = data;
             data.forEach(song => {
                 if(song.setlist_items && song.setlist_items.length > 0) {
                     // Extract setlist titles
                     const titles = song.setlist_items
                        .map(item => item.setlists?.title)
                        .filter(t => t); // remove nulls
                     // Deduplicate
                     usageMap.value[song.id] = [...new Set(titles)];
                 } else {
                     usageMap.value[song.id] = [];
                 }
             });
        }
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

async function fetchMySetlists() {
    const { data } = await supabase
        .from('setlists')
        .select('id, title, created_at, icon_name')
        .eq('owner_id', user.value.id)
        .order('created_at', { ascending: false });
    if(data) mySetlists.value = data;
}

// Helpers
// Helpers
function normalizeText(text) {
    if (!text) return '';
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

const filteredSongs = computed(() => {
    if(!searchQuery.value) return songs.value;
    
    // Normalize query
    const terms = normalizeText(searchQuery.value).split(' ').filter(t => t);
    
    if (terms.length === 0) return songs.value;

    return songs.value.filter(s => {
        const title = normalizeText(s.title);
        const artist = normalizeText(s.artist);
        const content = normalizeText(s.raw);
        
        // Search matches if ALL terms are present in ANY of the fields (or simple includes)
        // Let's do a simple "some term must match" or "every term must match"?
        // Usually "every term" is better for "Grande Señor" -> finds "Grande es el Señor"
        
        return terms.every(term => 
            title.includes(term) || 
            artist.includes(term) || 
            content.includes(term)
        );
    });
});

function getUsageCount(songId) {
    return usageMap.value[songId]?.length || 0;
}

function getUsageNames(songId) {
    return usageMap.value[songId] || [];
}

// Actions
function openAddToSetlistModal(song) {
    selectedSong.value = song;
    showAddModal.value = true;
}

function closeAddModal() {
    showAddModal.value = false;
    selectedSong.value = null;
}

async function addToSetlist(setlist) {
    if(!selectedSong.value) return;
    
    // 1. Get max position
    const { data: maxContent } = await supabase
        .from('setlist_items')
        .select('position')
        .eq('setlist_id', setlist.id)
        .order('position', { ascending: false })
        .limit(1);
        
    const nextPos = (maxContent && maxContent.length > 0) ? maxContent[0].position + 1 : 1;

    // 2. Insert with owner check? RLS should handle it.
    // Wait -> If fetching Global song, we can add it directly to our setlist? YES, relation is by ID.
    // Ideally we should CLONE it if the user wants to edit it later, but linking is fine for now.
    // If the global song is deleted (unlikely or handled by cascade), it disappears from the list.
    
    // IMPORTANT: If 'mine', usage is straightforward. If 'global', we might want to CLONE first implicitly?
    // User requested "Clone" as a separate button. So adding directly links the original ID.
    
    const { error } = await supabase.from('setlist_items').insert({
        setlist_id: setlist.id,
        song_id: selectedSong.value.id,
        position: nextPos
    });

    if(error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } else {
        Swal.fire({
            icon: 'success',
            title: 'Agregada',
            text: `Canción agregada a "${setlist.title}"`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            background: '#1f2937',
            color: '#fff'
        });
        closeAddModal();
        // Update local usage map if it was 'mine'
        if(currentTab.value === 'mine') {
             if(!usageMap.value[selectedSong.value.id]) usageMap.value[selectedSong.value.id] = [];
             usageMap.value[selectedSong.value.id].push(setlist.title);
        }
    }
}

async function cloneSong(song) {
    const { value: confirm } = await Swal.fire({
        title: '¿Clonar canción?',
        text: `Se creará una copia de "${song.title}" en tu biblioteca personal.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, clonar',
        background: '#1f2937',
        color: '#fff'
    });

    if(!confirm) return;

    // Insert copy
    const { error } = await supabase.from('songs').insert({
        title: song.title,
        artist: song.artist,
        key: song.key,
        bpm: song.bpm,
        time_signature: song.time_signature,
        raw: song.raw,
        original_link: song.original_link,
        notes: song.notes,
        owner_id: user.value.id,
        // is_public defaults to false usually, or we explicitly set it?
        // Let's assume default schema handles it, or set to false/private.
    });

    if(error) {
         Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } else {
         Swal.fire({
            icon: 'success',
            title: 'Clonada',
            text: 'La canción ahora está en tu biblioteca.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            background: '#1f2937',
            color: '#fff'
        });
    }
}

// CRUD
function openAddSongModal() {
    editingSong.value = null;
    showSongModal.value = true;
}

function openEditSongModal(song) {
    editingSong.value = song;
    showSongModal.value = true;
}

function openViewerModal(song) {
    viewingSong.value = song;
    showViewerModal.value = true;
}

async function handleSaveSong(formData) {
    isSaving.value = true;
    try {
        if (editingSong.value) {
            // UDPATE
            const { error } = await supabase
                .from('songs')
                .update({
                    ...formData,
                    // ensure we don't accidentally update owner_id or id if not needed, 
                    // though RLS usually protects this.
                })
                .eq('id', editingSong.value.id);

            if (error) throw error;
            
            Swal.fire({
                icon: 'success',
                title: 'Canción actualizada',
                toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
                background: '#1f2937', color: '#fff'
            });
        } else {
            // INSERT
            const { error } = await supabase.from('songs').insert({
                ...formData,
                owner_id: user.value.id,
                is_public: true
            });

            if (error) throw error;
            
            Swal.fire({
                icon: 'success',
                title: 'Canción creada',
                toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
                background: '#1f2937', color: '#fff'
            });
        }

        showSongModal.value = false;
        fetchSongs(); 
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: e.message });
    } finally {
        isSaving.value = false;
    }
}

async function deleteSong(song) {
    const usages = getUsageCount(song.id);
    let warningText = "Esta acción no se puede deshacer.";
    if (usages > 0) {
        warningText = `¡Cuidado! Esta canción se borrará de ${usages} lista(s) donde se está usando.`;
    }

    const { value: confirm } = await Swal.fire({
        title: '¿Eliminar canción?',
        text: warningText,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, borrar para siempre',
        background: '#1f2937', color: '#fff'
    });

    if (!confirm) return;

    try {
        const { error } = await supabase
            .from('songs')
            .delete()
            .eq('id', song.id);

        if (error) throw error;

        Swal.fire({
            icon: 'success',
            title: 'Eliminada',
            toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
            background: '#1f2937', color: '#fff'
        });
        fetchSongs();
    } catch (e) {
        console.error(e);
        Swal.fire({ icon: 'error', title: 'Error', text: e.message });
    }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

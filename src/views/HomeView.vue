<template>
  <div class="min-h-screen bg-black text-white p-6 pb-24">
    <header class="flex justify-between items-center mb-8">
      <div class="flex items-center gap-3">
        <img src="/logo.PNG" alt="SetList Play" class="w-10 h-10 rounded-xl shadow-lg" />
        <h1
          class="text-2xl md:text-3xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
        >
          SetList Play
        </h1>
      </div>
      <div v-if="user" class="flex items-center gap-3">
        <router-link 
          v-if="userRole === 'admin' || userRole === 'super_admin'"
          to="/admin"
          class="text-xs bg-indigo-900 border border-indigo-500 text-indigo-300 px-3 py-1 rounded hover:bg-indigo-800 transition"
        >
          <i class="ph ph-shield-check"></i> Admin
        </router-link>
        
        <router-link
          to="/library"
          class="text-sm bg-indigo-600 border border-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition flex items-center gap-2 font-bold"
        >
          <i class="ph ph-books text-lg"></i> Biblioteca de Canciones
        </router-link>

        <router-link 
          to="/help" 
          class="text-xs bg-gray-800 px-3 py-1 rounded border border-gray-700 hover:bg-gray-700 text-gray-300 flex items-center gap-1"
          title="Ayuda"
        >
          <i class="ph ph-question text-indigo-400"></i> Ayuda
        </router-link>

        <span class="text-xs text-gray-500 hidden sm:inline">{{ user.email }}</span>
        
        <button
          @click="logout"
          class="text-xs bg-red-900/20 text-red-400 px-3 py-1 rounded border border-red-900/50 hover:bg-red-900/40"
        >
          Salir
        </button>
      </div>
      <router-link
        v-else
        to="/login"
        class="text-sm bg-indigo-600 px-4 py-2 rounded-lg font-bold"
        >Admin Login</router-link
      >
    </header>

    <!-- My Setlists (Admin Only) -->
    <section v-if="user" class="mb-10">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Mis Listas</h2>
        <button
          @click="createSetlist"
          class="flex items-center gap-2 text-sm bg-gray-800 px-3 py-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition"
        >
          <i class="ph ph-plus-circle text-indigo-400"></i> Nueva Lista
        </button>
      </div>

      <div v-if="loading" class="text-gray-500 animate-pulse">Cargando...</div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="list in mySetlists"
          :key="list.id"
          class="border-2 rounded-xl flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          :style="{ 
              borderColor: list.hex_color, 
              boxShadow: '0 0 15px ' + list.hex_color + '1A',
              background: 'linear-gradient(135deg, #111827 40%, ' + list.hex_color + '22 100%)'
          }"
        >
          <!-- Top Status Icons -->
          <div class="absolute top-2 right-2 flex gap-1 z-10">
            <span
              v-if="!list.is_public"
              class="bg-black/50 p-1.5 rounded-lg backdrop-blur-sm shadow-sm"
              ><i class="ph ph-lock-key text-gray-400 text-sm"></i
            ></span>
            <span v-if="list.is_live" class="flex h-3 w-3 relative mt-1 mr-1">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-3 w-3 bg-red-500"
              ></span>
            </span>
          </div>

          <!-- Clickable Main Area -->
          <div 
            @click="router.push(`/setlist/${list.id}`)"
            class="p-5 flex-1 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition"
          >
              <div
                class="text-5xl text-gray-800 group-hover:text-white/10 transition duration-500 mb-4"
              >
                <i class="ph" :class="list.icon_name || 'ph-playlist'" :style="{ color: list.hex_color }"></i>
              </div>
              <div class="relative z-10">
                <h3
                  class="font-bold text-lg truncate text-white leading-tight mb-2 group-hover:text-indigo-400 transition"
                >
                  {{ list.title }}
                </h3>
                <div class="flex flex-col gap-1">
                    <p class="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                        <i class="ph ph-calendar-blank text-indigo-400/70"></i>
                        {{ list.event_date ? new Date(list.event_date).toLocaleString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' }) : new Date(list.created_at).toLocaleDateString() }}
                    </p>
                    <span v-if="list.service_type" class="text-[10px] font-bold uppercase tracking-wider bg-black/40 self-start px-2 py-0.5 rounded text-gray-400 border border-white/5">
                        {{ list.service_type }}
                    </span>
                </div>
              </div>
          </div>

          <!-- Action Buttons (Larger) -->
          <div class="flex border-t border-gray-800/50 bg-black/20 backdrop-blur-sm">
            <div class="flex items-center justify-around w-full py-2">
               <button
                @click.stop="shareSetlist(list)"
                class="p-2 rounded-xl flex items-center justify-center text-gray-500 hover:text-teal-400 hover:bg-teal-900/20 transition active:scale-95"
                title="Compartir"
              >
                <i class="ph ph-share-network text-xl"></i>
              </button>
              <div class="w-px h-6 bg-gray-800/50"></div>
              <button
                @click.stop="renameSetlist(list)"
                class="p-2 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-400 hover:bg-indigo-900/20 transition active:scale-95"
              >
                <i class="ph ph-pencil-simple text-xl"></i>
              </button>
              <div class="w-px h-6 bg-gray-800/50"></div>
              <button
                @click.stop="deleteSetlist(list)"
                class="p-2 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition active:scale-95"
              >
                <i class="ph ph-trash text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="mySetlists.length === 0"
          class="col-span-2 text-gray-600 text-sm italic py-4"
        >
          No tienes listas creadas.
        </div>
      </div>
    </section>

    <!-- Public Lists (Explore) -->
    <section>
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i class="ph ph-globe-hemisphere-west text-indigo-500"></i> Explorar
      </h2>

      <div v-if="loading" class="text-gray-500 animate-pulse">Cargando...</div>

      <div class="grid grid-cols-1 gap-3">
        <div
          v-for="list in publicSetlists"
          :key="list.id"
          @click="router.push(`/setlist/${list.id}`)"
          class="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-800 transition"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-500"
            >
              <i class="ph ph-music-notes"></i>
            </div>
            <div>
              <h3 class="font-bold text-base">{{ list.title }}</h3>
              <p class="text-xs text-gray-500 flex items-center gap-1">
                <i class="ph ph-user"></i>
                {{ list.profiles?.username || "Anónimo" }}
              </p>
            </div>
          </div>

          <div
            v-if="list.is_live"
            class="text-red-500 text-xs font-bold animate-pulse px-2 py-1 bg-red-900/20 rounded"
          >
            EN VIVO
          </div>
          <i v-else class="ph ph-caret-right text-gray-600"></i>
        </div>
      </div>
    </section>

    <!-- Invite Card -->
    <section class="mt-12 mb-8">
        <div class="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <h3 class="text-lg font-bold flex items-center gap-2 text-indigo-400 mb-2">
                    <i class="ph ph-gift"></i> Invita a tus amigos
                </h3>
                <p class="text-sm text-gray-400 max-w-md">
                    Ayuda a crecer la comunidad de SetList Play compartiendo la app con otros músicos y líderes de alabanza.
                </p>
            </div>
            <div class="flex gap-3">
                 <a 
                    :href="whatsappLink" 
                    target="_blank"
                    class="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition text-sm shadow-lg"
                >
                    <i class="ph ph-whatsapp-logo text-lg"></i> WhatsApp
                </a>
                 <button 
                    @click="copyLink" 
                    class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition text-sm border border-gray-700"
                >
                    <i class="ph ph-link text-lg"></i> {{ copied ? 'Copiado' : 'Link' }}
                </button>
            </div>
        </div>
    </section>

    <!-- SETLIST MODAL (Create/Edit) -->
    <Transition name="fade">
    <div v-if="showSetlistModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="closeSetlistModal">
        <div class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div class="p-5 border-b border-gray-800 flex justify-between items-center">
                <h2 class="text-xl font-bold flex items-center gap-2">
                    <i class="ph ph-playlist text-indigo-400"></i>
                    {{ editingSetlist ? 'Editar Lista' : 'Nueva Lista' }}
                </h2>
                <button @click="closeSetlistModal" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xl">&times;</button>
            </div>
            <div class="p-5 space-y-4">
                <div>
                    <label class="text-xs text-gray-400 block mb-2 font-bold uppercase tracking-wider">Nombre de la Lista</label>
                    <input 
                        v-model="setlistForm.title" 
                        type="text" 
                        class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent" 
                        placeholder="Ej: Domingo 29 Dic"
                        @keyup.enter="saveSetlist"
                        ref="setlistTitleInput"
                    />
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs text-gray-400 block mb-2 font-bold uppercase tracking-wider">Fecha y Hora</label>
                        <input 
                            v-model="setlistForm.event_date" 
                            type="datetime-local" 
                            class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm font-bold" 
                        />
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 block mb-2 font-bold uppercase tracking-wider">Tipo</label>
                        <input 
                            v-model="setlistForm.service_type" 
                            type="text" 
                            list="serviceTypes"
                            class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm font-bold"
                            placeholder="Ej: Jóvenes"
                        />
                        <datalist id="serviceTypes">
                            <option value="Domingo"></option>
                            <option value="Jóvenes"></option>
                            <option value="Ensayo"></option>
                            <option value="Especial"></option>
                            <option value="Vigilia"></option>
                        </datalist>
                    </div>
                </div>

                <!-- Customization Pickers -->
                <div class="grid grid-cols-1 gap-3">
                    <div>
                        <label class="text-xs text-gray-400 block mb-2 font-bold uppercase tracking-wider">Color</label>
                        <div class="flex flex-wrap gap-2">
                            <button 
                                v-for="color in presetColors" 
                                :key="color" 
                                @click="setlistForm.hex_color = color"
                                class="w-8 h-8 rounded-full border-2 transition hover:scale-110"
                                :class="setlistForm.hex_color === color ? 'border-white' : 'border-transparent'"
                                :style="{ backgroundColor: color }"
                            ></button>
                        </div>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 block mb-2 font-bold uppercase tracking-wider">Icono</label>
                        <div class="flex flex-wrap gap-2 bg-gray-800/50 p-2 rounded-xl">
                            <button 
                                v-for="icon in presetIcons" 
                                :key="icon" 
                                @click="setlistForm.icon_name = icon"
                                class="w-9 h-9 rounded-lg flex items-center justify-center text-xl transition hover:bg-gray-700"
                                :class="setlistForm.icon_name === icon ? 'bg-gray-700 text-white shadow-lg ring-1 ring-gray-500' : 'text-gray-500'"
                            >
                                <i class="ph" :class="icon"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="!editingSetlist" class="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl">
                    <input type="checkbox" v-model="setlistForm.is_public" id="publicCheck" class="w-5 h-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500">
                    <label for="publicCheck" class="text-sm text-gray-300 flex-1">
                        <span class="font-bold">Hacer pública</span>
                        <span class="text-gray-500 block text-xs">Otros podrán ver y clonar esta lista</span>
                    </label>
                </div>
            </div>
            <div class="p-5 border-t border-gray-800 grid grid-cols-2 gap-3">
                <button @click="closeSetlistModal" class="py-3 rounded-xl bg-gray-800 text-gray-300 font-bold text-center active:scale-95 transition">
                    Cancelar
                </button>
                <button @click="saveSetlist" :disabled="!setlistForm.title" class="py-3 rounded-xl bg-indigo-600 text-white font-bold text-center disabled:opacity-50 active:scale-95 transition">
                    {{ editingSetlist ? 'Guardar' : 'Crear Lista' }}
                </button>
            </div>
        </div>
    </div>
    </Transition>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { supabase } from "../lib/supabase";
import { useRouter } from "vue-router";
import Swal from 'sweetalert2';

const router = useRouter();
const user = ref(null);
const userRole = ref(null);
const mySetlists = ref([]);
const publicSetlists = ref([]);
const loading = ref(true);

// Invite
const inviteUrl = window.location.origin + '/login';
const inviteText = "¡Hola! Únete a SetList Play para gestionar tus canciones y setlists. Regístrate aquí:";
const whatsappLink = computed(() => `https://wa.me/?text=${encodeURIComponent(inviteText + ' ' + inviteUrl)}`);
const copied = ref(false);

function copyLink() {
    navigator.clipboard.writeText(inviteUrl);
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
}

// Modal State
const showSetlistModal = ref(false);
const editingSetlist = ref(null);

const setlistForm = ref({ title: '', event_date: '', service_type: '', is_public: true, hex_color: '#4f46e5', icon_name: 'ph-playlist' });
const setlistTitleInput = ref(null);

const presetColors = ['#ef4444', '#f97316', '#eab308', '#10b981', '#06b6d4', '#4f46e5', '#8b5cf6', '#ec4899', '#64748b'];
const presetIcons = ['ph-playlist', 'ph-music-notes', 'ph-microphone-stage', 'ph-guitar', 'ph-piano-keys', 'ph-speaker-high', 'ph-fire', 'ph-star', 'ph-heart', 'ph-cross'];

onMounted(async () => {
  // Check Session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  user.value = session?.user || null;

  if (user.value) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.value.id)
      .single();
    if (data) userRole.value = data.role;
  }

  await fetchData();

  // Listen to changes? Maybe later.
});

async function fetchData() {
  loading.value = true;

  // 1. Fetch My Lists
  if (user.value) {
    const { data } = await supabase
      .from("setlists")
      .select("*")
      .eq("owner_id", user.value.id)
      .order("created_at", { ascending: false });
    if (data) mySetlists.value = data;
  }

  // 2. Fetch Public Lists (excluding mine to avoid dupes)
  let query = supabase
    .from("setlists")
    .select("*, profiles(username)")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (user.value) {
    query = query.neq("owner_id", user.value.id);
  }

  const { data: publicData } = await query;
  if (publicData) publicSetlists.value = publicData;

  loading.value = false;
}

async function logout() {
  await supabase.auth.signOut();
  user.value = null;
  mySetlists.value = [];
  await fetchData(); // Refresh public list
}

async function createSetlist() {
    // Check limit (Free Plan)
    if (mySetlists.value.length >= 10) {
        Swal.fire({
            icon: 'warning',
            title: 'Límite Alcanzado',
            text: 'Has alcanzado el límite de 10 listas del plan gratuito.',
            background: '#1f2937',
            color: '#fff',
            confirmButtonColor: '#4f46e5'
        });
        return;
    }

    editingSetlist.value = null;
    // Default date to next Sunday 10am if creates today? Or just empty. Let's start empty.
    setlistForm.value = { title: '', event_date: '', service_type: '', is_public: true, hex_color: '#4f46e5', icon_name: 'ph-playlist' };
    showSetlistModal.value = true;
    await nextTick();
    setlistTitleInput.value?.focus();
}

function closeSetlistModal() {
    showSetlistModal.value = false;
    editingSetlist.value = null;
}

async function saveSetlist() {
    if (!setlistForm.value.title) return;

    if (editingSetlist.value) {
        // UPDATE
        const { error } = await supabase
            .from('setlists')
            .update({ 
                title: setlistForm.value.title,
                event_date: setlistForm.value.event_date || null,
                service_type: setlistForm.value.service_type,
                hex_color: setlistForm.value.hex_color,
                icon_name: setlistForm.value.icon_name
            })
            .eq('id', editingSetlist.value.id);

        if (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#1f2937', color: '#fff' });
        } else {
            editingSetlist.value.title = setlistForm.value.title;
            editingSetlist.value.title = setlistForm.value.title;
            editingSetlist.value.event_date = setlistForm.value.event_date;
            editingSetlist.value.service_type = setlistForm.value.service_type;
            editingSetlist.value.hex_color = setlistForm.value.hex_color;
            editingSetlist.value.icon_name = setlistForm.value.icon_name;
            closeSetlistModal();
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Lista actualizada',
                background: '#1f2937',
                color: '#fff'
            });
        }
    } else {
        // CREATE
        const { data, error } = await supabase
            .from('setlists')
            .insert({
                title: setlistForm.value.title,
                owner_id: user.value.id,
                is_public: setlistForm.value.is_public,
                event_date: setlistForm.value.event_date || null,
                service_type: setlistForm.value.service_type,
                hex_color: setlistForm.value.hex_color,
                icon_name: setlistForm.value.icon_name
            })
            .select()
            .single();

        if (data) {
            mySetlists.value.unshift(data);
            closeSetlistModal();
            router.push(`/setlist/${data.id}`);
        } else if (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#1f2937', color: '#fff' });
        }
    }
}

async function renameSetlist(list) {
    editingSetlist.value = list;
    
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    let formattedDate = '';
    if(list.event_date) {
        const d = new Date(list.event_date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // Adjust to local
        formattedDate = d.toISOString().slice(0, 16);
    }
    
    setlistForm.value = { 
        title: list.title, 
        is_public: list.is_public,
        event_date: formattedDate,
        service_type: list.service_type || '',
        hex_color: list.hex_color || '#4f46e5',
        icon_name: list.icon_name || 'ph-playlist'
    };
    showSetlistModal.value = true;
    await nextTick();
    setlistTitleInput.value?.focus();
    setlistTitleInput.value?.select();
}

async function deleteSetlist(list) {
    const result = await Swal.fire({
        title: `¿Eliminar "${list.title}"?`,
        text: "Esta acción no se puede deshacer.",
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

    // First delete all setlist_items
    await supabase.from('setlist_items').delete().eq('setlist_id', list.id);
    
    // Then delete the setlist
    const { error } = await supabase.from('setlists').delete().eq('id', list.id);

    if (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#1f2937', color: '#fff' });
    } else {
        const idx = mySetlists.value.findIndex(s => s.id === list.id);
        if (idx !== -1) mySetlists.value.splice(idx, 1);
        
         Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'success',
            title: 'Lista eliminada',
            background: '#1f2937',
            color: '#fff'
        });
    }
}

// Helpers
function getCardStyle(list) {
    const type = (list.service_type || '').toLowerCase();
    
    // Base style (Always dark but with gradient hint)
    // Gradients should be subtle: from-gray-900 to...
    
    if(type.includes('joven') || type.includes('jóvenes')) {
        return 'bg-linear-to-br from-gray-900 via-gray-900 to-orange-900/40 border-orange-500/20';
    }
    if(type.includes('domingo') || type.includes('general')) {
        return 'bg-linear-to-br from-gray-900 via-gray-900 to-indigo-900/40 border-indigo-500/20';
    }
    if(type.includes('ensayo') || type.includes('práctica')) {
        return 'bg-linear-to-br from-gray-900 via-gray-900 to-emerald-900/40 border-emerald-500/20';
    }
    if(type.includes('vigilia') || type.includes('especial')) {
        return 'bg-linear-to-br from-gray-900 via-gray-900 to-purple-900/40 border-purple-500/20';
    }
    
    return 'bg-gray-900 border-gray-800'; // Default
}
</script>

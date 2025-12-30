<template>
  <div class="p-4 md:p-8">
    <h2 class="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
      <i class="ph ph-users text-indigo-400"></i> Gestión de Usuarios
    </h2>

    <!-- Mobile Cards View -->
    <div class="md:hidden space-y-3">
      <div
        v-for="user in users"
        :key="user.id"
        class="bg-gray-900 border border-gray-800 rounded-xl p-4"
      >
        <!-- User Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1 min-w-0">
            <p class="font-bold text-white truncate">{{ user.full_name || user.username || "Sin nombre" }}</p>
            <p class="text-xs text-gray-500 truncate">{{ user.email || user.username || "Sin email" }}</p>
          </div>
          <span 
            class="px-2 py-1 rounded text-xs font-bold uppercase shrink-0 ml-2"
            :class="user.is_approved ? 'bg-green-900/20 text-green-400 border border-green-900/30' : 'bg-yellow-900/20 text-yellow-400 border border-yellow-900/30'"
          >
            {{ user.is_approved ? 'Aprobado' : 'Pendiente' }}
          </span>
        </div>

        <!-- User Info -->
        <div class="flex items-center gap-2 mb-3 text-xs text-gray-400">
          <span
            class="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 font-bold uppercase"
            :class="user.role === 'admin' ? 'text-indigo-400 border-indigo-500/30 bg-indigo-900/20' : 'text-gray-400'"
          >
            {{ user.role || "user" }}
          </span>
          <span class="text-gray-600">•</span>
          <span>{{ new Date(user.updated_at || Date.now()).toLocaleDateString() }}</span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button 
            v-if="!user.is_approved"
            @click="approveUser(user)"
            class="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-2 rounded transition shadow-lg shadow-green-900/20"
          >
            <i class="ph ph-check mr-1"></i> Aprobar
          </button>
          <button 
            v-if="user.is_approved"
            @click="toggleApproval(user, false)"
            class="flex-1 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 border border-yellow-600/30 text-xs font-bold px-3 py-2 rounded transition"
          >
            <i class="ph ph-x mr-1"></i> Revocar
          </button>
          <button 
            @click="sendPasswordReset(user)"
            class="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-900/30 text-xs font-bold px-3 py-2 rounded transition"
            title="Enviar email de reset de contraseña"
          >
            <i class="ph ph-key"></i>
          </button>
          <button 
            @click="deleteUser(user)"
            class="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-900/30 text-xs font-bold px-3 py-2 rounded transition"
            title="Eliminar usuario"
          >
            <i class="ph ph-trash"></i>
          </button>
        </div>
      </div>

      <div v-if="users.length === 0 && !loading" class="p-8 text-center text-gray-500">
        No se encontraron usuarios.
      </div>
      <div v-if="loading" class="p-8 text-center text-gray-500 animate-pulse">
        Cargando...
      </div>
    </div>

    <!-- Desktop Table View -->
    <div class="hidden md:block bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-950 text-gray-400">
          <tr>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">Usuario</th>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">Email</th>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">Rol</th>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">Fecha</th>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">Estado</th>
            <th class="p-4 font-bold uppercase tracking-wider text-xs text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr
            v-for="user in users"
            :key="user.id"
            class="hover:bg-gray-800/50 transition"
          >
            <td class="p-4">
              <div class="font-bold text-white">{{ user.full_name || "-" }}</div>
              <div class="text-xs text-gray-500">{{ user.username || "Sin usuario" }}</div>
            </td>
            <td class="p-4 text-gray-400 text-sm">{{ user.email || "-" }}</td>
            <td class="p-4">
              <span
                class="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs font-bold uppercase"
                :class="user.role === 'admin' ? 'text-indigo-400 border-indigo-500/30 bg-indigo-900/20' : 'text-gray-400'"
              >
                {{ user.role || "user" }}
              </span>
            </td>
            <td class="p-4 text-gray-500 text-sm">
              {{ new Date(user.updated_at || Date.now()).toLocaleDateString() }}
            </td>
            <td class="p-4">
              <span 
                class="px-2 py-1 rounded text-xs font-bold uppercase"
                :class="user.is_approved ? 'bg-green-900/20 text-green-400 border border-green-900/30' : 'bg-yellow-900/20 text-yellow-400 border border-yellow-900/30'"
              >
                {{ user.is_approved ? 'Aprobado' : 'Pendiente' }}
              </span>
            </td>
            <td class="p-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button 
                  v-if="!user.is_approved"
                  @click="approveUser(user)"
                  class="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-lg shadow-green-900/20"
                >
                  Aprobar
                </button>
                <button 
                  v-if="user.is_approved"
                  @click="toggleApproval(user, false)"
                  class="bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 border border-yellow-600/30 text-xs font-bold px-3 py-1.5 rounded transition"
                  title="Revocar acceso"
                >
                  Revocar
                </button>
                <button 
                  @click="sendPasswordReset(user)"
                  class="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-900/30 text-xs font-bold px-3 py-1.5 rounded transition"
                  title="Enviar reset de contraseña"
                >
                  <i class="ph ph-key"></i>
                </button>
                <button 
                  @click="deleteUser(user)"
                  class="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-900/30 text-xs font-bold px-3 py-1.5 rounded transition"
                  title="Eliminar usuario"
                >
                  <i class="ph ph-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="users.length === 0 && !loading" class="p-8 text-center text-gray-500">
        No se encontraron usuarios.
      </div>
      <div v-if="loading" class="p-8 text-center text-gray-500 animate-pulse">
        Cargando...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";
import Swal from "sweetalert2";

const users = ref([]);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false });
  if (data) users.value = data;
  loading.value = false;
});

async function approveUser(user) {
    await toggleApproval(user, true);
}

async function toggleApproval(user, status) {
    console.log('Toggling approval for:', user.id, 'to:', status);
    
    const { data, error } = await supabase
        .from('profiles')
        .update({ is_approved: status })
        .eq('id', user.id)
        .select();

    console.log('Update result:', { data, error });

    if (error) {
        console.error('Approval error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo actualizar el estado',
            background: '#1f2937', color: '#fff'
        });
    } else {
        // Update local state
        const idx = users.value.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users.value[idx].is_approved = status;
        }
        Swal.fire({
            icon: 'success',
            title: status ? 'Aprobado' : 'Revocado',
            text: status ? 'Usuario aprobado exitosamente' : 'Acceso revocado',
            timer: 1500,
            showConfirmButton: false,
            background: '#1f2937', color: '#fff'
        });
    }
}

async function deleteUser(user) {
    if(!confirm('¿Estás seguro de eliminar a este usuario?')) return;

    // Delete from profiles? Or just remove approval?
    // Note: Deleting from 'profiles' does NOT delete from 'auth.users' usually unless cascade.
    // We cannot delete from auth.users via Client API normally.
    // Best we can do is mark them as not approved (Revoke) or delete the profile data.
    // Deleting profile data might break foreign keys though.
    // Let's just delete the profile row.
    const { error } = await supabase.from('profiles').delete().eq('id', user.id);
    
    if (error) {
        alert('Error al eliminar: ' + error.message);
    } else {
        users.value = users.value.filter(u => u.id !== user.id);
    }
}

async function sendPasswordReset(user) {
    const email = user.email || user.username;
    if (!email || !email.includes('@')) {
        Swal.fire({
            icon: 'error',
            title: 'Sin correo',
            text: 'Este usuario no tiene un correo registrado.',
            background: '#1f2937', color: '#fff'
        });
        return;
    }

    const confirm = await Swal.fire({
        icon: 'question',
        title: 'Resetear Contraseña',
        text: `¿Enviar email de reseteo a ${email}?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'Cancelar',
        background: '#1f2937', color: '#fff'
    });

    if (!confirm.isConfirmed) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
    });

    if (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message,
            background: '#1f2937', color: '#fff'
        });
    } else {
        Swal.fire({
            icon: 'success',
            title: 'Enviado',
            text: `Se envió un email de reseteo a ${email}`,
            background: '#1f2937', color: '#fff'
        });
    }
}
</script>

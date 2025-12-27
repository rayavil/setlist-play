<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
      <i class="ph ph-users text-indigo-400"></i> Gestión de Usuarios
    </h2>

    <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-950 text-gray-400">
          <tr>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">ID</th>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">
              Usuario
            </th>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">
              Nombre Completo
            </th>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">Rol</th>
            <th class="p-4 font-bold uppercase tracking-wider text-xs">
              Fecha Registro
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr
            v-for="user in users"
            :key="user.id"
            class="hover:bg-gray-800/50 transition"
          >
            <td class="p-4 font-mono text-gray-500 text-xs">
              {{ user.id.slice(0, 8) }}...
            </td>
            <td class="p-4 font-bold text-white">
              {{ user.username || "Sin usuario" }}
            </td>
            <td class="p-4 text-gray-300">{{ user.full_name || "-" }}</td>
            <td class="p-4">
              <span
                class="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs font-bold uppercase"
                :class="
                  user.role === 'admin'
                    ? 'text-indigo-400 border-indigo-500/30 bg-indigo-900/20'
                    : 'text-gray-400'
                "
              >
                {{ user.role || "user" }}
              </span>
            </td>
            <td class="p-4 text-gray-500">
              {{ new Date(user.updated_at || Date.now()).toLocaleDateString() }}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="users.length === 0 && !loading"
        class="p-8 text-center text-gray-500"
      >
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

const users = ref([]);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false }); // Assuming created_at exists, else updated_at
  if (data) users.value = data;
  loading.value = false;
});
</script>

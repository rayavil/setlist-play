<template>
  <div class="min-h-screen bg-black text-white flex">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-gray-800 flex flex-col">
      <div class="p-6 border-b border-gray-800">
        <h1
          class="text-2xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
        >
          Admin
        </h1>
      </div>

      <nav class="flex-1 p-4 space-y-2">
        <router-link
          to="/admin"
          exact-active-class="bg-indigo-900/30 text-indigo-400 border-indigo-500/50"
          class="flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent hover:bg-gray-900 transition"
        >
          <i class="ph ph-chart-line-up text-xl"></i>
          <span class="font-bold">Dashboard</span>
        </router-link>

        <router-link
          to="/admin/users"
          active-class="bg-indigo-900/30 text-indigo-400 border-indigo-500/50"
          class="flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent hover:bg-gray-900 transition"
        >
          <i class="ph ph-users text-xl"></i>
          <span class="font-bold">Usuarios</span>
        </router-link>

        <router-link
          to="/admin/songs"
          active-class="bg-indigo-900/30 text-indigo-400 border-indigo-500/50"
          class="flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent hover:bg-gray-900 transition"
        >
          <i class="ph ph-music-notes text-xl"></i>
          <span class="font-bold">Canciones</span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-gray-800">
        <router-link
          to="/"
          class="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <i class="ph ph-arrow-left"></i> Volver a App
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 bg-gray-950 overflow-y-auto">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
// Layout logic if needed
</script>

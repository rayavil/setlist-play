<template>
  <div
    class="h-screen flex flex-col bg-black text-white font-sans overflow-hidden"
  >
    <SplashScreen />

    <!-- Flash Overlay for Metronome -->
    <div
      id="metroFlash"
      :class="flashClass"
      class="fixed inset-0 pointer-events-none z-50 transition-colors duration-75"
    ></div>

    <!-- Header -->
    <header
      class="border-b border-gray-800 p-3 flex justify-between items-center z-40 shadow-xl shrink-0"
      :class="showList ? 'bg-gray-900' : 'bg-indigo-900/30'"
    >
      <div class="flex items-center gap-2">
        <button
          @click="handleBack"
          class="p-2 text-gray-400 text-2xl active:scale-95 transition flex items-center gap-1"
        >
          <i class="ph ph-caret-left"></i>
          <span class="text-xs font-bold">{{
            showList ? "Inicio" : "Lista"
          }}</span>
        </button>

        <!-- Public/Private Indicator (Owner Toggle) - Only in List View -->
        <button
          v-if="isOwner && setlist && showList"
          @click="toggleVisibility"
          class="flex items-center gap-1 px-2 py-1 rounded border transition text-xs font-bold uppercase tracking-wider"
          :class="
            setlist.is_public
              ? 'border-green-800 bg-green-900/20 text-green-400'
              : 'border-gray-700 bg-gray-800 text-gray-400'
          "
        >
          <i :class="setlist.is_public ? 'ph-globe' : 'ph-lock-key'"></i>
          <span class="hidden sm:inline">{{
            setlist.is_public ? "Público" : "Privado"
          }}</span>
        </button>

        <!-- Clone Button (Visitor) - Only in List View -->
        <button
          v-if="user && !isOwner && showList"
          @click="cloneSetlist"
          :disabled="isSaving"
          class="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
        >
          <i class="ph ph-copy"></i> Clonar
        </button>
      </div>

      <!-- TITLE AREA - Different based on View -->
      <div class="flex-1 text-center overflow-hidden px-2">
        <!-- LIVE BADGE (Always visible when live) -->
        <div
          v-if="setlist?.is_live"
          class="flex items-center justify-center gap-1.5 mb-0.5"
        >
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span
            class="text-[10px] font-bold text-red-400 uppercase tracking-widest"
            >En Vivo</span
          >
        </div>

        <!-- LIST VIEW TITLE -->
        <template v-if="showList">
          <h1 class="text-xl font-bold truncate text-white leading-tight">
            {{ setlist?.title || "Cargando..." }}
          </h1>
          <p
            class="text-[10px] text-gray-500 flex items-center justify-center gap-2"
          >
            <span v-if="isOwner">Tu Lista</span>
            <span v-else
              >Por: {{ setlist?.profiles?.username || "Anónimo" }}</span
            >
            <span class="bg-indigo-900/50 px-1.5 py-0.5 rounded text-indigo-400"
              >{{ songs.length }} canciones</span
            >
          </p>
        </template>
        <!-- SONG VIEW TITLE -->
        <template v-else>
          <h1 class="text-lg font-bold truncate text-white leading-tight">
            {{ currentSong?.title || "Seleccionar" }}
          </h1>
          <p
            v-if="currentSong"
            class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest"
          >
            {{ currentSong.bpm }} BPM •
            {{ currentSong.time_signature || "4/4" }}
          </p>
        </template>
      </div>

      <!-- TRANSPOSE CONTROLS - Only in Song View -->
      <div
        v-if="!showList"
        class="flex items-center gap-1 bg-gray-800 rounded-lg border border-gray-700 p-1"
      >
        <button
          @click="changeTranspose(-1)"
          class="w-8 h-8 flex items-center justify-center text-gray-400 active:text-white active:scale-90"
        >
          <i class="ph ph-minus"></i>
        </button>
        <div
          class="w-6 h-8 flex items-center justify-center font-bold text-white text-lg"
        >
          {{ displayKey }}
        </div>
        <button
          @click="changeTranspose(1)"
          class="w-8 h-8 flex items-center justify-center text-gray-400 active:text-white active:scale-90"
        >
          <i class="ph ph-plus"></i>
        </button>
      </div>

      <!-- Placeholder for alignment when in List View -->
      <div v-else class="flex items-center justify-end min-w-[40px]">
          <button
            v-if="isOwner"
            @click="shareSetlist"
            class="w-9 h-9 flex items-center justify-center bg-gray-800 text-teal-500 rounded-lg active:scale-95 transition hover:bg-gray-700 border border-gray-700/50"
            title="Compartir con Banda"
        >
            <i class="ph ph-share-network text-lg"></i>
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-hidden relative">
      <!-- VIEW 1: SONG LIST -->
      <Transition name="slide-left">
        <div
          v-if="showList"
          class="absolute inset-0 overflow-y-auto p-4 flex flex-col"
        >
          <!-- List Controls -->
          <div class="mb-4 space-y-3">
            <!-- LIVE MODE TOGGLE (Owner Only) -->
            <div
              v-if="isOwner"
              class="bg-gray-800/50 p-3 rounded-xl border border-gray-700"
            >
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <div
                    class="w-3 h-3 rounded-full"
                    :class="
                      setlist?.is_live
                        ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]'
                        : 'bg-gray-600'
                    "
                  ></div>
                  <div>
                    <span class="text-sm font-bold text-white"
                      >Modo En Vivo</span
                    >
                    <p class="text-[10px] text-gray-500">
                      {{
                        setlist?.is_live ? "Transmitiendo a todos" : "Apagado"
                      }}
                    </p>
                  </div>
                </div>
                <button
                  @click="toggleLiveMode"
                  class="px-4 py-2 rounded-lg text-sm font-bold transition active:scale-95"
                  :class="
                    setlist?.is_live
                      ? 'bg-red-600 text-white'
                      : 'bg-indigo-600 text-white'
                  "
                >
                  {{ setlist?.is_live ? "Detener" : "Iniciar" }}
                </button>
              </div>
            </div>

            <!-- LIVE SYNC STATUS (Visitor - when setlist is live) -->
            <div
              v-if="!isOwner && setlist?.is_live"
              class="bg-red-900/20 p-3 rounded-xl border border-red-800/50 flex items-center gap-3"
            >
              <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <div class="flex-1">
                <span class="text-sm font-bold text-white">Sesión En Vivo</span>
                <p class="text-[10px] text-gray-400">
                  Sincronizado con el líder • {{ rtt.toFixed(0) }}ms
                </p>
              </div>
            </div>



            <!-- Export PDF Button -->
            <div v-if="showList" class="flex gap-2">
              <button
                @click="exportPDF('summary')"
                class="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <i class="ph ph-file-pdf"></i> Resumen
              </button>
              <button
                @click="exportPDF('songbook')"
                class="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <i class="ph ph-book-open-text"></i> Cancionero
              </button>
            </div>

            <!-- Search -->
            <div class="relative">
              <i
                class="ph ph-magnifying-glass absolute left-3 top-3 text-gray-500"
              ></i>
              <input
                :value="searchQuery"
                @input="searchQuery = $event.target.value"
                type="search"
                placeholder="Buscar canción..."
                class="w-full bg-gray-800 border-none pl-10 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-600 text-white placeholder-gray-500 text-sm"
              />
            </div>
          </div>

          <!-- Songs List -->
          <div class="flex-1 pb-24">
            <TransitionGroup name="list" tag="div" class="space-y-2">
              <div
                v-for="(song, idx) in filteredSongs"
                :key="song.id"
                class="w-full rounded-xl bg-gray-900 border border-gray-800 flex items-stretch overflow-hidden active:scale-[0.98] transition-all duration-200"
                :class="{
                  'border-indigo-500/50 ring-1 ring-indigo-500/20 bg-indigo-900/10':
                    idx === currentIndex,
                }"
                :data-index="idx"
              >
                <!-- Drag Handle -->
                <div
                  v-if="isOwner && !searchQuery"
                  class="w-10 bg-gray-800/30 flex items-center justify-center cursor-ns-resize touch-none active:bg-indigo-600/20 border-r border-gray-800/50"
                  @mousedown.prevent="startDrag($event, idx)"
                  @touchstart.prevent="startDrag($event, idx)"
                >
                  <i class="ph ph-dots-six-vertical text-gray-600"></i>
                </div>

                <button
                  @click="selectSong(songs.indexOf(song))"
                  class="flex-1 py-4 px-3 text-left flex justify-between items-center"
                >
                  <div>
                    <div class="flex items-center gap-2">
                      <h3
                        class="font-bold text-white text-base leading-tight"
                        :class="{ 'text-indigo-300': idx === currentIndex }"
                      >
                        {{ song.title }}
                      </h3>
                      <span
                        v-if="song.category"
                        class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                        :class="{
                          'bg-orange-900/40 text-orange-400 border border-orange-500/20':
                            song.category === 'Alabanza',
                          'bg-purple-900/40 text-purple-400 border border-purple-500/20':
                            song.category === 'Adoración',
                          'bg-blue-900/40 text-blue-400 border border-blue-500/20':
                            song.category === 'Especial',
                        }"
                      >
                        {{ song.category }}
                      </span>
                    </div>
                    <p class="text-[11px] text-gray-500 mt-1 font-mono">
                      <span
                        class="bg-gray-800 px-1 rounded text-gray-400 mr-2"
                        >{{ song.key }}</span
                      >
                      <span>{{ song.bpm }} BPM</span>
                    </p>
                  </div>
                  <div v-if="idx === currentIndex" class="shrink-0">
                    <i
                      class="ph ph-equalizer text-indigo-500 animate-pulse text-xl"
                    ></i>
                  </div>
                </button>

                <!-- Edit/Delete Actions (Owner Only) - Mobile Friendly -->
                <div v-if="isOwner" class="flex border-l border-gray-800/50">
                  <button
                    @click.stop="openEditSongModal(song)"
                    class="w-12 h-full flex items-center justify-center text-gray-500 hover:text-indigo-400 hover:bg-indigo-900/20 active:bg-indigo-900/40 transition"
                  >
                    <i class="ph ph-pencil-simple text-lg"></i>
                  </button>
                  <button
                    @click.stop="deleteSongFromList(song)"
                    class="w-12 h-full flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-900/20 active:bg-red-900/40 transition border-l border-gray-800/50"
                  >
                    <i class="ph ph-trash text-lg"></i>
                  </button>
                </div>
              </div>
            </TransitionGroup>

            <div
              v-if="songs.length === 0"
              class="text-center py-10 text-gray-600"
            >
              <i class="ph ph-music-notes text-4xl mb-2"></i>
              <p>Esta lista está vacía.</p>
              <button
                v-if="isOwner"
                @click="openAddSongModal"
                class="mt-4 text-indigo-400 underline"
              >
                Agregar primera canción
              </button>
            </div>
          </div>

          <!-- FAB GROUP (Owner Only) -->
          <div
            v-if="isOwner"
            class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3"
          >
            <!-- Import Button (Secondary) -->
            <button
              @click="openLibraryModal"
              class="w-12 h-12 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-indigo-400 rounded-full shadow-lg flex items-center justify-center text-xl active:scale-95 transition"
              title="Buscar en Biblioteca"
            >
              <i class="ph ph-magnifying-glass font-bold"></i>
            </button>

            <!-- Add New Button (Primary) -->
            <button
              @click="openAddSongModal"
              class="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center text-2xl active:scale-95 transition"
              title="Crear Nueva Canción"
            >
              <i class="ph ph-plus"></i>
            </button>
          </div>
        </div>
      </Transition>

      <!-- VIEW 2: SONG DETAIL -->
      <Transition name="slide-right">
        <div
          v-if="!showList"
          class="absolute inset-0 overflow-y-auto px-4 py-4 pb-32 scroll-smooth"
          ref="mainContent"
        >
          <SmartLyrics
            v-if="currentSong"
            :rawContent="currentSong.raw"
            :transposeLevel="transposeLevel"
            :viewMode="viewMode"
          />
          <div
            v-else
            class="flex h-full items-center justify-center text-gray-500"
          >
            <p>Selecciona una canción</p>
          </div>
        </div>
      </Transition>
    </main>

    <!-- SONG INFO PANEL (Slide Over) -->
    <Transition name="slide-up">
      <div
        v-if="showSongInfo && currentSong"
        class="fixed inset-x-0 bottom-0 top-20 bg-gray-900 border-t border-gray-700 rounded-t-2xl z-40 p-5 flex flex-col shadow-2xl"
      >
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              <i class="ph ph-info text-indigo-400"></i> Info de Canción
            </h3>
            <p class="text-sm text-gray-400">{{ currentSong.title }}</p>
          </div>
          <button
            @click="showSongInfo = false"
            class="bg-gray-800 p-2 rounded-full text-gray-400"
          >
            <i class="ph ph-x"></i>
          </button>
        </div>

        <div class="space-y-6 flex-1 overflow-y-auto">
          <!-- Link Section -->
          <div v-if="currentSong.original_link">
            <h4
              class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              Referencia
            </h4>
            <a
              :href="currentSong.original_link"
              target="_blank"
              class="flex items-center gap-3 bg-gray-800 p-3 rounded-xl hover:bg-gray-700 transition group border border-gray-700"
            >
              <div
                class="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition"
              >
                <i class="ph ph-youtube-logo text-xl"></i>
              </div>
              <div>
                <span class="block font-bold text-white text-sm"
                  >Ver Original</span
                >
                <span
                  class="block text-xs text-gray-500 truncate max-w-[200px]"
                  >{{ currentSong.original_link }}</span
                >
              </div>
              <i class="ph ph-arrow-square-out ml-auto text-gray-500"></i>
            </a>
          </div>

          <!-- Notes Section -->
          <div v-if="currentSong.notes">
            <h4
              class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              Notas de Ejecución
            </h4>
            <div
              class="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl text-indigo-200 text-sm whitespace-pre-wrap leading-relaxed font-mono"
            >
              {{ currentSong.notes }}
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="!currentSong.original_link && !currentSong.notes"
            class="text-center py-10 text-gray-600"
          >
            <i class="ph ph-notebook text-4xl mb-2"></i>
            <p>No hay notas ni links para esta canción.</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- SONG MODAL (Add/Edit) - Enhanced UX -->
    <Transition name="fade">
      <div
        v-if="showSongModal"
        class="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col"
        @click.self="closeSongModal"
      >
        <div class="flex-1 overflow-y-auto">
          <div
            class="min-h-full flex items-start sm:items-center justify-center p-4 py-8"
          >
            <div
              class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <!-- Header -->
              <div
                class="p-4 border-b border-gray-800 flex justify-between items-center"
              >
                <h2 class="text-xl font-bold flex items-center gap-2">
                  <i class="ph ph-music-notes text-indigo-400"></i>
                  {{ editingSong ? "Editar Canción" : "Nueva Canción" }}
                </h2>
                <button
                  @click="closeSongModal"
                  class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xl"
                >
                  &times;
                </button>
              </div>

              <!-- Form Body -->
              <div class="p-4 space-y-5">
                <!-- Title & Category -->
                <div class="flex gap-2">
                  <div class="flex-1">
                    <label
                      class="text-xs text-gray-400 block mb-1 font-bold uppercase tracking-wider"
                      >Título *</label
                    >
                    <input
                      v-model="songForm.title"
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
                      @click="songForm.category = 'Alabanza'"
                      class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1"
                      :class="
                        songForm.category === 'Alabanza'
                          ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/20'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                      "
                    >
                      Alabanza
                    </button>
                    <button
                      @click="songForm.category = 'Adoración'"
                      class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1"
                      :class="
                        songForm.category === 'Adoración'
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                      "
                    >
                      Adoración
                    </button>
                    <button
                      @click="songForm.category = 'Especial'"
                      class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1"
                      :class="
                        songForm.category === 'Especial'
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                      "
                    >
                      Especial
                    </button>
                    <button
                      v-if="songForm.category"
                      @click="songForm.category = ''"
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
                      v-model="songForm.key"
                      class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white text-center font-bold"
                    >
                      <option
                        v-for="k in [
                          'C',
                          'C#',
                          'D',
                          'D#',
                          'E',
                          'F',
                          'F#',
                          'G',
                          'G#',
                          'A',
                          'A#',
                          'B',
                          'Cm',
                          'Dm',
                          'Em',
                          'Fm',
                          'Gm',
                          'Am',
                          'Bm',
                        ]"
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
                      v-model.number="songForm.bpm"
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
                      v-model="songForm.time_signature"
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
                      type="button"
                      @click="insertAtCursor('[C]')"
                      class="px-2.5 py-1 bg-gray-800 hover:bg-indigo-900/50 text-gray-300 text-xs rounded-lg border border-gray-700 font-mono"
                    >
                      [C]
                    </button>
                    <button
                      type="button"
                      @click="insertAtCursor('[G]')"
                      class="px-2.5 py-1 bg-gray-800 hover:bg-indigo-900/50 text-gray-300 text-xs rounded-lg border border-gray-700 font-mono"
                    >
                      [G]
                    </button>
                    <button
                      type="button"
                      @click="insertAtCursor('[Am]')"
                      class="px-2.5 py-1 bg-gray-800 hover:bg-indigo-900/50 text-gray-300 text-xs rounded-lg border border-gray-700 font-mono"
                    >
                      [Am]
                    </button>
                    <button
                      type="button"
                      @click="insertAtCursor('[D]')"
                      class="px-2.5 py-1 bg-gray-800 hover:bg-indigo-900/50 text-gray-300 text-xs rounded-lg border border-gray-700 font-mono"
                    >
                      [D]
                    </button>
                    <span class="border-l border-gray-700 mx-1"></span>
                    <button
                      type="button"
                      @click="insertAtCursor('Verso\n')"
                      class="px-2.5 py-1 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 text-xs rounded-lg border border-indigo-800 font-bold"
                    >
                      Verso
                    </button>
                    <button
                      type="button"
                      @click="insertAtCursor('Coro\n')"
                      class="px-2.5 py-1 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 text-xs rounded-lg border border-indigo-800 font-bold"
                    >
                      Coro
                    </button>
                    <button
                      type="button"
                      @click="insertAtCursor('Puente\n')"
                      class="px-2.5 py-1 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 text-xs rounded-lg border border-indigo-800 font-bold"
                    >
                      Puente
                    </button>
                    <button
                      type="button"
                      @click="insertAtCursor('(x2)')"
                      class="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded-lg border border-gray-700"
                    >
                      (x2)
                    </button>
                  </div>

                  <textarea
                    ref="lyricsTextarea"
                    v-model="songForm.raw"
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
                      v-model="songForm.original_link"
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
                      v-model="songForm.notes"
                      rows="2"
                      class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
                      placeholder="Intro suave, solo de guitarra al final..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Footer Actions -->
              <div class="p-4 border-t border-gray-800 grid grid-cols-2 gap-3">
                <button
                  @click="closeSongModal"
                  class="py-3 rounded-xl bg-gray-800 text-gray-300 font-bold text-center active:scale-95 transition"
                >
                  Cancelar
                </button>
                <button
                  @click="saveSong"
                  :disabled="isSaving || !songForm.title"
                  class="py-3 rounded-xl bg-indigo-600 text-white font-bold text-center disabled:opacity-50 active:scale-95 transition"
                >
                  {{
                    isSaving
                      ? "Guardando..."
                      : editingSong
                      ? "Guardar"
                      : "Agregar"
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- LIBRARY IMPORT MODAL -->
    <Transition name="fade">
      <div
        v-if="showLibraryModal"
        class="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showLibraryModal = false"
      >
        <div
          class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl h-[80vh] flex flex-col"
        >
          <div
            class="p-4 border-b border-gray-800 flex justify-between items-center"
          >
            <h2 class="text-xl font-bold flex items-center gap-2">
              <i class="ph ph-books text-indigo-400"></i> Biblioteca
            </h2>
            <button
              @click="showLibraryModal = false"
              class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xl"
            >
              &times;
            </button>
          </div>

          <div class="p-4 border-b border-gray-800">
            <input
              v-model="librarySearchQuery"
              type="search"
              placeholder="Buscar en mis otras listas..."
              class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              autofocus
            />
          </div>

          <div class="flex-1 overflow-y-auto p-2">
            <div v-if="loadingLibrary" class="text-center py-10 text-gray-500">
              Cargando...
            </div>

            <div
              v-else-if="librarySongs.length === 0"
              class="text-center py-10 text-gray-500"
            >
              <p>No se encontraron canciones.</p>
            </div>

            <div v-else class="space-y-2">
              <button
                v-for="song in librarySongs"
                :key="song.id"
                @click="cloneSongToSetlist(song)"
                class="w-full text-left p-3 rounded-xl hover:bg-gray-800 border border-transparent hover:border-gray-700 transition flex justify-between items-center group"
              >
                <div>
                  <h4
                    class="font-bold text-white group-hover:text-indigo-400 transition"
                  >
                    {{ song.title }}
                  </h4>
                  <p class="text-xs text-gray-500 flex items-center gap-2">
                    <span
                      v-if="song.category"
                      class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-400 border border-gray-700"
                      >{{ song.category }}</span
                    >
                    <span>{{ song.key }} • {{ song.bpm }} BPM</span>
                  </p>
                </div>
                <i
                  class="ph ph-plus-circle text-2xl text-gray-600 group-hover:text-indigo-500 transition"
                ></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Floating Metronome Button (Only if Song Selected & Owner) -->
    <div
      v-if="!showList"
      class="fixed bottom-24 right-5 flex flex-col items-center gap-3 z-40"
    >
      <!-- Info Toggle (Mini FAB) -->
      <button
        v-if="currentSong && (currentSong.original_link || currentSong.notes)"
        @click.stop="showSongInfo = !showSongInfo"
        class="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center shadow-lg transition active:scale-95"
        :class="
          showSongInfo ? 'text-indigo-400 border-indigo-500' : 'text-gray-500'
        "
      >
        <i class="ph ph-info text-xl"></i>
      </button>

      <!-- Mute Toggle (Mini FAB) -->
      <button
        v-if="isOwner"
        @click.stop="isMuted = !isMuted"
        class="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center shadow-lg transition active:scale-95"
        :class="isMuted ? 'text-gray-500' : 'text-indigo-400 border-indigo-500'"
      >
        <i
          :class="isMuted ? 'ph-speaker-slash' : 'ph-speaker-high'"
          class="ph text-xl"
        ></i>
      </button>

      <!-- Main Toggle -->
      <button
        v-if="isOwner"
        @click="toggleMetronome"
        class="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-700 flex flex-col items-center justify-center shadow-2xl transition-all active:scale-90"
        :class="{ 'bg-red-600 border-red-500 scale-110': isPlaying }"
      >
        <i
          :class="isPlaying ? 'ph-stop' : 'ph-metronome'"
          class="ph text-3xl"
        ></i>
        <div class="flex flex-col items-center -mt-1">
          <span class="text-[10px] font-bold leading-none">{{
            currentSong?.bpm || 120
          }}</span>
        </div>
      </button>
    </div>

    <!-- Footer Controls (Navigation) -->
    <footer
      v-if="!showList"
      class="bg-gray-900 border-t border-gray-800 p-3 grid grid-cols-3 gap-2 shrink-0 z-40 safe-pb"
    >
      <button
        @click="prevSong"
        class="bg-gray-800 text-gray-300 py-3 rounded-xl font-bold border border-gray-700 active:bg-gray-700"
      >
        <i class="ph ph-skip-back text-xl"></i>
      </button>

      <button
        @click="showList = true"
        class="bg-gray-800 text-indigo-400 py-3 rounded-xl font-bold border border-gray-700 active:bg-gray-700 flex flex-col items-center justify-center leading-none"
      >
        <i class="ph ph-list text-xl mb-0.5"></i>
        <span class="text-[10px]">Lista</span>
      </button>

      <button
        @click="nextSong"
        class="bg-indigo-600 text-white py-3 rounded-xl font-bold border border-indigo-500 shadow-lg active:bg-indigo-700"
      >
        <i class="ph ph-skip-forward text-xl"></i>
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { supabase } from "../lib/supabase";
import { useMusicTheory } from "../composables/useMusicTheory";
import { useAudioEngine } from "../composables/useAudioEngine";
import { useLiveSession } from "../composables/useLiveSession";
import SmartLyrics from "../components/SmartLyrics.vue";
import SplashScreen from "../components/SplashScreen.vue";
import { useRouter } from "vue-router";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

const props = defineProps(["id"]);
const router = useRouter();

// ... existing code ...

async function cloneSongToSetlist(sourceSong) {
    if(isSaving.value) return;
    isSaving.value = true;
    
    // CLONE: Create deeper copy as new song entry
    const { data: newSong, error } = await supabase.from('songs').insert({
        title: sourceSong.title,
        key: sourceSong.key,
        bpm: sourceSong.bpm,
        time_signature: sourceSong.time_signature,
        raw: sourceSong.raw,
        original_link: sourceSong.original_link,
        notes: sourceSong.notes,
        category: sourceSong.category
    }).select().single();
    
    if(error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#1f2937', color: '#fff' });
        isSaving.value = false;
        return;
    }
    
    // Add to Setlist Items
    const position = songs.value.length;
    await supabase.from('setlist_items').insert({
        setlist_id: props.id,
        song_id: newSong.id,
        position
    });
    
    showLibraryModal.value = false;
    isSaving.value = false;
    await fetchSongs();
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: 'Canción clonada',
        background: '#1f2937',
        color: '#fff'
    });
}

// PDF Export
// PDF Export
function exportPDF(type) {
    const doc = new jsPDF();
    const title = setlist.value.title || 'Setlist';
    
    // Helper: Parse line into { chordsLine, lyricsLine }
    // This assumes Monospaced font logic where 1 char = 1 unit width roughly.
    // For exact positioning we use spaces padding.
    const parseLineForPDF = (line) => {
        let chordsLine = '';
        let lyricsLine = '';
        let extraChars = 0; // Track chords length to adjust visual spacing if needed
        
        // Split by chords [C]
        // Regex to capture chords and keeping delimiters
        const parts = line.split(/(\[.*?\])/);
        
        // RE-STRATEGY: Build unit pairs
        const units = [];
        let currentChord = '';
        
        parts.forEach(part => {
             if (part.startsWith('[') && part.endsWith(']')) {
                 if(currentChord) units.push({ chord: currentChord, text: '' }); // Chord without text
                 currentChord = part.replace(/[\[\]]/g, '');
             } else {
                 units.push({ chord: currentChord, text: part });
                 currentChord = '';
             }
        });
        if(currentChord) units.push({ chord: currentChord, text: '' }); // Trailing chord
        
        // Now build the strings with padding
        units.forEach(u => {
            const cLen = u.chord.length;
            const tLen = u.text.length;
            const maxLen = Math.max(cLen, tLen);
            
            // Pad both to maxLen + spacing
            const padFn = (str, len) => str + ' '.repeat(Math.max(0, len - str.length));
            
            // Add a minimum spacing between chords if text is short
            const spacing = 1; 
            
            chordsLine += padFn(u.chord, maxLen + spacing);
            lyricsLine += padFn(u.text, maxLen + spacing);
        });
        
        return { chordsLine, lyricsLine };
    };

    const addFooter = (doc, pageNumber, totalPages) => {
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`SetList Play App - Desarrollado por Ramón Avila`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        if(pageNumber && totalPages) {
            doc.text(`Página ${pageNumber} de ${totalPages} - ${title}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        }
    };

    if (type === 'summary') {
        // SUMMARY PDF (unchanged)
        doc.setFontSize(18);
        doc.text(title, 14, 15);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        const date = setlist.value.event_date 
            ? new Date(setlist.value.event_date).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }) 
            : new Date().toLocaleDateString('es-MX');
        doc.text(date, 14, 22);
        
        if(setlist.value.service_type) {
             doc.text(`Tipo: ${setlist.value.service_type}`, 14, 27);
        }

        const tableData = songs.value.map((s, i) => [
            i + 1,
            s.title,
            s.key,
            s.bpm + ' bpm',
            s.time_signature,
            s.category || '-'
        ]);

        autoTable(doc, {
            head: [['#', 'Título', 'Tono', 'BPM', 'Compás', 'Cat']],
            body: tableData,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 'auto', fontStyle: 'bold' },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 20, halign: 'center' },
                4: { cellWidth: 15, halign: 'center' },
                5: { cellWidth: 25, halign: 'center' }
            },
            didDrawPage: (data) => {
                addFooter(doc);
            }
        });

        doc.save(`${title.replace(/\s+/g, '_')}_Resumen.pdf`);
        
    } else if (type === 'songbook') {
        // SONGBOOK PDF PRO
        songs.value.forEach((song, index) => {
            if (index > 0) doc.addPage();
            
            // Header Background
            doc.setFillColor(245, 245, 245);
            doc.rect(0, 0, 210, 30, 'F');
            
            // Title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(0);
            doc.text(song.title, 105, 18, { align: 'center' });
            
            // Metadata Bar
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(80);
            const metaBox = `Tono: ${song.key}   |   BPM: ${song.bpm}   |   Compás: ${song.time_signature}`;
            doc.text(metaBox, 105, 26, { align: 'center' });
            
            // Content Rendering
            let y = 45;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;

            const lines = (song.raw || '').split('\n');
            
            doc.setFont("courier", "normal"); // Monospaced is crucial for alignment
            
            lines.forEach(line => {
                line = line.trimEnd(); // Remove trailing spaces
                
                // Pagination Check
                if (y > pageHeight - margin) {
                    addFooter(doc, index + 1, songs.value.length);
                    doc.addPage();
                    y = 20;
                }

                if (!line) {
                    y += 8; // Empty line spacing
                    return;
                }

                // Header check (CORO:, VERSO 1:)
                if (!line.includes('[') && (line === line.toUpperCase() && line.length < 30 || line.endsWith(':'))) {
                    doc.setFont("courier", "bold");
                    doc.setTextColor(100); // Gray for headers
                    doc.setFontSize(10);
                    doc.text(line, 15, y);
                    y += 10;
                    return;
                }

                // Regular Line Parsing
                const { chordsLine, lyricsLine } = parseLineForPDF(line);
                
                // Draw Chords (Indigo)
                if (chordsLine.trim()) {
                    doc.setFont("courier", "bold");
                    doc.setFontSize(11); // Slightly larger
                    doc.setTextColor(79, 70, 229); // Indigo 600
                    doc.text(chordsLine, 15, y);
                    y += 5; // Space between chord and lyric
                }

                // Draw Lyrics (Black)
                if (lyricsLine.trim()) {
                    doc.setFont("courier", "normal");
                    doc.setFontSize(11);
                    doc.setTextColor(0);
                    doc.text(lyricsLine, 15, y);
                    y += 10; // Space after lyric line
                } else {
                    // Only chords?
                    y += 6;
                }
                
                y += 2; // Extra breather
            });
            
            // Footer for final page of song
            addFooter(doc, index + 1, songs.value.length);
        });
        
        doc.save(`${title.replace(/\s+/g, '_')}_Cancionero.pdf`);
    }
}

// Composables
const { processChord } = useMusicTheory();
const { isPlaying, togglePlay, bpm, timeSig, isMuted } = useAudioEngine();
const {
  role,
  status,
  joinSession,
  broadcast,
  onSyncCommand,
  resync,
  offset,
  rtt,
} = useLiveSession();

// State
const user = ref(null);
const setlist = ref(null);
const songs = ref([]);
const isOwner = ref(false);
const isSaving = ref(false);
const searchQuery = ref("");
const currentIndex = ref(-1);
const transposeLevel = ref(0);
const showList = ref(true); // Default to List View
const viewMode = ref("full");
const flashClass = ref("");
const showSongInfo = ref(false); // New state for song info display

// Library Import State
const showLibraryModal = ref(false);
const librarySearchQuery = ref("");
const librarySongs = ref([]);
const loadingLibrary = ref(false);

// Drag & Drop
const isDragging = ref(false);
const dragIndex = ref(null);
let dragStartY = 0;

// Song CRUD Modal State
const showSongModal = ref(false);
const editingSong = ref(null); // null = Add Mode, object = Edit Mode
const songForm = ref({
  title: "",
  key: "C",
  bpm: 120,
  time_signature: "4/4",
  raw: "",
  original_link: "", // New field
  notes: "", // New field
  category: "", // New field
});

// Computed
const filteredSongs = computed(() => {
  if (!searchQuery.value) return songs.value;
  const normalize = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const q = normalize(searchQuery.value);
  return songs.value.filter((s) => normalize(s.title).includes(q));
});

const currentSong = computed(() => songs.value[currentIndex.value]);
const displayKey = computed(() => {
  if (!currentSong.value) return "-";
  return processChord(currentSong.value.key, transposeLevel.value);
});

// Navigation Logic
function handleBack() {
  if (!showList.value) {
    // In Song -> Back to List
    showList.value = true;
  } else {
    // In List -> Back to Home
    router.push("/");
  }
}

// Callbacks & Init
onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  user.value = session?.user || null;

  const { data: listData, error: listError } = await supabase
    .from("setlists")
    .select("*, profiles(username)")
    .eq("id", props.id)
    .single();

  if (listError || !listData) {
    router.push("/");
    return;
  }

  setlist.value = listData;
  isOwner.value = user.value && user.value.id === listData.owner_id;

  // Owner always joins as leader (to broadcast)
  // Visitors join as follower ONLY if session is live
  if (isOwner.value) {
    joinSession("leader", props.id);
  } else if (listData.is_live) {
    joinSession("follower", props.id);
  }

  await fetchSongs();

  // Subscribe to setlist_items changes
  supabase
    .channel(`setlist:${props.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "setlist_items",
        filter: `setlist_id=eq.${props.id}`,
      },
      async () => {
        if (!isSaving.value) await fetchSongs();
      }
    )
    .subscribe();

  // Subscribe to setlist changes (for is_live updates)
  supabase
    .channel(`setlist-meta:${props.id}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "setlists",
        filter: `id=eq.${props.id}`,
      },
      (payload) => {
        setlist.value = { ...setlist.value, ...payload.new };
        // Auto-join when setlist goes live (for visitors)
        if (!isOwner.value && payload.new.is_live && !role.value) {
          joinSession("follower", props.id);
        }
      }
    )
    .subscribe();

  window.addEventListener("metronome-tick", (e) => {
    const beat = e.detail.beat;
    flashClass.value =
      beat === 0
        ? "bg-red-500/20 shadow-[inset_0_0_0_10px_rgba(239,68,68,0.5)]"
        : "shadow-[inset_0_0_0_5px_rgba(99,102,241,0.5)]";
    if (navigator.vibrate) navigator.vibrate(beat === 0 ? 50 : 20);
    setTimeout(() => {
      flashClass.value = "";
    }, 100);
  });
});

async function fetchSongs() {
  const { data } = await supabase
    .from("setlist_items")
    .select(`id, position, songs ( * )`)
    .eq("setlist_id", props.id)
    .order("position", { ascending: true });
  if (data) {
    songs.value = data.map((item) => ({
      ...item.songs,
      item_id: item.id,
      position: item.position,
    }));
  }
}

// Library Functions
async function openLibraryModal() {
  showLibraryModal.value = true;
  librarySearchQuery.value = "";
  loadingLibrary.value = true;

  // Fetch distinct songs from ALL lists owned by user (could be optimized with RPC but client-side distinct is fine for now)
  const { data } = await supabase
    .from("songs")
    .select("*")
    // Ideally we would filter by owner's lists, but simplified: fetch recent 100 songs
    .order("created_at", { ascending: false })
    .limit(100);

  if (data) {
    // Simple client-side deduplication by Title to avoid clutter
    const unique = [];
    const map = new Map();
    for (const item of data) {
      if (!map.has(item.title)) {
        map.set(item.title, true);
        unique.push(item);
      }
    }
    librarySongs.value = unique;
  }
  loadingLibrary.value = false;
}

// Watch search query to filter locally
watch(librarySearchQuery, async (newVal) => {
  if (!newVal) return;
  // In a real app, we might debounce and search DB. For now, simple filter of loaded list or re-fetch.
  // Let's implement active DB search for better results
  loadingLibrary.value = true;
  const { data } = await supabase
    .from("songs")
    .select("*")
    .ilike("title", `%${newVal}%`)
    .limit(20);
  if (data) librarySongs.value = data;
  loadingLibrary.value = false;
});





// PDF Export


// Session Listeners
onSyncCommand.value = (payload, autoOffset = 0) => {
  if (payload.type === "jump") {
    const idx = payload.index;
    if (songs.value[idx]) {
      currentIndex.value = idx;
      showList.value = false; // Auto-show song
    }
    transposeLevel.value = 0;
    if (songs.value[idx]?.bpm) bpm.value = songs.value[idx].bpm;
  }
  if (payload.type === "transpose") transposeLevel.value = payload.level;
  if (payload.type === "metro") {
    const forcePlay = payload.playing;
    if (forcePlay && !isPlaying.value) {
      // ... existing metro start logic ...
      // Assuming logic from previous step is preserved if copy-pasted, but simplified here for brevity
      const targetLocal = payload.startAt - autoOffset;
      togglePlay(true, targetLocal);
    } else if (!forcePlay && isPlaying.value) {
      togglePlay(false);
    }
  }
};

watch(currentIndex, () => {
  // Scroll behavior
});

// CLEANUP: Auto-turn off live mode when admin leaves
onBeforeUnmount(async () => {
  if (isOwner.value && setlist.value?.is_live) {
    // Turn off live mode in DB (fire and forget)
    await supabase
      .from("setlists")
      .update({ is_live: false })
      .eq("id", props.id);
  }
  // Clear inactivity timer
  if (inactivityTimer) clearTimeout(inactivityTimer);
});

// INACTIVITY TIMEOUT for Live Mode (15 minutes)
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
let inactivityTimer = null;

function resetInactivityTimer() {
  if (!isOwner.value || !setlist.value?.is_live) return;

  // Clear existing timer
  if (inactivityTimer) clearTimeout(inactivityTimer);

  // Set new timer
  inactivityTimer = setTimeout(async () => {
    if (setlist.value?.is_live) {
      console.log("Live mode auto-off due to inactivity");
      await supabase
        .from("setlists")
        .update({ is_live: false })
        .eq("id", props.id);
      setlist.value.is_live = false;
    }
  }, INACTIVITY_TIMEOUT_MS);
}

// Track activity on key actions
watch([currentIndex, transposeLevel], () => {
  resetInactivityTimer();
});

// Also reset timer when live mode is toggled on
watch(
  () => setlist.value?.is_live,
  (newVal) => {
    if (newVal && isOwner.value) {
      resetInactivityTimer();
    }
  }
);

// UI Actions
function toggleMetronome() {
  // Simplified for implementation_tool (Assuming existing logic)
  if (isPlaying.value) {
    togglePlay(false);
    broadcast({ type: "metro", playing: false });
  } else {
    togglePlay(true, Date.now() + 1000); // Simple start
    broadcast({ type: "metro", playing: true, startAt: Date.now() + 1000 });
  }
}

async function saveOrder() {
  if (!songs.value.length || !isOwner.value) return;
  isSaving.value = true;
  const updates = songs.value.map((song, index) => ({
    id: song.item_id,
    position: index,
    setlist_id: props.id,
    song_id: song.id,
  }));
  await supabase.from("setlist_items").upsert(updates);
  isSaving.value = false;
}

function selectSong(index) {
  currentIndex.value = index;
  transposeLevel.value = 0;
  showList.value = false; // CLOSE LIST, OPEN SONG
  showSongInfo.value = false; // Hide info when changing song
  if (currentSong.value) bpm.value = currentSong.value.bpm || 120;
  if (isOwner.value) broadcast({ type: "jump", index });
}

// Drag & Drop
function startDrag(event, index) {
  if (searchQuery.value || !isOwner.value) return; // Lock if not owner

  isDragging.value = true;
  dragIndex.value = index;
  dragStartY = event.type.includes("touch")
    ? event.touches[0].clientY
    : event.clientY;

  if (event.type.includes("touch")) {
    window.addEventListener("touchmove", onDragMove, { passive: false });
    window.addEventListener("touchend", endDrag);
  } else {
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", endDrag);
  }
}

function onDragMove(event) {
  if (!isDragging.value) return;
  event.preventDefault();

  const clientY = event.type.includes("touch")
    ? event.touches[0].clientY
    : event.clientY;

  const movementThreshold = 40;
  if (Math.abs(clientY - dragStartY) < movementThreshold) return;

  const elementBehind = document.elementFromPoint(
    event.type.includes("touch") ? event.touches[0].clientX : event.clientX,
    clientY
  );

  if (!elementBehind) return;

  const row = elementBehind.closest("[data-index]");
  if (!row) return;

  const targetIndex = parseInt(row.getAttribute("data-index"));

  if (targetIndex !== dragIndex.value && !isNaN(targetIndex)) {
    moveSong(dragIndex.value, targetIndex);
    dragIndex.value = targetIndex;
    dragStartY = clientY;
  }
}

function endDrag() {
  isDragging.value = false;
  dragIndex.value = null;

  window.removeEventListener("touchmove", onDragMove);
  window.removeEventListener("touchend", endDrag);
  window.removeEventListener("mousemove", onDragMove);
  window.removeEventListener("mouseup", endDrag);
}

function moveSong(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= songs.value.length) return;

  const item = songs.value.splice(fromIndex, 1)[0];
  songs.value.splice(toIndex, 0, item);

  const currentId = currentSong.value?.id;

  if (currentId) {
    const newIdx = songs.value.findIndex((s) => s.id === currentId);
    if (newIdx !== -1) currentIndex.value = newIdx;
  }

  saveOrder();
}

function changeTranspose(delta) {
  transposeLevel.value += delta;
  if (isOwner.value)
    broadcast({ type: "transpose", level: transposeLevel.value });
}

function nextSong() {
  if (currentIndex.value < songs.value.length - 1)
    selectSong(currentIndex.value + 1);
}
function prevSong() {
  if (currentIndex.value > 0) selectSong(currentIndex.value - 1);
}

// LIVE MODE
async function toggleLiveMode() {
  if (!isOwner.value || !setlist.value) return;

  const newValue = !setlist.value.is_live;

  const { error } = await supabase
    .from("setlists")
    .update({ is_live: newValue })
    .eq("id", props.id);

  if (error) {
    Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#1f2937', color: '#fff' });
    return;
  }

  setlist.value.is_live = newValue;

  // If going LIVE, broadcast current state so newcomers sync immediately
  if (newValue && currentIndex.value >= 0) {
    broadcast({ type: "jump", index: currentIndex.value });
    broadcast({ type: "transpose", level: transposeLevel.value });
  }
}

// Sharing Features
async function toggleVisibility() {
  if (!isOwner.value || !setlist.value) return;

  const newValue = !setlist.value.is_public;
  const { error } = await supabase
    .from("setlists")
    .update({ is_public: newValue })
    .eq("id", props.id);

  if (error) {
    Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#1f2937', color: '#fff' });
  } else {
    setlist.value.is_public = newValue;
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      icon: 'success',
      title: newValue ? 'Ahora es pública' : 'Ahora es privada',
      background: '#1f2937',
      color: '#fff'
    });
  }
}

async function cloneSetlist() {
  if (!user.value || isSaving.value) return;

  const { value: newTitle } = await Swal.fire({
    title: 'Clonar Lista',
    input: 'text',
    inputLabel: 'Nombre para tu copia',
    inputValue: `${setlist.value.title} (Copia)`,
    showCancelButton: true,
    confirmButtonText: 'Clonar',
    cancelButtonText: 'Cancelar',
    background: '#1f2937',
    color: '#fff',
    inputValidator: (value) => {
      if (!value) {
        return '¡Necesitas escribir un nombre!'
      }
    }
  });

  if (!newTitle) return;

  isSaving.value = true;

  try {
    // 1. Create New Setlist
    const { data: newList, error: listError } = await supabase
      .from("setlists")
      .insert({
        title: newTitle,
        owner_id: user.value.id,
        is_public: false, // Default to private copy
      })
      .select()
      .single();

    if (listError) throw listError;

    // 2. Prepare Items
    if (songs.value.length > 0) {
      const itemsToInsert = songs.value.map((s, idx) => ({
        setlist_id: newList.id,
        song_id: s.id, // The song itself (reference)
        position: idx,
      }));

      const { error: itemsError } = await supabase
        .from("setlist_items")
        .insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }

    // 3. Navigate
    Swal.fire({
        title: '¡Lista clonada!',
        text: "¿Ir a tu nueva lista?",
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#374151',
        confirmButtonText: 'Sí, ir ahora',
        cancelButtonText: 'Quedarme aquí',
        background: '#1f2937',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            router.push("/");
            setTimeout(() => router.push(`/setlist/${newList.id}`), 100);
        }
    });

  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: 'Error al clonar', text: err.message, background: '#1f2937', color: '#fff' });
  } finally {
    isSaving.value = false;
  }
}

// SHARE: Public Link Logic
async function shareSetlist() {
    // 1. Check if public
    if (!setlist.value.is_public) {
        const result = await Swal.fire({
            title: '¿Hacer Pública?',
            text: "Esta lista es privada. Para compartirla necesitas hacerla pública. ¿Deseas continuar?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, hacer pública',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#fff',
            confirmButtonColor: '#4f46e5'
        });

        if (!result.isConfirmed) return;

        // Change to public
        const { error } = await supabase
            .from('setlists')
            .update({ is_public: true })
            .eq('id', props.id);
        
        if (error) {
             Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#1f2937', color: '#fff' });
             return;
        }
        setlist.value.is_public = true;
    }

    // 2. Copy Link
    const url = window.location.href;
    try {
        await navigator.clipboard.writeText(url);
        Swal.fire({
            title: '¡Enlace Copiado!',
            text: 'Comparte este enlace con tu banda. Ellos podrán ver la lista sin necesidad de registrarse.',
            icon: 'success',
            background: '#1f2937',
            color: '#fff',
            confirmButtonColor: '#10b981'
        });
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo copiar al portapapeles', background: '#1f2937', color: '#fff' });
    }
}

// PDF Export
// Song CRUD Functions
const lyricsTextarea = ref(null);

function insertAtCursor(text) {
  const textarea = lyricsTextarea.value;
  if (!textarea) {
    songForm.value.raw += text;
    return;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = songForm.value.raw.substring(0, start);
  const after = songForm.value.raw.substring(end);

  songForm.value.raw = before + text + after;

  // Restore focus and cursor position
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
  }, 0);
}

function openAddSongModal() {
  editingSong.value = null;
  songForm.value = {
    title: "",
    key: "C",
    bpm: 120,
    time_signature: "4/4",
    raw: "",
    original_link: "",
    notes: "",
    category: "",
  };
  showSongModal.value = true;
}

function openEditSongModal(song) {
  editingSong.value = song;
  songForm.value = {
    title: song.title || "",
    key: song.key || "C",
    bpm: song.bpm || 120,
    time_signature: song.time_signature || "4/4",
    raw: song.raw || "",
    original_link: song.original_link || "",
    notes: song.notes || "",
    category: song.category || "",
  };
  showSongModal.value = true;
}

function closeSongModal() {
  showSongModal.value = false;
  editingSong.value = null;
}

async function saveSong() {
  if (!songForm.value.title || isSaving.value) return;
  isSaving.value = true;

  try {
    if (editingSong.value) {
      // UPDATE existing song
      const { error } = await supabase
        .from("songs")
        .update({
          title: songForm.value.title,
          key: songForm.value.key,
          bpm: songForm.value.bpm,
          time_signature: songForm.value.time_signature,
          raw: songForm.value.raw,
          original_link: songForm.value.original_link,
          notes: songForm.value.notes,
          category: songForm.value.category,
        })
        .eq("id", editingSong.value.id);

      if (error) throw error;
    } else {
      // CREATE new song AND add to setlist
      const { data, error } = await supabase
        .from("songs")
        .insert({
          title: songForm.value.title,
          key: songForm.value.key,
          bpm: songForm.value.bpm,
          time_signature: songForm.value.time_signature,
          raw: songForm.value.raw,
          original_link: songForm.value.original_link,
          notes: songForm.value.notes,
          category: songForm.value.category,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to setlist_items at the end
      const nextPosition = songs.value.length;
      const { error: itemError } = await supabase.from("setlist_items").insert({
        setlist_id: props.id,
        song_id: data.id,
        position: nextPosition,
      });

      if (itemError) throw itemError;
    }

    await fetchSongs();
    closeSongModal();
  } catch (err) {
    console.error(err);
    alert("Error guardando: " + err.message);
  } finally {
    isSaving.value = false;
  }
}

async function deleteSongFromList(song) {
  const result = await Swal.fire({
      title: `¿Quitar "${song.title}"?`,
      text: "La canción no se borrará de la base de datos, solo de esta lista.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
      background: '#1f2937',
      color: '#fff'
  });

  if (!result.isConfirmed) return;

  isSaving.value = true;
  try {
    // Remove from setlist_items (keep the song in songs table)
    const { error } = await supabase
      .from("setlist_items")
      .delete()
      .eq("setlist_id", props.id)
      .eq("song_id", song.id);

    if (error) {
      throw error; // Throw to be caught by the catch block
    }

    // Optimistically update UI
    songs.value = songs.value.filter((s) => s.id !== song.id);
    
    if (currentSong.value && currentSong.value.id === song.id) {
      showList.value = true;
      currentIndex.value = -1;
    }

    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: 'Canción removida',
        background: '#1f2937',
        color: '#fff'
    });

  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#1f2937', color: '#fff' });
  } finally {
    isSaving.value = false;
  }
}
</script>

<style>
/* Global Hacks */
.safe-pb {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Slide Transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Fade Transition (Modal) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* List Transitions */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.15s ease-out;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
/* Ensure absolute positioning for leave transitions to allow others to move up */
.list-leave-active {
  position: absolute;
}
</style>

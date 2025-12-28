# 🎵 SetList Play

Una aplicación web para líderes de alabanza y músicos que facilita la organización, sincronización y ejecución de listas de canciones en tiempo real.

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css)

## ✨ Características Principales

- **📋 Gestión de Setlists** — Crea listas personalizadas con fecha, tipo de servicio, color e ícono
- **🎼 Canciones con Acordes** — Escribe letras con acordes `[C]`, `[Am]` para transposición automática
- **🔗 Links de Referencia** — Guarda el enlace de YouTube/Spotify de la versión que van a tocar
- **📝 Notas Internas** — Comentarios para la banda: "Intro suave", "Fill antes del coro", etc.
- **🎹 Transposición Inteligente** — Sube o baja el tono con un click, los acordes se ajustan automáticamente
- **🎵 Metrónomo Integrado** — Con flash visual y soporte para 4/4, 3/4, 6/8
- **🔴 Modo En Vivo** — Sincroniza la canción actual en todos los dispositivos del equipo en tiempo real
- **📄 Exportar PDF** — Genera resúmenes o cancioneros completos para imprimir
- **📱 Mobile-First** — Diseñado para usarse en el celular durante servicios y ensayos

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/setlist-play.git
cd setlist-play

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev
```

## ⚙️ Variables de Entorno

Crea un archivo `.env` con:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## 🗄️ Base de Datos (Supabase)

La app requiere las siguientes tablas en Supabase:

- `profiles` — Usuarios con roles
- `setlists` — Listas de canciones
- `songs` — Canciones con letra, acordes, metadata
- `setlist_items` — Relación entre setlists y songs (con orden)

Los scripts SQL para crear las tablas están en la raíz del proyecto (`001_*.sql`, `002_*.sql`, etc.)

## 🛠️ Tech Stack

| Capa       | Tecnología                            |
| ---------- | ------------------------------------- |
| Frontend   | Vue.js 3 (Composition API)            |
| Build Tool | Vite                                  |
| Estilos    | TailwindCSS                           |
| Backend    | Supabase (PostgreSQL, Auth, Realtime) |
| Iconos     | Phosphor Icons                        |
| PDFs       | jsPDF + AutoTable                     |
| Alertas    | SweetAlert2                           |
| Deploy     | Vercel                                |

## 📁 Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── SmartLyrics.vue      # Renderizador de letras con acordes
│   ├── SplashScreen.vue     # Pantalla de carga
│   └── HelpAccordion.vue    # Acordeón para ayuda
├── composables/       # Lógica reutilizable
│   ├── useMusicTheory.js    # Transposición de acordes
│   ├── useAudioEngine.js    # Motor de audio (metrónomo)
│   └── useLiveSession.js    # Sincronización en vivo
├── views/             # Páginas principales
│   ├── HomeView.vue         # Inicio con listas
│   ├── SetlistView.vue      # Vista de lista y canción
│   ├── LoginView.vue        # Login
│   └── HelpView.vue         # Centro de ayuda
├── layouts/           # Layouts
├── lib/               # Configuraciones (Supabase)
└── router/            # Vue Router
```

## 📖 Uso

### Para el líder:

1. Inicia sesión
2. Crea una lista con nombre y fecha
3. Agrega canciones (nuevas o desde biblioteca)
4. Activa "Modo En Vivo" para sincronizar con el equipo
5. Comparte el enlace de la lista

### Para los músicos:

1. Abren el enlace compartido (no necesitan cuenta)
2. Ven la canción que el líder selecciona en tiempo real
3. Pueden transportar el tono localmente

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir los cambios que te gustaría hacer.

## 📄 Licencia

MIT

## 📞 Contacto

**Ramón Avila**  
📧 ramonavil@gmail.com

---

_SetList Play — Sincroniza tu alabanza._

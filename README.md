[🇺🇸 Read in English](./README.en.md) | [🇪🇸 Leer en Español](./README.md)

---

# 🧊 Terroncín

**Terroncín** es una plataforma web moderna para crear espacios virtuales y colaborativos. Combina un **mega-lienzo interactivo** con comunicación en tiempo real (video, voz y chat) y un conjunto de herramientas multimedia compartidas. Imagina un espacio infinito donde tú y tus amigos pueden arrastrar videos de YouTube, subir imágenes, dibujar, usar notas adhesivas y verse las caras al mismo tiempo.

## 🚀 Características Principales

- **Lienzo Interactivo Infinito**: Un espacio gigante (zoomeable y paneable) donde todos pueden mover elementos libremente.
- **Videollamadas P2P (WebRTC)**: Comunicación directa de baja latencia entre navegadores (cámara, micrófono y pantalla compartida).
- **Cursores Sincronizados**: Telepresencia fluida; mira exactamente por dónde se mueven los demás en la sala.
- **Multimedia Sincronizada**: Reproductor de YouTube integrado. Si alguien pausa o adelanta el video, se refleja para todos al instante.
- **Salas Privadas y Knock-Knock**: Sistema de aprobación para entrar a salas y evitar invitados no deseados.
- **Panel de Administración**: Gestión de usuarios, edición de perfiles, roles (admin, mod, user, premium) y sistema de baneos.
- **Glassmorphism Design**: Interfaz moderna, limpia y estéticamente atractiva usando Tailwind CSS.

## 🛠️ Tecnologías Utilizadas

- **[Next.js](https://nextjs.org/) (App Router)**: Framework de React para rendimiento, rutas y SSR.
- **[Supabase](https://supabase.com/)**: Autenticación de usuarios (Google OAuth), Base de Datos PostgreSQL, RLS y canales de comunicación (Realtime / Broadcast) para sincronizar estado y cursores.
- **[Tailwind CSS](https://tailwindcss.com/)**: Motor de estilos para una UI moderna y responsiva.
- **[Simple-Peer](https://github.com/feross/simple-peer)**: Abstracción de WebRTC para conectar a los usuarios en malla (mesh) sin necesidad de servidores de video costosos.
- **[Framer Motion](https://www.framer.com/motion/)**: Animaciones fluidas y arrastre (drag) de componentes.

## 💻 Instalación y Desarrollo Local

Para levantar el proyecto en tu máquina local, asegúrate de tener Node.js instalado y sigue estos pasos:

1. **Clona el repositorio e instala las dependencias:**
   ```bash
   npm install
   ```

2. **Configura las variables de entorno:**
   Renombra o crea un archivo `.env.local` en la raíz basándote en un archivo de ejemplo. Necesitarás tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="tu_url_de_supabase"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="tu_service_role_key"
   ```

3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Visita la aplicación:**
   Abre tu navegador en [http://localhost:3000](http://localhost:3000).

## 🤝 Contribuir

¡Todo tipo de apoyo es bienvenido! Desde reportar bugs hasta crear pull requests. Revisa nuestro `CHANGELOG.md` para estar al tanto de las últimas actualizaciones.

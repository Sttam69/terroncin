# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.6.2-beta] - 2026-07-28

Cimientos del Ecosistema Social y Resiliencia en WAN.

### Añadido
- **Mensajería Privada (DMs)**: Sistema de chat uno-a-uno en el Lobby con notificaciones en tiempo real e historial, protegido por políticas RLS.
- **Sistema de Reportes Global**: Modal para reportar usuarios (spam, acoso, etc.) desde la lista de amigos y desde los participantes de las salas, integrado directamente a la base de datos para facilitar la moderación.

### Cambiado
- **Servidores STUN (WebRTC)**: Ampliación de la redundancia de servidores STUN, agregando múltiples servidores de Google y Twilio para mejorar dramáticamente el descubrimiento de IPs públicas a través de firewalls internacionales.

### Arreglado
- **Redes WAN y Rate-Limiting**: Solucionado un fallo clásico (pantallas negras) que ocurría entre usuarios de diferentes países. Se deshabilitó *Trickle ICE* para forzar el empaquetado de todos los candidatos en un solo SDP, evitando que Supabase Broadcast descarte conexiones por límite de velocidad.

## [v0.6.1-beta] - 2026-07-27

Parche crítico de interfaz y P2P para estabilizar la Beta.

### Arreglado
- **Flujo de ICE Candidates (WebRTC)**: Eliminamos una restricción condicional que estaba bloqueando la transmisión de candidatos ICE generados por el receptor. Ahora el apretón de manos se completa de forma íntegra evitando recuadros negros persistentes.
- **Interferencia del Traductor Automático**: Añadimos el atributo `translate="no"` y la metaetiqueta `google` para impedir que navegadores como Chrome traduzcan el DOM de React accidentalmente, lo cual destruía la jerarquía de los elementos.
- **Interferencia de Teclados**: El input del chat en vivo ya no sufre de autocorrecciones disruptivas (`spellCheck={false}`) para asegurar una experiencia de escritura fluida en móviles.

## [v0.6.0-beta] - 2026-07-27

¡Oficializamos el lanzamiento de Terroncín a fase Beta! Toda la arquitectura ha sido consolidada para soportar alta concurrencia y despliegues seguros en producción.

### Añadido
- **Auth Guard Estricto**: Implementación del nuevo estándar de Next.js 16 (`proxy.ts`) para la intercepción de rutas. El sistema ahora bloquea proactivamente cualquier intento de acceso sin sesión y redirige hacia `/login`.

### Cambiado
- **Refactorización de Interceptores**: Migración completa del obsoleto `middleware.ts` a la nueva convención `proxy.ts`, garantizando compatibilidad total con el compilador Turbopack.

### Arreglado
- **Despliegues en Vercel Limpios**: Resolución definitiva de los crashes y conflictos de rutas causados por archivos residuales y cachés duplicados, logrando compilaciones exitosas.
- **Producción Google OAuth**: Se actualizaron las URIs de redirección y credenciales en Supabase para asegurar que el inicio de sesión con Google funcione en el entorno de despliegue en vivo.

## [v0.5.0-alpha] - 2026-07-27

### Añadido
- **Panel de Administración (`/admin`)**: Una interfaz dedicada para gestionar la plataforma, editar perfiles y gestionar reportes de forma sencilla.
- **Roles de Usuario**: Soporte completo para jerarquías (`user`, `premium`, `moderator`, `admin`, `banned`) conectadas directamente con Supabase.
- **Sistema Knock-Knock**: Si la sala es privada y no estás invitado, el anfitrión tiene que aprobar tu entrada. Más control, menos intrusos.
- **WebRTC y Multimedia**: Logramos una conexión P2P sólida usando `simple-peer`. Ahora puedes usar tu cámara, compartir pantalla y hablar sin depender de un servidor central, además de ver videos de YouTube sincronizados con todos.
- **Cursores Sincronizados**: Telepresencia real. Puedes ver dónde están los ratones de los demás moviéndose por el lienzo, cada uno con un color asignado.
- **Monetización**: Un modal rápido de donaciones en el Lobby para apoyar el proyecto vía PayPal o escanear el QR de Deuna.
- **Donaciones Globales**: Ahora el botón de apoyo es visible desde las pantallas de inicio de sesión y registro, es completamente bilingüe (Español/Inglés) y vive en la esquina superior derecha.
- **Preparación para Alta Concurrencia**: Las salas interactivas ahora detectan picos de usuarios (más de 15 personas) y activan alertas preventivas de rendimiento para el anfitrión y los invitados.
- **Protección de Rutas (Middleware)**: Implementamos un sólido candado en el servidor (Edge) usando `@supabase/ssr` que bloquea el acceso de usuarios no autenticados, redirigiéndolos instantáneamente a `/login` sin cargar la aplicación.

### Cambiado
- **Rediseño del Lobby**: Le dimos un lavado de cara completo a la pantalla principal (`/`). Adoptamos el estilo glassmorphism, modo oscuro ambiental y una sección súper práctica para acceder a "Mis Salas" de inmediato.
- **Lienzo Interactivo (Canvas)**: Pasamos de un simple fondo a un mega-lienzo paneable y con zoom (`react-zoom-pan-pinch`). Ahora puedes soltar notas de texto, subir imágenes, usar la herramienta de dibujo y acomodar los videos a tu gusto.
- **Registro de Cambios Dinámico**: El modal de changelog ahora se alimenta automáticamente de un archivo centralizado (`changelogData.ts`), haciendo que las actualizaciones sean inmediatas.
- **Privacidad del Lobby**: Eliminamos la posibilidad de explorar la aplicación como "Invitado". El Lobby ahora te espera con una pantalla de carga para garantizar tu sesión y mostrar tu información real de inmediato.

### Arreglado
- **Fallo Crítico en Producción (SSR)**: Vercel y Turbopack crasheaban al intentar procesar `simple-peer` en el backend. Lo solucionamos aislando la lógica de la sala en un componente cliente y desactivando el SSR (`next/dynamic`).
- **Autenticación con GitHub**: El botón de GitHub en el Login redirigía por error a una función bloqueada de Apple. Ahora utiliza Supabase OAuth de forma correcta y limpia, con su ícono oficial.
- **Fugas de Memoria WebRTC**: Implementamos una limpieza profunda (`cleanup`) al abandonar la sala para cerrar conexiones, limpiar canales y apagar la cámara, evitando que la app colapse con el tiempo. Ahora también detecta si el usuario cierra el navegador de golpe (`beforeunload`).
- **Advertencias de React Next.js**: Corregimos un error estricto de Next.js donde se intentaba acceder de forma síncrona a los parámetros de la URL (`params.slug`). Ahora usamos `use()` de React para desenvolver la Promesa de la ruta adecuadamente.
- **Seguridad (XSS)**: Implementamos `dompurify` para limpiar cualquier inyección maliciosa de código en los widgets de texto libre (`contentEditable`), garantizando que nadie pueda insertar scripts en el lienzo público.
- **Construcción en Vercel (Panel Admin)**: Solucionamos un fallo durante el `npm run build` donde Next.js intentaba pre-renderizar estáticamente la ruta `/admin` sin sesión. Ahora forzamos el renderizado dinámico (`force-dynamic`).
- **Conflictos de Intercepción (Vercel)**: Corregimos un error de despliegue donde el compilador se confundía por la existencia simultánea de `proxy.ts` y `middleware.ts`. Limpiamos los archivos residuales para dejar a `middleware.ts` como la única fuente de la verdad para el Auth Guard.

# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### Cambiado
- **Rediseño del Lobby**: Le dimos un lavado de cara completo a la pantalla principal (`/`). Adoptamos el estilo glassmorphism, modo oscuro ambiental y una sección súper práctica para acceder a "Mis Salas" de inmediato.
- **Lienzo Interactivo (Canvas)**: Pasamos de un simple fondo a un mega-lienzo paneable y con zoom (`react-zoom-pan-pinch`). Ahora puedes soltar notas de texto, subir imágenes, usar la herramienta de dibujo y acomodar los videos a tu gusto.
- **Registro de Cambios Dinámico**: El modal de changelog ahora se alimenta automáticamente de un archivo centralizado (`changelogData.ts`), haciendo que las actualizaciones sean inmediatas.

### Arreglado
- **Fallo Crítico en Producción (SSR)**: Vercel y Turbopack crasheaban al intentar procesar `simple-peer` en el backend. Lo solucionamos aislando la lógica de la sala en un componente cliente y desactivando el SSR (`next/dynamic`).
- **Autenticación con GitHub**: El botón de GitHub en el Login redirigía por error a una función bloqueada de Apple. Ahora utiliza Supabase OAuth de forma correcta y limpia, con su ícono oficial.
- **Fugas de Memoria WebRTC**: Implementamos una limpieza profunda (`cleanup`) al abandonar la sala para cerrar conexiones, limpiar canales y apagar la cámara, evitando que la app colapse con el tiempo. Ahora también detecta si el usuario cierra el navegador de golpe (`beforeunload`).
- **Advertencias de React Next.js**: Corregimos un error estricto de Next.js donde se intentaba acceder de forma síncrona a los parámetros de la URL (`params.slug`). Ahora usamos `use()` de React para desenvolver la Promesa de la ruta adecuadamente.
- **Seguridad (XSS)**: Implementamos `dompurify` para limpiar cualquier inyección maliciosa de código en los widgets de texto libre (`contentEditable`), garantizando que nadie pueda insertar scripts en el lienzo público.

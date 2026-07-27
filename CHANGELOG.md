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

### Cambiado
- **Rediseño del Lobby**: Le dimos un lavado de cara completo a la pantalla principal (`/`). Adoptamos el estilo glassmorphism, modo oscuro ambiental y una sección súper práctica para acceder a "Mis Salas" de inmediato.
- **Lienzo Interactivo (Canvas)**: Pasamos de un simple fondo a un mega-lienzo paneable y con zoom (`react-zoom-pan-pinch`). Ahora puedes soltar notas de texto, subir imágenes, usar la herramienta de dibujo y acomodar los videos a tu gusto.

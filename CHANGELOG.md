# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.5.0-alpha] - 2026-07-27

### Added
- **Panel de Administración (`/admin`)**: Interfaz dedicada para gestión avanzada de la plataforma con edición de perfiles en tiempo real.
- **Roles de Usuario**: Soporte para roles jerárquicos (`user`, `premium`, `moderator`, `admin`, `banned`) integrados con Supabase.
- **Sistema Knock-Knock**: Flujo de aprobación para permitir o denegar la entrada a salas privadas a usuarios no invitados (Control de Host).
- **WebRTC y Multimedia**: Infraestructura robusta P2P (mesh) usando `simple-peer` para transmisión de cámara, pantalla compartida (Screen Share) y audio en la sala, con STUN de Google.
- **Cursores Sincronizados**: Telepresencia fluida al mostrar el puntero con colores asignados del resto de participantes dentro del lienzo interactivo.
- **Monetización**: Modal de donaciones integrado en el Lobby con acceso rápido a PayPal y QR de Deuna.

### Changed
- **Rediseño del Lobby**: Modernización completa de la pantalla principal (`/`) con estética glassmorphism, modo oscuro ambiental y sección rápida para "Mis Salas".
- **Lienzo Interactivo (Canvas)**: Evolución del espacio de la sala (`react-zoom-pan-pinch`) para soportar widgets avanzados: notas de texto, subida de imágenes, herramientas de dibujo (Pizarra) y el `SyncedVideoWidget` de YouTube.

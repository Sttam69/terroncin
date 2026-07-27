[🇺🇸 Read in English](./README.en.md) | [🇪🇸 Leer en Español](./README.md)

---

# 🧊 Terroncín

**Terroncín** is a modern web platform for creating virtual and collaborative spaces. It combines an **interactive mega-canvas** with real-time communication (video, voice, and chat) and a set of shared multimedia tools. Imagine an infinite space where you and your friends can drag YouTube videos, upload images, draw, use sticky notes, and see each other's faces all at the same time.

## 🚀 Key Features

- **Infinite Interactive Canvas**: A giant space (zoomable and pannable) where everyone can freely move elements around.
- **P2P Video Calls (WebRTC)**: Low-latency direct communication between browsers (camera, microphone, and screen sharing).
- **Synchronized Cursors**: Fluid telepresence; see exactly where others are moving in the room.
- **Synchronized Multimedia**: Integrated YouTube player. If someone pauses or skips the video, it reflects for everyone instantly.
- **Private Rooms and Knock-Knock**: Approval system for joining rooms to keep unwanted guests out.
- **Admin Panel**: User management, profile editing, roles (admin, mod, user, premium), and a ban system.
- **Glassmorphism Design**: Modern, clean, and aesthetically pleasing interface using Tailwind CSS.

## 🛠️ Built With

- **[Next.js](https://nextjs.org/) (App Router)**: React framework for performance, routing, and SSR.
- **[Supabase](https://supabase.com/)**: User authentication (Google OAuth), PostgreSQL Database, RLS, and communication channels (Realtime / Broadcast) to sync state and cursors.
- **[Tailwind CSS](https://tailwindcss.com/)**: Styling engine for a modern and responsive UI.
- **[Simple-Peer](https://github.com/feross/simple-peer)**: WebRTC abstraction to connect users in a mesh topology without needing expensive video servers.
- **[Framer Motion](https://www.framer.com/motion/)**: Fluid animations and draggable components.

## 💻 Local Development & Installation

To get the project running on your local machine, make sure you have Node.js installed and follow these steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create or rename a `.env.local` file in the root directory based on the example environment file. You'll need your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Visit the app:**
   Open your browser at [http://localhost:3000](http://localhost:3000).

## 🤝 Contributing

All types of support are welcome! From reporting bugs to creating pull requests. Check our `CHANGELOG.md` to stay updated with the latest changes.

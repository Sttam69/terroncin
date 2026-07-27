import Link from 'next/link'
import Image from 'next/image'
import logoMain from '../../../public/logo-main.png'

export default function PrivacidadPage() {
  return (
    <main className="flex flex-col min-h-screen items-center p-6 relative overflow-hidden bg-[#0a0a0c]">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-terroncin-primary/20 rounded-full blur-[80px] pointer-events-none animate-pulse -z-10"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-terroncin-secondary/10 rounded-full blur-[80px] pointer-events-none animate-pulse -z-10" style={{ animationDelay: '2s' }}></div>

      <div className="flex flex-col w-full max-w-3xl mx-auto relative z-10 py-10">
        <Link href="/register" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 w-max bg-[#1e2024]/80 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          <span className="material-symbols-outlined text-[20px] mr-2">arrow_back</span>
          Volver al registro
        </Link>
        
        <div className="glass-panel rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="flex flex-col items-center text-center mb-10">
            <Image src={logoMain} alt="Terroncín Logo" width={64} height={64} className="w-16 h-16 object-contain mb-4 drop-shadow-xl" />
            <h1 className="font-syne text-3xl md:text-4xl font-bold text-white mb-4">Política de Privacidad</h1>
            <p className="font-inter text-gray-400">Última actualización: Julio 2026</p>
          </div>

          <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none font-inter text-sm md:text-base space-y-6">
            <section>
              <h2 className="text-xl font-bold font-syne mb-2 text-terroncin-primary">1. Privacidad de Voz y Video (WebRTC P2P)</h2>
              <p>Tu privacidad en las comunicaciones de audio y video es nuestra máxima prioridad. Todas las conexiones de cámara web, micrófono y pantalla compartida se realizan mediante tecnología WebRTC Peer-to-Peer (P2P). Esto significa que <strong>las comunicaciones fluyen directamente entre los usuarios</strong> de la sala.</p>
              <p>Terroncín <strong>NO GRABA, NO ESCUCHA Y NO ALMACENA</strong> ninguna transmisión de voz o video en nuestros servidores.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold font-syne mb-2 text-terroncin-primary">2. Datos que SÍ almacenamos</h2>
              <p>Para proporcionar las funcionalidades esenciales de la plataforma, almacenamos la siguiente información en nuestra base de datos cifrada:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                  <li><strong>Información de Cuenta:</strong> Correos electrónicos, tokens de autenticación de Google y perfiles públicos (Apodos, Biografías y Avatares).</li>
                  <li><strong>Estado de las Salas (JSONB):</strong> La configuración y el contenido estático de las salas (posiciones de widgets, notas de texto, URL de imágenes insertadas y trazos de pizarra) se almacenan para que persistan cuando vuelvas.</li>
                  <li><strong>Historial de Chat:</strong> Los mensajes de texto enviados a través del chat global de la sala.</li>
                  <li><strong>Moderación:</strong> Registros de usuarios baneados o expulsados por los administradores de la sala.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-syne mb-2 text-terroncin-primary">3. Protección de tus Datos</h2>
              <p>Utilizamos infraestructura moderna y reglas estrictas de seguridad a nivel de fila (RLS en Supabase) para asegurar que nadie pueda acceder o alterar tus datos personales o el contenido de tus salas privadas, a menos que tengan el permiso explícito o conozcan la URL/Código de tu sala.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-syne mb-2 text-terroncin-primary">4. Compartir Información con Terceros</h2>
              <p>No vendemos, alquilamos ni comercializamos tus datos personales. Sin embargo, podríamos compartir tu información si estamos obligados legalmente a hacerlo, o para proteger los derechos y la seguridad de Terroncín y de sus usuarios, siempre en estricto cumplimiento de la ley.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

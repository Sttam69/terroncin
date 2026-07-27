import Link from 'next/link'
import Image from 'next/image'
import logoMain from '../../../public/logo-main.png'

export default function TerminosPage() {
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
            <h1 className="font-syne text-3xl md:text-4xl font-bold text-white mb-4">Términos de Servicio</h1>
            <p className="font-inter text-gray-400">Última actualización: Julio 2026</p>
          </div>

          <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none font-inter text-sm md:text-base space-y-6">
            <section>
              <h2 className="text-xl font-bold font-syne mb-2 text-terroncin-primary">1. Aceptación de los Términos</h2>
              <p>Al acceder, registrarse o utilizar la plataforma Terroncín, usted acepta quedar vinculado legalmente por estos Términos de Servicio. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios. Terroncín es un espacio virtual colaborativo diseñado para la creatividad y la interacción comunitaria.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold font-syne mb-2 text-terroncin-primary">2. Reglas de Conducta Comunitaria</h2>
              <p>Mantenemos una política de <strong>cero tolerancia</strong> hacia comportamientos destructivos. Al utilizar nuestras salas y herramientas de interacción, usted se compromete a <strong>NO</strong>:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                  <li>Publicar, compartir o dibujar contenido que sea ilegal, difamatorio, obsceno o que incite al odio.</li>
                  <li>Acosar, intimidar, amenazar o discriminar a otros usuarios de la comunidad.</li>
                  <li>Enviar spam, enlaces maliciosos, publicidad no solicitada o ejecutar scripts automatizados.</li>
                  <li>Evadir bloqueos o baneos creando múltiples cuentas secundarias.</li>
              </ul>
              <p className="mt-2">El incumplimiento de cualquiera de estas reglas resultará en sanciones inmediatas.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-syne mb-2 text-terroncin-primary">3. Moderación y Derechos de Administración</h2>
              <p>Terroncín se reserva el <strong>derecho irrefutable</strong> de moderar la plataforma para mantener un entorno seguro. Los Administradores y Moderadores de Terroncín tienen plena autoridad para, en cualquier momento y sin previo aviso:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                  <li>Eliminar, limpiar o bloquear permanentemente cualquier sala que infrinja las normas.</li>
                  <li>Expulsar (kick) o Banear (block) de forma permanente a cualquier usuario o dirección IP.</li>
                  <li>Suspender o eliminar cuentas de usuario si consideramos que su comportamiento es perjudicial para la plataforma o sus miembros.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-syne mb-2 text-terroncin-primary">4. Exención de Responsabilidad de Contenidos</h2>
              <p>La plataforma Terroncín proporciona un "lienzo en blanco" y herramientas de comunicación para sus usuarios. <strong>Terroncín no se hace responsable por el contenido</strong> (textos, dibujos, imágenes, videos o enlaces) que los usuarios coloquen, compartan o transmitan dentro de sus salas o lienzos privados.</p>
              <p>Todo el contenido generado es responsabilidad exclusiva de la persona que lo originó. Si encuentras contenido infractor, por favor utiliza las herramientas de reporte o contacta a un administrador.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold font-syne mb-2 text-terroncin-primary">5. Modificaciones del Servicio</h2>
              <p>Nos reservamos el derecho de modificar o discontinuar temporal o permanentemente el servicio (o cualquier parte del mismo) con o sin previo aviso. Terroncín no será responsable ante usted ni ante ningún tercero por ninguna modificación, suspensión o interrupción del servicio.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

import React from 'react';

interface TermsConditionsProps {
  onBack: () => void;
}

const TermsConditions: React.FC<TermsConditionsProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl bg-surface border border-border rounded-2xl p-8 sm:p-12 shadow-2xl animate-fade-in">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Volver al inicio
        </button>

        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Términos y Condiciones</h1>
        <p className="text-gray-400 mb-8">Última actualización: Mayo 2024</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-primary mb-4">1. Aceptación de los Términos</h2>
            <p>
              Bienvenido a <strong>EsMiOficio Michoacán</strong>. Al acceder, navegar o utilizar este sitio web, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">2. Descripción del Servicio (Intermediación)</h2>
            <p>
              EsMiOficio actúa exclusivamente como un <strong>directorio y plataforma de conexión</strong>. Nuestra función se limita a facilitar el contacto entre usuarios que buscan servicios ("Clientes") y personas que los ofrecen ("Profesionales").
            </p>
            <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mt-4 rounded-r-lg">
              <p className="font-bold text-red-200">Importante:</p>
              <p className="text-red-100/80 text-sm">
                EsMiOficio NO es empleador de los profesionales, NO garantiza la calidad del trabajo, NO supervisa las obras y NO se hace responsable por daños, perjuicios, robos, o incumplimientos derivados de la relación contractual entre el Cliente y el Profesional.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">3. Responsabilidades de los Profesionales</h2>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li>Garantizar que toda la información proporcionada (identidad, experiencia, fotos) es veraz y actual.</li>
              <li>Contar con las herramientas, conocimientos y permisos necesarios para realizar el oficio ofertado.</li>
              <li>Tratar a los clientes con respeto y profesionalismo.</li>
              <li>Cumplir con los precios y tiempos acordados directamente con el cliente.</li>
              <li>EsMiOficio se reserva el derecho de eliminar perfiles que reciban quejas reiteradas o reportes de fraude.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">4. Responsabilidades de los Usuarios/Clientes</h2>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li>Utilizar la plataforma para fines lícitos y reales.</li>
              <li>Proporcionar reseñas honestas y basadas en experiencias reales de servicio.</li>
              <li>No utilizar lenguaje ofensivo, discriminatorio o difamatorio en las reseñas o mensajes.</li>
              <li>Verificar por su propia cuenta las credenciales del profesional antes de permitir el acceso a su domicilio o realizar pagos anticipados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">5. Sistema de Reseñas y Contenido</h2>
            <p>
              Los usuarios son los únicos responsables del contenido de sus reseñas. EsMiOficio no valida la veracidad de cada opinión, pero se reserva el derecho de moderar o eliminar contenido que viole nuestras políticas de comunidad (spam, insultos, contenido irrelevante). Al publicar contenido, usted otorga a EsMiOficio una licencia para mostrarlo públicamente en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">6. Limitación de Responsabilidad</h2>
            <p>
              En la máxima medida permitida por la ley aplicable en México, EsMiOficio no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, ni por ninguna pérdida de beneficios o ingresos, ya sea incurrida directa o indirectamente, como resultado de: (a) su acceso o uso o su incapacidad para acceder o utilizar los servicios; (b) cualquier conducta o contenido de cualquier tercero en los servicios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">7. Modificaciones al Servicio</h2>
            <p>
              Nos reservamos el derecho de modificar o discontinuar, temporal o permanentemente, el servicio (o cualquier parte del mismo) con o sin previo aviso. Usted acepta que EsMiOficio no será responsable ante usted ni ante terceros por ninguna modificación, suspensión o interrupción del servicio.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;

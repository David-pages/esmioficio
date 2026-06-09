import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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

        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Aviso de Privacidad</h1>
        <p className="text-gray-400 mb-8">Última actualización: Mayo 2024</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-primary mb-4">1. Identidad y Domicilio del Responsable</h2>
            <p>
              <strong>EsMiOficio Michoacán</strong> (en adelante "La Plataforma"), con domicilio para efectos de este aviso en Morelia, Michoacán, México, es el responsable del uso y protección de sus datos personales, y al respecto le informamos lo siguiente de conformidad con la <em>Ley Federal de Protección de Datos Personales en Posesión de los Particulares</em>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">2. Datos Personales que Recabamos</h2>
            <p className="mb-2">Para llevar a cabo las finalidades descritas en el presente aviso de privacidad, utilizaremos los siguientes datos personales:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li><strong>Usuarios Generales:</strong> Nombre completo, correo electrónico y datos de navegación.</li>
              <li><strong>Profesionales/Oficios:</strong> Nombre completo, teléfono de contacto (WhatsApp), correo electrónico, ubicación (Municipio/Colonia), fotografía de perfil, años de experiencia y descripción de servicios.</li>
              <li><strong>Datos Sensibles:</strong> La Plataforma NO recaba datos personales sensibles (como origen racial, salud, creencias religiosas, etc.).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">3. Finalidades del Tratamiento</h2>
            <p className="mb-2">Los datos personales que recabamos de usted los utilizaremos para las siguientes finalidades que son necesarias para el servicio que solicita:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li>Crear su cuenta en la plataforma y verificar su identidad.</li>
              <li>Publicar su perfil profesional para que usuarios interesados puedan contactarlo.</li>
              <li>Facilitar la comunicación entre usuarios y profesionales (vía WhatsApp o teléfono).</li>
              <li>Gestionar el sistema de reseñas y calificaciones.</li>
              <li>Mejorar la seguridad y funcionamiento de nuestro sitio web.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">4. Transferencia de Datos</h2>
            <p>
              Le informamos que sus datos de contacto (Nombre, Teléfono y Ubicación aproximada) serán públicos dentro de la plataforma para permitir que los usuarios contraten sus servicios. Al registrarse como profesional, usted acepta esta divulgación pública de sus datos de contacto comercial. No vendemos ni rentamos su información a terceros para fines de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">5. Derechos ARCO</h2>
            <p>
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada conforme a los principios, deberes y obligaciones previstas en la normativa (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición).
            </p>
            <p className="mt-2">
              Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva a través del correo electrónico: <strong>privacidad@esmioficio.mx</strong> (Correo demostrativo).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">6. Uso de Cookies</h2>
            <p>
              Le informamos que en nuestra página de Internet utilizamos cookies y otras tecnologías a través de las cuales es posible monitorear su comportamiento como usuario de Internet, brindarle un mejor servicio y experiencia de usuario al navegar en nuestra página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">7. Cambios al Aviso de Privacidad</h2>
            <p>
              El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales; de nuestras propias necesidades por los productos o servicios que ofrecemos; de nuestras prácticas de privacidad; o por otras causas. Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso de privacidad a través de nuestro sitio web.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

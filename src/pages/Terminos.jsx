import { useNavigate } from "react-router-dom";

import "./legal.css";


function Terminos() {

  const navigate = useNavigate();


  return (

    <div className="legal-page">

      <div className="legal-container">


        {/* =========================================
            BOTÓN VOLVER
        ========================================= */}

        <button
          type="button"
          className="legal-back"
        onClick={() => navigate("/register")}
        >
          ← Volver
        </button>


        {/* =========================================
            ENCABEZADO
        ========================================= */}

        <header className="legal-header">

          <span className="legal-badge">
            Documento legal
          </span>

          <h1>
            Términos y Condiciones
          </h1>

          <p>
            Última actualización: septiembre de 2026
          </p>

        </header>


        {/* =========================================
            1. OBJETO
        ========================================= */}

        <section className="legal-section">

          <h2>
            1. Objeto
          </h2>

          <p>
            Los presentes Términos y Condiciones regulan
            el acceso y uso de la plataforma CONTADURIA,
            destinada a facilitar la comunicación y
            gestión de servicios contables entre los
            clientes y el profesional responsable de
            prestar dichos servicios.
          </p>

          <p>
            Al registrarse y utilizar la plataforma,
            el usuario declara haber leído y aceptado
            estos Términos y Condiciones.
          </p>

        </section>


        {/* =========================================
            2. REGISTRO
        ========================================= */}

        <section className="legal-section">

          <h2>
            2. Registro de usuarios
          </h2>

          <p>
            Para acceder a determinadas funcionalidades,
            el usuario deberá crear una cuenta y
            proporcionar la información necesaria para
            la prestación del servicio.
          </p>

          <p>
            El usuario se compromete a proporcionar
            información verdadera, completa y actualizada.
          </p>

          <p>
            Cada usuario es responsable de mantener
            la confidencialidad de sus credenciales de
            acceso y de las actividades realizadas desde
            su cuenta.
          </p>

        </section>


        {/* =========================================
            3. SERVICIOS
        ========================================= */}

        <section className="legal-section">

          <h2>
            3. Servicios disponibles
          </h2>

          <p>
            La plataforma podrá permitir, entre otras,
            las siguientes funcionalidades:
          </p>

          <ul>

            <li>
              Solicitar servicios o asesorías contables.
            </li>

            <li>
              Gestionar solicitudes relacionadas con
              los servicios ofrecidos.
            </li>

            <li>
              Solicitar y consultar citas.
            </li>

            <li>
              Cargar documentos necesarios para la
              prestación del servicio.
            </li>

            <li>
              Recibir documentos enviados por el
              contador.
            </li>

            <li>
              Consultar información relacionada con
              sus solicitudes y servicios.
            </li>

          </ul>

        </section>


        {/* =========================================
            4. INFORMACIÓN DEL USUARIO
        ========================================= */}

        <section className="legal-section">

          <h2>
            4. Responsabilidad sobre la información
          </h2>

          <p>
            El usuario es responsable de que la
            información y los documentos suministrados
            mediante la plataforma sean correctos,
            completos, actualizados y legítimos.
          </p>

          <p>
            El responsable del servicio no será
            responsable por errores, omisiones o
            consecuencias derivadas de información
            incorrecta, incompleta o desactualizada
            proporcionada por el usuario.
          </p>

        </section>


        {/* =========================================
            5. DOCUMENTOS
        ========================================= */}

        <section className="legal-section">

          <h2>
            5. Documentos cargados
          </h2>

          <p>
            Los documentos cargados deberán estar
            relacionados con la prestación de los
            servicios solicitados.
          </p>

          <p>
            El usuario declara que tiene autorización
            para suministrar los documentos e información
            que carga en la plataforma.
          </p>

          <p>
            No está permitido cargar archivos maliciosos,
            contenidos ilícitos o documentos que vulneren
            derechos de terceros.
          </p>

        </section>


        {/* =========================================
            6. SEGURIDAD
        ========================================= */}

        <section className="legal-section">

          <h2>
            6. Seguridad de la cuenta
          </h2>

          <p>
            El usuario deberá utilizar una contraseña
            segura y no compartir sus credenciales de
            acceso con otras personas.
          </p>

          <p>
            En caso de sospechar un acceso no autorizado,
            el usuario deberá cambiar su contraseña y
            comunicar la situación mediante los canales
            disponibles en la plataforma.
          </p>

        </section>


        {/* =========================================
            7. DISPONIBILIDAD
        ========================================= */}

        <section className="legal-section">

          <h2>
            7. Disponibilidad de la plataforma
          </h2>

          <p>
            Se procurará mantener la plataforma disponible
            de manera continua. Sin embargo, podrán
            presentarse interrupciones por mantenimiento,
            actualizaciones, fallas técnicas, servicios
            de terceros o circunstancias fuera del
            control razonable del responsable.
          </p>

        </section>


        {/* =========================================
            8. USO ADECUADO
        ========================================= */}

        <section className="legal-section">

          <h2>
            8. Uso adecuado de la plataforma
          </h2>

          <p>
            El usuario se compromete a utilizar la
            plataforma únicamente para fines legítimos
            relacionados con los servicios ofrecidos.
          </p>

          <p>
            Está prohibido intentar vulnerar la seguridad,
            acceder sin autorización a información de
            otros usuarios, introducir software malicioso
            o utilizar la plataforma para actividades
            fraudulentas o ilícitas.
          </p>

        </section>


        {/* =========================================
            9. DATOS PERSONALES
        ========================================= */}

        <section className="legal-section">

          <h2>
            9. Protección de datos personales
          </h2>

          <p>
            Los datos personales recopilados mediante
            la plataforma serán tratados conforme a la
            Política de Privacidad y Tratamiento de
            Datos Personales disponible en la aplicación.
          </p>

        </section>


        {/* =========================================
            10. PROPIEDAD INTELECTUAL
        ========================================= */}

        <section className="legal-section">

          <h2>
            10. Propiedad intelectual
          </h2>

          <p>
            El diseño, estructura, elementos gráficos,
            textos, software y demás componentes propios
            de la plataforma se encuentran protegidos
            por las normas aplicables de propiedad
            intelectual, salvo aquellos elementos que
            pertenezcan a terceros.
          </p>

        </section>


        {/* =========================================
            11. MODIFICACIONES
        ========================================= */}

        <section className="legal-section">

          <h2>
            11. Modificaciones
          </h2>

          <p>
            Estos Términos y Condiciones podrán ser
            actualizados cuando existan cambios
            operativos, tecnológicos, comerciales o
            normativos.
          </p>

          <p>
            Cuando las modificaciones sean relevantes,
            podrá solicitarse al usuario una nueva
            aceptación de los términos actualizados.
          </p>

        </section>


        {/* =========================================
            12. LEGISLACIÓN
        ========================================= */}

        <section className="legal-section">

          <h2>
            12. Legislación aplicable
          </h2>

          <p>
            Los presentes Términos y Condiciones se
            interpretarán de acuerdo con la legislación
            vigente de la República de Colombia.
          </p>

        </section>


        {/* =========================================
            13. CONTACTO
        ========================================= */}

        <section className="legal-section">

          <h2>
            13. Contacto
          </h2>

          <p>
            Para consultas relacionadas con estos
            Términos y Condiciones, los usuarios podrán
            utilizar los canales de contacto publicados
            en la plataforma.
          </p>

        </section>


        {/* =========================================
            FOOTER
        ========================================= */}

        <div className="legal-footer">

          <button
            type="button"
            onClick={() => navigate(-1)}
          >
            ← Volver
          </button>

        </div>


      </div>

    </div>

  );

}


export default Terminos;
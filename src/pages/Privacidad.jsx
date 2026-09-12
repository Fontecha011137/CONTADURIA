import { useNavigate } from "react-router-dom";

import "./legal.css";


function Privacidad() {

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
            Protección de datos
          </span>

          <h1>
            Política de Privacidad y
            Tratamiento de Datos Personales
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
            1. Finalidad de esta política
          </h2>

          <p>
            La presente Política de Privacidad y
            Tratamiento de Datos Personales establece
            las condiciones aplicables al tratamiento
            de la información personal recopilada
            mediante la plataforma CONTADURIA.
          </p>

          <p>
            El tratamiento de la información se realizará
            conforme a la normativa colombiana aplicable
            en materia de protección de datos personales.
          </p>

        </section>


        {/* =========================================
            2. DATOS RECOPILADOS
        ========================================= */}

        <section className="legal-section">

          <h2>
            2. Datos que podemos recopilar
          </h2>

          <p>
            La plataforma aplica el principio de
            minimización de datos y procura solicitar
            únicamente la información necesaria para
            prestar los servicios.
          </p>

          <p>
            Dependiendo de las funcionalidades utilizadas,
            podrán recopilarse los siguientes datos:
          </p>

          <ul>

            <li>
              Nombre del usuario.
            </li>

            <li>
              Número de celular.
            </li>

            <li>
              Correo electrónico.
            </li>

            <li>
              Información relacionada con solicitudes
              de servicios o asesorías.
            </li>

            <li>
              Información relacionada con citas.
            </li>

            <li>
              Documentos que el usuario decida suministrar
              para la prestación del servicio contable.
            </li>

            <li>
              Información técnica necesaria para la
              seguridad y funcionamiento de la plataforma.
            </li>

          </ul>

        </section>


        {/* =========================================
            3. DATOS QUE NO SOLICITAMOS
        ========================================= */}

        <section className="legal-section">

          <h2>
            3. Información que no solicitamos
          </h2>

          <p>
            La plataforma no solicita contraseñas
            bancarias, PIN, CVV, claves de Nequi,
            credenciales de entidades financieras ni
            otros datos bancarios sensibles que no sean
            necesarios para la prestación del servicio.
          </p>

          <p>
            Las contraseñas utilizadas para acceder a
            la plataforma son gestionadas mediante
            mecanismos de autenticación segura y no
            deben almacenarse en texto visible.
          </p>

        </section>


        {/* =========================================
            4. FINALIDADES
        ========================================= */}

        <section className="legal-section">

          <h2>
            4. Finalidades del tratamiento
          </h2>

          <p>
            Los datos personales podrán ser tratados
            para las siguientes finalidades:
          </p>

          <ul>

            <li>
              Crear y administrar la cuenta del usuario.
            </li>

            <li>
              Identificar al cliente dentro de la
              plataforma.
            </li>

            <li>
              Gestionar solicitudes y servicios contables.
            </li>

            <li>
              Gestionar citas.
            </li>

            <li>
              Facilitar comunicaciones relacionadas
              con los servicios solicitados.
            </li>

            <li>
              Recibir, almacenar y consultar documentos
              proporcionados por el cliente.
            </li>

            <li>
              Enviar al cliente documentos relacionados
              con la prestación del servicio.
            </li>

            <li>
              Atender consultas, solicitudes y reclamos.
            </li>

            <li>
              Mantener la seguridad y funcionamiento
              de la plataforma.
            </li>

            <li>
              Cumplir las obligaciones legales que
              resulten aplicables.
            </li>

          </ul>

        </section>


        {/* =========================================
            5. AUTORIZACIÓN
        ========================================= */}

        <section className="legal-section">

          <h2>
            5. Autorización del usuario
          </h2>

          <p>
            Al registrarse y marcar la casilla de
            aceptación correspondiente, el usuario
            manifiesta haber leído esta política y
            autoriza el tratamiento de sus datos para
            las finalidades aquí descritas.
          </p>

          <p>
            La plataforma podrá registrar la fecha de
            aceptación y la versión de la política
            aceptada para conservar trazabilidad del
            consentimiento otorgado.
          </p>

        </section>


        {/* =========================================
            6. SEGURIDAD
        ========================================= */}

        <section className="legal-section">

          <h2>
            6. Seguridad de la información
          </h2>

          <p>
            Se adoptarán medidas técnicas,
            administrativas y organizativas razonables
            destinadas a proteger la información contra
            pérdida, acceso no autorizado, alteración,
            uso indebido o divulgación no autorizada.
          </p>

          <p>
            El acceso a los documentos almacenados
            estará restringido de acuerdo con los roles
            y permisos establecidos en la plataforma.
          </p>

        </section>


        {/* =========================================
            7. PROVEEDORES TECNOLÓGICOS
        ========================================= */}

        <section className="legal-section">

          <h2>
            7. Proveedores tecnológicos
          </h2>

          <p>
            Para el funcionamiento de la plataforma
            podrán utilizarse proveedores tecnológicos
            que suministren servicios de infraestructura,
            alojamiento, autenticación, almacenamiento,
            bases de datos u otras funcionalidades
            necesarias.
          </p>

          <p>
            Estos proveedores podrán tratar información
            únicamente en la medida necesaria para
            prestar los servicios tecnológicos
            correspondientes.
          </p>

        </section>


        {/* =========================================
            8. DERECHOS
        ========================================= */}

        <section className="legal-section">

          <h2>
            8. Derechos del titular
          </h2>

          <p>
            De acuerdo con la normativa colombiana
            aplicable, el titular de los datos podrá,
            según corresponda:
          </p>

          <ul>

            <li>
              Conocer los datos personales objeto
              de tratamiento.
            </li>

            <li>
              Solicitar su actualización o rectificación.
            </li>

            <li>
              Solicitar prueba de la autorización
              otorgada cuando corresponda.
            </li>

            <li>
              Solicitar información sobre el uso dado
              a sus datos personales.
            </li>

            <li>
              Presentar consultas y reclamos.
            </li>

            <li>
              Solicitar la supresión de sus datos cuando
              legalmente proceda.
            </li>

            <li>
              Revocar la autorización cuando resulte
              legalmente procedente.
            </li>

          </ul>

        </section>


        {/* =========================================
            9. CONSULTAS Y RECLAMOS
        ========================================= */}

        <section className="legal-section">

          <h2>
            9. Consultas y reclamos
          </h2>

          <p>
            Los usuarios podrán ejercer sus derechos
            mediante los canales de contacto publicados
            en la plataforma.
          </p>

          <p>
            Para proteger la información, podrá
            solicitarse información razonable que
            permita verificar la identidad del titular
            antes de atender determinadas solicitudes.
          </p>

        </section>


        {/* =========================================
            10. CONSERVACIÓN
        ========================================= */}

        <section className="legal-section">

          <h2>
            10. Conservación de la información
          </h2>

          <p>
            Los datos personales se conservarán durante
            el tiempo necesario para cumplir las
            finalidades informadas, prestar los servicios,
            atender obligaciones legales y gestionar
            posibles consultas o reclamaciones.
          </p>

          <p>
            Cuando la información deje de ser necesaria
            y no exista una obligación legal que exija
            conservarla, podrá ser eliminada de acuerdo
            con los procedimientos establecidos.
          </p>

        </section>


        {/* =========================================
            11. CAMBIOS
        ========================================= */}

        <section className="legal-section">

          <h2>
            11. Modificaciones de la política
          </h2>

          <p>
            Esta política podrá actualizarse cuando
            existan cambios legales, tecnológicos,
            operativos o relacionados con los servicios
            prestados.
          </p>

          <p>
            Cuando las modificaciones sean relevantes,
            podrá solicitarse una nueva aceptación por
            parte del usuario.
          </p>

        </section>


        {/* =========================================
            12. AUTORIDAD
        ========================================= */}

        <section className="legal-section">

          <h2>
            12. Autoridad de protección de datos
          </h2>

          <p>
            En Colombia, la Superintendencia de Industria
            y Comercio ejerce funciones como autoridad
            de protección de datos personales, de
            acuerdo con la legislación aplicable.
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
            Para consultas relacionadas con el
            tratamiento de datos personales, los
            usuarios podrán utilizar los canales de
            contacto publicados en la plataforma.
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


export default Privacidad;
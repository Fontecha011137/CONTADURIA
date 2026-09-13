import "./home.css";

import {
  Link
} from "react-router-dom";

import {
  useState
} from "react";

import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebaseConfig";


function Home() {

  // =====================================================
  // MODAL
  // =====================================================

  const [mostrarModal, setMostrarModal] =
    useState(false);

  const [mensaje, setMensaje] =
    useState("");

  const [enviando, setEnviando] =
    useState(false);


  // =====================================================
  // ACEPTACIONES LEGALES
  // =====================================================

  const [aceptaTerminos, setAceptaTerminos] =
    useState(false);

  const [
    autorizaTratamientoDatos,
    setAutorizaTratamientoDatos
  ] = useState(false);


  // =====================================================
  // VERSIONES LEGALES
  // =====================================================

  const VERSION_TERMINOS = "1.0";

  const VERSION_POLITICA_DATOS = "1.0";


  // =====================================================
  // FORMULARIO
  // =====================================================

  const [formulario, setFormulario] =
    useState({
      nombre: "",
      celular: "",
      email: "",
      tipoAsesoria: "",
      solicitud: ""
    });


  // =====================================================
  // MANEJAR CAMBIOS
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormulario((prev) => ({
      ...prev,
      [name]: value
    }));

  };


  // =====================================================
  // ABRIR FORMULARIO
  // =====================================================

  const abrirFormulario = () => {

    setMostrarModal(true);

    setMensaje("");

  };


  // =====================================================
  // CERRAR FORMULARIO
  // =====================================================

  const cerrarFormulario = () => {

    if (enviando) {
      return;
    }


    setMostrarModal(false);

    setMensaje("");

  };


  // =====================================================
  // ENVIAR SOLICITUD
  // =====================================================

  const enviarSolicitud = async (e) => {

    e.preventDefault();


    if (enviando) {
      return;
    }


    // ===================================================
    // VALIDAR TÉRMINOS
    // ===================================================

    if (!aceptaTerminos) {

      setMensaje(
        "Debes leer y aceptar los Términos y Condiciones."
      );

      return;

    }


    // ===================================================
    // VALIDAR TRATAMIENTO DE DATOS
    // ===================================================

    if (!autorizaTratamientoDatos) {

      setMensaje(
        "Debes autorizar el tratamiento de tus datos personales."
      );

      return;

    }


    // ===================================================
    // LIMPIAR DATOS
    // ===================================================

    const nombre =
      formulario.nombre.trim();

    const celular =
      formulario.celular.trim();

    const email =
      formulario.email
        .trim()
        .toLowerCase();

    const solicitud =
      formulario.solicitud.trim();


    // ===================================================
    // VALIDAR CELULAR
    // ===================================================

    if (!/^[0-9]{10}$/.test(celular)) {

      setMensaje(
        "Ingrese un número de celular válido de 10 dígitos."
      );

      return;

    }


    try {

      setEnviando(true);

      setMensaje("");


      // =================================================
      // GUARDAR SOLICITUD
      // =================================================

      await addDoc(
        collection(
          db,
          "solicitudes_asesoria"
        ),
        {

          nombre,

          celular,

          email,

          tipoAsesoria:
            formulario.tipoAsesoria,

          solicitud,

          prioridad:
            "Media",

          estado:
            "Pendiente",

          uidCliente:
            auth.currentUser
              ? auth.currentUser.uid
              : "publico",


          // =============================================
          // ACEPTACIÓN TÉRMINOS
          // =============================================

          aceptoTerminos: true,

          versionTerminos:
            VERSION_TERMINOS,

          fechaAceptacionTerminos:
            serverTimestamp(),


          // =============================================
          // TRATAMIENTO DE DATOS
          // =============================================

          autorizoTratamientoDatos: true,

          versionPoliticaDatos:
            VERSION_POLITICA_DATOS,

          fechaAutorizacionDatos:
            serverTimestamp(),


          // =============================================
          // FECHA SOLICITUD
          // =============================================

          fechaSolicitud:
            serverTimestamp()

        }
      );


      // =================================================
      // MENSAJE
      // =================================================

      setMensaje(
        "Tu solicitud fue enviada correctamente. Nos pondremos en contacto contigo."
      );


      // =================================================
      // LIMPIAR FORMULARIO
      // =================================================

      setFormulario({
        nombre: "",
        celular: "",
        email: "",
        tipoAsesoria: "",
        solicitud: ""
      });


      setAceptaTerminos(false);

      setAutorizaTratamientoDatos(false);


    } catch (error) {

      console.error(
        "Error enviando solicitud:",
        error
      );


      setMensaje(
        "No fue posible enviar la solicitud. Intenta nuevamente."
      );


    } finally {

      setEnviando(false);

    }

  };


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <div className="home">


      {/* =================================================
          HERO
      ================================================= */}

      <header className="hero">

        <div className="hero-content">


          {/* LOGO */}

          <img
            src="/Contaduria-icono.png"
            alt="Contador Bogotá"
            className="hero-logo"
          />


          {/* BADGE */}

          <span className="hero-eyebrow">
            Servicios contables en Bogotá
          </span>


          {/* TÍTULO */}

          <h1>
            Contabilidad clara,
            segura y en línea
          </h1>


          {/* DESCRIPCIÓN */}

          <p className="hero-description">
            Gestiona tus servicios contables,
            tributarios y financieros desde
            cualquier dispositivo, con acceso
            seguro a tus documentos, citas
            y solicitudes.
          </p>


          {/* =================================================
              BOTONES
          ================================================= */}

          <div className="hero-buttons">

            <Link to="/login">

              <button
                type="button"
                className="btn-primary"
              >
                Iniciar Sesión
              </button>

            </Link>


            <Link to="/register">

              <button
                type="button"
                className="btn-secondary"
              >
                Crear cuenta
              </button>

            </Link>

          </div>


          {/* =================================================
              CONTACTO
          ================================================= */}

          <div className="hero-contact-card">

            <p className="hero-contact-title">
              ¿Necesitas comunicarte con nosotros?
            </p>


            <div className="hero-contact-items">


              <a
                href="mailto:oh526122@gmail.com"
                className="hero-contact-item"
              >
                <span>✉️</span>

                <span>
                  oh526122@gmail.com
                </span>
              </a>


              <a
                href="tel:+573057823390"
                className="hero-contact-item"
              >
                <span>📱</span>

                <span>
                  305 782 3390
                </span>
              </a>


              <div className="hero-contact-item">

                <span>📍</span>

                <span>
                  Bogotá D.C., Colombia
                </span>

              </div>

            </div>


            {/* =============================================
                ENLACES LEGALES
            ============================================= */}

            <div className="hero-legal">

              <Link to="/terminos">
                Términos y Condiciones
              </Link>

              <span>
                •
              </span>

              <Link to="/privacidad">
                Política de Privacidad
              </Link>

            </div>

          </div>

        </div>

      </header>


      {/* =================================================
          SERVICIOS
      ================================================= */}

      <section className="services">

        <h2>
          Nuestros Servicios
        </h2>


        <div className="cards">


          <div className="card">

            <h3>
              📄 Declaración de Renta
            </h3>

            <p>
              Preparación y presentación
              de declaraciones tributarias.
            </p>

          </div>


          <div className="card">

            <h3>
              💰 Facturación Electrónica
            </h3>

            <p>
              Implementación y gestión
              de facturación electrónica.
            </p>

          </div>


          <div className="card">

            <h3>
              📊 Contabilidad Empresarial
            </h3>

            <p>
              Control financiero y
              estados contables.
            </p>

          </div>


          <div className="card">

            <h3>
              📈 Asesoría Tributaria
            </h3>

            <p>
              Planeación fiscal y
              cumplimiento normativo.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          BENEFICIOS
      ================================================= */}

      <section className="benefits">

        <h2>
          ¿Por qué elegirnos?
        </h2>


        <div className="benefits-grid">


          <div className="benefit">

            <h3>
              🔒 Seguridad
            </h3>

            <p>
              Tus documentos protegidos
              y disponibles en línea.
            </p>

          </div>


          <div className="benefit">

            <h3>
              📱 Acceso Móvil
            </h3>

            <p>
              Consulta información
              desde cualquier lugar.
            </p>

          </div>


          <div className="benefit">

            <h3>
              ⚡ Rapidez
            </h3>

            <p>
              Procesos ágiles
              y automatizados.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          CONTACTO
      ================================================= */}

      <section className="contact">

        <h2>
          Contáctanos
        </h2>


        <p>
          Agenda una asesoría personalizada
          para tu empresa o negocio.
        </p>


        <button
          type="button"
          className="btn-primary"
          onClick={abrirFormulario}
        >
          Solicitar Asesoría
        </button>

      </section>


      {/* =================================================
          MODAL SOLICITUD DE ASESORÍA
      ================================================= */}

      {mostrarModal && (

        <div className="asesoria-overlay">

          <div className="asesoria-modal">


            {/* =============================================
                CERRAR
            ============================================= */}

            <button
              type="button"
              className="asesoria-cerrar"
              onClick={cerrarFormulario}
              aria-label="Cerrar"
            >
              ×
            </button>


            <h2>
              Solicitar Asesoría
            </h2>


            <p>
              Déjanos tus datos y cuéntanos
              qué tipo de asesoría necesitas.
            </p>


            <form
              onSubmit={enviarSolicitud}
            >


              {/* ===========================================
                  NOMBRE
              =========================================== */}

              <div className="asesoria-group">

                <label htmlFor="asesoria-nombre">
                  Nombre completo
                </label>


                <input
                  id="asesoria-nombre"
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  autoComplete="name"
                  required
                />

              </div>


              {/* ===========================================
                  CELULAR
              =========================================== */}

              <div className="asesoria-group">

                <label htmlFor="asesoria-celular">
                  Número de celular
                </label>


                <input
                  id="asesoria-celular"
                  type="tel"
                  name="celular"
                  value={formulario.celular}
                  onChange={handleChange}
                  placeholder="3001234567"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                />

              </div>


              {/* ===========================================
                  CORREO
              =========================================== */}

              <div className="asesoria-group">

                <label htmlFor="asesoria-email">
                  Correo electrónico
                </label>


                <input
                  id="asesoria-email"
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  required
                />

              </div>


              {/* ===========================================
                  TIPO DE ASESORÍA
              =========================================== */}

              <div className="asesoria-group">

                <label htmlFor="tipoAsesoria">
                  Tipo de asesoría
                </label>


                <select
                  id="tipoAsesoria"
                  name="tipoAsesoria"
                  value={formulario.tipoAsesoria}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Seleccione una opción
                  </option>

                  <option value="Declaración de Renta">
                    Declaración de Renta
                  </option>

                  <option value="Facturación Electrónica">
                    Facturación Electrónica
                  </option>

                  <option value="Contabilidad Empresarial">
                    Contabilidad Empresarial
                  </option>

                  <option value="Asesoría Tributaria">
                    Asesoría Tributaria
                  </option>

                  <option value="Otra">
                    Otra
                  </option>

                </select>

              </div>


              {/* ===========================================
                  SOLICITUD
              =========================================== */}

              <div className="asesoria-group">

                <label htmlFor="solicitud">
                  ¿Qué necesitas?
                </label>


                <textarea
                  id="solicitud"
                  name="solicitud"
                  value={formulario.solicitud}
                  onChange={handleChange}
                  placeholder="Cuéntanos brevemente qué necesitas..."
                  rows="4"
                  required
                />

              </div>


              {/* =================================================
                  TÉRMINOS Y CONDICIONES
              ================================================= */}

              <div className="asesoria-legal">

                <label className="asesoria-legal-label">

                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(e) =>
                      setAceptaTerminos(
                        e.target.checked
                      )
                    }
                  />


                  <span>

                    He leído y acepto los{" "}

                    <Link to="/terminos">
                      Términos y Condiciones
                    </Link>.

                  </span>

                </label>

              </div>


              {/* =================================================
                  TRATAMIENTO DE DATOS
              ================================================= */}

              <div className="asesoria-legal">

                <label className="asesoria-legal-label">

                  <input
                    type="checkbox"
                    checked={
                      autorizaTratamientoDatos
                    }
                    onChange={(e) =>
                      setAutorizaTratamientoDatos(
                        e.target.checked
                      )
                    }
                  />


                  <span>

                    Autorizo de manera previa,
                    expresa e informada el
                    tratamiento de mis datos
                    personales conforme a la{" "}

                    <Link to="/privacidad">
                      Política de Privacidad y
                      Tratamiento de Datos Personales
                    </Link>.

                  </span>

                </label>

              </div>


              {/* ===========================================
                  MENSAJE
              =========================================== */}

              {mensaje && (

                <div className="asesoria-mensaje">
                  {mensaje}
                </div>

              )}


              {/* ===========================================
                  BOTONES
              =========================================== */}

              <div className="asesoria-buttons">


                <button
                  type="button"
                  className="asesoria-btn-cancelar"
                  onClick={cerrarFormulario}
                  disabled={enviando}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="asesoria-btn-enviar"
                  disabled={
                    enviando ||
                    !aceptaTerminos ||
                    !autorizaTratamientoDatos
                  }
                >

                  {
                    enviando
                      ? "Enviando..."
                      : "Enviar Solicitud"
                  }

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <p>
          © 2026 Contador Bogotá -
          Todos los derechos reservados
        </p>

      </footer>

    </div>

  );

}


export default Home;
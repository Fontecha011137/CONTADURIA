import "./home.css";
import { Link } from "react-router-dom";
import { useState } from "react";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

function Home() {

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre: "",
    celular: "",
    email: "",
    tipoAsesoria: "",
    solicitud: "",
  });


  // =========================================
  // MANEJAR CAMBIOS
  // =========================================

  const handleChange = (e) => {

    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });

  };


  // =========================================
  // ABRIR FORMULARIO
  // =========================================

  const abrirFormulario = () => {

    setMostrarModal(true);
    setMensaje("");

  };


  // =========================================
  // CERRAR FORMULARIO
  // =========================================

  const cerrarFormulario = () => {

    if (!enviando) {
      setMostrarModal(false);
    }

  };


  // =========================================
  // ENVIAR SOLICITUD
  // =========================================

  const enviarSolicitud = async (e) => {

    e.preventDefault();

    setEnviando(true);
    setMensaje("");

    try {

      await addDoc(
        collection(db, "solicitudes_asesoria"),
        {
          nombre: formulario.nombre,
          celular: formulario.celular,
          email: formulario.email,
          tipoAsesoria: formulario.tipoAsesoria,
          solicitud: formulario.solicitud,

          estado: "pendiente",

          fechaSolicitud: serverTimestamp(),

          uidCliente: auth.currentUser
            ? auth.currentUser.uid
            : null,
        }
      );


      setMensaje(
        "Tu solicitud fue enviada correctamente. Nos pondremos en contacto contigo."
      );


      setFormulario({
        nombre: "",
        celular: "",
        email: "",
        tipoAsesoria: "",
        solicitud: "",
      });


    } catch (error) {

      console.error(
        "Error enviando solicitud:",
        error
      );

      setMensaje(
        "No fue posible enviar la solicitud. Inténtalo nuevamente."
      );

    } finally {

      setEnviando(false);

    }

  };


  return (
    <div className="home">

      {/* =====================================
          HERO
      ====================================== */}

      <header className="hero">

        <div className="hero-content">

          <h1>PWA Contador</h1>

          <p>
            Gestiona tus servicios contables,
            tributarios y financieros desde
            cualquier dispositivo de manera
            rápida y segura.
          </p>


          <div className="hero-buttons">

            <Link to="/login">
              <button className="btn-primary">
                Iniciar Sesión
              </button>
            </Link>


            <Link to="/register">
              <button className="btn-secondary">
                Registrarse
              </button>
            </Link>

          </div>

        </div>

      </header>


      {/* =====================================
          SERVICIOS
      ====================================== */}

      <section className="services">

        <h2>Nuestros Servicios</h2>

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


      {/* =====================================
          BENEFICIOS
      ====================================== */}

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


      {/* =====================================
          CONTACTO
      ====================================== */}

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


      {/* =====================================
          MODAL SOLICITUD
      ====================================== */}

      {mostrarModal && (

        <div className="asesoria-overlay">

          <div className="asesoria-modal">

            <button
              type="button"
              className="asesoria-cerrar"
              onClick={cerrarFormulario}
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


            <form onSubmit={enviarSolicitud}>

              {/* NOMBRE */}

              <div className="asesoria-group">

                <label>
                  Nombre completo
                </label>

                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  required
                />

              </div>


              {/* CELULAR */}

              <div className="asesoria-group">

                <label>
                  Número de celular
                </label>

                <input
                  type="tel"
                  name="celular"
                  value={formulario.celular}
                  onChange={handleChange}
                  placeholder="3001234567"
                  maxLength={10}
                  inputMode="numeric"
                  required
                />

              </div>


              {/* CORREO */}

              <div className="asesoria-group">

                <label>
                  Correo electrónico
                </label>

                <input
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  required
                />

              </div>


              {/* TIPO DE ASESORÍA */}

              <div className="asesoria-group">

                <label>
                  Tipo de asesoría
                </label>

                <select
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


              {/* SOLICITUD */}

              <div className="asesoria-group">

                <label>
                  ¿Qué necesitas?
                </label>

                <textarea
                  name="solicitud"
                  value={formulario.solicitud}
                  onChange={handleChange}
                  placeholder="Cuéntanos brevemente qué necesitas..."
                  rows="4"
                  required
                />

              </div>


              {/* MENSAJE */}

              {mensaje && (

                <div className="asesoria-mensaje">

                  {mensaje}

                </div>

              )}


              {/* BOTONES */}

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
                  disabled={enviando}
                >

                  {enviando
                    ? "Enviando..."
                    : "Enviar Solicitud"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================
          FOOTER
      ====================================== */}

      <footer className="footer">

        <p>
          © 2026 PWA Contador -
          Todos los derechos reservados
        </p>

      </footer>

    </div>
  );
}

export default Home;
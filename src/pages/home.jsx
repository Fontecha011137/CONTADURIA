import "./home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">

      {/* HERO */}
      <header className="hero">

        <div className="hero-content">
          <h1>PWA Contador</h1>

          <p>
            Gestiona tus servicios contables, tributarios y financieros
            desde cualquier dispositivo de manera rápida y segura.
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

      {/* SERVICIOS */}

      <section className="services">

        <h2>Nuestros Servicios</h2>

        <div className="cards">

          <div className="card">
            <h3>📄 Declaración de Renta</h3>
            <p>
              Preparación y presentación de declaraciones tributarias.
            </p>
          </div>

          <div className="card">
            <h3>💰 Facturación Electrónica</h3>
            <p>
              Implementación y gestión de facturación electrónica.
            </p>
          </div>

          <div className="card">
            <h3>📊 Contabilidad Empresarial</h3>
            <p>
              Control financiero y estados contables.
            </p>
          </div>

          <div className="card">
            <h3>📈 Asesoría Tributaria</h3>
            <p>
              Planeación fiscal y cumplimiento normativo.
            </p>
          </div>

        </div>

      </section>

      {/* BENEFICIOS */}

      <section className="benefits">

        <h2>¿Por qué elegirnos?</h2>

        <div className="benefits-grid">

          <div className="benefit">
            <h3>🔒 Seguridad</h3>
            <p>Tus documentos protegidos y disponibles en línea.</p>
          </div>

          <div className="benefit">
            <h3>📱 Acceso Móvil</h3>
            <p>Consulta información desde cualquier lugar.</p>
          </div>

          <div className="benefit">
            <h3>⚡ Rapidez</h3>
            <p>Procesos ágiles y automatizados.</p>
          </div>

        </div>

      </section>

      {/* CONTACTO */}

      <section className="contact">

        <h2>Contáctanos</h2>

        <p>
          Agenda una asesoría personalizada para tu empresa o negocio.
        </p>

        <button className="btn-primary">
          Solicitar Asesoría
        </button>

      </section>

      {/* FOOTER */}

      <footer className="footer">
        <p>© 2026 PWA Contador - Todos los derechos reservados</p>
      </footer>

    </div>
  );
}

export default Home;
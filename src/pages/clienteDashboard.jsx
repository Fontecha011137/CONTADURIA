import "./clienteDashboard.css";

function ClienteDashboard() {
  return (
    <div className="dashboard-container">

      <aside className="sidebar">
        <h2>PWA Contador</h2>

        <nav>
          <ul>
            <li>🏠 Inicio</li>
            <li>📄 Mis Documentos</li>
            <li>📅 Mis Citas</li>
            <li>📊 Declaraciones</li>
            <li>💬 Soporte</li>
            <li>👤 Mi Perfil</li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-content">

        <header className="dashboard-header">
          <h1>Bienvenido, Cliente</h1>
          <button>Cerrar Sesión</button>
        </header>

        <section className="cards">

          <div className="card">
            <h3>Documentos</h3>
            <p>5</p>
          </div>

          <div className="card">
            <h3>Citas Programadas</h3>
            <p>2</p>
          </div>

          <div className="card">
            <h3>Solicitudes</h3>
            <p>3</p>
          </div>

        </section>

        <section className="services">

          <h2>Mis Servicios</h2>

          <table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Declaración de Renta</td>
                <td>En Proceso</td>
                <td>15/08/2026</td>
              </tr>

              <tr>
                <td>Facturación Electrónica</td>
                <td>Finalizado</td>
                <td>10/08/2026</td>
              </tr>

              <tr>
                <td>Asesoría Tributaria</td>
                <td>Pendiente</td>
                <td>20/08/2026</td>
              </tr>
            </tbody>
          </table>

        </section>

      </main>

    </div>
  );
}

export default ClienteDashboard;
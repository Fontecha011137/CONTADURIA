import "./contadorDashboard.css";

function ContadorDashboard() {
  return (
    <div className="dashboard-container">

      <aside className="sidebar">
        <h2>PWA Contador</h2>

        <nav>
          <ul>
            <li>📊 Dashboard</li>
            <li>👥 Clientes</li>
            <li>📄 Documentos</li>
            <li>💰 Facturación</li>
            <li>📅 Citas</li>
            <li>📈 Reportes</li>
            <li>⚙️ Configuración</li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-content">

        <header className="dashboard-header">
          <h1>Panel del Contador</h1>
          <button>Cerrar Sesión</button>
        </header>

        <section className="cards">

          <div className="card">
            <h3>Clientes</h3>
            <p>25</p>
          </div>

          <div className="card">
            <h3>Citas Pendientes</h3>
            <p>8</p>
          </div>

          <div className="card">
            <h3>Documentos</h3>
            <p>42</p>
          </div>

          <div className="card">
            <h3>Facturas</h3>
            <p>15</p>
          </div>

        </section>

        <section className="recent">

          <h2>Actividad Reciente</h2>

          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Juan Pérez</td>
                <td>Declaración de Renta</td>
                <td>En Proceso</td>
              </tr>

              <tr>
                <td>María Gómez</td>
                <td>Facturación Electrónica</td>
                <td>Finalizado</td>
              </tr>

              <tr>
                <td>Carlos Ruiz</td>
                <td>Asesoría Tributaria</td>
                <td>Pendiente</td>
              </tr>
            </tbody>
          </table>

        </section>

      </main>

    </div>
  );
}

export default ContadorDashboard;
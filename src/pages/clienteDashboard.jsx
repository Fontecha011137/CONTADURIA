import "./clienteDashboard.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import { auth, db, storage } from "../firebaseConfig";
function ClienteDashboard() {

  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState([]);

  // 👇 AQUÍ va la función
 const cargarDocumentos = async (userId) => {
  try {
    console.log("UID:", userId);

    const snapshot = await getDocs(
      collection(db, "usuarios", userId, "documentos")
    );

    console.log("Documentos encontrados:", snapshot.size);

    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Datos:", docs);

    setDocumentos(docs);

  } catch (error) {
    console.error("Error cargando documentos:", error);
  }
};

  const cerrarSesion = async () => {
  try {
    await signOut(auth);

    console.log("Sesión cerrada correctamente");

    navigate("/login", { replace: true });

  } catch (error) {
    console.error("Error al cerrar sesión:", error);

    alert(
      error?.message ||
      "No fue posible cerrar la sesión. Inténtalo nuevamente."
    );
  }
};
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      navigate("/login");
      return;
    }

    console.log("UID REAL:", user.uid);

    cargarDocumentos(user.uid);
  });

  return () => unsubscribe();
}, [navigate]);
  

  return (
    <div className="dashboard-container">

      <aside className="sidebar">
  <h2>PWA Contador</h2>

  <nav>
    <ul>
      <li>🏠 Inicio</li>
    
      <li onClick={() => navigate("/mis-documentos")}>
  📄 Mis Documentos
</li>
      <li
  onClick={() => navigate("/mis-citas")}
  style={{ cursor: "pointer" }}
>
  📅 Mis Citas
</li>
      <li>📊 Declaraciones</li>
      <li
  onClick={() => navigate("/subir-documento")}
  style={{ cursor: "pointer" }}
>
  📤 Subir Documentos
</li>
     <li
  onClick={() => navigate("/mi-perfil")}
  style={{ cursor: "pointer" }}
>
  👤 Mi Perfil
</li>
    </ul>
  </nav>
</aside>

      <main className="dashboard-content">

      <header className="dashboard-header">
  <h1>Bienvenido, Cliente</h1>

  <button onClick={cerrarSesion}>
    Cerrar Sesión
  </button>
</header>

        <section className="cards">

       <div className="card clickable" onClick={() => navigate("/mis-documentos")}>
  <h3>Documentos</h3>
  <p>{documentos.length}</p>
</div>

         <div
  className="card clickable"
  onClick={() => navigate("/mis-citas")}
>
  <h3>Citas Programadas</h3>
  <p>Ver</p>
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

        <section className="services">
  <h2>Mis Documentos</h2>

  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Tipo</th>
        <th>Estado</th>
        <th>Periodo</th>
      </tr>
    </thead>

    <tbody>
      {documentos.map((doc) => (
        <tr key={doc.id}>
          <td>{doc.nombre}</td>
          <td>{doc.tipo}</td>
          <td>{doc.estado}</td>
          <td>{doc.periodo}</td>
        </tr>
      ))}
    </tbody>
  </table>
</section>

      </main>

    </div>
  );
}

export default ClienteDashboard;
import "./clienteDashboard.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  collection,
  getDocs
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebaseConfig";


function ClienteDashboard() {

  const navigate = useNavigate();

  // =========================================
  // ESTADOS
  // =========================================

  const [documentos, setDocumentos] = useState([]);

  const [servicios] = useState([
    {
      id: 1,
      servicio: "Declaración de Renta",
      estado: "En Proceso",
      fecha: "15/08/2026"
    },
    {
      id: 2,
      servicio: "Facturación Electrónica",
      estado: "Finalizado",
      fecha: "10/08/2026"
    },
    {
      id: 3,
      servicio: "Asesoría Tributaria",
      estado: "Pendiente",
      fecha: "20/08/2026"
    }
  ]);


  // =========================================
  // CARGAR DOCUMENTOS
  // =========================================

  const cargarDocumentos = async (userId) => {

    try {

      console.log("UID:", userId);

      const snapshot = await getDocs(
        collection(
          db,
          "usuarios",
          userId,
          "documentos"
        )
      );


      console.log(
        "Documentos encontrados:",
        snapshot.size
      );


      const docs = snapshot.docs.map(
        (documento) => ({

          id: documento.id,
          ...documento.data()

        })
      );


      console.log(
        "Datos documentos:",
        docs
      );


      setDocumentos(docs);

    } catch (error) {

      console.error(
        "Error cargando documentos:",
        error
      );

    }

  };


  // =========================================
  // CERRAR SESIÓN
  // =========================================

  const cerrarSesion = async () => {

    try {

      await signOut(auth);

      console.log(
        "Sesión cerrada correctamente"
      );


      navigate(
        "/login",
        {
          replace: true
        }
      );

    } catch (error) {

      console.error(
        "Error al cerrar sesión:",
        error
      );


      alert(
        error?.message ||
        "No fue posible cerrar la sesión. Inténtalo nuevamente."
      );

    }

  };


  // =========================================
  // PROTECCIÓN DE SESIÓN
  // =========================================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {

          if (!user) {

            navigate(
              "/login",
              {
                replace: true
              }
            );

            return;

          }


          console.log(
            "UID REAL:",
            user.uid
          );


          cargarDocumentos(
            user.uid
          );

        }
      );


    return () => unsubscribe();

  }, [navigate]);


  // =========================================
  // ÚLTIMOS 5 DOCUMENTOS
  // =========================================

  const ultimosDocumentos =
    documentos.slice(0, 5);


  // =========================================
  // ÚLTIMOS 5 SERVICIOS
  // =========================================

  const ultimosServicios =
    servicios.slice(0, 5);


  // =========================================
  // INTERFAZ
  // =========================================

  return (

    <div className="dashboard-container">


      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside className="sidebar">

        <h2>
          PWA Contador
        </h2>


        <nav>

          <ul>

            <li>
              🏠 Inicio
            </li>


            <li
              onClick={() =>
                navigate("/mis-documentos")
              }
              style={{
                cursor: "pointer"
              }}
            >
              📄 Mis Documentos
            </li>


            <li
              onClick={() =>
                navigate("/mis-citas")
              }
              style={{
                cursor: "pointer"
              }}
            >
              📅 Mis Citas
            </li>


            <li
              onClick={() =>
                navigate("/subir-documento")
              }
              style={{
                cursor: "pointer"
              }}
            >
              📤 Subir Documentos
            </li>


            <li
              onClick={() =>
                navigate("/mi-perfil")
              }
              style={{
                cursor: "pointer"
              }}
            >
              👤 Mi Perfil
            </li>

          </ul>

        </nav>

      </aside>


      {/* =====================================
          CONTENIDO
      ===================================== */}

      <main className="dashboard-content">


        {/* ===================================
            HEADER
        ==================================== */}

        <header className="dashboard-header">

          <h1>
            Bienvenido, Cliente
          </h1>


          <button
            onClick={cerrarSesion}
          >
            Cerrar Sesión
          </button>

        </header>


        {/* ===================================
            TARJETAS
        ==================================== */}

        <section className="cards">


          {/* DOCUMENTOS */}

          <div
            className="card clickable"
            onClick={() =>
              navigate("/mis-documentos")
            }
          >

            <h3>
              Documentos
            </h3>

            <p>
              {documentos.length}
            </p>

            <span>
              Ver documentos →
            </span>

          </div>


          {/* CITAS */}

          <div
            className="card clickable"
            onClick={() =>
              navigate("/mis-citas")
            }
          >

            <h3>
              Citas Programadas
            </h3>

            <p>
              Ver
            </p>

            <span>
              Ver citas →
            </span>

          </div>


          {/* SOLICITUDES */}

          <div
            className="card clickable"
            onClick={() =>
              navigate("/mis-solicitudes")
            }
          >

            <h3>
              Solicitudes
            </h3>

            <p>
              Ver
            </p>

            <span>
              Ver solicitudes →
            </span>

          </div>


        </section>


        {/* ===================================
            MIS SERVICIOS
        ==================================== */}

        <section className="services">

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              marginBottom: "15px"
            }}
          >

            <h2
              style={{
                margin: 0
              }}
            >
              Mis Servicios
            </h2>


            <button
              onClick={() =>
                navigate("/mis-servicios")
              }
              style={{
                background: "transparent",
                border: "none",
                color: "#198754",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "15px"
              }}
            >
              Ver todos →
            </button>

          </div>


          <table>

            <thead>

              <tr>

                <th>
                  Servicio
                </th>

                <th>
                  Estado
                </th>

                <th>
                  Fecha
                </th>

              </tr>

            </thead>


            <tbody>

              {ultimosServicios.length === 0 ? (

                <tr>

                  <td
                    colSpan="3"
                    style={{
                      textAlign: "center"
                    }}
                  >
                    No tienes servicios registrados.
                  </td>

                </tr>

              ) : (

                ultimosServicios.map(
                  (servicio) => (

                    <tr
                      key={servicio.id}
                    >

                      <td>
                        {servicio.servicio}
                      </td>

                      <td>
                        {servicio.estado}
                      </td>

                      <td>
                        {servicio.fecha}
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </section>


        {/* ===================================
            MIS DOCUMENTOS
        ==================================== */}

        <section className="services">

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              marginBottom: "15px"
            }}
          >

            <h2
              style={{
                margin: 0
              }}
            >
              Mis Documentos
            </h2>


            <button
              onClick={() =>
                navigate("/mis-documentos")
              }
              style={{
                background: "transparent",
                border: "none",
                color: "#198754",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "15px"
              }}
            >
              Ver todos →
            </button>

          </div>


          <table>

            <thead>

              <tr>

                <th>
                  Nombre
                </th>

                <th>
                  Tipo
                </th>

                <th>
                  Estado
                </th>

                <th>
                  Periodo
                </th>

                <th>
                  Origen
                </th>

              </tr>

            </thead>


            <tbody>

              {ultimosDocumentos.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center"
                    }}
                  >
                    No tienes documentos registrados.
                  </td>

                </tr>

              ) : (

                ultimosDocumentos.map(
                  (doc) => (

                    <tr
                      key={doc.id}
                    >

                      <td>
                        {doc.nombre}
                      </td>


                      <td>
                        {doc.tipo}
                      </td>


                      <td>
                        {doc.estado}
                      </td>


                      <td>
                        {doc.periodo}
                      </td>


                      <td>

                        {doc.enviadoPor === "contador" ? (

                          <strong
                            style={{
                              color: "#198754"
                            }}
                          >
                            📤 Contador
                          </strong>

                        ) : (

                          <span>
                            📥 Yo
                          </span>

                        )}

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </section>


      </main>

    </div>

  );

}


export default ClienteDashboard;
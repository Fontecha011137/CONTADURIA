import "./contadorDashboard.css";

import {
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  collection,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebaseConfig";

import {
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";


function ContadorDashboard() {

  const navigate = useNavigate();


  // =========================================
  // ESTADOS
  // =========================================

  const [totalClientes, setTotalClientes] =
    useState(0);

  const [totalFacturas, setTotalFacturas] =
    useState(0);

  const [totalCitasPendientes, setTotalCitasPendientes] =
    useState(0);


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

          }

        }
      );


    return () => unsubscribe();

  }, [navigate]);


  // =========================================
  // CLIENTES EN TIEMPO REAL
  // =========================================

  useEffect(() => {

    const clientesQuery =
      query(
        collection(
          db,
          "usuarios"
        ),
        where(
          "rol",
          "==",
          "cliente"
        )
      );


    const unsubscribe =
      onSnapshot(

        clientesQuery,

        (snapshot) => {

          setTotalClientes(
            snapshot.size
          );

        },

        (error) => {

          console.error(
            "Error al cargar clientes:",
            error
          );

        }

      );


    return () => unsubscribe();

  }, []);


  // =========================================
  // FACTURAS EN TIEMPO REAL
  // =========================================

  useEffect(() => {

    const facturacionRef =
      collection(
        db,
        "facturacion"
      );


    const unsubscribe =
      onSnapshot(

        facturacionRef,

        (snapshot) => {

          setTotalFacturas(
            snapshot.size
          );

        },

        (error) => {

          console.error(
            "Error al cargar facturación:",
            error
          );

        }

      );


    return () => unsubscribe();

  }, []);


  // =========================================
  // CITAS PENDIENTES EN TIEMPO REAL
  // =========================================

  useEffect(() => {

    let unsubscribeUsuarios = null;

    let unsubscribeCitas = [];


    const citasPorCliente = {};


    // =======================================
    // BUSCAR CLIENTES
    // =======================================

    const usuariosQuery =
      query(
        collection(
          db,
          "usuarios"
        ),
        where(
          "rol",
          "==",
          "cliente"
        )
      );


    // =======================================
    // ESCUCHAR CLIENTES
    // =======================================

    unsubscribeUsuarios =
      onSnapshot(

        usuariosQuery,

        (usuariosSnapshot) => {

          // =================================
          // ELIMINAR LISTENERS ANTERIORES
          // =================================

          unsubscribeCitas.forEach(
            (unsubscribe) =>
              unsubscribe()
          );


          unsubscribeCitas = [];


          // =================================
          // LIMPIAR CONTADORES
          // =================================

          Object.keys(
            citasPorCliente
          ).forEach(
            (uid) => {

              delete citasPorCliente[uid];

            }
          );


          // =================================
          // SI NO HAY CLIENTES
          // =================================

          if (
            usuariosSnapshot.empty
          ) {

            setTotalCitasPendientes(0);

            return;

          }


          // =================================
          // BUSCAR CITAS DE CADA CLIENTE
          // =================================

          usuariosSnapshot.docs.forEach(
            (usuarioDoc) => {

              const uid =
                usuarioDoc.id;


              const citasRef =
                collection(
                  db,
                  "usuarios",
                  uid,
                  "citas"
                );


              // =================================
              // ESCUCHAR CITAS
              // =================================

              const unsubscribeCitasCliente =
                onSnapshot(

                  citasRef,

                  (citasSnapshot) => {

                    const cantidadPendientes =
                      citasSnapshot.docs.filter(
                        (citaDoc) => {

                          const datos =
                            citaDoc.data();


                          return (
                            datos.estado
                              ?.trim() ===
                            "Pendiente"
                          );

                        }
                      ).length;


                    // =========================
                    // GUARDAR POR CLIENTE
                    // =========================

                    citasPorCliente[uid] =
                      cantidadPendientes;


                    // =========================
                    // SUMAR
                    // =========================

                    const total =
                      Object.values(
                        citasPorCliente
                      ).reduce(
                        (
                          suma,
                          cantidad
                        ) =>
                          suma + cantidad,
                        0
                      );


                    setTotalCitasPendientes(
                      total
                    );

                  },

                  (error) => {

                    console.error(
                      `Error cargando citas del cliente ${uid}:`,
                      error
                    );

                  }

                );


              unsubscribeCitas.push(
                unsubscribeCitasCliente
              );

            }
          );

        },

        (error) => {

          console.error(
            "Error cargando clientes para citas:",
            error
          );


          setTotalCitasPendientes(0);

        }

      );


    // =======================================
    // LIMPIEZA
    // =======================================

    return () => {

      if (
        unsubscribeUsuarios
      ) {

        unsubscribeUsuarios();

      }


      unsubscribeCitas.forEach(
        (unsubscribe) =>
          unsubscribe()
      );

    };

  }, []);


  // =========================================
  // CERRAR SESIÓN
  // =========================================

  const handleLogout =
    async () => {

      try {

        await signOut(
          auth
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

      }

    };


  // =========================================
  // INTERFAZ
  // =========================================

  return (

    <div className="dashboard-container">


      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside className="sidebar">

        <h2>
          PWA Contador
        </h2>


        <nav>

          <ul>

            <li
              onClick={() =>
                navigate("/contador")
              }
            >
              📊 Dashboard
            </li>


            <li
              onClick={() =>
                navigate("/clientes")
              }
            >
              👥 Clientes
            </li>


            <li
              onClick={() =>
                navigate("/documentos")
              }
            >
              📄 Documentos
            </li>


            <li
              onClick={() =>
                navigate("/facturacion")
              }
            >
              💰 Facturación
            </li>


            <li
              onClick={() =>
                navigate("/citas")
              }
            >
              📅 Citas
            </li>


            {/* =================================
                SOLICITUDES
            ================================== */}

            <li
              onClick={() =>
                navigate("/solicitudes")
              }
            >
              📋 Solicitudes
            </li>


            <li
              onClick={() =>
                navigate("/reportes")
              }
            >
              📈 Reportes
            </li>


            <li>
              ⚙️ Configuración
            </li>

          </ul>

        </nav>

      </aside>


      {/* =====================================
          CONTENIDO
      ====================================== */}

      <main className="dashboard-content">


        {/* ===================================
            HEADER
        ==================================== */}

        <header className="dashboard-header">

          <h1>
            Panel del Contador
          </h1>


          <button
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>

        </header>


        {/* ===================================
            TARJETAS
        ==================================== */}

        <section className="cards">


          {/* =================================
              CLIENTES
          ================================== */}

          <div
            className="card card-clickable"

            onClick={() =>
              navigate("/clientes")
            }

            role="button"

            tabIndex="0"

            onKeyDown={(e) => {

              if (
                e.key === "Enter" ||
                e.key === " "
              ) {

                navigate(
                  "/clientes"
                );

              }

            }}
          >

            <h3>
              Clientes
            </h3>


            <p>
              {totalClientes}
            </p>


            <span className="card-link">
              Ver clientes →
            </span>

          </div>


          {/* =================================
              CITAS PENDIENTES
          ================================== */}

          <div
            className="card card-clickable"

            onClick={() =>
              navigate("/citas")
            }

            role="button"

            tabIndex="0"

            onKeyDown={(e) => {

              if (
                e.key === "Enter" ||
                e.key === " "
              ) {

                navigate(
                  "/citas"
                );

              }

            }}
          >

            <h3>
              Citas Pendientes
            </h3>


            <p>
              {totalCitasPendientes}
            </p>


            <span className="card-link">
              Ver citas →
            </span>

          </div>


          {/* =================================
              DOCUMENTOS
          ================================== */}

          <div
            className="card card-clickable"

            onClick={() =>
              navigate("/documentos")
            }

            role="button"

            tabIndex="0"

            onKeyDown={(e) => {

              if (
                e.key === "Enter" ||
                e.key === " "
              ) {

                navigate(
                  "/documentos"
                );

              }

            }}
          >

            <h3>
              Documentos
            </h3>


            <p>
              0
            </p>


            <span className="card-link">
              Ver documentos →
            </span>

          </div>


          {/* =================================
              FACTURAS
          ================================== */}

          <div
            className="card card-clickable"

            onClick={() =>
              navigate("/facturacion")
            }

            role="button"

            tabIndex="0"

            onKeyDown={(e) => {

              if (
                e.key === "Enter" ||
                e.key === " "
              ) {

                navigate(
                  "/facturacion"
                );

              }

            }}
          >

            <h3>
              Facturas
            </h3>


            <p>
              {totalFacturas}
            </p>


            <span className="card-link">
              Ver facturación →
            </span>

          </div>


          {/* =================================
              SOLICITUDES
          ================================== */}

          <div
            className="card card-clickable"

            onClick={() =>
              navigate("/solicitudes")
            }

            role="button"

            tabIndex="0"

            onKeyDown={(e) => {

              if (
                e.key === "Enter" ||
                e.key === " "
              ) {

                navigate(
                  "/solicitudes"
                );

              }

            }}
          >

            <h3>
              Solicitudes
            </h3>


            <p>
              Ver
            </p>


            <span className="card-link">
              Ver solicitudes →
            </span>

          </div>


        </section>


        {/* ===================================
            ACTIVIDAD RECIENTE
        ==================================== */}

        <section className="recent">

          <h2>
            Actividad Reciente
          </h2>


          <p>
            La actividad de los clientes aparecerá aquí.
          </p>

        </section>


      </main>

    </div>

  );

}


export default ContadorDashboard;
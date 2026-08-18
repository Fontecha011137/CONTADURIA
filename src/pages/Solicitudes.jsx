import "./solicitudes.css";

import {
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  doc
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


function Solicitudes() {

  const navigate = useNavigate();


  // =========================================
  // ESTADOS
  // =========================================

  const [solicitudes, setSolicitudes] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [filtro, setFiltro] =
    useState("7dias");

  const [actualizando, setActualizando] =
    useState(null);


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
  // CARGAR SOLICITUDES
  // =========================================

  const cargarSolicitudes = async (
    filtroActual = "7dias"
  ) => {

    try {

      setCargando(true);


      const solicitudesRef =
        collection(
          db,
          "solicitudes_asesoria"
        );


      let consulta;


      // =====================================
      // TODAS
      // =====================================

      if (
        filtroActual === "todas"
      ) {

        consulta =
          query(
            solicitudesRef,
            orderBy(
              "fechaSolicitud",
              "desc"
            )
          );

      }


      // =====================================
      // FILTROS POR FECHA
      // =====================================

      else {

        const fechaInicio =
          new Date();


        // -------------------------------
        // HOY
        // -------------------------------

        if (
          filtroActual === "hoy"
        ) {

          fechaInicio.setHours(
            0,
            0,
            0,
            0
          );

        }


        // -------------------------------
        // ÚLTIMOS 7 DÍAS
        // -------------------------------

        if (
          filtroActual === "7dias"
        ) {

          fechaInicio.setDate(
            fechaInicio.getDate() - 7
          );

        }


        // -------------------------------
        // ÚLTIMOS 30 DÍAS
        // -------------------------------

        if (
          filtroActual === "30dias"
        ) {

          fechaInicio.setDate(
            fechaInicio.getDate() - 30
          );

        }


        // -------------------------------
        // ESTE MES
        // -------------------------------

        if (
          filtroActual === "mes"
        ) {

          fechaInicio.setDate(1);

          fechaInicio.setHours(
            0,
            0,
            0,
            0
          );

        }


        consulta =
          query(

            solicitudesRef,

            where(
              "fechaSolicitud",
              ">=",
              Timestamp.fromDate(
                fechaInicio
              )
            ),

            orderBy(
              "fechaSolicitud",
              "desc"
            )

          );

      }


      // =====================================
      // EJECUTAR CONSULTA
      // =====================================

      const snapshot =
        await getDocs(
          consulta
        );


      // =====================================
      // CONVERTIR DATOS
      // =====================================

      const datos =
        snapshot.docs.map(
          (documento) => ({

            id:
              documento.id,

            ...documento.data()

          })
        );


      setSolicitudes(
        datos
      );


    } catch (error) {

      console.error(
        "Error cargando solicitudes:",
        error
      );


      setSolicitudes([]);


    } finally {

      setCargando(false);

    }

  };


  // =========================================
  // CARGA INICIAL
  // ÚLTIMOS 7 DÍAS
  // =========================================

  useEffect(() => {

    cargarSolicitudes(
      "7dias"
    );

  }, []);


  // =========================================
  // CAMBIAR FILTRO
  // =========================================

  const cambiarFiltro =
    (e) => {

      const nuevoFiltro =
        e.target.value;


      setFiltro(
        nuevoFiltro
      );


      cargarSolicitudes(
        nuevoFiltro
      );

    };


  // =========================================
  // CAMBIAR ESTADO
  // =========================================

  const cambiarEstado =
    async (
      solicitudId,
      nuevoEstado
    ) => {

      try {

        setActualizando(
          solicitudId
        );


        const solicitudRef =
          doc(
            db,
            "solicitudes_asesoria",
            solicitudId
          );


        await updateDoc(
          solicitudRef,
          {
            estado:
              nuevoEstado
          }
        );


        // =================================
        // ACTUALIZAR PANTALLA
        // =================================

        setSolicitudes(
          (solicitudesActuales) =>
            solicitudesActuales.map(
              (solicitud) => {

                if (
                  solicitud.id ===
                  solicitudId
                ) {

                  return {
                    ...solicitud,
                    estado:
                      nuevoEstado
                  };

                }


                return solicitud;

              }
            )
        );


      } catch (error) {

        console.error(
          "Error actualizando estado:",
          error
        );


        alert(
          "No fue posible actualizar el estado de la solicitud."
        );

      } finally {

        setActualizando(
          null
        );

      }

    };


  // =========================================
  // CERRAR SESIÓN
  // =========================================

  const cerrarSesion =
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
          "Error cerrando sesión:",
          error
        );

      }

    };


  // =========================================
  // FORMATEAR FECHA
  // =========================================

  const formatearFecha =
    (fecha) => {

      if (
        !fecha
      ) {

        return "Fecha no disponible";

      }


      try {

        if (
          fecha.toDate
        ) {

          return fecha
            .toDate()
            .toLocaleString(
              "es-CO",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }
            );

        }


        return "Fecha no disponible";

      } catch {

        return "Fecha no disponible";

      }

    };


  // =========================================
  // ESTADO NORMALIZADO
  // =========================================

  const obtenerClaseEstado =
    (estado) => {

      const estadoNormalizado =
        estado
          ?.toLowerCase()
          .trim();


      if (
        estadoNormalizado ===
        "pendiente"
      ) {

        return "estado-pendiente";

      }


      if (
        estadoNormalizado ===
        "atendida"
      ) {

        return "estado-atendida";

      }


      if (
        estadoNormalizado ===
        "cancelada"
      ) {

        return "estado-cancelada";

      }


      return "estado-pendiente";

    };


  // =========================================
  // CONTADORES
  // =========================================

  const pendientes =
    solicitudes.filter(
      (solicitud) =>
        solicitud.estado
          ?.toLowerCase()
          .trim() ===
        "pendiente"
    ).length;


  const atendidas =
    solicitudes.filter(
      (solicitud) =>
        solicitud.estado
          ?.toLowerCase()
          .trim() ===
        "atendida"
    ).length;


  const canceladas =
    solicitudes.filter(
      (solicitud) =>
        solicitud.estado
          ?.toLowerCase()
          .trim() ===
        "cancelada"
    ).length;


  // =========================================
  // INTERFAZ
  // =========================================

  return (

    <div className="solicitudes-page">


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


            <li
              className="menu-activo"
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


            <li
              onClick={cerrarSesion}
            >
              🚪 Cerrar Sesión
            </li>

          </ul>

        </nav>

      </aside>


      {/* =====================================
          CONTENIDO
      ====================================== */}

      <main className="solicitudes-content">


        {/* ===================================
            HEADER
        ==================================== */}

        <header className="solicitudes-header">

          <div>

            <h1>
              Solicitudes de Asesoría
            </h1>

            <p>
              Gestiona las solicitudes recibidas
              de los clientes.
            </p>

          </div>


          <button
            className="btn-volver-solicitudes"
            onClick={() =>
              navigate("/contador")
            }
          >
            ← Volver al panel
          </button>

        </header>


        {/* ===================================
            RESUMEN
        ==================================== */}

        <section className="solicitudes-resumen">


          <div className="resumen-card">

            <span>
              📋 Total
            </span>

            <strong>
              {solicitudes.length}
            </strong>

          </div>


          <div className="resumen-card">

            <span>
              🟡 Pendientes
            </span>

            <strong>
              {pendientes}
            </strong>

          </div>


          <div className="resumen-card">

            <span>
              🟢 Atendidas
            </span>

            <strong>
              {atendidas}
            </strong>

          </div>


          <div className="resumen-card">

            <span>
              🔴 Canceladas
            </span>

            <strong>
              {canceladas}
            </strong>

          </div>


        </section>


        {/* ===================================
            FILTROS
        ==================================== */}

        <section className="solicitudes-filtros">

          <div>

            <label>
              Mostrar solicitudes:
            </label>


            <select
              value={filtro}
              onChange={cambiarFiltro}
            >

              <option value="hoy">
                Hoy
              </option>

              <option value="7dias">
                Últimos 7 días
              </option>

              <option value="30dias">
                Últimos 30 días
              </option>

              <option value="mes">
                Este mes
              </option>

              <option value="todas">
                Todas
              </option>

            </select>

          </div>


          <button
            className="btn-recargar"
            onClick={() =>
              cargarSolicitudes(
                filtro
              )
            }
          >
            🔄 Actualizar
          </button>

        </section>


        {/* ===================================
            CARGANDO
        ==================================== */}

        {cargando && (

          <div className="solicitudes-mensaje">

            <div className="spinner">
              ⏳
            </div>

            <p>
              Cargando solicitudes...
            </p>

          </div>

        )}


        {/* ===================================
            SIN SOLICITUDES
        ==================================== */}

        {!cargando &&
          solicitudes.length === 0 && (

            <div className="solicitudes-vacio">

              <div>
                📭
              </div>

              <h2>
                No hay solicitudes
              </h2>

              <p>
                No existen solicitudes dentro
                del período seleccionado.
              </p>

            </div>

          )
        }


        {/* ===================================
            LISTA
        ==================================== */}

        {!cargando &&
          solicitudes.length > 0 && (

            <section className="solicitudes-lista">

              {solicitudes.map(
                (solicitud) => (

                  <article
                    className="solicitud-card"
                    key={solicitud.id}
                  >


                    {/* =========================
                        CABECERA
                    ========================== */}

                    <div className="solicitud-card-header">

                      <div>

                        <h2>
                          {solicitud.nombre}
                        </h2>

                        <span className="solicitud-tipo">

                          {solicitud.tipoAsesoria ||
                            "Asesoría general"}

                        </span>

                      </div>


                      <span
                        className={
                          `solicitud-estado ${
                            obtenerClaseEstado(
                              solicitud.estado
                            )
                          }`
                        }
                      >

                        {solicitud.estado ||
                          "Pendiente"}

                      </span>

                    </div>


                    {/* =========================
                        INFORMACIÓN
                    ========================== */}

                    <div className="solicitud-info">

                      <div>

                        <strong>
                          📱 Celular
                        </strong>

                        <span>
                          {solicitud.celular ||
                            "No registrado"}
                        </span>

                      </div>


                      <div>

                        <strong>
                          ✉️ Correo
                        </strong>

                        <span>
                          {solicitud.email ||
                            "No registrado"}
                        </span>

                      </div>


                      <div>

                        <strong>
                          📅 Fecha
                        </strong>

                        <span>
                          {formatearFecha(
                            solicitud.fechaSolicitud
                          )}
                        </span>

                      </div>

                    </div>


                    {/* =========================
                        SOLICITUD
                    ========================== */}

                    <div className="solicitud-texto">

                      <strong>
                        Solicitud del cliente
                      </strong>

                      <p>
                        {solicitud.solicitud ||
                          "Sin descripción"}
                      </p>

                    </div>


                    {/* =========================
                        CAMBIAR ESTADO
                    ========================== */}

                    <div className="solicitud-acciones">

                      <span>
                        Cambiar estado:
                      </span>


                      <button
                        className="btn-estado pendiente"
                        disabled={
                          actualizando ===
                          solicitud.id
                        }
                        onClick={() =>
                          cambiarEstado(
                            solicitud.id,
                            "pendiente"
                          )
                        }
                      >
                        🟡 Pendiente
                      </button>


                      <button
                        className="btn-estado atendida"
                        disabled={
                          actualizando ===
                          solicitud.id
                        }
                        onClick={() =>
                          cambiarEstado(
                            solicitud.id,
                            "atendida"
                          )
                        }
                      >
                        🟢 Atendida
                      </button>


                      <button
                        className="btn-estado cancelada"
                        disabled={
                          actualizando ===
                          solicitud.id
                        }
                        onClick={() =>
                          cambiarEstado(
                            solicitud.id,
                            "cancelada"
                          )
                        }
                      >
                        🔴 Cancelada
                      </button>

                    </div>

                  </article>

                )
              )}

            </section>

          )
        }

      </main>

    </div>

  );

}


export default Solicitudes;

import "./citas.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

import { auth, db } from "../firebaseConfig";

function Citas() {
  const navigate = useNavigate();

  // =========================================
  // ESTADOS
  // =========================================

  const [citas, setCitas] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [filtroEstado, setFiltroEstado] =
    useState("todas");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancelando, setCancelando] =
    useState(null);

  // =========================================
  // NORMALIZAR TEXTO
  //
  // Ignora:
  // - MAYÚSCULAS
  // - minúsculas
  // - tildes
  // =========================================

  const normalizarTexto = (valor) => {
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  // =========================================
  // CARGAR CITAS DE TODOS LOS CLIENTES
  // =========================================

  useEffect(() => {
    let unsubscribeUsuarios = null;

    let unsubscribeCitas = [];

    // =======================================
    // LIMPIAR LISTENERS DE CITAS
    // =======================================

    const limpiarListenersCitas = () => {
      unsubscribeCitas.forEach(
        (unsubscribe) => {
          if (
            typeof unsubscribe ===
            "function"
          ) {
            unsubscribe();
          }
        }
      );

      unsubscribeCitas = [];
    };

    // =======================================
    // AUTENTICACIÓN
    // =======================================

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {
          // =================================
          // NO HAY SESIÓN
          // =================================

          if (!user) {
            navigate("/login", {
              replace: true,
            });

            return;
          }

          setLoading(true);
          setError("");

          // =================================
          // LIMPIAR LISTENERS ANTERIORES
          // =================================

          if (unsubscribeUsuarios) {
            unsubscribeUsuarios();
            unsubscribeUsuarios = null;
          }

          limpiarListenersCitas();

          // =================================
          // REFERENCIA USUARIOS
          // =================================

          const usuariosRef =
            collection(
              db,
              "usuarios"
            );

          // =================================
          // ESCUCHAR USUARIOS
          // =================================

          unsubscribeUsuarios =
            onSnapshot(
              usuariosRef,

              (usuariosSnapshot) => {
                // -----------------------------
                // LIMPIAR CITAS ANTERIORES
                // -----------------------------

                limpiarListenersCitas();

                // -----------------------------
                // OBTENER SOLO CLIENTES
                // -----------------------------

                const clientes =
                  usuariosSnapshot.docs.filter(
                    (usuarioDoc) => {
                      const usuario =
                        usuarioDoc.data();

                      return (
                        usuario.rol ===
                        "cliente"
                      );
                    }
                  );

                // -----------------------------
                // NO HAY CLIENTES
                // -----------------------------

                if (
                  clientes.length ===
                  0
                ) {
                  setCitas([]);
                  setLoading(false);

                  return;
                }

                // -----------------------------
                // CITAS POR CLIENTE
                // -----------------------------

                const citasPorCliente =
                  {};

                // =================================
                // ESCUCHAR CITAS DE CADA CLIENTE
                // =================================

                clientes.forEach(
                  (usuarioDoc) => {
                    const usuario =
                      usuarioDoc.data();

                    const uid =
                      usuarioDoc.id;

                    citasPorCliente[uid] =
                      [];

                    const citasRef =
                      collection(
                        db,
                        "usuarios",
                        uid,
                        "citas"
                      );

                    const unsubscribe =
                      onSnapshot(
                        citasRef,

                        (citasSnapshot) => {
                          // ---------------------------
                          // CONSTRUIR CITAS
                          // ---------------------------

                          const citasCliente =
                            citasSnapshot.docs.map(
                              (citaDoc) => {
                                const cita =
                                  citaDoc.data();

                                return {
                                  id:
                                    citaDoc.id,

                                  uid,

                                  // =====================
                                  // DATOS CLIENTE
                                  // =====================

                                  cliente:
                                    usuario.nombre ||
                                    "Sin nombre",

                                  email:
                                    usuario.email ||
                                    "",

                                  celular:
                                    usuario.celular ||
                                    "",

                                  // =====================
                                  // DATOS CITA
                                  // =====================

                                  servicio:
                                    cita.servicio ||
                                    "",

                                  fecha:
                                    cita.fecha ||
                                    "",

                                  hora:
                                    cita.hora ||
                                    "",

                                  estado:
                                    cita.estado ||
                                    "Pendiente",

                                  // =====================
                                  // OTROS CAMPOS
                                  // =====================

                                  ...cita,
                                };
                              }
                            );

                          // ---------------------------
                          // GUARDAR CITAS DEL CLIENTE
                          // ---------------------------

                          citasPorCliente[uid] =
                            citasCliente;

                          // ---------------------------
                          // UNIR TODAS LAS CITAS
                          // ---------------------------

                          const todasLasCitas =
                            Object.values(
                              citasPorCliente
                            ).flat();

                          // ---------------------------
                          // ORDENAR
                          // ---------------------------

                          todasLasCitas.sort(
                            (a, b) => {
                              const fechaA =
                                new Date(
                                  `${
                                    a.fecha ||
                                    "9999-12-31"
                                  }T${
                                    a.hora ||
                                    "23:59"
                                  }:00`
                                );

                              const fechaB =
                                new Date(
                                  `${
                                    b.fecha ||
                                    "9999-12-31"
                                  }T${
                                    b.hora ||
                                    "23:59"
                                  }:00`
                                );

                              return (
                                fechaA -
                                fechaB
                              );
                            }
                          );

                          // ---------------------------
                          // ACTUALIZAR ESTADO
                          // ---------------------------

                          setCitas(
                            todasLasCitas
                          );

                          setLoading(false);
                        },

                        (firebaseError) => {
                          console.error(
                            "Error cargando citas:",
                            firebaseError
                          );

                          setError(
                            "No se pudieron cargar las citas. Revisa las reglas de Firestore."
                          );

                          setLoading(false);
                        }
                      );

                    unsubscribeCitas.push(
                      unsubscribe
                    );
                  }
                );
              },

              (firebaseError) => {
                console.error(
                  "Error cargando usuarios:",
                  firebaseError
                );

                setError(
                  "No se pudieron cargar los clientes. Revisa las reglas de Firestore."
                );

                setLoading(false);
              }
            );
        }
      );

    // =======================================
    // LIMPIEZA
    // =======================================

    return () => {
      unsubscribeAuth();

      if (
        unsubscribeUsuarios
      ) {
        unsubscribeUsuarios();
      }

      limpiarListenersCitas();
    };
  }, [navigate]);

  // =========================================
  // OBTENER ESTADO
  // =========================================

  const obtenerEstado = (
    cita
  ) => {
    return normalizarTexto(
      cita.estado ||
        "Pendiente"
    );
  };

  // =========================================
  // CANCELAR CITA
  // =========================================

  const cancelarCita = async (
    cita
  ) => {
    const estadoActual =
      obtenerEstado(cita);

    // No cancelar dos veces
    if (
      estadoActual ===
      "cancelada"
    ) {
      return;
    }

    const confirmar =
      window.confirm(
        `¿Deseas cancelar la cita de ${cita.cliente}?\n\n` +
          `Servicio: ${
            cita.servicio ||
            "Sin servicio"
          }\n` +
          `Fecha: ${
            cita.fecha ||
            "Sin fecha"
          }\n` +
          `Hora: ${
            cita.hora ||
            "Sin hora"
          }\n\n` +
          `La cita será marcada como cancelada.`
      );

    if (!confirmar) {
      return;
    }

    const idCita =
      `${cita.uid}-${cita.id}`;

    try {
      setCancelando(idCita);

      // =====================================
      // ACTUALIZAR FIRESTORE
      // =====================================

      const citaRef = doc(
        db,
        "usuarios",
        cita.uid,
        "citas",
        cita.id
      );

      await updateDoc(
        citaRef,
        {
          estado: "Cancelada",

          canceladaPor:
            "contador",

          fechaCancelacion:
            new Date().toISOString(),
        }
      );

      alert(
        "✅ La cita fue cancelada correctamente."
      );
    } catch (firebaseError) {
      console.error(
        "Error cancelando cita:",
        firebaseError
      );

      alert(
        "❌ No fue posible cancelar la cita."
      );
    } finally {
      setCancelando(null);
    }
  };

  // =========================================
  // LIMPIAR BÚSQUEDA
  // =========================================

  const limpiarBusqueda = () => {
    setBusqueda("");
  };

  // =========================================
  // TEXTO DE BÚSQUEDA
  // =========================================

  const textoBusqueda =
    normalizarTexto(
      busqueda
    );

  // =========================================
  // FILTRAR CITAS
  // =========================================

  const citasFiltradas =
    citas.filter(
      (cita) => {
        const estado =
          obtenerEstado(cita);

        // -------------------------------
        // FILTRO POR ESTADO
        // -------------------------------

        if (
          filtroEstado !==
            "todas" &&
          estado !==
            filtroEstado
        ) {
          return false;
        }

        // -------------------------------
        // SIN BÚSQUEDA
        // -------------------------------

        if (
          !textoBusqueda
        ) {
          return true;
        }

        // -------------------------------
        // DATOS A BUSCAR
        // -------------------------------

        const cliente =
          normalizarTexto(
            cita.cliente
          );

        const email =
          normalizarTexto(
            cita.email
          );

        const celular =
          normalizarTexto(
            cita.celular
          );

        const servicio =
          normalizarTexto(
            cita.servicio
          );

        const fecha =
          normalizarTexto(
            cita.fecha
          );

        const hora =
          normalizarTexto(
            cita.hora
          );

        const estadoTexto =
          normalizarTexto(
            cita.estado
          );

        // -------------------------------
        // BUSCAR
        // -------------------------------

        return (
          cliente.includes(
            textoBusqueda
          ) ||
          email.includes(
            textoBusqueda
          ) ||
          celular.includes(
            textoBusqueda
          ) ||
          servicio.includes(
            textoBusqueda
          ) ||
          fecha.includes(
            textoBusqueda
          ) ||
          hora.includes(
            textoBusqueda
          ) ||
          estadoTexto.includes(
            textoBusqueda
          )
        );
      }
    );

  // =========================================
  // CONTADORES
  // =========================================

  const citasPendientes =
    citas.filter(
      (cita) =>
        obtenerEstado(
          cita
        ) ===
        "pendiente"
    ).length;

  const citasConfirmadas =
    citas.filter(
      (cita) =>
        obtenerEstado(
          cita
        ) ===
        "confirmada"
    ).length;

  const citasCanceladas =
    citas.filter(
      (cita) =>
        obtenerEstado(
          cita
        ) ===
        "cancelada"
    ).length;

  const citasPerdidas =
    citas.filter(
      (cita) =>
        obtenerEstado(
          cita
        ) ===
        "perdida"
    ).length;

  // =========================================
  // CARGANDO
  // =========================================

  if (loading) {
    return (
      <div className="citas-container">

        <button
          type="button"
          className="btn-volver"
          onClick={() =>
            navigate(
              "/contador"
            )
          }
        >
          ← Volver al panel
        </button>

        <div className="mensaje-citas">

          <h3>
            Cargando citas...
          </h3>

          <p>
            Estamos consultando
            las citas de los
            clientes.
          </p>

        </div>

      </div>
    );
  }

  // =========================================
  // INTERFAZ
  // =========================================

  return (
    <div className="citas-container">

      {/* ===================================
          BOTÓN VOLVER
      ==================================== */}

      <button
        type="button"
        className="btn-volver"
        onClick={() =>
          navigate(
            "/contador"
          )
        }
      >
        ← Volver al panel
      </button>

      {/* ===================================
          ERROR
      ==================================== */}

      {error && (
        <div className="mensaje-error-citas">

          <strong>
            ⚠️ Error
          </strong>

          <p>
            {error}
          </p>

        </div>
      )}

      {/* ===================================
          HEADER
      ==================================== */}

      <div className="citas-header">

        <div>

          <h1>
            Citas
          </h1>

          <p>
            Gestión de citas de
            los clientes
          </p>

        </div>

        <div className="citas-total">

          <strong>
            {citas.length}
          </strong>

          <span>
            Citas
          </span>

        </div>

      </div>

      {/* ===================================
          RESUMEN
      ==================================== */}

      <div className="citas-resumen">

        <div className="cita-resumen-card">

          <span>
            🟡 Pendientes
          </span>

          <strong>
            {citasPendientes}
          </strong>

        </div>

        <div className="cita-resumen-card">

          <span>
            🟢 Confirmadas
          </span>

          <strong>
            {citasConfirmadas}
          </strong>

        </div>

        <div className="cita-resumen-card">

          <span>
            🔴 Canceladas
          </span>

          <strong>
            {citasCanceladas}
          </strong>

        </div>

        <div className="cita-resumen-card">

          <span>
            ⚫ Perdidas
          </span>

          <strong>
            {citasPerdidas}
          </strong>

        </div>

      </div>

      {/* ===================================
          FILTROS
      ==================================== */}

      <div className="citas-filtros">

        <div className="citas-buscador">

          <input
            type="text"
            value={busqueda}
            onChange={(e) =>
              setBusqueda(
                e.target.value
              )
            }
            placeholder="🔎 Buscar cliente, correo, celular, servicio, fecha..."
            autoComplete="off"
          />

          {/* ================================
              BOTÓN LIMPIAR
          ================================= */}

          {busqueda && (
            <button
              type="button"
              className="btn-limpiar-busqueda"
              onClick={
                limpiarBusqueda
              }
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}

        </div>

        <select
          value={
            filtroEstado
          }
          onChange={(e) =>
            setFiltroEstado(
              e.target.value
            )
          }
        >

          <option value="todas">
            Todas las citas
          </option>

          <option value="pendiente">
            Pendientes
          </option>

          <option value="confirmada">
            Confirmadas
          </option>

          <option value="cancelada">
            Canceladas
          </option>

          <option value="perdida">
            Perdidas
          </option>

        </select>

      </div>

      {/* ===================================
          BOTÓN LIMPIAR BÚSQUEDA
      ==================================== */}

      {(busqueda ||
        filtroEstado !==
          "todas") && (

        <div className="acciones-filtros">

          <button
            type="button"
            className="btn-limpiar-todo"
            onClick={() => {
              setBusqueda("");
              setFiltroEstado(
                "todas"
              );
            }}
          >
            ✕ Limpiar filtros
          </button>

        </div>

      )}

      {/* ===================================
          INFORMACIÓN DE RESULTADOS
      ==================================== */}

      <div className="resultado-info">

        Mostrando{" "}
        <strong>
          {citasFiltradas.length}
        </strong>{" "}
        de{" "}
        <strong>
          {citas.length}
        </strong>{" "}
        citas

      </div>

      {/* ===================================
          RESULTADOS
      ==================================== */}

      {citasFiltradas.length ===
      0 ? (

        <div className="mensaje-citas">

          <h3>
            {textoBusqueda ||
            filtroEstado !==
              "todas"
              ? "No se encontraron citas"
              : "No hay citas registradas"}
          </h3>

          <p>
            {textoBusqueda ||
            filtroEstado !==
              "todas"
              ? "Prueba con otro criterio de búsqueda."
              : "Las citas solicitadas por los clientes aparecerán aquí."}
          </p>

        </div>

      ) : (

        <div className="tabla-citas">

          <table>

            <thead>

              <tr>

                <th>
                  Cliente
                </th>

                <th>
                  Servicio
                </th>

                <th>
                  Fecha
                </th>

                <th>
                  Hora
                </th>

                <th>
                  Estado
                </th>

                <th>
                  Acción
                </th>

              </tr>

            </thead>

            <tbody>

              {citasFiltradas.map(
                (cita) => {

                  const estado =
                    obtenerEstado(
                      cita
                    );

                  const idCita =
                    `${cita.uid}-${cita.id}`;

                  return (
                    <tr
                      key={
                        idCita
                      }
                    >

                      {/* =================
                          CLIENTE
                      ================== */}

                      <td>

                        <strong>
                          {cita.cliente ||
                            "Sin nombre"}
                        </strong>

                        {cita.email && (
                          <small>
                            📧{" "}
                            {cita.email}
                          </small>
                        )}

                        {cita.celular && (
                          <small>
                            📱{" "}
                            {cita.celular}
                          </small>
                        )}

                      </td>

                      {/* =================
                          SERVICIO
                      ================== */}

                      <td>
                        {cita.servicio ||
                          "—"}
                      </td>

                      {/* =================
                          FECHA
                      ================== */}

                      <td>
                        {cita.fecha ||
                          "—"}
                      </td>

                      {/* =================
                          HORA
                      ================== */}

                      <td>
                        {cita.hora ||
                          "—"}
                      </td>

                      {/* =================
                          ESTADO
                      ================== */}

                      <td>

                        <span
                          className={
                            `estado-cita estado-cita-${estado}`
                          }
                        >
                          {cita.estado ||
                            "Pendiente"}
                        </span>

                      </td>

                      {/* =================
                          ACCIÓN
                      ================== */}

                      <td>

                        {estado !==
                        "cancelada" ? (

                          <button
                            type="button"
                            className="btn-cancelar-cita"
                            onClick={() =>
                              cancelarCita(
                                cita
                              )
                            }
                            disabled={
                              cancelando ===
                              idCita
                            }
                          >

                            {cancelando ===
                            idCita
                              ? "Cancelando..."
                              : "✕ Cancelar"}

                          </button>

                        ) : (

                          <span className="cita-cancelada-texto">
                            Cancelada
                          </span>

                        )}

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Citas;


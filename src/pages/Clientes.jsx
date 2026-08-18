
import "./clientes.css";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../firebaseConfig";

import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

function Clientes() {
  const navigate = useNavigate();

  // =========================================
  // ESTADOS
  // =========================================

  const [clientes, setClientes] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  // GUARDAMOS SOLAMENTE EL ID
  // DEL CLIENTE SELECCIONADO
  const [clienteSeleccionadoId, setClienteSeleccionadoId] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================
  // NORMALIZAR TEXTO
  //
  // Ignora:
  // - Mayúsculas
  // - Minúsculas
  // - Tildes
  // =========================================

  const normalizarTexto = (valor) => {
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  // =========================================
  // CARGAR CLIENTES
  // =========================================

  useEffect(() => {
    let unsubscribeClientes = null;

    let unsubscribeCitas = [];

    // =======================================
    // LIMPIAR LISTENERS DE CITAS
    // =======================================

    const limpiarListenersCitas = () => {
      unsubscribeCitas.forEach(
        (unsubscribe) => {
          if (
            typeof unsubscribe === "function"
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
          // SIN SESIÓN
          // =================================

          if (!user) {
            navigate("/login", {
              replace: true,
            });

            return;
          }

          // =================================
          // LIMPIAR LISTENERS ANTERIORES
          // =================================

          if (unsubscribeClientes) {
            unsubscribeClientes();

            unsubscribeClientes = null;
          }

          limpiarListenersCitas();

          setLoading(true);

          setError("");

          // =================================
          // CONSULTA DE CLIENTES
          // =================================

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

          console.log(
            "Consultando clientes..."
          );

          // =================================
          // ESCUCHAR CLIENTES
          // =================================

          unsubscribeClientes =
            onSnapshot(
              clientesQuery,

              (snapshot) => {
                console.log(
                  "Clientes encontrados:",
                  snapshot.size
                );

                const clientesBase =
                  snapshot.docs.map(
                    (documento) => ({
                      id:
                        documento.id,

                      ...documento.data(),

                      citas: [],
                    })
                  );

                console.log(
                  "Datos clientes:",
                  clientesBase
                );

                setClientes(
                  clientesBase
                );

                setLoading(false);

                // =================================
                // LIMPIAR CITAS ANTERIORES
                // =================================

                limpiarListenersCitas();

                // =================================
                // ESCUCHAR CITAS
                // DE CADA CLIENTE
                // =================================

                clientesBase.forEach(
                  (cliente) => {
                    const citasRef =
                      collection(
                        db,
                        "usuarios",
                        cliente.id,
                        "citas"
                      );

                    const unsubscribeCita =
                      onSnapshot(
                        citasRef,

                        (citasSnapshot) => {
                          const citas =
                            citasSnapshot.docs
                              .map(
                                (
                                  documento
                                ) => ({
                                  id:
                                    documento.id,

                                  ...documento.data(),
                                })
                              )
                              .sort(
                                (
                                  a,
                                  b
                                ) => {
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

                          // =================================
                          // ACTUALIZAR CITAS DEL CLIENTE
                          // =================================

                          setClientes(
                            (
                              clientesActuales
                            ) =>
                              clientesActuales.map(
                                (
                                  clienteActual
                                ) =>
                                  clienteActual.id ===
                                  cliente.id
                                    ? {
                                        ...clienteActual,

                                        citas,
                                      }
                                    : clienteActual
                              )
                          );
                        },

                        (firebaseError) => {
                          console.error(
                            "Error cargando citas:",
                            firebaseError
                          );
                        }
                      );

                    unsubscribeCitas.push(
                      unsubscribeCita
                    );
                  }
                );
              },

              (firebaseError) => {
                console.error(
                  "ERROR FIREBASE CLIENTES:",
                  firebaseError
                );

                setError(
                  "No se pudieron cargar los clientes."
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

      if (unsubscribeClientes) {
        unsubscribeClientes();
      }

      limpiarListenersCitas();
    };
  }, [navigate]);

  // =========================================
  // TEXTO DE BÚSQUEDA NORMALIZADO
  // =========================================

  const textoBusqueda =
    normalizarTexto(
      busqueda
    );

  // =========================================
  // BUSCAR CLIENTES
  //
  // Busca por:
  //
  // CLIENTE:
  // - nombre
  // - email
  // - celular
  //
  // CITA:
  // - servicio
  // - fecha
  // - hora
  // - estado
  // =========================================

  const clientesCoincidentes =
    clientes.filter(
      (cliente) => {
        // -------------------------------
        // DATOS DEL CLIENTE
        // -------------------------------

        const nombre =
          normalizarTexto(
            cliente.nombre
          );

        const email =
          normalizarTexto(
            cliente.email
          );

        const celular =
          normalizarTexto(
            cliente.celular
          );

        // -------------------------------
        // BUSCAR CLIENTE
        // -------------------------------

        const coincideCliente =
          !textoBusqueda ||
          nombre.includes(
            textoBusqueda
          ) ||
          email.includes(
            textoBusqueda
          ) ||
          celular.includes(
            textoBusqueda
          );

        // -------------------------------
        // BUSCAR EN CITAS
        // -------------------------------

        const coincideCita =
          textoBusqueda &&
          (cliente.citas || []).some(
            (cita) => {
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

              const estado =
                normalizarTexto(
                  cita.estado
                );

              return (
                servicio.includes(
                  textoBusqueda
                ) ||
                fecha.includes(
                  textoBusqueda
                ) ||
                hora.includes(
                  textoBusqueda
                ) ||
                estado.includes(
                  textoBusqueda
                )
              );
            }
          );

        return (
          coincideCliente ||
          coincideCita
        );
      }
    );

  // =========================================
  // SUGERENCIAS
  // =========================================

  const sugerencias =
    textoBusqueda &&
    !clienteSeleccionadoId
      ? clientesCoincidentes.slice(
          0,
          8
        )
      : [];

  // =========================================
  // CLIENTE SELECCIONADO
  //
  // LO BUSCAMOS DIRECTAMENTE EN CLIENTES
  // PARA QUE SI FIREBASE ACTUALIZA LAS CITAS,
  // LA INFORMACIÓN TAMBIÉN SE ACTUALICE.
  // =========================================

  const clienteSeleccionado =
    clienteSeleccionadoId
      ? clientes.find(
          (cliente) =>
            cliente.id ===
            clienteSeleccionadoId
        )
      : null;

  // =========================================
  // SELECCIONAR CLIENTE
  // =========================================

  const seleccionarCliente = (
    cliente
  ) => {
    console.log(
      "Cliente seleccionado:",
      cliente
    );

    setClienteSeleccionadoId(
      cliente.id
    );

    setBusqueda(
      cliente.nombre ||
        cliente.email ||
        cliente.celular ||
        ""
    );
  };

  // =========================================
  // LIMPIAR
  // =========================================

  const limpiarBusqueda = () => {
    console.log(
      "Limpiando búsqueda..."
    );

    setBusqueda("");

    setClienteSeleccionadoId(
      null
    );
  };

  // =========================================
  // CONTADOR CITAS PENDIENTES
  // =========================================

  const totalCitasPendientes =
    clientes.reduce(
      (
        total,
        cliente
      ) => {
        const pendientes =
          (
            cliente.citas ||
            []
          ).filter(
            (cita) =>
              normalizarTexto(
                cita.estado
              ) ===
              "pendiente"
          ).length;

        return (
          total +
          pendientes
        );
      },
      0
    );

  // =========================================
  // INTERFAZ
  // =========================================

  return (
    <div className="clientes-container">

      {/* =====================================
          BOTÓN VOLVER
      ====================================== */}

      <button
        type="button"
        className="btn-volver-clientes"
        onClick={() =>
          navigate(
            "/contador"
          )
        }
      >
        ← Volver al panel
      </button>

      {/* =====================================
          ENCABEZADO
      ====================================== */}

      <div className="clientes-header">

        <div>
          <h1>
            Clientes
          </h1>

          <p>
            Busca clientes y consulta
            sus citas
          </p>
        </div>

        <div className="clientes-total">

          <strong>
            {clientes.length}
          </strong>

          <span>
            Clientes
          </span>

          <small>
            {totalCitasPendientes}{" "}
            {totalCitasPendientes ===
            1
              ? "cita pendiente"
              : "citas pendientes"}
          </small>

        </div>

      </div>

      {/* =====================================
          ERROR
      ====================================== */}

      {error && (
        <div className="mensaje-error">
          {error}
        </div>
      )}

      {/* =====================================
          BUSCADOR
      ====================================== */}

      <div className="buscador-clientes">

        <div className="buscador-input-contenedor">

          <span className="icono-busqueda">
            🔎
          </span>

          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              const valor =
                e.target.value;

              console.log(
                "Buscando:",
                valor
              );

              setBusqueda(
                valor
              );

              // Cuando el usuario
              // vuelve a escribir,
              // quitamos selección
              setClienteSeleccionadoId(
                null
              );
            }}
            placeholder="Escribe nombre, correo, celular, servicio, fecha..."
            autoComplete="off"
          />

          {/* =================================
              X DEL INPUT
          ================================= */}

          {busqueda.length >
            0 && (
            <button
              type="button"
              className="btn-x-buscador"
              onClick={
                limpiarBusqueda
              }
            >
              ×
            </button>
          )}

        </div>

        {/* ===================================
            AUTOCOMPLETADO
        =================================== */}

        {textoBusqueda &&
          !clienteSeleccionadoId && (

            <div className="resultados-busqueda">

              {sugerencias.length >
              0 ? (

                sugerencias.map(
                  (
                    cliente
                  ) => (

                    <button
                      type="button"
                      key={
                        cliente.id
                      }
                      className="resultado-cliente"
                      onClick={() =>
                        seleccionarCliente(
                          cliente
                        )
                      }
                    >

                      <div className="resultado-avatar">

                        {String(
                          cliente.nombre ||
                            "C"
                        )
                          .charAt(
                            0
                          )
                          .toUpperCase()}

                      </div>

                      <div className="resultado-datos">

                        <strong>
                          {cliente.nombre ||
                            "Sin nombre"}
                        </strong>

                        <span>
                          📧{" "}
                          {cliente.email ||
                            "Sin correo"}
                        </span>

                        <small>
                          📱{" "}
                          {cliente.celular ||
                            "Sin celular"}
                        </small>

                      </div>

                    </button>
                  )
                )

              ) : (

                <div className="sin-resultados">

                  No se encontró
                  ningún cliente.

                </div>

              )}

            </div>
          )}

      </div>

      {/* =====================================
          BOTÓN LIMPIAR
      ====================================== */}

      {clienteSeleccionado && (

        <div className="limpiar-contenedor">

          <button
            type="button"
            className="btn-limpiar-clientes"
            onClick={
              limpiarBusqueda
            }
          >
            ✕ Limpiar búsqueda
          </button>

        </div>

      )}

      {/* =====================================
          CARGANDO
      ====================================== */}

      {loading && (

        <div className="mensaje">

          <h3>
            Cargando clientes...
          </h3>

          <p>
            Consultando clientes
            y citas.
          </p>

        </div>

      )}

      {/* =====================================
          SIN SELECCIÓN
      ====================================== */}

      {!loading &&
        !clienteSeleccionado && (

          <div className="mensaje">

            <h3>
              Buscar cliente
            </h3>

            <p>
              Escribe el nombre,
              correo, celular,
              servicio o fecha.
            </p>

            <p>
              <strong>
                Clientes cargados:
              </strong>{" "}
              {clientes.length}
            </p>

          </div>

        )}

      {/* =====================================
          CLIENTE SELECCIONADO
      ====================================== */}

      {!loading &&
        clienteSeleccionado && (

          <div className="clientes-lista">

            <div
              className="cliente-card"
              key={
                clienteSeleccionado.id
              }
            >

              {/* =============================
                  AVATAR
              ============================== */}

              <div className="cliente-avatar">

                {String(
                  clienteSeleccionado.nombre ||
                    "C"
                )
                  .charAt(
                    0
                  )
                  .toUpperCase()}

              </div>

              {/* =============================
                  INFORMACIÓN
              ============================== */}

              <div className="cliente-info">

                <h3>
                  {
                    clienteSeleccionado.nombre ||
                    "Sin nombre"
                  }
                </h3>

                <p>
                  📧{" "}
                  {
                    clienteSeleccionado.email ||
                    "Sin correo"
                  }
                </p>

                <p>
                  📱{" "}
                  {
                    clienteSeleccionado.celular ||
                    "Sin celular"
                  }
                </p>

                <div className="cliente-rol">
                  Cliente
                </div>

              </div>

              {/* =============================
                  CITAS
              ============================== */}

              <div className="cliente-citas">

                <div className="cliente-citas-header">

                  <h4>
                    📅 Citas
                  </h4>

                  <span>
                    {
                      (
                        clienteSeleccionado.citas ||
                        []
                      ).length
                    }
                  </span>

                </div>

                {(
                  clienteSeleccionado.citas ||
                  []
                ).length >
                0 ? (

                  <div className="lista-citas-cliente">

                    {(
                      clienteSeleccionado.citas ||
                      []
                    ).map(
                      (
                        cita
                      ) => {

                        const estado =
                          String(
                            cita.estado ||
                              "Pendiente"
                          ).trim();

                        const estadoNormalizado =
                          normalizarTexto(
                            estado
                          );

                        return (
                          <div
                            className="cita-card"
                            key={
                              cita.id
                            }
                          >

                            <div className="cita-info">

                              <strong>
                                {
                                  cita.servicio ||
                                  "Sin servicio"
                                }
                              </strong>

                              <p>
                                📅{" "}
                                {
                                  cita.fecha ||
                                  "Sin fecha"
                                }
                              </p>

                              <p>
                                🕐{" "}
                                {
                                  cita.hora ||
                                  "Sin hora"
                                }
                              </p>

                              <span
                                className={`estado-cita estado-${estadoNormalizado.replace(
                                  /\s+/g,
                                  "-"
                                )}`}
                              >
                                {estado}
                              </span>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                ) : (

                  <div className="sin-citas">
                    Este cliente no tiene
                    citas registradas.
                  </div>

                )}

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Clientes;



import "./misCitas.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebaseConfig";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

function MisCitas() {
  const navigate = useNavigate();

  const [citas, setCitas] = useState([]);

  const [servicio, setServicio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  const [uid, setUid] = useState("");

  const [editando, setEditando] = useState(false);
  const [idCita, setIdCita] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  // ==========================================
  // CARGAR CITAS EN TIEMPO REAL
  // ==========================================

  const cargarCitas = (userId) => {
    const citasRef = collection(
      db,
      "usuarios",
      userId,
      "citas"
    );

    return onSnapshot(citasRef, async (snapshot) => {
      const ahora = new Date();

      const datos = await Promise.all(
        snapshot.docs.map(async (documento) => {
          const datosCita = documento.data();

          const cita = {
            ...datosCita,
            estado:
              datosCita.estado?.trim() || "Pendiente",
          };

          const fechaHora = new Date(
            `${cita.fecha}T${cita.hora}:00`
          );

          // Si la cita está pendiente y ya pasó,
          // automáticamente pasa a Perdida.
          if (
            cita.estado === "Pendiente" &&
            fechaHora < ahora
          ) {
            await updateDoc(
              doc(
                db,
                "usuarios",
                userId,
                "citas",
                documento.id
              ),
              {
                estado: "Perdida",
              }
            );

            cita.estado = "Perdida";
          }

          return {
            id: documento.id,
            ...cita,
          };
        })
      );

      // Ordenar por fecha y hora
      datos.sort((a, b) => {
        return (
          new Date(`${a.fecha}T${a.hora}:00`) -
          new Date(`${b.fecha}T${b.hora}:00`)
        );
      });

      setCitas(datos);
    });
  };

  // ==========================================
  // AGENDAR CITA
  // ==========================================

  const guardarCita = async () => {
    if (!servicio || !fecha || !hora) {
      alert("Completa todos los campos.");
      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "usuarios",
          uid,
          "citas"
        ),
        {
          servicio,
          fecha,
          hora,
          estado: "Pendiente",
          createdAt: serverTimestamp(),
        }
      );

      alert("Cita agendada correctamente.");

      limpiarFormulario();
    } catch (error) {
      console.error(error);

      alert("Error creando la cita.");
    }
  };

  // ==========================================
  // ABRIR MODAL PARA EDITAR
  // ==========================================

  const editarCita = (cita) => {
    setServicio(cita.servicio);
    setFecha(cita.fecha);
    setHora(cita.hora);

    setIdCita(cita.id);

    setMostrarModal(true);
  };

  // ==========================================
  // ACTUALIZAR CITA
  // ==========================================

  const actualizarCita = async () => {
    if (!servicio || !fecha || !hora) {
      alert("Completa todos los campos.");
      return;
    }

    try {
      await updateDoc(
        doc(
          db,
          "usuarios",
          uid,
          "citas",
          idCita
        ),
        {
          servicio,
          fecha,
          hora,
          estado: "Pendiente",
        }
      );

      alert("Cita modificada correctamente.");

      limpiarFormulario();

      setMostrarModal(false);
    } catch (error) {
      console.error(error);

      alert("Error modificando la cita.");
    }
  };

  // ==========================================
  // CANCELAR CITA
  // ==========================================

  const cancelarCita = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas cancelar esta cita?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await updateDoc(
        doc(
          db,
          "usuarios",
          uid,
          "citas",
          id
        ),
        {
          estado: "Cancelada",
        }
      );

      alert("Cita cancelada.");
    } catch (error) {
      console.error(error);

      alert("Error cancelando la cita.");
    }
  };

  // ==========================================
  // ELIMINAR CITA
  // ==========================================

  const eliminarCita = async (id) => {
    const confirmar = window.confirm(
      "¿Deseas eliminar esta cita definitivamente?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "usuarios",
          uid,
          "citas",
          id
        )
      );

      alert("Cita eliminada.");
    } catch (error) {
      console.error(error);

      alert("Error eliminando cita.");
    }
  };

  // ==========================================
  // LIMPIAR FORMULARIO
  // ==========================================

  const limpiarFormulario = () => {
    setServicio("");
    setFecha("");
    setHora("");

    setEditando(false);
    setIdCita("");
  };

  // ==========================================
  // AUTENTICACIÓN + FIRESTORE
  // ==========================================

  useEffect(() => {
    let unsubscribeCitas;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          navigate("/login");
          return;
        }

        setUid(user.uid);

        unsubscribeCitas = cargarCitas(
          user.uid
        );
      }
    );

    return () => {
      unsubscribeAuth();

      if (unsubscribeCitas) {
        unsubscribeCitas();
      }
    };
  }, [navigate]);

  // ==========================================
  // FECHA MÍNIMA
  // ==========================================

  const hoy = new Date()
    .toISOString()
    .split("T")[0];

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div className="mis-citas">

      {/* ==============================
          HEADER
      =============================== */}

      <header className="header">

        <h1>
          Mis Citas
        </h1>

        <button
          onClick={() => navigate("/cliente")}
        >
          Volver
        </button>

      </header>


      {/* ==============================
          NUEVA CITA
      =============================== */}

      <section className="nueva-cita">

        <h2>
          {editando
            ? "Modificar Cita"
            : "Agendar Nueva Cita"}
        </h2>


        <div className="form-cita">

          {/* SERVICIO */}

          <select
            value={servicio}
            onChange={(e) =>
              setServicio(e.target.value)
            }
          >

            <option value="">
              Seleccione un servicio
            </option>

            <option value="Declaración de Renta">
              Declaración de Renta
            </option>

            <option value="Facturación Electrónica">
              Facturación Electrónica
            </option>

            <option value="Asesoría Tributaria">
              Asesoría Tributaria
            </option>

            <option value="Contabilidad">
              Contabilidad
            </option>

          </select>


          {/* FECHA */}

          <input
            type="date"
            min={hoy}
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
          />


          {/* HORA */}

          <select
            value={hora}
            onChange={(e) =>
              setHora(e.target.value)
            }
          >

            <option value="">
              Seleccione una hora
            </option>

            <option value="08:00">
              08:00 AM
            </option>

            <option value="09:00">
              09:00 AM
            </option>

            <option value="10:00">
              10:00 AM
            </option>

            <option value="11:00">
              11:00 AM
            </option>

            <option value="12:00">
              12:00 PM
            </option>

            <option value="14:00">
              02:00 PM
            </option>

            <option value="15:00">
              03:00 PM
            </option>

            <option value="16:00">
              04:00 PM
            </option>

            <option value="17:00">
              05:00 PM
            </option>

          </select>


          {/* BOTÓN */}

          <button
            onClick={
              editando
                ? actualizarCita
                : guardarCita
            }
          >
            {editando
              ? "Guardar Cambios"
              : "Agendar Cita"}
          </button>

        </div>

      </section>


      {/* ==============================
          TABLA DE CITAS
      =============================== */}

      <section className="tabla-citas">

        <h2>
          Mis Citas Programadas
        </h2>


        <table>

          <thead>

            <tr>

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

            </tr>

          </thead>


          <tbody>

            {citas.length > 0 ? (

              citas.map((cita) => (

                <tr key={cita.id}>

                  <td>
                    {cita.servicio}
                  </td>

                  <td>
                    {cita.fecha}
                  </td>

                  <td>
                    {cita.hora}
                  </td>

                  <td>

                    <div>
                      {cita.estado}
                    </div>


                    {/* ==========================
                        ACCIONES DE LA CITA
                    =========================== */}

                    {
                      (
                        cita.estado?.trim() ===
                          "Pendiente" ||
                        cita.estado?.trim() ===
                          "Perdida"
                      )
                      &&
                      (
                        <div className="acciones-cita">

                          {/* EDITAR */}

                          <button
                            onClick={() =>
                              editarCita(cita)
                            }
                          >
                            Editar
                          </button>


                          {/* ELIMINAR */}

                          <button
                            onClick={() =>
                              eliminarCita(
                                cita.id
                              )
                            }
                          >
                            Eliminar
                          </button>


                          {/* CANCELAR
                              SOLO PENDIENTE */}

                          {
                            cita.estado?.trim() ===
                              "Pendiente"
                            &&
                            (
                              <button
                                onClick={() =>
                                  cancelarCita(
                                    cita.id
                                  )
                                }
                              >
                                Cancelar
                              </button>
                            )
                          }

                        </div>
                      )
                    }

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td colSpan="4">
                  No tienes citas registradas.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </section>


      {/* ==============================
          MODAL EDITAR CITA
      =============================== */}

      {
        mostrarModal && (

          <div className="modal-overlay">

            <div className="modal-cita">

              <h2>
                Editar Cita
              </h2>


              {/* SERVICIO */}

              <label>
                Servicio
              </label>

              <select
                value={servicio}
                onChange={(e) =>
                  setServicio(e.target.value)
                }
              >

                <option value="">
                  Seleccione un servicio
                </option>

                <option value="Declaración de Renta">
                  Declaración de Renta
                </option>

                <option value="Facturación Electrónica">
                  Facturación Electrónica
                </option>

                <option value="Asesoría Tributaria">
                  Asesoría Tributaria
                </option>

                <option value="Contabilidad">
                  Contabilidad
                </option>

              </select>


              {/* FECHA */}

              <label>
                Fecha
              </label>

              <input
                type="date"
                min={hoy}
                value={fecha}
                onChange={(e) =>
                  setFecha(e.target.value)
                }
              />


              {/* HORA */}

              <label>
                Hora
              </label>

              <select
                value={hora}
                onChange={(e) =>
                  setHora(e.target.value)
                }
              >

                <option value="">
                  Seleccione una hora
                </option>

                <option value="08:00">
                  08:00 AM
                </option>

                <option value="09:00">
                  09:00 AM
                </option>

                <option value="10:00">
                  10:00 AM
                </option>

                <option value="11:00">
                  11:00 AM
                </option>

                <option value="12:00">
                  12:00 PM
                </option>

                <option value="14:00">
                  02:00 PM
                </option>

                <option value="15:00">
                  03:00 PM
                </option>

                <option value="16:00">
                  04:00 PM
                </option>

                <option value="17:00">
                  05:00 PM
                </option>

              </select>


              {/* BOTONES MODAL */}

              <div className="modal-botones">

                <button
                  onClick={actualizarCita}
                >
                  Guardar Cambios
                </button>


                <button
                  onClick={() => {

                    limpiarFormulario();

                    setMostrarModal(false);

                  }}
                >
                  Cancelar
                </button>

              </div>

            </div>

          </div>

        )
      }

    </div>
  );
}

export default MisCitas;

import "./misSolicitudes.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebaseConfig";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";


function MisSolicitudes() {

  const navigate = useNavigate();

  const [uid, setUid] = useState("");

  const [servicio, setServicio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("Media");

  const [solicitudes, setSolicitudes] = useState([]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);


  // =====================================================
  // MODAL
  // =====================================================

  const abrirModal = (texto, fueExito = false) => {

    setMensaje(texto);
    setExito(fueExito);
    setMostrarModal(true);

  };


  // =====================================================
  // CARGAR SOLICITUDES DEL CLIENTE
  // =====================================================

  const cargarSolicitudes = async (userId) => {

    try {

      const solicitudesRef = collection(
        db,
        "solicitudes_asesoria"
      );


      // Solamente solicitamos las solicitudes
      // cuyo uidCliente sea el usuario actual.

      const q = query(
        solicitudesRef,
        where("uidCliente", "==", userId)
      );


      const snapshot = await getDocs(q);


      const lista = [];


      snapshot.forEach((documento) => {

        lista.push({
          id: documento.id,
          ...documento.data(),
        });

      });


      // Ordenar por fecha más reciente
      // sin necesidad de índice compuesto.

      lista.sort((a, b) => {

        const fechaA =
          a.fecha?.toMillis
            ? a.fecha.toMillis()
            : a.fechaSolicitud?.toMillis
              ? a.fechaSolicitud.toMillis()
              : 0;


        const fechaB =
          b.fecha?.toMillis
            ? b.fecha.toMillis()
            : b.fechaSolicitud?.toMillis
              ? b.fechaSolicitud.toMillis()
              : 0;


        return fechaB - fechaA;

      });


      setSolicitudes(lista);


    } catch (error) {

      console.error(
        "ERROR CARGANDO SOLICITUDES:",
        error
      );


      abrirModal(
        `No fue posible cargar las solicitudes. ${
          error.code || ""
        }`
      );

    }

  };


  // =====================================================
  // ENVIAR SOLICITUD
  // =====================================================

  const enviarSolicitud = async () => {

    if (
      servicio.trim() === "" ||
      descripcion.trim() === ""
    ) {

      abrirModal(
        "Debe completar todos los campos."
      );

      return;

    }


    if (!uid) {

      abrirModal(
        "No se encontró el usuario autenticado."
      );

      return;

    }


    try {

      // =====================================================
      // BUSCAR DATOS DEL CLIENTE AUTENTICADO
      // =====================================================

      const usuarioRef = doc(
        db,
        "usuarios",
        uid
      );


      const usuarioSnapshot = await getDoc(
        usuarioRef
      );


      if (!usuarioSnapshot.exists()) {

        abrirModal(
          "No se encontró el perfil del usuario."
        );

        return;

      }


      const datosUsuario =
        usuarioSnapshot.data();


      // =====================================================
      // DATOS DEL CLIENTE
      // =====================================================

      const nombreCliente =
        datosUsuario.nombre ||
        datosUsuario.nombreCompleto ||
        auth.currentUser?.displayName ||
        "";


      const celularCliente =
        datosUsuario.celular ||
        datosUsuario.telefono ||
        "";


      const emailCliente =
        datosUsuario.email ||
        datosUsuario.correo ||
        auth.currentUser?.email ||
        "";


      // =====================================================
      // GUARDAR SOLICITUD
      // =====================================================

      await addDoc(

        collection(
          db,
          "solicitudes_asesoria"
        ),

        {

          // =========================================
          // DATOS AUTOMÁTICOS DEL CLIENTE
          // =========================================

          uidCliente: uid,

          nombre: nombreCliente,
          celular: celularCliente,
          email: emailCliente,


          // =========================================
          // DATOS DE LA SOLICITUD
          // =========================================

          servicio: servicio.trim(),
          descripcion: descripcion.trim(),

          prioridad,
          estado: "Pendiente",


          // =========================================
          // COMPATIBILIDAD CON SOLICITUDES DE HOME
          // =========================================

          tipoAsesoria: servicio.trim(),
          solicitud: descripcion.trim(),


          // =========================================
          // FECHAS
          // =========================================

          fecha: serverTimestamp(),
          fechaSolicitud: serverTimestamp(),

        }

      );


      // =====================================================
      // MENSAJE DE ÉXITO
      // =====================================================

      abrirModal(
        "Solicitud enviada correctamente.",
        true
      );


      // =====================================================
      // LIMPIAR FORMULARIO
      // =====================================================

      setServicio("");
      setDescripcion("");
      setPrioridad("Media");


      // =====================================================
      // ACTUALIZAR HISTORIAL
      // =====================================================

      await cargarSolicitudes(uid);


    } catch (error) {

      console.error(
        "ERROR ENVIANDO SOLICITUD:",
        error
      );


      abrirModal(
        `No fue posible enviar la solicitud. ${
          error.code || ""
        }`
      );

    }

  };


  // =====================================================
  // AUTENTICACIÓN
  // =====================================================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(

        auth,

        (user) => {

          if (!user) {

            navigate("/login");

            return;

          }


          setUid(user.uid);


          cargarSolicitudes(
            user.uid
          );

        }

      );


    return () => unsubscribe();

  }, [navigate]);


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <div className="solicitudes-container">

      <div className="solicitudes-card">


        <h1>
          Mis Solicitudes
        </h1>


        <button
          className="btn-volver"
          onClick={() =>
            navigate("/cliente")
          }
        >
          Volver
        </button>


        {/* =================================================
            NUEVA SOLICITUD
        ================================================= */}

        <h2>
          Nueva Solicitud
        </h2>


        <div className="campo">

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
              Seleccione...
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

            <option value="Certificado de Ingresos">
              Certificado de Ingresos
            </option>

            <option value="Cámara de Comercio">
              Cámara de Comercio
            </option>

            <option value="Nómina">
              Nómina
            </option>

            <option value="Otro">
              Otro
            </option>

          </select>

        </div>


        {/* =================================================
            DESCRIPCIÓN
        ================================================= */}

        <div className="campo">

          <label>
            Descripción
          </label>


          <textarea
            rows="5"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(e.target.value)
            }
            placeholder="Describe lo que necesitas..."
          />

        </div>


        {/* =================================================
            PRIORIDAD
        ================================================= */}

        <div className="campo">

          <label>
            Prioridad
          </label>


          <select
            value={prioridad}
            onChange={(e) =>
              setPrioridad(e.target.value)
            }
          >

            <option value="Baja">
              Baja
            </option>

            <option value="Media">
              Media
            </option>

            <option value="Alta">
              Alta
            </option>

          </select>

        </div>


        {/* =================================================
            BOTÓN ENVIAR
        ================================================= */}

        <button
          className="btn-enviar"
          onClick={enviarSolicitud}
        >
          Enviar Solicitud
        </button>


        <hr />


        {/* =================================================
            HISTORIAL
        ================================================= */}

        <h2>
          Historial
        </h2>


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
                Prioridad
              </th>

              <th>
                Fecha
              </th>

            </tr>

          </thead>


          <tbody>

            {solicitudes.length === 0 ? (

              <tr>

                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No existen solicitudes.
                </td>

              </tr>

            ) : (

              solicitudes.map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.servicio ||
                      item.tipoAsesoria ||
                      "-"}
                  </td>


                  <td>
                    {item.estado || "Pendiente"}
                  </td>


                  <td>
                    {item.prioridad || "-"}
                  </td>


                  <td>

                    {item.fecha?.toDate

                      ? item.fecha
                          .toDate()
                          .toLocaleDateString()

                      : item.fechaSolicitud?.toDate

                        ? item.fechaSolicitud
                            .toDate()
                            .toLocaleDateString()

                        : "-"

                    }

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>


      </div>


      {/* ===================================================
          MODAL
      =================================================== */}

      {mostrarModal && (

        <div className="modal-overlay">

          <div className="modal">

            <h2>

              {exito
                ? "Operación Exitosa"
                : "Error"}

            </h2>


            <p>
              {mensaje}
            </p>


            <button
              onClick={() =>
                setMostrarModal(false)
              }
            >
              Aceptar
            </button>

          </div>

        </div>

      )}


    </div>

  );

}


export default MisSolicitudes;
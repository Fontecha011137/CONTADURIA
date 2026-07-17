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
  query,
  orderBy,
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

  const abrirModal = (texto, fueExito = false) => {
    setMensaje(texto);
    setExito(fueExito);
    setMostrarModal(true);
  };

  const cargarSolicitudes = async (userId) => {

    try {

      const q = query(
        collection(db, "usuarios", userId, "solicitudes"),
        orderBy("fecha", "desc")
      );

      const snapshot = await getDocs(q);

      const lista = [];

      snapshot.forEach((doc) => {

        lista.push({
          id: doc.id,
          ...doc.data(),
        });

      });

      setSolicitudes(lista);

    } catch (error) {

      console.error(error);

      abrirModal(
        "No fue posible cargar las solicitudes."
      );

    }

  };

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

    try {

      await addDoc(

        collection(
          db,
          "usuarios",
          uid,
          "solicitudes"
        ),

        {
          servicio,
          descripcion,
          prioridad,
          estado: "Pendiente",
          fecha: serverTimestamp(),
        }

      );

      abrirModal(
        "Solicitud enviada correctamente.",
        true
      );

      setServicio("");
      setDescripcion("");
      setPrioridad("Media");

      cargarSolicitudes(uid);

    } catch (error) {

      console.error(error);

      abrirModal(
        "No fue posible enviar la solicitud."
      );

    }

  };

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(

      auth,

      (user) => {

        if (!user) {

          navigate("/login");
          return;

        }

        setUid(user.uid);

        cargarSolicitudes(user.uid);

      }

    );

    return () => unsubscribe();

  }, [navigate]);

  return (

    <div className="solicitudes-container">

      <div className="solicitudes-card">

        <h1>Mis Solicitudes</h1>

        <h2>Nueva Solicitud</h2>

        <div className="campo">

          <label>Servicio</label>

          <select
            value={servicio}
            onChange={(e) =>
              setServicio(e.target.value)
            }
          >

            <option value="">
              Seleccione...
            </option>

            <option>
              Declaración de Renta
            </option>

            <option>
              Facturación Electrónica
            </option>

            <option>
              Asesoría Tributaria
            </option>

            <option>
              Certificado de Ingresos
            </option>

            <option>
              Cámara de Comercio
            </option>

            <option>
              Nómina
            </option>

            <option>
              Otro
            </option>

          </select>

        </div>

        <div className="campo">

          <label>Descripción</label>

          <textarea

            rows="5"

            value={descripcion}

            onChange={(e) =>
              setDescripcion(e.target.value)
            }

          />

        </div>

        <div className="campo">

          <label>Prioridad</label>

          <select
            value={prioridad}
            onChange={(e) =>
              setPrioridad(e.target.value)
            }
          >

            <option>Baja</option>
            <option>Media</option>
            <option>Alta</option>

          </select>

        </div>

        <button

          className="btn-enviar"

          onClick={enviarSolicitud}

        >

          Enviar Solicitud

        </button>

        <hr />

        <h2>Historial</h2>

        <table>

          <thead>

            <tr>

              <th>Servicio</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Fecha</th>

            </tr>

          </thead>

          <tbody>

            {

              solicitudes.length === 0 ?

              (

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

              )

              :

              solicitudes.map(

                (item) => (

                  <tr key={item.id}>

                    <td>{item.servicio}</td>

                    <td>{item.estado}</td>

                    <td>{item.prioridad}</td>

                    <td>

                      {

                        item.fecha?.toDate

                          ?

                        item.fecha
                          .toDate()
                          .toLocaleDateString()

                          :

                        "-"

                      }

                    </td>

                  </tr>

                )

              )

            }

          </tbody>

        </table>

        <button

          className="btn-volver"

          onClick={() =>
            navigate("/cliente")
          }

        >

          Volver

        </button>

      </div>

      {

        mostrarModal &&

        (

          <div className="modal-overlay">

            <div className="modal">

              <h2>

                {

                  exito

                    ?

                  "Operación Exitosa"

                    :

                  "Error"

                }

              </h2>

              <p>{mensaje}</p>

              <button

                onClick={() =>
                  setMostrarModal(false)
                }

              >

                Aceptar

              </button>

            </div>

          </div>

        )

      }

    </div>

  );

}

export default MisSolicitudes;
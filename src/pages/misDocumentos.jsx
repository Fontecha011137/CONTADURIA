import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  auth,
  db
} from "../firebaseConfig";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import {
  onAuthStateChanged
} from "firebase/auth";


function MisDocumentos() {

  const navigate = useNavigate();

  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================
  // BUSCADOR
  // =========================================

  const [busqueda, setBusqueda] = useState("");


  // =========================================
  // NORMALIZAR TEXTO
  // Ignora mayúsculas, minúsculas y tildes
  // =========================================

  const normalizarTexto = (texto) => {

    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  };


  // =========================================
  // CARGAR DOCUMENTOS
  // =========================================

  useEffect(() => {

    let unsubscribeDocumentos = null;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {

          if (!user) {

            setDocumentos([]);
            setLoading(false);

            return;

          }


          const ref =
            collection(
              db,
              "usuarios",
              user.uid,
              "documentos"
            );


          unsubscribeDocumentos =
            onSnapshot(

              ref,

              (snapshot) => {

                const docs =
                  snapshot.docs.map(
                    (doc) => ({

                      id: doc.id,
                      ...doc.data(),

                    })
                  );


                setDocumentos(docs);
                setLoading(false);

              },

              (error) => {

                console.error(
                  "Error cargando documentos:",
                  error
                );

                setLoading(false);

              }

            );

        }
      );


    return () => {

      unsubscribeAuth();


      if (unsubscribeDocumentos) {

        unsubscribeDocumentos();

      }

    };

  }, []);


  // =========================================
  // FILTRAR DOCUMENTOS
  // =========================================

  const documentosFiltrados = useMemo(() => {

    const texto = normalizarTexto(busqueda);


    // Si no hay búsqueda,
    // mostrar todos los documentos

    if (!texto) {

      return documentos;

    }


    return documentos.filter((doc) => {

      const nombre =
        normalizarTexto(doc.nombre);

      const tipo =
        normalizarTexto(doc.tipo);

      const estado =
        normalizarTexto(doc.estado);

      const periodo =
        normalizarTexto(doc.periodo);

      const origen =
        doc.enviadoPor === "contador"
          ? "contador"
          : "yo";


      return (

        nombre.includes(texto) ||

        tipo.includes(texto) ||

        estado.includes(texto) ||

        periodo.includes(texto) ||

        origen.includes(texto)

      );

    });

  }, [documentos, busqueda]);


  // =========================================
  // LIMPIAR BÚSQUEDA
  // =========================================

  const limpiarBusqueda = () => {

    setBusqueda("");

  };


  // =========================================
  // CARGANDO
  // =========================================

  if (loading) {

    return (

      <div
        style={{
          minHeight: "100vh",
          padding: "30px",
          boxSizing: "border-box"
        }}
      >

        <p>
          Cargando documentos...
        </p>

      </div>

    );

  }


  // =========================================
  // INTERFAZ
  // =========================================

  return (

    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        boxSizing: "border-box",
        background: "#f5f5f5"
      }}
    >


      {/* =====================================
          ENCABEZADO
      ===================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          gap: "20px"
        }}
      >

        <h1
          style={{
            margin: 0,
            color: "#212529"
          }}
        >
          Mis Documentos
        </h1>


        {/* BOTÓN VOLVER */}

        <button
          onClick={() => navigate("/cliente")}
          style={{
            background: "#198754",
            color: "#ffffff",
            border: "none",
            padding: "11px 20px",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow:
              "0 2px 6px rgba(0, 0, 0, 0.15)",
            whiteSpace: "nowrap"
          }}
        >
          ← Volver al panel
        </button>

      </div>


      {/* =====================================
          BUSCADOR
      ===================================== */}

      {documentos.length > 0 && (

        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
            boxShadow:
              "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
        >

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >

            {/* INPUT */}

            <div
              style={{
                flex: "1 1 350px",
                position: "relative"
              }}
            >

              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "18px"
                }}
              >
                🔎
              </span>


              <input
                type="text"
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
                placeholder="Buscar por nombre, tipo, estado, periodo u origen..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px 15px 13px 45px",
                  border:
                    "1px solid #ced4da",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none"
                }}
              />

            </div>


            {/* BOTÓN LIMPIAR */}

            {busqueda && (

              <button
                onClick={limpiarBusqueda}
                style={{
                  background: "#dc3545",
                  color: "#ffffff",
                  border: "none",
                  padding: "13px 20px",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                ✕ Limpiar búsqueda
              </button>

            )}

          </div>


          {/* RESULTADOS */}

          <div
            style={{
              marginTop: "12px",
              color: "#666",
              fontSize: "14px"
            }}
          >

            {busqueda ? (

              <>
                Mostrando{" "}
                <strong>
                  {documentosFiltrados.length}
                </strong>{" "}
                de{" "}
                <strong>
                  {documentos.length}
                </strong>{" "}
                documentos
              </>

            ) : (

              <>
                Total de documentos:{" "}
                <strong>
                  {documentos.length}
                </strong>
              </>

            )}

          </div>

        </div>

      )}


      {/* =====================================
          SIN DOCUMENTOS
      ===================================== */}

      {documentos.length === 0 ? (

        <div
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "10px",
            boxShadow:
              "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
        >

          <p
            style={{
              margin: 0,
              color: "#666"
            }}
          >
            No tienes documentos todavía.
          </p>

        </div>

      ) : documentosFiltrados.length === 0 ? (

        /* ===================================
           SIN RESULTADOS
        =================================== */

        <div
          style={{
            background: "#ffffff",
            padding: "35px",
            borderRadius: "10px",
            textAlign: "center",
            boxShadow:
              "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
        >

          <div
            style={{
              fontSize: "40px",
              marginBottom: "10px"
            }}
          >
            🔎
          </div>


          <h3
            style={{
              marginBottom: "8px",
              color: "#212529"
            }}
          >
            No se encontraron documentos
          </h3>


          <p
            style={{
              color: "#666",
              marginBottom: "20px"
            }}
          >
            No encontramos documentos que coincidan
            con "{busqueda}".
          </p>


          <button
            onClick={limpiarBusqueda}
            style={{
              background: "#198754",
              color: "#ffffff",
              border: "none",
              padding: "11px 20px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Limpiar búsqueda
          </button>

        </div>

      ) : (

        /* ===================================
           TABLA DE DOCUMENTOS
        =================================== */

        <div
          style={{
            background: "#ffffff",
            borderRadius: "10px",
            padding: "20px",
            boxShadow:
              "0 2px 8px rgba(0, 0, 0, 0.08)",
            overflowX: "auto"
          }}
        >

          <table
            border="1"
            cellPadding="10"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#ffffff"
            }}
          >

            <thead>

              <tr
                style={{
                  background: "#198754",
                  color: "#ffffff"
                }}
              >

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

                <th>
                  Archivo
                </th>

              </tr>

            </thead>


            <tbody>

              {documentosFiltrados.map(
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


                    <td>

                      {doc.fileUrl ? (

                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#198754",
                            fontWeight: "bold",
                            textDecoration: "none"
                          }}
                        >
                          📄 Ver documento
                        </a>

                      ) : (

                        <span
                          style={{
                            color: "#dc3545"
                          }}
                        >
                          Pendiente de carga
                        </span>

                      )}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}


export default MisDocumentos;
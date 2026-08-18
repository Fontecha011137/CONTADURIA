import "./documentos.css";

import {
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  auth,
  db
} from "../firebaseConfig";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  subirDocumentoParaCliente
} from "../services/documentos";



function Documentos() {

  const navigate = useNavigate();


  // =========================================
  // ESTADOS
  // =========================================

  const [clientes, setClientes] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [fechaDesde, setFechaDesde] = useState("");

  const [fechaHasta, setFechaHasta] = useState("");

  const [origenFiltro, setOrigenFiltro] = useState("todos");

  const [loading, setLoading] = useState(true);


  // =========================================
  // MODAL
  // =========================================

  const [mostrarModal, setMostrarModal] = useState(false);

  const [clienteSeleccionado, setClienteSeleccionado] =
    useState(null);


  // =========================================
  // FORMULARIO
  // =========================================

  const [archivo, setArchivo] = useState(null);

  const [nombreDocumento, setNombreDocumento] =
    useState("");

  const [periodo, setPeriodo] = useState("2026");

  const [enviando, setEnviando] = useState(false);



  // =========================================
  // NORMALIZAR TEXTO
  // =========================================
  //
  // Ignora:
  // - Mayúsculas
  // - Minúsculas
  // - Tildes
  // - Puntuación
  // - Guiones
  // - Puntos
  // - Comas
  // - Espacios repetidos
  //
  // Ejemplo:
  //
  // "Óscar-Raúl, Herrera"
  //
  // queda:
  //
  // "oscar raul herrera"
  //
  // =========================================

  const normalizarTexto = (texto = "") => {

    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  };



  // =========================================
  // OBTENER FECHA DEL DOCUMENTO
  // =========================================

  const obtenerFechaDocumento = (documento) => {

    const posiblesFechas = [
      documento.fechaEnvio,
      documento.fechaCreacion,
      documento.createdAt,
      documento.fecha,
      documento.timestamp,
    ];


    for (const valor of posiblesFechas) {

      if (!valor) {
        continue;
      }


      // Timestamp de Firestore

      if (
        typeof valor === "object" &&
        typeof valor.toDate === "function"
      ) {

        const fecha = valor.toDate();

        if (!isNaN(fecha.getTime())) {
          return fecha;
        }

      }


      // Date

      if (valor instanceof Date) {

        if (!isNaN(valor.getTime())) {
          return valor;
        }

      }


      // String o número

      const fecha = new Date(valor);

      if (!isNaN(fecha.getTime())) {
        return fecha;
      }

    }


    return null;

  };



  // =========================================
  // CONVERTIR FECHA A YYYY-MM-DD
  // =========================================

  const fechaParaFiltro = (fecha) => {

    if (!fecha) {
      return "";
    }


    const year =
      fecha.getFullYear();


    const month =
      String(
        fecha.getMonth() + 1
      ).padStart(2, "0");


    const day =
      String(
        fecha.getDate()
      ).padStart(2, "0");


    return `${year}-${month}-${day}`;

  };



  // =========================================
  // FORMATEAR FECHA PARA MOSTRAR
  // =========================================

  const formatearFecha = (fecha) => {

    if (!fecha) {
      return "Sin fecha";
    }


    return fecha.toLocaleDateString(
      "es-CO",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );

  };



  // =========================================
  // CARGAR CLIENTES Y DOCUMENTOS
  // =========================================

  useEffect(() => {

    let unsubscribeUsuarios = null;

    let unsubscribeDocumentos = [];


    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {

          // =====================================
          // NO AUTENTICADO
          // =====================================

          if (!user) {

            navigate(
              "/login",
              {
                replace: true
              }
            );

            return;
          }


          // =====================================
          // LIMPIAR LISTENERS ANTERIORES
          // =====================================

          if (unsubscribeUsuarios) {
            unsubscribeUsuarios();
          }


          unsubscribeDocumentos.forEach(
            (unsubscribe) => unsubscribe()
          );

          unsubscribeDocumentos = [];


          // =====================================
          // REFERENCIA USUARIOS
          // =====================================

          const usuariosRef =
            collection(
              db,
              "usuarios"
            );


          // =====================================
          // ESCUCHAR USUARIOS
          // =====================================

          unsubscribeUsuarios =
            onSnapshot(

              usuariosRef,

              (usuariosSnapshot) => {

                // =================================
                // LIMPIAR LISTENERS DOCUMENTOS
                // =================================

                unsubscribeDocumentos.forEach(
                  (unsubscribe) => unsubscribe()
                );

                unsubscribeDocumentos = [];


                // =================================
                // OBTENER CLIENTES
                // =================================

                const clientesFirestore =
                  usuariosSnapshot.docs.filter(
                    (usuarioDoc) => {

                      const usuario =
                        usuarioDoc.data();

                      return (
                        usuario.rol === "cliente"
                      );

                    }
                  );


                // =================================
                // NO HAY CLIENTES
                // =================================

                if (
                  clientesFirestore.length === 0
                ) {

                  setClientes([]);

                  setLoading(false);

                  return;

                }


                // =================================
                // DATOS TEMPORALES
                // =================================

                const datosClientes = {};


                clientesFirestore.forEach(
                  (usuarioDoc) => {

                    const usuario =
                      usuarioDoc.data();

                    const uid =
                      usuarioDoc.id;


                    datosClientes[uid] = {

                      uid,

                      nombre:
                        usuario.nombre ||
                        "Sin nombre",

                      email:
                        usuario.email ||
                        "",

                      celular:
                        usuario.celular ||
                        "",

                      documentos: [],

                    };


                    // =================================
                    // REFERENCIA DOCUMENTOS
                    // =================================

                    const documentosRef =
                      collection(
                        db,
                        "usuarios",
                        uid,
                        "documentos"
                      );


                    // =================================
                    // LISTENER DOCUMENTOS
                    // =================================

                    const unsubscribe =
                      onSnapshot(

                        documentosRef,

                        (documentosSnapshot) => {

                          const documentos =
                            documentosSnapshot.docs.map(
                              (documentoDoc) => {

                                const documento =
                                  documentoDoc.data();


                                return {

                                  id:
                                    documentoDoc.id,

                                  uid,

                                  nombre:
                                    documento.nombre ||
                                    "Sin nombre",

                                  tipo:
                                    documento.tipo ||
                                    "Sin tipo",

                                  estado:
                                    documento.estado ||
                                    "pendiente",

                                  periodo:
                                    documento.periodo ||
                                    "",

                                  fileUrl:
                                    documento.fileUrl ||
                                    documento.url ||
                                    documento.urlArchivo ||
                                    documento.archivoURL ||
                                    documento.downloadURL ||
                                    "",

                                  enviadoPor:
                                    documento.enviadoPor ||
                                    "cliente",

                                  fechaEnvio:
                                    documento.fechaEnvio ||
                                    null,

                                  fechaCreacion:
                                    documento.fechaCreacion ||
                                    null,

                                  createdAt:
                                    documento.createdAt ||
                                    null,

                                  ...documento,

                                };

                              }
                            );


                          // =================================
                          // ACTUALIZAR CLIENTE
                          // =================================

                          datosClientes[uid] = {

                            ...datosClientes[uid],

                            documentos,

                          };


                          // =================================
                          // ACTUALIZAR LISTA
                          // =================================

                          setClientes(
                            Object.values(
                              datosClientes
                            )
                          );

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


                    unsubscribeDocumentos.push(
                      unsubscribe
                    );

                  }
                );

              },

              (error) => {

                console.error(
                  "Error cargando usuarios:",
                  error
                );

                setLoading(false);

              }

            );

        }
      );


    // =========================================
    // LIMPIEZA
    // =========================================

    return () => {

      unsubscribeAuth();


      if (unsubscribeUsuarios) {
        unsubscribeUsuarios();
      }


      unsubscribeDocumentos.forEach(
        (unsubscribe) => unsubscribe()
      );

    };

  }, [navigate]);



  // =========================================
  // CREAR LISTA GENERAL DE DOCUMENTOS
  // =========================================
  //
  // Convierte:
  //
  // Cliente
  //   ├── Documento
  //   ├── Documento
  //
  // Cliente
  //   ├── Documento
  //
  // en una sola lista.
  //
  // Esto permite buscar todos los documentos
  // sin importar el cliente.
  //
  // =========================================

  const todosLosDocumentos = useMemo(() => {

    const lista = [];


    clientes.forEach(
      (cliente) => {

        (cliente.documentos || []).forEach(
          (documento) => {

            lista.push({

              ...documento,

              clienteNombre:
                cliente.nombre || "",

              clienteEmail:
                cliente.email || "",

              clienteCelular:
                cliente.celular || "",

              fechaDocumento:
                obtenerFechaDocumento(
                  documento
                ),

            });

          }
        );

      }
    );


    // Más recientes primero

    lista.sort(
      (a, b) => {

        const fechaA =
          a.fechaDocumento?.getTime?.() || 0;

        const fechaB =
          b.fechaDocumento?.getTime?.() || 0;

        return fechaB - fechaA;

      }
    );


    return lista;

  }, [clientes]);



  // =========================================
  // FILTRAR DOCUMENTOS
  // =========================================

  const documentosFiltrados =
    useMemo(() => {

      const textoBusqueda =
        normalizarTexto(busqueda);


      return todosLosDocumentos.filter(
        (documento) => {

          // =====================================
          // TEXTO GENERAL
          // =====================================

          if (textoBusqueda) {

            const contenido = normalizarTexto(

              `${documento.clienteNombre} ` +

              `${documento.clienteEmail} ` +

              `${documento.clienteCelular} ` +

              `${documento.nombre} ` +

              `${documento.tipo} ` +

              `${documento.periodo}`

            );


            if (
              !contenido.includes(
                textoBusqueda
              )
            ) {

              return false;

            }

          }


          // =====================================
          // FILTRO ORIGEN
          // =====================================

          if (
            origenFiltro !== "todos"
          ) {

            if (
              documento.enviadoPor !==
              origenFiltro
            ) {

              return false;

            }

          }


          // =====================================
          // FILTRO FECHA DESDE
          // =====================================

          if (fechaDesde) {

            if (!documento.fechaDocumento) {
              return false;
            }


            const fechaDocumento =
              fechaParaFiltro(
                documento.fechaDocumento
              );


            if (
              fechaDocumento <
              fechaDesde
            ) {

              return false;

            }

          }


          // =====================================
          // FILTRO FECHA HASTA
          // =====================================

          if (fechaHasta) {

            if (!documento.fechaDocumento) {
              return false;
            }


            const fechaDocumento =
              fechaParaFiltro(
                documento.fechaDocumento
              );


            if (
              fechaDocumento >
              fechaHasta
            ) {

              return false;

            }

          }


          return true;

        }
      );

    }, [
      todosLosDocumentos,
      busqueda,
      fechaDesde,
      fechaHasta,
      origenFiltro
    ]);



  // =========================================
  // CLIENTES FILTRADOS
  // =========================================
  //
  // Mantiene las tarjetas de clientes.
  // Si existe una búsqueda/filtro, solamente
  // mostramos clientes que tienen documentos
  // coincidentes.
  //
  // =========================================

  const clientesFiltrados =
    useMemo(() => {

      const idsClientes =
        new Set(
          documentosFiltrados.map(
            (documento) =>
              documento.uid
          )
        );


      const hayFiltros =
        Boolean(
          busqueda.trim() ||
          fechaDesde ||
          fechaHasta ||
          origenFiltro !== "todos"
        );


      if (!hayFiltros) {
        return clientes;
      }


      return clientes.filter(
        (cliente) =>
          idsClientes.has(
            cliente.uid
          )
      );

    }, [
      clientes,
      documentosFiltrados,
      busqueda,
      fechaDesde,
      fechaHasta,
      origenFiltro
    ]);



  // =========================================
  // TOTAL DOCUMENTOS
  // =========================================

  const totalDocumentos =
    todosLosDocumentos.length;



  // =========================================
  // LIMPIAR FILTROS
  // =========================================

  const limpiarFiltros = () => {

    setBusqueda("");

    setFechaDesde("");

    setFechaHasta("");

    setOrigenFiltro("todos");

  };



  // =========================================
  // ABRIR DOCUMENTO
  // =========================================

  const abrirDocumento =
    (documento) => {

      const url =
        documento.fileUrl ||
        documento.url ||
        documento.urlArchivo ||
        documento.archivoURL ||
        documento.downloadURL;


      if (!url) {

        alert(
          "Este documento no tiene una URL disponible."
        );

        return;

      }


      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

    };



  // =========================================
  // ABRIR MODAL
  // =========================================

  const abrirEnviarDocumento =
    (cliente) => {

      setClienteSeleccionado(
        cliente
      );

      setArchivo(null);

      setNombreDocumento("");

      setPeriodo("2026");

      setMostrarModal(true);

    };



  // =========================================
  // CERRAR MODAL
  // =========================================

  const cerrarModal =
    () => {

      if (enviando) {
        return;
      }


      setMostrarModal(false);

      setClienteSeleccionado(null);

      setArchivo(null);

      setNombreDocumento("");

      setPeriodo("2026");

    };



  // =========================================
  // ENVIAR DOCUMENTO
  // =========================================

  const enviarDocumento =
    async () => {

      if (!clienteSeleccionado) {

        alert(
          "No se ha seleccionado ningún cliente."
        );

        return;

      }


      if (!archivo) {

        alert(
          "Selecciona un archivo."
        );

        return;

      }


      if (!nombreDocumento.trim()) {

        alert(
          "Escribe el nombre del documento."
        );

        return;

      }


      try {

        setEnviando(true);


        await subirDocumentoParaCliente(

          archivo,

          clienteSeleccionado.uid,

          {

            nombre:
              nombreDocumento.trim(),

            tipo:
              archivo.type,

            periodo:
              periodo.trim(),

            // =================================
            // FECHA DE ENVÍO
            // =================================
            //
            // IMPORTANTE:
            // El servicio documentos.js debe
            // guardar este campo.
            //
            fechaEnvio:
              serverTimestamp(),

            enviadoPor:
              "contador",

            estado:
              "enviado",

          }

        );


        alert(
          `✅ Documento enviado correctamente a ${clienteSeleccionado.nombre}`
        );


        setMostrarModal(false);

        setClienteSeleccionado(null);

        setArchivo(null);

        setNombreDocumento("");

        setPeriodo("2026");

      } catch (error) {

        console.error(
          "Error enviando documento:",
          error
        );


        alert(
          "❌ No se pudo enviar el documento."
        );

      } finally {

        setEnviando(false);

      }

    };



  // =========================================
  // CARGANDO
  // =========================================

  if (loading) {

    return (

      <div className="documentos-page">

        <div className="mensaje-documentos">

          <h3>
            Cargando documentos...
          </h3>

          <p>
            Estamos consultando los documentos
            de los clientes.
          </p>

        </div>

      </div>

    );

  }



  // =========================================
  // INTERFAZ
  // =========================================

  return (

    <div className="documentos-page">


      {/* =====================================
          VOLVER
      ====================================== */}

      <button
        className="btn-volver-documentos"
        onClick={() =>
          navigate("/contador")
        }
      >
        ← Volver al panel
      </button>



      {/* =====================================
          ENCABEZADO
      ====================================== */}

      <div className="documentos-header">

        <div>

          <h1>
            Documentos
          </h1>

          <p>
            Gestión de documentos de los clientes
          </p>

        </div>


        <div className="documentos-total">

          <strong>
            {totalDocumentos}
          </strong>

          <span>
            Documentos
          </span>

        </div>

      </div>



      {/* =====================================
          FILTROS
      ====================================== */}

      <div className="documentos-filtros">


        {/* ===================================
            BUSQUEDA GENERAL
        =================================== */}

    {/* ===================================
    BUSQUEDA GENERAL
=================================== */}

<div className="documentos-busqueda-contenedor">

  <div className="documentos-busqueda">

    <input
      type="text"
      value={busqueda}
      onChange={(e) =>
        setBusqueda(e.target.value)
      }
      placeholder="🔎 Buscar cliente, documento, correo, celular..."
    />

  </div>


  <button
    type="button"
    className="btn-limpiar-documentos"
    onClick={() => setBusqueda("")}
  >
    ✕ Limpiar búsqueda
  </button>

</div>



        {/* ===================================
            FECHA DESDE
        =================================== */}

        <div className="filtro-documento">

          <label>
            Fecha desde
          </label>

          <input
            type="date"
            value={fechaDesde}
            onChange={(e) =>
              setFechaDesde(
                e.target.value
              )
            }
          />

        </div>



        {/* ===================================
            FECHA HASTA
        =================================== */}

        <div className="filtro-documento">

          <label>
            Fecha hasta
          </label>

          <input
            type="date"
            value={fechaHasta}
            onChange={(e) =>
              setFechaHasta(
                e.target.value
              )
            }
          />

        </div>



        {/* ===================================
            ORIGEN
        =================================== */}

        <div className="filtro-documento">

          <label>
            Origen
          </label>

          <select
            value={origenFiltro}
            onChange={(e) =>
              setOrigenFiltro(
                e.target.value
              )
            }
          >

            <option value="todos">
              Todos
            </option>

            <option value="cliente">
              📥 Recibidos del cliente
            </option>

            <option value="contador">
              📤 Enviados por contador
            </option>

          </select>

        </div>



        {/* ===================================
            LIMPIAR
        =================================== */}

        <button
          className="btn-limpiar-documentos"
          onClick={limpiarFiltros}
        >
          ✕ Limpiar filtros
        </button>

      </div>



      {/* =====================================
          RESULTADOS
      ====================================== */}

      <div className="documentos-resultados">

        <strong>
          {documentosFiltrados.length}
        </strong>

        <span>
          documentos encontrados
        </span>

      </div>



      {/* =====================================
          SIN RESULTADOS
      ====================================== */}

      {documentosFiltrados.length === 0 ? (

        <div className="mensaje-documentos">

          <h3>

            {todosLosDocumentos.length === 0
              ? "No hay documentos"
              : "No se encontraron resultados"
            }

          </h3>


          <p>

            {todosLosDocumentos.length === 0
              ? "Los documentos de los clientes aparecerán aquí."
              : "Prueba con otro cliente, documento, fecha u origen."
            }

          </p>

        </div>

      ) : (


        <>
          {/* =====================================
              HISTORIAL GENERAL
          ====================================== */}

          <div className="historial-documentos">

            <div className="historial-documentos-header">

              <h2>
                Historial de documentos
              </h2>

              <span>
                {documentosFiltrados.length} resultado(s)
              </span>

            </div>


            <div className="lista-historial-documentos">

              {documentosFiltrados.map(
                (documento) => (

                  <div
                    className="historial-documento"
                    key={`${documento.uid}-${documento.id}`}
                  >


                    {/* =============================
                        FECHA
                    ============================== */}

                    <div className="historial-fecha">

                      <strong>
                        {formatearFecha(
                          documento.fechaDocumento
                        )}
                      </strong>

                    </div>



                    {/* =============================
                        CLIENTE
                    ============================== */}

                    <div className="historial-cliente">

                      <div className="historial-avatar">

                        {(
                          documento.clienteNombre ||
                          "C"
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>


                      <div>

                        <strong>
                          {documento.clienteNombre}
                        </strong>

                        <small>
                          {documento.clienteEmail}
                        </small>

                        {documento.clienteCelular && (

                          <small>
                            📱 {documento.clienteCelular}
                          </small>

                        )}

                      </div>

                    </div>



                    {/* =============================
                        DOCUMENTO
                    ============================== */}

                    <div className="historial-nombre">

                      <strong>
                        📄 {documento.nombre}
                      </strong>

                      <small>

                        {documento.tipo}

                        {" • "}

                        {documento.periodo}

                      </small>

                    </div>



                    {/* =============================
                        ORIGEN
                    ============================== */}

                    <div className="historial-origen">

                      {documento.enviadoPor ===
                      "contador" ? (

                        <span className="origen-contador">
                          📤 Contador
                        </span>

                      ) : (

                        <span className="origen-cliente">
                          📥 Cliente
                        </span>

                      )}

                    </div>



                    {/* =============================
                        ESTADO
                    ============================== */}

                    <div className="historial-estado">

                      <span
                        className={
                          `estado estado-${
                            (
                              documento.estado ||
                              "pendiente"
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )
                          }`
                        }
                      >

                        {documento.estado}

                      </span>

                    </div>



                    {/* =============================
                        VER
                    ============================== */}

                    <div className="historial-accion">

                      {(
                        documento.fileUrl ||
                        documento.url ||
                        documento.urlArchivo ||
                        documento.archivoURL ||
                        documento.downloadURL
                      ) && (

                        <button
                          className="btn-ver-documento"
                          onClick={() =>
                            abrirDocumento(
                              documento
                            )
                          }
                        >
                          Ver
                        </button>

                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          </div>



          {/* =====================================
              TARJETAS CLIENTES
          ====================================== */}

          <div className="lista-clientes-documentos">

            {clientesFiltrados.map(
              (cliente) => {

                const documentosCliente =
                  documentosFiltrados.filter(
                    (documento) =>
                      documento.uid ===
                      cliente.uid
                  );


                const documentosRecibidos =
                  documentosCliente.filter(
                    (documento) =>
                      documento.enviadoPor !==
                      "contador"
                  ).length;


                const documentosEnviados =
                  documentosCliente.filter(
                    (documento) =>
                      documento.enviadoPor ===
                      "contador"
                  ).length;


                return (

                  <div
                    className="cliente-documentos-card"
                    key={cliente.uid}
                  >


                    {/* =============================
                        INFORMACIÓN CLIENTE
                    ============================== */}

                    <div className="cliente-documentos-info">

                      <div className="cliente-documentos-avatar">

                        {(
                          cliente.nombre ||
                          "C"
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>


                      <div>

                        <h2>
                          {cliente.nombre}
                        </h2>

                        <p>
                          {cliente.email}
                        </p>

                        {cliente.celular && (

                          <small>
                            📱 {cliente.celular}
                          </small>

                        )}

                      </div>

                    </div>



                    {/* =============================
                        ESTADÍSTICAS
                    ============================== */}

                    <div className="cliente-documentos-stats">


                      <div className="cliente-stat">

                        <strong>
                          {documentosCliente.length}
                        </strong>

                        <span>
                          Documentos
                        </span>

                      </div>


                      <div className="cliente-stat">

                        <strong>
                          {documentosRecibidos}
                        </strong>

                        <span>
                          Recibidos
                        </span>

                      </div>


                      <div className="cliente-stat">

                        <strong>
                          {documentosEnviados}
                        </strong>

                        <span>
                          Enviados
                        </span>

                      </div>

                    </div>



                    {/* =============================
                        ACCIONES
                    ============================== */}

                    <div className="cliente-documentos-acciones">

                      <button
                        className="btn-enviar-documento"
                        onClick={() =>
                          abrirEnviarDocumento(
                            cliente
                          )
                        }
                      >
                        📤 Enviar documento
                      </button>

                    </div>



                    {/* =============================
                        DOCUMENTOS CLIENTE
                    ============================== */}

                    {documentosCliente.length > 0 && (

                      <div className="cliente-documentos-lista">

                        <h3>
                          Documentos
                        </h3>


                        <div className="mini-tabla-documentos">

                          {documentosCliente.map(
                            (documento) => (

                              <div
                                className="mini-documento"
                                key={documento.id}
                              >


                                <div>

                                  <strong>
                                    {documento.nombre}
                                  </strong>

                                  <small>

                                    {formatearFecha(
                                      documento.fechaDocumento
                                    )}

                                    {" • "}

                                    {documento.tipo}

                                    {" • "}

                                    {documento.periodo}

                                  </small>

                                </div>


                                <div className="mini-documento-derecha">

                                  <span
                                    className={
                                      `estado estado-${
                                        (
                                          documento.estado ||
                                          "pendiente"
                                        )
                                          .toLowerCase()
                                          .replace(
                                            /\s+/g,
                                            "-"
                                          )
                                      }`
                                    }
                                  >
                                    {documento.estado}
                                  </span>


                                  {documento.enviadoPor ===
                                  "contador" ? (

                                    <span className="origen-contador">
                                      📤 Contador
                                    </span>

                                  ) : (

                                    <span className="origen-cliente">
                                      📥 Cliente
                                    </span>

                                  )}


                                  {(
                                    documento.fileUrl ||
                                    documento.url ||
                                    documento.urlArchivo ||
                                    documento.archivoURL ||
                                    documento.downloadURL
                                  ) && (

                                    <button
                                      className="btn-ver-documento"
                                      onClick={() =>
                                        abrirDocumento(
                                          documento
                                        )
                                      }
                                    >
                                      Ver
                                    </button>

                                  )}

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )}

                  </div>

                );

              }
            )}

          </div>

        </>

      )}



      {/* =====================================
          MODAL ENVIAR DOCUMENTO
      ====================================== */}

      {mostrarModal && (

        <div
          className="modal-documentos"
          onClick={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {

              cerrarModal();

            }

          }}
        >

          <div className="modal-documentos-contenido">


            {/* =================================
                HEADER
            ================================= */}

            <div className="modal-documentos-header">

              <div>

                <h2>
                  📤 Enviar documento
                </h2>

                <p>
                  Documento para el cliente
                </p>

              </div>


              <button
                className="btn-cerrar-modal"
                onClick={cerrarModal}
                disabled={enviando}
              >
                ✕
              </button>

            </div>



            {/* =================================
                CLIENTE
            ================================= */}

            <div className="cliente-destino">

              <span>
                Cliente seleccionado
              </span>

              <strong>
                {clienteSeleccionado?.nombre}
              </strong>

              <small>
                {clienteSeleccionado?.email}
              </small>

              {clienteSeleccionado?.celular && (

                <small>
                  📱 {clienteSeleccionado.celular}
                </small>

              )}

            </div>



            {/* =================================
                NOMBRE
            ================================= */}

            <label>
              Nombre del documento
            </label>

            <input
              type="text"
              value={nombreDocumento}
              onChange={(e) =>
                setNombreDocumento(
                  e.target.value
                )
              }
              placeholder="Ej: Declaración de renta 2025"
              disabled={enviando}
            />



            {/* =================================
                PERIODO
            ================================= */}

            <label>
              Periodo
            </label>

            <input
              type="text"
              value={periodo}
              onChange={(e) =>
                setPeriodo(
                  e.target.value
                )
              }
              placeholder="Ej: 2026"
              disabled={enviando}
            />



            {/* =================================
                ARCHIVO
            ================================= */}

            <label>
              Archivo
            </label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
              onChange={(e) => {

                setArchivo(
                  e.target.files?.[0] ||
                  null
                );

              }}
              disabled={enviando}
            />



            {/* =================================
                ARCHIVO SELECCIONADO
            ================================= */}

            {archivo && (

              <div className="archivo-seleccionado">

                <span>
                  📄
                </span>

                <strong>
                  {archivo.name}
                </strong>

              </div>

            )}



            {/* =================================
                BOTONES
            ================================= */}

            <div className="modal-documentos-acciones">

              <button
                className="btn-cancelar-modal"
                onClick={cerrarModal}
                disabled={enviando}
              >
                Cancelar
              </button>


              <button
                className="btn-confirmar-envio"
                onClick={enviarDocumento}
                disabled={
                  enviando ||
                  !archivo ||
                  !nombreDocumento.trim()
                }
              >

                {enviando
                  ? "⏳ Enviando..."
                  : "📤 Enviar documento"
                }

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default Documentos;

import "./facturacion.css";

import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp
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


function Facturacion() {

  const navigate = useNavigate();


  // =========================================
  // ESTADOS
  // =========================================

  const [registros, setRegistros] = useState([]);

  const [clientes, setClientes] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [clienteSeleccionado, setClienteSeleccionado] =
    useState(null);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [guardando, setGuardando] = useState(false);


  // =========================================
  // FORMULARIO
  // =========================================

  const [formulario, setFormulario] = useState({

    uidCliente: "",

    cliente: "",

    concepto: "",

    periodo:
      new Date().getFullYear().toString(),

    valor: "",

    pagado: ""

  });


  // =========================================
  // CARGAR CLIENTES Y FACTURACIÓN
  // =========================================

  useEffect(() => {

    let unsubscribeUsuarios = null;

    let unsubscribeFacturacion = null;


    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {


          // =====================================
          // NO AUTENTICADO
          // =====================================

          if (!user) {

            navigate("/login", {
              replace: true
            });

            return;

          }


          // =====================================
          // CLIENTES
          // =====================================

          const usuariosRef =
            collection(
              db,
              "usuarios"
            );


          unsubscribeUsuarios =
            onSnapshot(
              usuariosRef,

              (snapshot) => {

                const listaClientes =
                  snapshot.docs

                    .map((documento) => {

                      const data =
                        documento.data();


                      return {

                        uid:
                          documento.id,

                        nombre:
                          data.nombre ||
                          "Sin nombre",

                        email:
                          data.email ||
                          "",

                        celular:
                          data.celular ||
                          "",

                        rol:
                          data.rol ||
                          ""

                      };

                    })

                    .filter(
                      (cliente) =>
                        cliente.rol === "cliente"
                    )

                    .sort(
                      (a, b) =>
                        a.nombre.localeCompare(
                          b.nombre
                        )
                    );


                setClientes(
                  listaClientes
                );

              },

              (error) => {

                console.error(
                  "Error cargando clientes:",
                  error
                );

              }

            );


          // =====================================
          // FACTURACIÓN
          // =====================================

          const facturacionRef =
            collection(
              db,
              "facturacion"
            );


          unsubscribeFacturacion =
            onSnapshot(
              facturacionRef,

              (snapshot) => {

                const lista =
                  snapshot.docs.map(
                    (documento) => {

                      const data =
                        documento.data();


                      const valor =
                        Number(
                          data.valor || 0
                        );


                      const pagado =
                        Number(
                          data.pagado || 0
                        );


                      const saldo =
                        Math.max(
                          valor - pagado,
                          0
                        );


                      let estado =
                        "pendiente";


                      if (
                        saldo <= 0 &&
                        valor > 0
                      ) {

                        estado =
                          "pagado";

                      } else if (
                        pagado > 0
                      ) {

                        estado =
                          "abono";

                      } else {

                        estado =
                          "pendiente";

                      }


                      return {

                        id:
                          documento.id,

                        ...data,

                        valor,

                        pagado,

                        saldo,

                        estado

                      };

                    }
                  );


                setRegistros(
                  lista
                );

                setLoading(false);

              },

              (error) => {

                console.error(
                  "Error cargando facturación:",
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


      if (unsubscribeFacturacion) {

        unsubscribeFacturacion();

      }

    };

  }, [navigate]);


  // =========================================
  // FORMATEAR MONEDA
  // =========================================

  const formatoMoneda = (valor) => {

    return new Intl.NumberFormat(
      "es-CO",
      {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
      }
    ).format(
      Number(valor || 0)
    );

  };


  // =========================================
  // ESTADÍSTICAS GENERALES
  // =========================================

  const resumen =
    useMemo(() => {

      const totalGenerado =
        registros.reduce(
          (total, registro) =>
            total +
            Number(
              registro.valor || 0
            ),
          0
        );


      const totalPagado =
        registros.reduce(
          (total, registro) =>
            total +
            Number(
              registro.pagado || 0
            ),
          0
        );


      const totalPendiente =
        registros.reduce(
          (total, registro) =>
            total +
            Number(
              registro.saldo || 0
            ),
          0
        );


      const clientesConSaldo =
        new Set(
          registros
            .filter(
              (registro) =>
                Number(
                  registro.saldo || 0
                ) > 0
            )
            .map(
              (registro) =>
                registro.uidCliente
            )
        ).size;


      return {

        totalGenerado,

        totalPagado,

        totalPendiente,

        clientesConSaldo

      };

    }, [registros]);


  // =========================================
  // CLIENTES FILTRADOS
  // =========================================

  const clientesFiltrados =
    clientes.filter(
      (cliente) => {

        const texto =
          busqueda
            .toLowerCase()
            .trim();


        if (!texto) {

          return true;

        }


        return (

          cliente.nombre
            .toLowerCase()
            .includes(texto)

          ||

          cliente.email
            .toLowerCase()
            .includes(texto)

          ||

          cliente.celular
            .toLowerCase()
            .includes(texto)

        );

      }
    );


  // =========================================
  // REGISTROS DEL CLIENTE
  // =========================================

  const registrosCliente =
    clienteSeleccionado

      ? registros.filter(
          (registro) =>
            registro.uidCliente ===
            clienteSeleccionado.uid
        )

      : [];


  // =========================================
  // TOTALES DEL CLIENTE
  // =========================================

  const resumenCliente =
    useMemo(() => {

      return registrosCliente.reduce(
        (resultado, registro) => {

          resultado.valor +=
            Number(
              registro.valor || 0
            );


          resultado.pagado +=
            Number(
              registro.pagado || 0
            );


          resultado.saldo +=
            Number(
              registro.saldo || 0
            );


          return resultado;

        },

        {
          valor: 0,
          pagado: 0,
          saldo: 0
        }

      );

    }, [registrosCliente]);


  // =========================================
  // SELECCIONAR CLIENTE
  // =========================================

  const seleccionarCliente =
    (cliente) => {

      setClienteSeleccionado(
        cliente
      );


      setFormulario({

        uidCliente:
          cliente.uid,

        cliente:
          cliente.nombre,

        concepto:
          "",

        periodo:
          new Date()
            .getFullYear()
            .toString(),

        valor:
          "",

        pagado:
          ""

      });


      setMostrarFormulario(
        false
      );

    };


  // =========================================
  // CAMBIAR FORMULARIO
  // =========================================

  const cambiarFormulario =
    (e) => {

      const {
        name,
        value
      } = e.target;


      setFormulario(
        (anterior) => ({
          ...anterior,
          [name]: value
        })
      );

    };


  // =========================================
  // AGREGAR CONCEPTO
  // =========================================

  const agregarConcepto =
    async (e) => {

      e.preventDefault();


      if (!formulario.uidCliente) {

        alert(
          "Selecciona un cliente."
        );

        return;

      }


      if (
        !formulario.concepto.trim()
      ) {

        alert(
          "Escribe el concepto."
        );

        return;

      }


      const valor =
        Number(
          formulario.valor
        );


      const pagado =
        Number(
          formulario.pagado || 0
        );


      if (
        !valor ||
        valor <= 0
      ) {

        alert(
          "Ingresa un valor válido."
        );

        return;

      }


      if (
        pagado < 0 ||
        pagado > valor
      ) {

        alert(
          "El valor pagado no puede ser mayor que el valor del concepto."
        );

        return;

      }


      const saldo =
        valor - pagado;


      let estado =
        "pendiente";


      if (saldo === 0) {

        estado =
          "pagado";

      } else if (
        pagado > 0
      ) {

        estado =
          "abono";

      }


      try {

        setGuardando(true);


        await addDoc(
          collection(
            db,
            "facturacion"
          ),
          {

            uidCliente:
              formulario.uidCliente,

            cliente:
              formulario.cliente,

            concepto:
              formulario.concepto.trim(),

            periodo:
              formulario.periodo,

            valor,

            pagado,

            saldo,

            estado,

            fecha:
              serverTimestamp()

          }
        );


        alert(
          "✅ Concepto agregado correctamente."
        );


        setFormulario(
          (anterior) => ({

            ...anterior,

            concepto:
              "",

            valor:
              "",

            pagado:
              ""

          })
        );


        setMostrarFormulario(
          false
        );


      } catch (error) {

        console.error(
          "Error agregando concepto:",
          error
        );


        alert(
          "❌ No fue posible guardar el concepto."
        );

      } finally {

        setGuardando(false);

      }

    };


  // =========================================
  // CARGANDO
  // =========================================

  if (loading) {

    return (

      <div className="facturacion-page">

        <div className="facturacion-cargando">

          Cargando facturación...

        </div>

      </div>

    );

  }


  // =========================================
  // INTERFAZ
  // =========================================

  return (

    <div className="facturacion-page">


      {/* =====================================
          VOLVER
      ====================================== */}

      <button
        className="btn-volver-facturacion"
        onClick={() =>
          navigate("/contador")
        }
      >
        ← Volver al panel
      </button>


      {/* =====================================
          ENCABEZADO
      ====================================== */}

      <div className="facturacion-header">

        <div>

          <h1>
            Facturación
          </h1>

          <p>
            Control de conceptos, pagos y saldos de los clientes
          </p>

        </div>

      </div>


      {/* =====================================
          RESUMEN
      ====================================== */}

      <div className="facturacion-resumen">


        <div className="facturacion-card">

          <span>
            Total generado
          </span>

          <strong>
            {formatoMoneda(
              resumen.totalGenerado
            )}
          </strong>

        </div>


        <div className="facturacion-card">

          <span>
            Total cobrado
          </span>

          <strong>
            {formatoMoneda(
              resumen.totalPagado
            )}
          </strong>

        </div>


        <div className="facturacion-card">

          <span>
            Total pendiente
          </span>

          <strong>
            {formatoMoneda(
              resumen.totalPendiente
            )}
          </strong>

        </div>


        <div className="facturacion-card">

          <span>
            Clientes con saldo
          </span>

          <strong>
            {resumen.clientesConSaldo}
          </strong>

        </div>

      </div>


      {/* =====================================
          BUSCADOR
      ====================================== */}

      <div className="facturacion-buscador">

        <input
          type="text"
          value={busqueda}
          onChange={(e) =>
            setBusqueda(
              e.target.value
            )
          }
          placeholder="🔎 Buscar cliente..."
        />

      </div>


      {/* =====================================
          CONTENIDO
      ====================================== */}

      <div className="facturacion-contenido">


        {/* ===================================
            LISTA CLIENTES
        ==================================== */}

        <div className="lista-clientes">

          <div className="lista-clientes-header">

            <h2>
              Clientes
            </h2>

            <span>
              {clientesFiltrados.length}
            </span>

          </div>


          {clientesFiltrados.length === 0 ? (

            <div className="sin-clientes">

              No hay clientes encontrados.

            </div>

          ) : (

            clientesFiltrados.map(
              (cliente) => {


                // IMPORTANTE:
                // No usamos "const registros"
                // porque ya existe el estado
                // registros.

                const registrosClienteLista =
                  registros.filter(
                    (registro) =>
                      registro.uidCliente ===
                      cliente.uid
                  );


                const saldo =
                  registrosClienteLista.reduce(
                    (total, registro) =>
                      total +
                      Number(
                        registro.saldo || 0
                      ),
                    0
                  );


                const activo =
                  clienteSeleccionado?.uid ===
                  cliente.uid;


                return (

                  <button
                    key={cliente.uid}
                    type="button"
                    className={
                      `cliente-item ${
                        activo
                          ? "cliente-item-activo"
                          : ""
                      }`
                    }
                    onClick={() =>
                      seleccionarCliente(
                        cliente
                      )
                    }
                  >

                    <div>

                      <strong>
                        {cliente.nombre}
                      </strong>

                      <small>
                        {cliente.email}
                      </small>

                    </div>


                    <span
                      className={
                        saldo > 0
                          ? "cliente-saldo"
                          : "cliente-al-dia"
                      }
                    >

                      {saldo > 0

                        ? formatoMoneda(
                            saldo
                          )

                        : "Al día"

                      }

                    </span>

                  </button>

                );

              }
            )

          )}

        </div>


        {/* ===================================
            DETALLE
        ==================================== */}

        <div className="facturacion-detalle">


          {!clienteSeleccionado ? (

            <div className="detalle-vacio">

              <div>
                💰
              </div>

              <h2>
                Selecciona un cliente
              </h2>

              <p>
                Selecciona un cliente para consultar
                sus conceptos, pagos y saldo pendiente.
              </p>

            </div>

          ) : (

            <>


              {/* ==============================
                  CABECERA CLIENTE
              =============================== */}

              <div className="cliente-detalle-header">

                <div>

                  <h2>
                    {clienteSeleccionado.nombre}
                  </h2>

                  <p>
                    {clienteSeleccionado.email}
                  </p>

                  {clienteSeleccionado.celular && (

                    <small>
                      {clienteSeleccionado.celular}
                    </small>

                  )}

                </div>


                <button
                  type="button"
                  className="btn-agregar-concepto"
                  onClick={() =>
                    setMostrarFormulario(
                      !mostrarFormulario
                    )
                  }
                >
                  + Agregar concepto
                </button>

              </div>


              {/* ==============================
                  RESUMEN CLIENTE
              =============================== */}

              <div className="cliente-resumen">


                <div>

                  <span>
                    Generado
                  </span>

                  <strong>
                    {formatoMoneda(
                      resumenCliente.valor
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Pagado
                  </span>

                  <strong>
                    {formatoMoneda(
                      resumenCliente.pagado
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Saldo
                  </span>

                  <strong>
                    {formatoMoneda(
                      resumenCliente.saldo
                    )}
                  </strong>

                </div>

              </div>


              {/* ==============================
                  FORMULARIO
              =============================== */}

              {mostrarFormulario && (

                <form
                  className="formulario-facturacion"
                  onSubmit={
                    agregarConcepto
                  }
                >

                  <h3>
                    Agregar concepto
                  </h3>


                  <div className="form-grid">


                    <div>

                      <label>
                        Concepto
                      </label>

                      <input
                        type="text"
                        name="concepto"
                        value={
                          formulario.concepto
                        }
                        onChange={
                          cambiarFormulario
                        }
                        placeholder="Ej. Contabilidad mensual"
                      />

                    </div>


                    <div>

                      <label>
                        Período
                      </label>

                      <input
                        type="text"
                        name="periodo"
                        value={
                          formulario.periodo
                        }
                        onChange={
                          cambiarFormulario
                        }
                        placeholder="Ej. Agosto 2026"
                      />

                    </div>


                    <div>

                      <label>
                        Valor
                      </label>

                      <input
                        type="number"
                        name="valor"
                        value={
                          formulario.valor
                        }
                        onChange={
                          cambiarFormulario
                        }
                        min="0"
                        placeholder="0"
                      />

                    </div>


                    <div>

                      <label>
                        Pago inicial
                      </label>

                      <input
                        type="number"
                        name="pagado"
                        value={
                          formulario.pagado
                        }
                        onChange={
                          cambiarFormulario
                        }
                        min="0"
                        placeholder="0"
                      />

                    </div>

                  </div>


                  <div className="formulario-botones">

                    <button
                      type="button"
                      className="btn-cancelar"
                      onClick={() =>
                        setMostrarFormulario(
                          false
                        )
                      }
                    >
                      Cancelar
                    </button>


                    <button
                      type="submit"
                      className="btn-guardar"
                      disabled={
                        guardando
                      }
                    >

                      {guardando

                        ? "Guardando..."

                        : "Guardar concepto"

                      }

                    </button>

                  </div>

                </form>

              )}


              {/* ==============================
                  TABLA
              =============================== */}

              {registrosCliente.length === 0 ? (

                <div className="sin-registros">

                  <h3>
                    No hay conceptos registrados
                  </h3>

                  <p>
                    Agrega el primer concepto para este cliente.
                  </p>

                </div>

              ) : (

                <div className="tabla-facturacion">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          Concepto
                        </th>

                        <th>
                          Período
                        </th>

                        <th>
                          Valor
                        </th>

                        <th>
                          Pagado
                        </th>

                        <th>
                          Saldo
                        </th>

                        <th>
                          Estado
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {registrosCliente.map(
                        (registro) => (

                          <tr
                            key={
                              registro.id
                            }
                          >

                            <td>

                              <strong>
                                {registro.concepto}
                              </strong>

                            </td>


                            <td>
                              {registro.periodo}
                            </td>


                            <td>
                              {formatoMoneda(
                                registro.valor
                              )}
                            </td>


                            <td>
                              {formatoMoneda(
                                registro.pagado
                              )}
                            </td>


                            <td>

                              <strong>
                                {formatoMoneda(
                                  registro.saldo
                                )}
                              </strong>

                            </td>


                            <td>

                              <span
                                className={
                                  `estado-facturacion estado-${registro.estado}`
                                }
                              >
                                {registro.estado}
                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </>

          )}

        </div>

      </div>

    </div>

  );

}


export default Facturacion;


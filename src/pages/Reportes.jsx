import "./reportes.css";

import {
  collection,
  onSnapshot
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


function Reportes() {

  const navigate = useNavigate();

  // =========================================
  // ESTADOS
  // =========================================

  const [registros, setRegistros] = useState([]);

  const [loading, setLoading] = useState(true);


  // =========================================
  // CARGAR FACTURACIÓN
  // =========================================

  useEffect(() => {

    let unsubscribeFacturacion = null;


    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {

          if (!user) {

            navigate("/login", {
              replace: true
            });

            return;

          }


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
                  "Error cargando reportes:",
                  error
                );

                setLoading(false);

              }

            );

        }
      );


    return () => {

      unsubscribeAuth();


      if (
        unsubscribeFacturacion
      ) {

        unsubscribeFacturacion();

      }

    };

  }, [navigate]);


  // =========================================
  // FORMATO MONEDA
  // =========================================

  const formatoMoneda =
    (valor) => {

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

  const estadisticas =
    useMemo(() => {

      const totalGenerado =
        registros.reduce(
          (total, registro) =>
            total +
            registro.valor,
          0
        );


      const totalPagado =
        registros.reduce(
          (total, registro) =>
            total +
            registro.pagado,
          0
        );


      const totalPendiente =
        registros.reduce(
          (total, registro) =>
            total +
            registro.saldo,
          0
        );


      const facturasPagadas =
        registros.filter(
          (registro) =>
            registro.estado ===
            "pagado"
        ).length;


      const facturasAbono =
        registros.filter(
          (registro) =>
            registro.estado ===
            "abono"
        ).length;


      const facturasPendientes =
        registros.filter(
          (registro) =>
            registro.estado ===
            "pendiente"
        ).length;


      const clientesConSaldo =
        new Set(
          registros
            .filter(
              (registro) =>
                registro.saldo > 0
            )
            .map(
              (registro) =>
                registro.uidCliente
            )
        ).size;


      const porcentajeCobrado =
        totalGenerado > 0
          ? (
              totalPagado /
              totalGenerado
            ) * 100
          : 0;


      return {

        totalGenerado,

        totalPagado,

        totalPendiente,

        facturasPagadas,

        facturasAbono,

        facturasPendientes,

        clientesConSaldo,

        porcentajeCobrado

      };

    }, [registros]);


  // =========================================
  // FACTURACIÓN POR PERÍODO
  // =========================================

  const estadisticasPeriodo =
    useMemo(() => {

      const agrupado = {};


      registros.forEach(
        (registro) => {

          const periodo =
            registro.periodo ||
            "Sin período";


          if (
            !agrupado[periodo]
          ) {

            agrupado[periodo] = {

              periodo,

              generado: 0,

              pagado: 0,

              pendiente: 0,

              cantidad: 0

            };

          }


          agrupado[periodo].generado +=
            registro.valor;


          agrupado[periodo].pagado +=
            registro.pagado;


          agrupado[periodo].pendiente +=
            registro.saldo;


          agrupado[periodo].cantidad +=
            1;

        }
      );


      return Object.values(
        agrupado
      ).sort(
        (a, b) =>
          b.generado -
          a.generado
      );

    }, [registros]);


  // =========================================
  // CLIENTES CON MAYOR FACTURACIÓN
  // =========================================

  const rankingClientes =
    useMemo(() => {

      const clientes = {};


      registros.forEach(
        (registro) => {

          const uid =
            registro.uidCliente ||
            registro.cliente ||
            "sin-cliente";


          if (
            !clientes[uid]
          ) {

            clientes[uid] = {

              cliente:
                registro.cliente ||
                "Sin nombre",

              generado: 0,

              pagado: 0,

              pendiente: 0

            };

          }


          clientes[uid].generado +=
            registro.valor;


          clientes[uid].pagado +=
            registro.pagado;


          clientes[uid].pendiente +=
            registro.saldo;

        }
      );


      return Object.values(
        clientes
      )
        .sort(
          (a, b) =>
            b.generado -
            a.generado
        )
        .slice(
          0,
          10
        );

    }, [registros]);


  // =========================================
  // MÁXIMO PARA GRÁFICA
  // =========================================

  const maxPeriodo =
    Math.max(
      ...estadisticasPeriodo.map(
        (item) =>
          item.generado
      ),
      1
    );


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="reportes-page">

        <div className="reportes-cargando">

          Cargando estadísticas...

        </div>

      </div>

    );

  }


  // =========================================
  // INTERFAZ
  // =========================================

  return (

    <div className="reportes-page">


      {/* =====================================
          HEADER
      ====================================== */}

      <header className="reportes-header">

        <div>

          <h1>
            📈 Reportes de Facturación
          </h1>

          <p>
            Estadísticas generales de la facturación
          </p>

        </div>


     <button
  className="btn-volver-reportes"
  onClick={() => navigate("/contador")}
>
  ← Volver al panel
</button>

      </header>


      {/* =====================================
          TARJETAS PRINCIPALES
      ====================================== */}

      <section className="reportes-cards">


        <div className="reporte-card">

          <span>
            Total generado
          </span>

          <strong>
            {formatoMoneda(
              estadisticas.totalGenerado
            )}
          </strong>

        </div>


        <div className="reporte-card">

          <span>
            Total cobrado
          </span>

          <strong>
            {formatoMoneda(
              estadisticas.totalPagado
            )}
          </strong>

        </div>


        <div className="reporte-card">

          <span>
            Total pendiente
          </span>

          <strong>
            {formatoMoneda(
              estadisticas.totalPendiente
            )}
          </strong>

        </div>


        <div className="reporte-card">

          <span>
            Conceptos registrados
          </span>

          <strong>
            {registros.length}
          </strong>

        </div>

      </section>


      {/* =====================================
          SEGUNDA FILA
      ====================================== */}

      <section className="reportes-cards reportes-cards-secundarias">


        <div className="reporte-card">

          <span>
            Facturas pagadas
          </span>

          <strong>
            {estadisticas.facturasPagadas}
          </strong>

        </div>


        <div className="reporte-card">

          <span>
            Facturas con abono
          </span>

          <strong>
            {estadisticas.facturasAbono}
          </strong>

        </div>


        <div className="reporte-card">

          <span>
            Facturas pendientes
          </span>

          <strong>
            {estadisticas.facturasPendientes}
          </strong>

        </div>


        <div className="reporte-card">

          <span>
            Clientes con saldo
          </span>

          <strong>
            {estadisticas.clientesConSaldo}
          </strong>

        </div>

      </section>


      {/* =====================================
          PORCENTAJE COBRADO
      ====================================== */}

      <section className="reporte-seccion">

        <div className="reporte-seccion-header">

          <div>

            <h2>
              Porcentaje de cobranza
            </h2>

            <p>
              Porcentaje del dinero generado que ya ha sido cobrado.
            </p>

          </div>

          <strong>
            {estadisticas.porcentajeCobrado.toFixed(1)}%
          </strong>

        </div>


        <div className="barra-progreso">

          <div
            className="barra-progreso-valor"
            style={{
              width:
                `${Math.min(
                  estadisticas.porcentajeCobrado,
                  100
                )}%`
            }}
          />

        </div>

      </section>


      {/* =====================================
          FACTURACIÓN POR PERÍODO
      ====================================== */}

      <section className="reporte-seccion">

        <div className="reporte-seccion-header">

          <div>

            <h2>
              Facturación por período
            </h2>

            <p>
              Comparación de los valores registrados en cada período.
            </p>

          </div>

        </div>


        {estadisticasPeriodo.length === 0 ? (

          <div className="reporte-vacio">

            No hay información de facturación.

          </div>

        ) : (

          <div className="grafica-periodos">

            {estadisticasPeriodo.map(
              (item) => {

                const porcentaje =
                  (
                    item.generado /
                    maxPeriodo
                  ) * 100;


                return (

                  <div
                    className="grafica-item"
                    key={
                      item.periodo
                    }
                  >

                    <div className="grafica-info">

                      <strong>
                        {item.periodo}
                      </strong>

                      <span>
                        {formatoMoneda(
                          item.generado
                        )}
                      </span>

                    </div>


                    <div className="grafica-barra">

                      <div
                        className="grafica-barra-valor"
                        style={{
                          width:
                            `${porcentaje}%`
                        }}
                      />

                    </div>


                    <div className="grafica-detalle">

                      <span>
                        Cobrado:{" "}
                        {formatoMoneda(
                          item.pagado
                        )}
                      </span>

                      <span>
                        Pendiente:{" "}
                        {formatoMoneda(
                          item.pendiente
                        )}
                      </span>

                      <span>
                        {item.cantidad} concepto(s)
                      </span>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* =====================================
          RANKING CLIENTES
      ====================================== */}

      <section className="reporte-seccion">

        <div className="reporte-seccion-header">

          <div>

            <h2>
              Clientes con mayor facturación
            </h2>

            <p>
              Los clientes ordenados por valor generado.
            </p>

          </div>

        </div>


        {rankingClientes.length === 0 ? (

          <div className="reporte-vacio">

            No hay clientes con facturación.

          </div>

        ) : (

          <div className="tabla-ranking">

            <table>

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Cliente
                  </th>

                  <th>
                    Generado
                  </th>

                  <th>
                    Cobrado
                  </th>

                  <th>
                    Pendiente
                  </th>

                </tr>

              </thead>


              <tbody>

                {rankingClientes.map(
                  (cliente, index) => (

                    <tr
                      key={
                        `${cliente.cliente}-${index}`
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {cliente.cliente}
                        </strong>
                      </td>

                      <td>
                        {formatoMoneda(
                          cliente.generado
                        )}
                      </td>

                      <td>
                        {formatoMoneda(
                          cliente.pagado
                        )}
                      </td>

                      <td>
                        {formatoMoneda(
                          cliente.pendiente
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


    </div>

  );

}


export default Reportes;
import "./misCitas.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebaseConfig";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

function MisCitas() {
  const navigate = useNavigate();

  const [citas, setCitas] = useState([]);

  const [servicio, setServicio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  const [uid, setUid] = useState("");

  const cargarCitas = async (userId) => {
    try {
      const snapshot = await getDocs(
        collection(db, "usuarios", userId, "citas")
      );

      const datos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCitas(datos);
    } catch (error) {
      console.error("Error cargando citas:", error);
    }
  };

  const guardarCita = async () => {
    if (!servicio || !fecha || !hora) {
      alert("Completa todos los campos.");
      return;
    }

    try {
      console.log("UID:", uid);
console.log("Ruta:", `usuarios/${uid}/citas`);
      await addDoc(
        collection(db, "usuarios", uid, "citas"),
        {
          servicio,
          fecha,
          hora,
          estado: "Pendiente",
          createdAt: serverTimestamp(),
        }
      );

      alert("Cita agendada correctamente.");

      setServicio("");
      setFecha("");
      setHora("");

      cargarCitas(uid);
    } 
    catch (error) {
  console.error("Código:", error.code);
  console.error("Mensaje:", error.message);
  console.error(error);

  alert(error.message);
}
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      setUid(user.uid);
      cargarCitas(user.uid);
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="mis-citas-container">

      <header className="header">
        <h1>Mis Citas</h1>

      <button onClick={() => navigate("/cliente")}>
  Volver
</button>
      </header>

      <section className="nueva-cita">

  <h2>Agendar Nueva Cita</h2>

  <div className="form-cita">

    <select
      value={servicio}
      onChange={(e) => setServicio(e.target.value)}
    >
      <option value="">Seleccione un servicio</option>

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

    <input
      type="date"
      value={fecha}
      onChange={(e) => setFecha(e.target.value)}
    />

    <select
      value={hora}
      onChange={(e) => setHora(e.target.value)}
    >
      <option value="">Seleccione una hora</option>

      <option value="08:00">08:00 AM</option>
      <option value="09:00">09:00 AM</option>
      <option value="10:00">10:00 AM</option>
      <option value="11:00">11:00 AM</option>
      <option value="12:00">12:00 PM</option>

      <option value="14:00">02:00 PM</option>
      <option value="15:00">03:00 PM</option>
      <option value="16:00">04:00 PM</option>
      <option value="17:00">05:00 PM</option>
    </select>

    <button onClick={guardarCita}>
      Agendar Cita
    </button>

  </div>

</section>
      <section className="tabla-citas">

        <h2>Mis Citas Programadas</h2>

        <table>

          <thead>
            <tr>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>

            {citas.length > 0 ? (
              citas.map((cita) => (
                <tr key={cita.id}>
                  <td>{cita.servicio}</td>
                  <td>{cita.fecha}</td>
                  <td>{cita.hora}</td>
                  <td>{cita.estado}</td>
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

    </div>
  );
}

export default MisCitas;
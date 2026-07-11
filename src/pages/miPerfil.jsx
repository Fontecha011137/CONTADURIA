import "./miPerfil.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebaseConfig";

import {
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

function MiPerfil() {

  const navigate = useNavigate();

  const [uid, setUid] = useState("");

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");

  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);

  const cargarPerfil = async (userId) => {
    try {

      const documento = await getDoc(
        doc(db, "usuarios", userId)
      );

      if (documento.exists()) {

        const datos = documento.data();

        setNombre(datos.nombre || "");
        setEmail(datos.email || "");
        setCelular(datos.celular || "");

      }

    } catch (error) {

      console.error(error);

    abrirModal("No fue posible cargar la información del perfil.");

    }
  };
const abrirModal = (texto, fueExito = false) => {
  setMensaje(texto);
  setExito(fueExito);
  setMostrarModal(true);
};
const guardarCambios = async () => {

    const user = auth.currentUser;

if (!user) {
  abrirModal("No hay un usuario autenticado.");
  return;
}
// Validar que todos los campos estén diligenciados
if (
  nombre.trim() === "" ||
  email.trim() === "" ||
  celular.trim() === "" ||
  passwordActual.trim() === "" ||
  passwordNueva.trim() === "" ||
  confirmarPassword.trim() === ""
) {
  abrirModal("Debe llenar todos los campos.");
  return;
}

  try {


    const cambiaCorreo = user.email !== email;
    const cambiaPassword = passwordNueva.trim() !== "";

    if (cambiaCorreo || cambiaPassword) {

      if (!passwordActual) {

        abrirModal("Debes escribir tu contraseña actual.");
        return;

      }

      const credential = EmailAuthProvider.credential(
        user.email,
        passwordActual
      );

      await reauthenticateWithCredential(
        user,
        credential
      );

      if (cambiaCorreo) {

        await updateEmail(user, email);

      }

      if (cambiaPassword) {

        if (passwordNueva !== confirmarPassword) {

          abrirModal("Las contraseñas no coinciden.");
          return;

        }

        if (passwordNueva.length < 6) {

          abrirModal("La contraseña debe tener al menos 6 caracteres.");
          return;

        }

        await updatePassword(
          user,
          passwordNueva
        );

      }

    }

    // Actualizar Firestore únicamente cuando todo salió bien
    await updateDoc(
      doc(db, "usuarios", uid),
      {
        nombre,
        celular,
        email,
      }
    );

    abrirModal(
      "Perfil actualizado correctamente.",
      true
    );

    setPasswordActual("");
    setPasswordNueva("");
    setConfirmarPassword("");
    setMostrarActual(false);
setMostrarNueva(false);
setMostrarConfirmar(false);

  } catch (error) {

    console.error("Código:", error.code);
console.error("Mensaje:", error.message);
console.error(error);

switch (error.code)  {

      case "auth/wrong-password":
        abrirModal("La contraseña actual es incorrecta.");
        break;

      case "auth/requires-recent-login":
        abrirModal("Por seguridad debes iniciar sesión nuevamente.");
        break;

      case "auth/email-already-in-use":
        abrirModal("Ese correo electrónico ya está registrado.");
        break;

      case "auth/invalid-email":
        abrirModal("El correo electrónico no es válido.");
        break;

      default:
        abrirModal("Ocurrió un error al actualizar el perfil.");

    }

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

        cargarPerfil(user.uid);

      }
    );

    return () => unsubscribe();

  }, [navigate]);

  return (

    <div className="perfil-container">

      <div className="perfil-card">

        <h1>Mi Perfil</h1>

        <h2 className="titulo-seccion">
          Información Personal
        </h2>

        <div className="campo">

          <label>Nombre</label>

          <input
            type="text"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
          />

        </div>

        <div className="campo">

          <label>Correo Electrónico</label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

        </div>

        <div className="campo">

          <label>Celular</label>

          <input
            type="text"
            value={celular}
            onChange={(e) =>
              setCelular(e.target.value)
            }
          />

        </div>

        <h2 className="titulo-seccion">
          Seguridad
        </h2>

      <div className="campo">

  <label>Contraseña Actual</label>

  <div className="password-input">

    <input
      type={mostrarActual ? "text" : "password"}
      value={passwordActual}
      onChange={(e) => setPasswordActual(e.target.value)}
    />

    <button
      type="button"
      className="btn-password"
      onClick={() => setMostrarActual(!mostrarActual)}
    >
      {mostrarActual ? "🙈" : "👁️"}
    </button>

  </div>

</div>

    <div className="campo">

  <label>Nueva Contraseña</label>

  <div className="password-input">

    <input
      type={mostrarNueva ? "text" : "password"}
      value={passwordNueva}
      onChange={(e) => setPasswordNueva(e.target.value)}
    />

    <button
      type="button"
      className="btn-password"
      onClick={() => setMostrarNueva(!mostrarNueva)}
    >
      {mostrarNueva ? "🙈" : "👁️"}
    </button>

  </div>

</div>

        <div className="campo">

  <label>Confirmar Nueva Contraseña</label>

  <div className="password-input">

    <input
      type={mostrarConfirmar ? "text" : "password"}
      value={confirmarPassword}
      onChange={(e) => setConfirmarPassword(e.target.value)}
    />

    <button
      type="button"
      className="btn-password"
      onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
    >
      {mostrarConfirmar ? "🙈" : "👁️"}
    </button>

  </div>

</div>

        <div className="botones">

          <button
            className="guardar"
            onClick={guardarCambios}
          >
            Guardar Cambios
          </button>

          <button
            className="volver"
            onClick={() => navigate("/cliente")}
          >
            Volver
          </button>

        </div>

      </div>
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal">

            <h2>
              {exito ? "Operación Exitosa" : "Error"}
            </h2>

            <p>{mensaje}</p>

<button
  onClick={() => {
    setMostrarModal(false);
    setMensaje("");
    setExito(false);

    if (exito) {
      setPasswordActual("");
      setPasswordNueva("");
      setConfirmarPassword("");

      setMostrarActual(false);
      setMostrarNueva(false);
      setMostrarConfirmar(false);
    }
  }}
>
  Aceptar
</button>

          </div>
        </div>
      )}
    </div>

  );

}

export default MiPerfil;
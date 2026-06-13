import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";



import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [rutaDestino, setRutaDestino] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("Usuario autenticado:", userCredential.user);

    // Obtener UID del usuario autenticado
    const uid = userCredential.user.uid;

    // Buscar documento en Firestore
    const docRef = doc(db, "usuarios", uid);
    const docSnap = await getDoc(docRef);

    let rolUsuario = "cliente";

    if (docSnap.exists()) {
      rolUsuario = docSnap.data().rol;
    }

    console.log("ROL:", rolUsuario);

    setMensaje("Inicio de sesión exitoso");
setLoginExitoso(true);
setMostrarModal(true);

if (rolUsuario === "contador") {
  setRutaDestino("/contador");
} else {
  setRutaDestino("/cliente");
}

  } catch (error) {
    console.error(error);

    if (error.code === "auth/user-not-found") {
      setMensaje("Usuario no encontrado");
    } else if (error.code === "auth/wrong-password") {
      setMensaje("Contraseña incorrecta");
    } else if (error.code === "auth/invalid-credential") {
      setMensaje("Correo o contraseña incorrectos");
    } else {
      setMensaje("Error al iniciar sesión");
    }
setLoginExitoso(false);
    setMostrarModal(true);
  }
};


  const handleResetPassword = async () => {
   if (!email) {
  setMensaje("Ingresa tu correo electrónico primero");
  setLoginExitoso(false);
  setMostrarModal(true);
  return;
}

  try {
  await sendPasswordResetEmail(auth, email);

  setMensaje(
    "Se ha enviado un enlace para restablecer tu contraseña a tu correo."
  );
  setLoginExitoso(false);
  setMostrarModal(true);

    } catch (error) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        setMensaje("No existe una cuenta con ese correo");
      } else {
        setMensaje("Error al enviar el correo de recuperación");
      }
setLoginExitoso(false);
      setMostrarModal(true);
    }
  };
const cerrarModal = () => {
  setMostrarModal(false);

  if (loginExitoso) {
    navigate(rutaDestino);
  }
};
  return (
    <>
      <div className="login-container">
        <div className="login-card">

          <h1>Iniciar Sesión</h1>

          <p>
            Accede a tu cuenta para gestionar tus servicios contables.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Correo Electrónico</label>

              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>

              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="forgot-password">
              <button
                type="button"
                onClick={handleResetPassword}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="login-btn"
            >
              Ingresar
            </button>

          </form>

          <div className="login-footer">

            <p>¿No tienes cuenta?</p>

            <Link to="/register">
              <button className="register-link">
                Registrarse
              </button>
            </Link>

          </div>

        </div>
      </div>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal">

          <h3>
  {loginExitoso ? "Inicio de sesión exitoso" : "Información"}
</h3>

<p>{mensaje}</p>

<button onClick={cerrarModal}>
  {loginExitoso ? "Continuar" : "Cerrar"}
</button>

          </div>
        </div>
      )}
    </>
  );
}

export default Login;
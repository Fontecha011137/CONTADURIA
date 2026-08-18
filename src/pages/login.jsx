import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

import {
  auth,
  db
} from "../firebaseConfig";

import {
  doc,
  getDoc
} from "firebase/firestore";

import "./login.css";


function Login() {

  const navigate = useNavigate();


  // =========================================
  // ESTADOS
  // =========================================

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [mensaje, setMensaje] = useState("");

  const [mostrarModal, setMostrarModal] =
    useState(false);

  const [loginExitoso, setLoginExitoso] =
    useState(false);


  // =========================================
  // INICIAR SESIÓN
  // =========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );


      const uid =
        userCredential.user.uid;


      // =====================================
      // BUSCAR PERFIL DEL USUARIO
      // =====================================

      const docRef =
        doc(
          db,
          "usuarios",
          uid
        );


      const docSnap =
        await getDoc(docRef);


      // =====================================
      // DETERMINAR ROL
      // =====================================

      let rolUsuario = "cliente";


      if (docSnap.exists()) {

        rolUsuario =
          docSnap.data().rol;

      }


      // =====================================
      // RUTA SEGÚN EL ROL
      // =====================================

      const destino =
        rolUsuario === "contador"
          ? "/contador"
          : "/cliente";


      // =====================================
      // MOSTRAR MENSAJE
      // =====================================

      setMensaje(
        "Inicio de sesión exitoso"
      );

      setLoginExitoso(true);

      setMostrarModal(true);


      // =====================================
      // IR AL DASHBOARD
      // =====================================

      setTimeout(() => {

        setMostrarModal(false);

        navigate(destino);

      }, 800);


    } catch (error) {

      console.error(
        "FULL ERROR:",
        error
      );


      let msg =
        error.code +
        " - " +
        error.message;


      // =====================================
      // MENSAJES DE ERROR
      // =====================================

      if (
        error.code ===
        "auth/user-not-found"
      ) {

        msg =
          "Usuario no encontrado";

      }


      if (
        error.code ===
        "auth/wrong-password"
      ) {

        msg =
          "Contraseña incorrecta";

      }


      if (
        error.code ===
        "auth/invalid-credential"
      ) {

        msg =
          "Correo o contraseña incorrectos";

      }


      setMensaje(msg);

      setLoginExitoso(false);

      setMostrarModal(true);

    }

  };


  // =========================================
  // RECUPERAR CONTRASEÑA
  // =========================================

  const handleResetPassword =
    async () => {

      if (!email) {

        setMensaje(
          "Ingresa tu correo electrónico primero"
        );

        setLoginExitoso(false);

        setMostrarModal(true);

        return;

      }


      try {

        await sendPasswordResetEmail(
          auth,
          email
        );


        setMensaje(
          "Se ha enviado un enlace para restablecer tu contraseña a tu correo."
        );

        setLoginExitoso(false);

        setMostrarModal(true);


      } catch (error) {

        console.error(
          error
        );


        if (
          error.code ===
          "auth/user-not-found"
        ) {

          setMensaje(
            "No existe una cuenta con ese correo"
          );

        } else {

          setMensaje(
            "Error al enviar el correo de recuperación"
          );

        }


        setLoginExitoso(false);

        setMostrarModal(true);

      }

    };


  // =========================================
  // CERRAR MODAL
  // =========================================

  const cerrarModal = () => {

    setMostrarModal(false);

  };


  // =========================================
  // INTERFAZ
  // =========================================

  return (

    <>

      <div className="login-container">


        {/* ===================================
            TARJETA DE LOGIN
        ==================================== */}

        <div className="login-card">


          {/* =================================
              VOLVER AL INICIO
          ================================== */}

          <button
            type="button"
            className="btn-volver-home"
            onClick={() =>
              navigate("/")
            }
          >
            ← Volver al inicio
          </button>


          {/* =================================
              TÍTULO
          ================================== */}

          <h1>
            Iniciar Sesión
          </h1>


          <p>
            Accede a tu cuenta para gestionar tus servicios contables.
          </p>


          {/* =================================
              FORMULARIO
          ================================== */}

          <form
            onSubmit={handleSubmit}
          >


            {/* CORREO */}

            <div className="form-group">

              <label>
                Correo Electrónico
              </label>


              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>


            {/* CONTRASEÑA */}

            <div className="form-group">

              <label>
                Contraseña
              </label>


              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>


            {/* =================================
                RECUPERAR CONTRASEÑA
            ================================== */}

            <div className="forgot-password">

              <button
                type="button"
                onClick={
                  handleResetPassword
                }
              >
                ¿Olvidaste tu contraseña?
              </button>

            </div>


            {/* =================================
                BOTÓN INGRESAR
            ================================== */}

            <button
              type="submit"
              className="login-btn"
            >
              Ingresar
            </button>


          </form>


          {/* =================================
              REGISTRO
          ================================== */}

          <div className="login-footer">

            <p>
              ¿No tienes cuenta?
            </p>


            <Link to="/register">

              <button
                type="button"
                className="register-link"
              >
                Registrarse
              </button>

            </Link>

          </div>


        </div>

      </div>


      {/* =====================================
          MODAL
      ===================================== */}

      {mostrarModal && (

        <div className="modal-overlay">

          <div className="modal">


            <h3>

              {loginExitoso
                ? "Inicio de sesión exitoso"
                : "Información"}

            </h3>


            <p>
              {mensaje}
            </p>


            <button
              onClick={cerrarModal}
            >

              {loginExitoso
                ? "Continuar"
                : "Cerrar"}

            </button>


          </div>

        </div>

      )}

    </>

  );

}


export default Login;
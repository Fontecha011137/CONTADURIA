import { useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebaseConfig";

import "./login.css";


function Login() {

  const navigate = useNavigate();


  // =====================================================
  // ESTADOS
  // =====================================================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [mostrarModal, setMostrarModal] =
    useState(false);

  const [loginExitoso, setLoginExitoso] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [recuperando, setRecuperando] =
    useState(false);


  // =====================================================
  // INICIAR SESIÓN
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (loading) {
      return;
    }


    const correoLimpio =
      email
        .trim()
        .toLowerCase();


    if (!correoLimpio) {

      setMensaje(
        "Ingresa tu correo electrónico."
      );

      setLoginExitoso(false);
      setMostrarModal(true);

      return;
    }


    if (!password) {

      setMensaje(
        "Ingresa tu contraseña."
      );

      setLoginExitoso(false);
      setMostrarModal(true);

      return;
    }


    try {

      setLoading(true);


      // =========================================
      // AUTENTICAR
      // =========================================

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          correoLimpio,
          password
        );


      const uid =
        userCredential.user.uid;


      // =========================================
      // BUSCAR PERFIL
      // =========================================

      const docRef =
        doc(
          db,
          "usuarios",
          uid
        );


      const docSnap =
        await getDoc(
          docRef
        );


      // =========================================
      // VALIDAR PERFIL
      // =========================================

      if (!docSnap.exists()) {

        throw new Error(
          "No se encontró el perfil del usuario."
        );

      }


      const datosUsuario =
        docSnap.data();


      const rolUsuario =
        datosUsuario.rol ||
        "cliente";


      // =========================================
      // DESTINO SEGÚN ROL
      // =========================================

      const destino =
        rolUsuario === "contador"
          ? "/contador"
          : "/cliente";


      // =========================================
      // MENSAJE
      // =========================================

      setMensaje(
        "Inicio de sesión exitoso."
      );

      setLoginExitoso(true);

      setMostrarModal(true);


      // =========================================
      // IR AL PANEL
      // =========================================

      setTimeout(() => {

        setMostrarModal(false);

        navigate(
          destino
        );

      }, 600);


    } catch (error) {

      console.error(
        "Error iniciando sesión:",
        error
      );


      let msg =
        "No fue posible iniciar sesión.";


      if (
        error.code ===
        "auth/invalid-credential"
      ) {

        msg =
          "Correo o contraseña incorrectos.";

      } else if (
        error.code ===
        "auth/invalid-email"
      ) {

        msg =
          "El correo electrónico no es válido.";

      } else if (
        error.code ===
        "auth/too-many-requests"
      ) {

        msg =
          "Se realizaron demasiados intentos. Espera unos minutos e intenta nuevamente.";

      } else if (
        error.code ===
        "auth/network-request-failed"
      ) {

        msg =
          "No fue posible conectarse. Verifica tu conexión a Internet.";

      } else if (
        error.message ===
        "No se encontró el perfil del usuario."
      ) {

        msg =
          "La cuenta existe, pero no se encontró su perfil. Comunícate con soporte.";

      }


      setMensaje(msg);

      setLoginExitoso(false);

      setMostrarModal(true);


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // RECUPERAR CONTRASEÑA
  // =====================================================

  const handleResetPassword =
    async () => {

      if (recuperando) {
        return;
      }


      const correoLimpio =
        email
          .trim()
          .toLowerCase();


      if (!correoLimpio) {

        setMensaje(
          "Ingresa tu correo electrónico primero."
        );

        setLoginExitoso(false);
        setMostrarModal(true);

        return;
      }


      try {

        setRecuperando(true);


        await sendPasswordResetEmail(
          auth,
          correoLimpio
        );


        setMensaje(
          "Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo electrónico."
        );

        setLoginExitoso(false);

        setMostrarModal(true);


      } catch (error) {

        console.error(
          "Error recuperando contraseña:",
          error
        );


        let msg =
          "No fue posible enviar el correo de recuperación.";


        if (
          error.code ===
          "auth/invalid-email"
        ) {

          msg =
            "El correo electrónico no es válido.";

        } else if (
          error.code ===
          "auth/network-request-failed"
        ) {

          msg =
            "No fue posible conectarse. Verifica tu conexión a Internet.";

        }


        setMensaje(msg);

        setLoginExitoso(false);

        setMostrarModal(true);


      } finally {

        setRecuperando(false);

      }

    };


  // =====================================================
  // CERRAR MODAL
  // =====================================================

  const cerrarModal = () => {

    setMostrarModal(false);

  };


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <>

      <div className="login-container">

        <div className="login-card">


          {/* =====================================
              VOLVER AL INICIO
          ===================================== */}

          <button
            type="button"
            className="btn-volver-home"
            onClick={() =>
              navigate("/")
            }
          >
            ← Volver al inicio
          </button>


          {/* =====================================
              LOGO
          ===================================== */}

          <div className="login-logo-container">

            <img
              src="/Contaduria-icono.png"
              alt="Contador Bogotá"
              className="login-logo"
            />

          </div>


          {/* =====================================
              ENCABEZADO
          ===================================== */}

          <div className="login-header">

            <span className="login-badge">
              Acceso seguro
            </span>

            <h1>
              Iniciar Sesión
            </h1>

            <p>
              Accede a tu cuenta para gestionar
              tus servicios contables,
              documentos, citas y solicitudes.
            </p>

          </div>


          {/* =====================================
              FORMULARIO
          ===================================== */}

          <form
            onSubmit={handleSubmit}
          >


            {/* CORREO */}

            <div className="form-group">

              <label htmlFor="email">
                Correo Electrónico
              </label>

              <input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                autoComplete="email"
                required
              />

            </div>


            {/* CONTRASEÑA */}

            <div className="form-group">

              <label htmlFor="password">
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                autoComplete="current-password"
                required
              />

            </div>


            {/* =====================================
                RECUPERAR CONTRASEÑA
            ===================================== */}

            <div className="forgot-password">

              <button
                type="button"
                onClick={
                  handleResetPassword
                }
                disabled={
                  recuperando
                }
              >

                {
                  recuperando
                    ? "Enviando..."
                    : "¿Olvidaste tu contraseña?"
                }

              </button>

            </div>


            {/* =====================================
                BOTÓN INGRESAR
            ===================================== */}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >

              {
                loading
                  ? "Ingresando..."
                  : "Ingresar"
              }

            </button>

          </form>


          {/* =====================================
              REGISTRO
          ===================================== */}

          <div className="login-footer">

            <p>
              ¿Aún no tienes una cuenta?
            </p>


            <Link to="/register">

              <button
                type="button"
                className="register-link"
              >
                Crear cuenta
              </button>

            </Link>

          </div>


          {/* =====================================
              ENLACES LEGALES
          ===================================== */}

          <div className="login-legal">

            <Link to="/terminos">
              Términos y Condiciones
            </Link>

            <span>
              •
            </span>

            <Link to="/privacidad">
              Política de Privacidad
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

              {
                loginExitoso
                  ? "Inicio de sesión exitoso"
                  : "Información"
              }

            </h3>


            <p>
              {mensaje}
            </p>


            <button
              type="button"
              onClick={
                cerrarModal
              }
            >

              {
                loginExitoso
                  ? "Continuar"
                  : "Cerrar"
              }

            </button>

          </div>

        </div>

      )}

    </>

  );

}


export default Login;
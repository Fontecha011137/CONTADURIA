import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  deleteUser
} from "firebase/auth";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebaseConfig";

import "./register.css";


function Register() {

  const navigate = useNavigate();


  // =====================================================
  // ESTADOS
  // =====================================================

  const [mensaje, setMensaje] = useState("");

  const [mostrarModal, setMostrarModal] =
    useState(false);

  const [registroExitoso, setRegistroExitoso] =
    useState(false);

  const [aceptaTerminos, setAceptaTerminos] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    email: "",
    password: "",
    confirmPassword: ""
  });


  // =====================================================
  // VERSIONES LEGALES
  // =====================================================

  const VERSION_TERMINOS = "1.0";

  const VERSION_PRIVACIDAD = "1.0";


  // =====================================================
  // MANEJAR CAMBIOS
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };


  // =====================================================
  // REGISTRAR USUARIO
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (loading) {
      return;
    }


    // ===================================================
    // VALIDAR TÉRMINOS
    // ===================================================

    if (!aceptaTerminos) {

      setMensaje(
        "Debes aceptar los Términos y Condiciones y la Política de Privacidad para registrarte."
      );

      setRegistroExitoso(false);

      setMostrarModal(true);

      return;

    }


    // ===================================================
    // LIMPIAR DATOS
    // ===================================================

    const nombre =
      formData.nombre.trim();

    const celular =
      formData.celular.trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();


    // ===================================================
    // VALIDAR NOMBRE
    // ===================================================

    if (nombre.length < 3) {

      setMensaje(
        "Ingrese un nombre válido."
      );

      setRegistroExitoso(false);

      setMostrarModal(true);

      return;

    }


    // ===================================================
    // VALIDAR CELULAR
    // ===================================================

    if (!/^[0-9]{10}$/.test(celular)) {

      setMensaje(
        "Ingrese un número de celular válido de 10 dígitos."
      );

      setRegistroExitoso(false);

      setMostrarModal(true);

      return;

    }


    // ===================================================
    // VALIDAR CONTRASEÑA
    // ===================================================

    if (formData.password.length < 6) {

      setMensaje(
        "La contraseña debe tener al menos 6 caracteres."
      );

      setRegistroExitoso(false);

      setMostrarModal(true);

      return;

    }


    // ===================================================
    // VALIDAR CONFIRMACIÓN
    // ===================================================

    if (
      formData.password !==
      formData.confirmPassword
    ) {

      setMensaje(
        "Las contraseñas no coinciden."
      );

      setRegistroExitoso(false);

      setMostrarModal(true);

      return;

    }


    let usuarioCreado = null;


    try {

      setLoading(true);


      // =================================================
      // CREAR USUARIO EN FIREBASE AUTH
      // =================================================

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          formData.password
        );


      usuarioCreado =
        userCredential.user;


      const uid =
        usuarioCreado.uid;


      // =================================================
      // CREAR PERFIL EN FIRESTORE
      // =================================================

      await setDoc(
        doc(
          db,
          "usuarios",
          uid
        ),
        {

          nombre,

          celular,

          email,

          rol: "cliente",


          // =============================================
          // TÉRMINOS Y CONDICIONES
          // =============================================

          aceptoTerminos: true,

          versionTerminos:
            VERSION_TERMINOS,

          fechaAceptacionTerminos:
            serverTimestamp(),


          // =============================================
          // POLÍTICA DE PRIVACIDAD
          // =============================================

          aceptoPoliticaPrivacidad: true,

          versionPoliticaPrivacidad:
            VERSION_PRIVACIDAD,

          fechaAceptacionPrivacidad:
            serverTimestamp(),


          // =============================================
          // INFORMACIÓN DEL REGISTRO
          // =============================================

          fechaRegistro:
            serverTimestamp()

        }
      );


      // =================================================
      // REGISTRO CORRECTO
      // =================================================

      setMensaje(
        "Cuenta creada correctamente."
      );

      setRegistroExitoso(true);

      setMostrarModal(true);


    } catch (error) {

      console.error(
        "Error registrando usuario:",
        error
      );


      // =================================================
      // EVITAR USUARIO INCOMPLETO
      // =================================================

      if (usuarioCreado) {

        try {

          await deleteUser(
            usuarioCreado
          );

        } catch (deleteError) {

          console.error(
            "No se pudo eliminar el usuario incompleto:",
            deleteError
          );

        }

      }


      // =================================================
      // MENSAJES FIREBASE
      // =================================================

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {

        setMensaje(
          "Este correo ya está registrado."
        );

      } else if (
        error.code ===
        "auth/weak-password"
      ) {

        setMensaje(
          "La contraseña debe tener al menos 6 caracteres."
        );

      } else if (
        error.code ===
        "auth/invalid-email"
      ) {

        setMensaje(
          "Correo electrónico inválido."
        );

      } else if (
        error.code ===
        "auth/network-request-failed"
      ) {

        setMensaje(
          "No fue posible conectarse. Verifique su conexión a Internet."
        );

      } else {

        setMensaje(
          "No fue posible crear la cuenta. Intente nuevamente."
        );

      }


      setRegistroExitoso(false);

      setMostrarModal(true);


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // CERRAR MODAL
  // =====================================================

  const cerrarModal = () => {

    setMostrarModal(false);


    if (registroExitoso) {

      navigate(
        "/cliente"
      );

    }

  };


  // =====================================================
  // VOLVER AL HOME
  // =====================================================

  const volverHome = () => {

    navigate("/");

  };


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <div className="register-container">

      <div className="register-card">


        {/* =================================================
            VOLVER AL INICIO
        ================================================= */}

        <button
          type="button"
          className="btn-volver-register"
          onClick={volverHome}
        >
          ← Volver al inicio
        </button>


        {/* =================================================
            ENCABEZADO
        ================================================= */}

        <h1>
          Crear Cuenta
        </h1>


        <p>
          Regístrate para acceder a nuestros
          servicios contables.
        </p>


        {/* =================================================
            FORMULARIO
        ================================================= */}

        <form onSubmit={handleSubmit}>


          {/* ===============================================
              NOMBRE
          =============================================== */}

          <div className="form-group">

            <label htmlFor="nombre">
              Nombre Completo
            </label>

            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              autoComplete="name"
              required
            />

          </div>


          {/* ===============================================
              CELULAR
          =============================================== */}

          <div className="form-group">

            <label htmlFor="celular">
              Número de Celular
            </label>

            <input
              id="celular"
              type="tel"
              name="celular"
              placeholder="3001234567"
              value={formData.celular}
              onChange={handleChange}
              maxLength={10}
              inputMode="numeric"
              autoComplete="tel"
              required
            />

          </div>


          {/* ===============================================
              CORREO
          =============================================== */}

          <div className="form-group">

            <label htmlFor="email">
              Correo Electrónico
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

          </div>


          {/* ===============================================
              CONTRASEÑA
          =============================================== */}

          <div className="form-group">

            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              autoComplete="new-password"
              required
            />

          </div>


          {/* ===============================================
              CONFIRMAR CONTRASEÑA
          =============================================== */}

          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirmar Contraseña
            </label>

            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={6}
              autoComplete="new-password"
              required
            />

          </div>


          {/* ===============================================
              TÉRMINOS Y PRIVACIDAD
          =============================================== */}

          <div className="terminos-container">

            <label className="terminos-label">

              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) =>
                  setAceptaTerminos(
                    e.target.checked
                  )
                }
                required
              />


              <span>

                He leído y acepto los{" "}

                <Link to="/terminos">
                Términos y Condiciones
                </Link>


                {" "}y la{" "}


                <Link to="/privacidad">
                Política de Privacidad
                </Link>

              </span>

            </label>

          </div>


          {/* ===============================================
              BOTÓN REGISTRARSE
          =============================================== */}

          <button
            type="submit"
            className="register-btn"
            disabled={
              !aceptaTerminos ||
              loading
            }
          >

            {
              loading
                ? "Creando cuenta..."
                : "Registrarse"
            }

          </button>

        </form>


        {/* =================================================
            INICIAR SESIÓN
        ================================================= */}

        <div className="register-footer">

          <p>
            ¿Ya tienes una cuenta?
          </p>


          <Link to="/login">

            <button
              type="button"
              className="login-link"
            >
              Iniciar Sesión
            </button>

          </Link>

        </div>

      </div>


      {/* ===================================================
          MODAL
      =================================================== */}

      {mostrarModal && (

        <div className="modal-overlay">

          <div className="modal">

            <h3>

              {
                registroExitoso
                  ? "Registro exitoso"
                  : "Error"
              }

            </h3>


            <p>
              {mensaje}
            </p>


            <button
              type="button"
              onClick={cerrarModal}
            >
              Aceptar
            </button>

          </div>

        </div>

      )}

    </div>

  );

}


export default Register;
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

import { auth, db } from "../firebaseConfig";
import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import "./register.css";

function Register() {
  const navigate = useNavigate();

  const [mensaje, setMensaje] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // =========================================
  // VERSIONES LEGALES
  // =========================================

  const VERSION_TERMINOS = "1.0";
  const VERSION_PRIVACIDAD = "1.0";

  // =========================================
  // MANEJAR CAMBIOS DEL FORMULARIO
  // =========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================
  // REGISTRAR USUARIO
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // =========================================
    // VALIDAR TÉRMINOS
    // =========================================

    if (!aceptaTerminos) {
      setMensaje(
        "Debes aceptar los Términos y Condiciones y la Política de Privacidad para registrarte."
      );

      setRegistroExitoso(false);
      setMostrarModal(true);

      return;
    }

    // =========================================
    // VALIDAR CONTRASEÑAS
    // =========================================

    if (formData.password !== formData.confirmPassword) {
      setMensaje("Las contraseñas no coinciden");
      setRegistroExitoso(false);
      setMostrarModal(true);
      return;
    }

    // =========================================
    // VALIDAR CELULAR
    // =========================================

    if (!/^[0-9]{10}$/.test(formData.celular)) {
      setMensaje(
        "Ingrese un número de celular válido de 10 dígitos."
      );

      setRegistroExitoso(false);
      setMostrarModal(true);

      return;
    }

    try {
      // =========================================
      // CREAR USUARIO EN FIREBASE AUTH
      // =========================================

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

      const uid = userCredential.user.uid;

      // =========================================
      // CREAR PERFIL EN FIRESTORE
      // =========================================

      await setDoc(
        doc(db, "usuarios", uid),
        {
          nombre: formData.nombre,
          celular: formData.celular,
          email: formData.email,

          rol: "cliente",

          // =====================================
          // ACEPTACIÓN LEGAL
          // =====================================

          aceptoTerminos: true,

          versionTerminos:
            VERSION_TERMINOS,

          aceptoPoliticaPrivacidad: true,

          versionPoliticaPrivacidad:
            VERSION_PRIVACIDAD,

          fechaAceptacionTerminos:
            serverTimestamp(),

          fechaAceptacionPrivacidad:
            serverTimestamp(),

          // =====================================
          // FECHA DE CREACIÓN
          // =====================================

          fechaRegistro:
            serverTimestamp(),
        }
      );

      console.log(
        "Usuario creado:",
        userCredential.user
      );

      setMensaje(
        "Cuenta creada correctamente"
      );

      setRegistroExitoso(true);
      setMostrarModal(true);

    } catch (error) {
      console.error(error);

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        setMensaje(
          "Este correo ya está registrado"
        );

      } else if (
        error.code ===
        "auth/weak-password"
      ) {
        setMensaje(
          "La contraseña debe tener al menos 6 caracteres"
        );

      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        setMensaje(
          "Correo electrónico inválido"
        );

      } else {
        setMensaje(
          "Error al registrar usuario"
        );
      }

      setRegistroExitoso(false);
      setMostrarModal(true);
    }
  };

  // =========================================
  // CERRAR MODAL
  // =========================================

  const cerrarModal = () => {
    setMostrarModal(false);

    if (registroExitoso) {
      navigate("/cliente");
    }
  };

  // =========================================
  // VOLVER AL HOME
  // =========================================

  const volverHome = () => {
    navigate("/");
  };

  return (
    <div className="register-container">

      <div className="register-card">

        {/* =====================================
            BOTÓN VOLVER AL HOME
        ====================================== */}

        <button
          type="button"
          className="btn-volver-register"
          onClick={volverHome}
        >
          ← Volver al inicio
        </button>

        {/* =====================================
            ENCABEZADO
        ====================================== */}

        <h1>
          Crear Cuenta
        </h1>

        <p>
          Regístrate para acceder a nuestros
          servicios contables.
        </p>

        {/* =====================================
            FORMULARIO
        ====================================== */}

        <form onSubmit={handleSubmit}>

          {/* NOMBRE */}

          <div className="form-group">

            <label>
              Nombre Completo
            </label>

            <input
              type="text"
              name="nombre"
              placeholder="Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              required
            />

          </div>

          {/* CELULAR */}

          <div className="form-group">

            <label>
              Número de Celular
            </label>

            <input
              type="tel"
              name="celular"
              placeholder="3001234567"
              value={formData.celular}
              onChange={handleChange}
              maxLength={10}
              inputMode="numeric"
              required
            />

          </div>

          {/* CORREO */}

          <div className="form-group">

            <label>
              Correo Electrónico
            </label>

            <input
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>

          {/* CONFIRMAR CONTRASEÑA */}

          <div className="form-group">

            <label>
              Confirmar Contraseña
            </label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

          </div>

          {/* ===================================
              TÉRMINOS Y PRIVACIDAD
          =================================== */}

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
              />

              <span>
                He leído y acepto los{" "}

                <Link
                  to="/terminos"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Términos y Condiciones
                </Link>

                {" "}y la{" "}

                <Link
                  to="/privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Política de Privacidad
                </Link>.
              </span>

            </label>

          </div>

          {/* ===================================
              BOTÓN REGISTRARSE
          =================================== */}

          <button
            type="submit"
            className="register-btn"
            disabled={!aceptaTerminos}
          >
            Registrarse
          </button>

        </form>

        {/* =====================================
            PIE DEL FORMULARIO
        ====================================== */}

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

      {/* =======================================
          MODAL
      ======================================== */}

      {mostrarModal && (

        <div className="modal-overlay">

          <div className="modal">

            <h3>
              {registroExitoso
                ? "Registro exitoso"
                : "Error"}
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
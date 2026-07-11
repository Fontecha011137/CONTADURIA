import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

import "./register.css";

function Register() {
  const navigate = useNavigate();

  const [mensaje, setMensaje] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMensaje("Las contraseñas no coinciden");
      setRegistroExitoso(false);
      setMostrarModal(true);
      return;
    }

    // Validar celular
    if (!/^[0-9]{10}$/.test(formData.celular)) {
      setMensaje("Ingrese un número de celular válido de 10 dígitos.");
      setRegistroExitoso(false);
      setMostrarModal(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await setDoc(
        doc(db, "usuarios", userCredential.user.uid),
        {
          nombre: formData.nombre,
          celular: formData.celular,
          email: formData.email,
          rol: "cliente",
        }
      );

      console.log("Usuario creado:", userCredential.user);

      setMensaje("Cuenta creada correctamente");
      setRegistroExitoso(true);
      setMostrarModal(true);

    } catch (error) {

      console.error(error);

      if (error.code === "auth/email-already-in-use") {

        setMensaje("Este correo ya está registrado");

      } else if (error.code === "auth/weak-password") {

        setMensaje("La contraseña debe tener al menos 6 caracteres");

      } else if (error.code === "auth/invalid-email") {

        setMensaje("Correo electrónico inválido");

      } else {

        setMensaje("Error al registrar usuario");

      }

      setRegistroExitoso(false);
      setMostrarModal(true);
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);

    if (registroExitoso) {
      navigate("/cliente");
    }
  };

  return (
    <>
      <div className="register-container">

        <div className="register-card">

          <h1>Crear Cuenta</h1>

          <p>
            Regístrate para acceder a nuestros servicios contables.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Nombre Completo</label>

              <input
                type="text"
                name="nombre"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Número de Celular</label>

              <input
                type="tel"
                name="celular"
                placeholder="3001234567"
                value={formData.celular}
                onChange={handleChange}
                maxLength={10}
                required
              />
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>

              <input
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>

              <input
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="register-btn"
            >
              Registrarse
            </button>

          </form>

          <div className="register-footer">

            <p>¿Ya tienes una cuenta?</p>

            <Link to="/login">
              <button className="login-link">
                Iniciar Sesión
              </button>
            </Link>

          </div>

        </div>

        {mostrarModal && (

          <div className="modal-overlay">

            <div className="modal">

              <h3>
                {registroExitoso ? "Registro exitoso" : "Error"}
              </h3>

              <p>{mensaje}</p>

              <button onClick={cerrarModal}>
                Aceptar
              </button>

            </div>

          </div>

        )}

      </div>
    </>
  );
}

export default Register;
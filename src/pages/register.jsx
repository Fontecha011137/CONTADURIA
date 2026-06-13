import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

import "./register.css";

function Register() {
  const navigate = useNavigate();

const [mensaje, setMensaje] = useState("");
const [mostrarModal, setMostrarModal] = useState(false);
const [registroExitoso, setRegistroExitoso] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol: "cliente",
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
        email: formData.email,
        rol: formData.rol,
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
    setRegistroExitoso(false);
    setMostrarModal(true);

  } else if (error.code === "auth/weak-password") {
    setMensaje("La contraseña debe tener al menos 6 caracteres");
    setRegistroExitoso(false);
    setMostrarModal(true);

  } else {
    setMensaje("Error al registrar usuario");
    setRegistroExitoso(false);
    setMostrarModal(true);
  }
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

          <div className="form-group">
            <label>Rol</label>

           <select
  name="rol"
  value={formData.rol}
  onChange={handleChange}
>
  <option value="cliente">Cliente</option>
</select>
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
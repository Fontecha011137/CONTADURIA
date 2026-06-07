import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";

import { auth } from "../firebaseConfig";

import "./register.css";

function Register() {
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
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log("Usuario creado:", userCredential.user);

      alert("Cuenta creada correctamente");

      setFormData({
        nombre: "",
        email: "",
        password: "",
        confirmPassword: "",
        rol: "cliente",
      });

    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        alert("Este correo ya está registrado");
      } else if (error.code === "auth/weak-password") {
        alert("La contraseña debe tener al menos 6 caracteres");
      } else {
        alert("Error al registrar usuario");
      }
    }
  };

  return (
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
              <option value="contador">Contador</option>
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
    </div>
  );
}

export default Register;
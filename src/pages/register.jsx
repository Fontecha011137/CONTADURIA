import { useState } from "react";
import "./register.css";

function Register() {

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol: "cliente"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    console.log(formData);

    // Aquí irá Firebase Authentication
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
              <option value="cliente">
                Cliente
              </option>

              <option value="contador">
                Contador
              </option>
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

          <button className="login-link">
            Iniciar Sesión
          </button>

        </div>

      </div>

    </div>
  );
}

export default Register;
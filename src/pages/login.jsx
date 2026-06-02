import { useState } from "react";
import "./login.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      email,
      password
    });

    // Aquí irá Firebase Login
  };

  return (
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

          <button type="submit" className="login-btn">
            Ingresar
          </button>

        </form>

        <div className="login-footer">

          <p>
            ¿No tienes cuenta?
          </p>

          <button className="register-link">
            Registrarse
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;
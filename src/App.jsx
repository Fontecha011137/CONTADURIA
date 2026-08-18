
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";

import ClienteDashboard from "./pages/clienteDashboard";
import ContadorDashboard from "./pages/contadorDashboard";

import MisDocumentos from "./pages/misDocumentos";
import SubirDocumento from "./pages/subirDocumentos";

import MisCitas from "./pages/misCitas";
import MiPerfil from "./pages/miPerfil";

import MisSolicitudes from "./pages/misSolicitudes";

import Clientes from "./pages/Clientes";
import Documentos from "./pages/Documentos";
import Facturacion from "./pages/Facturacion";
import Citas from "./pages/Citas";
import Reportes from "./pages/Reportes";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* 🏠 INICIO */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* 🔐 LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* 📝 REGISTRO */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* 👤 DASHBOARD CLIENTE */}

        <Route
          path="/cliente"
          element={<ClienteDashboard />}
        />


        {/* 👨‍💼 DASHBOARD CONTADOR */}

        <Route
          path="/contador"
          element={<ContadorDashboard />}
        />


        {/* 👥 CLIENTES */}

        <Route
          path="/clientes"
          element={<Clientes />}
        />


        {/* 📄 DOCUMENTOS DEL CONTADOR */}

        <Route
          path="/documentos"
          element={<Documentos />}
        />

        <Route
        path="/facturacion"
        element={<Facturacion />}
        />

        <Route
        path="/citas"
        element={<Citas />}
        />

        <Route
        path="/reportes"
        element={<Reportes />}
        />

        {/* 📄 MIS DOCUMENTOS */}

        <Route
          path="/mis-documentos"
          element={<MisDocumentos />}
        />


        {/* 📤 SUBIR DOCUMENTO */}

        <Route
          path="/subir-documento"
          element={<SubirDocumento />}
        />


        {/* 📅 MIS CITAS */}

        <Route
          path="/mis-citas"
          element={<MisCitas />}
        />


        {/* 👤 MI PERFIL */}

        <Route
          path="/mi-perfil"
          element={<MiPerfil />}
        />


        {/* 📋 MIS SOLICITUDES */}

        <Route
          path="/mis-solicitudes"
          element={<MisSolicitudes />}
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;


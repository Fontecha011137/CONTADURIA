import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import ClienteDashboard from "./pages/clienteDashboard";
import ContadorDashboard from "./pages/contadorDashboard";
import MisDocumentos from "./pages/misDocumentos";
import SubirDocumento from "./pages/subirDocumentos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cliente" element={<ClienteDashboard />} />
        <Route path="/contador" element={<ContadorDashboard />} />
        <Route path="/mis-documentos" element={<MisDocumentos />} />
        <Route path="/subir-documento" element={<SubirDocumento />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
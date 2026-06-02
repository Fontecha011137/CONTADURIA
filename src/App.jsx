import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import ClienteDashboard from "./pages/clienteDashboard";
import ContadorDashboard from "./pages/contadorDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cliente" element={<ClienteDashboard />} />
        <Route path="/contador" element={<ContadorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
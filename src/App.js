import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Solicitar from "./pages/Solicitar";
import Consultar from "./pages/Consultar";
import Base from "./pages/Base";
import Fiscal from "./pages/Fiscal";
import ConsultarRecebimentos from "./pages/ConsultarRecebimentos";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/solicitar" element={<Solicitar />} />
        <Route path="/consultar" element={<Consultar />} />
        <Route path="/base" element={<Base />} />
        <Route path="/fiscal" element={<Fiscal />} />
        <Route path="/consultar-recebimentos" element={<ConsultarRecebimentos />} />
      </Routes>
    </Router>
  );
}

export default App;

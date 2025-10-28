import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/home.css";

// Importamos las páginas
import Registro from "./pages/users/registro";
import Login from "./pages/users/login";
import Home from "./pages/home";
import Header from "./components/header";
import Footer from "./components/footer";
import Perfil from "./pages/users/perfil";
import ProductosPanel from "./pages/vendedor/ProductosPanel";
import Catalogo from "./pages/catalogo";
import VistaPrevia from "./pages/producto/vistaPrevia";

function App() {
  return (
    <Router>
      

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<Perfil/>} />
        <Route path="/productos" element={<ProductosPanel/>} />
        <Route path="/catalogo" element={<Catalogo/>} />
        <Route path="/vistaprevia" element={<VistaPrevia/>} />
      </Routes>
    </Router>
  );
}

export default App;

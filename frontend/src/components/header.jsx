// frontend/src/components/header.jsx

import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  UserCircle,
} from "lucide-react";
import "../styles/components/header.css";
import PremiumBadge from "./premiumBadge";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0); // ✅ Contador dinámico
  const [usuario, setUsuario] = useState(null);

  // ✅ Cargar datos del usuario al montar el componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioData = localStorage.getItem("usuario");

    if (token && usuarioData) {
      try {
        const user = JSON.parse(usuarioData);
        setUsuario(user);

        // ✅ Si hay usuario autenticado, cargar el contador del carrito
        cargarContadorCarrito(token);
      } catch (error) {
        console.error("Error al parsear usuario:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      }
    }
  }, []);

  // ✅ NUEVA FUNCIÓN: Obtener el número de productos en el carrito
  const cargarContadorCarrito = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/carrito/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const totales = response.data.totales;
        // total_productos es la suma de todas las cantidades (ej: 2 pastillas + 3 filtros = 5)
        setCartCount(totales.total_productos || 0);
      }
    } catch (error) {
      console.error("Error al cargar contador del carrito:", error);
      // Si hay error, dejamos el contador en 0
      setCartCount(0);
    }
  };

  // ✅ NUEVA FUNCIÓN: Actualizar el contador cuando se agrega un producto
  const actualizarContadorCarrito = () => {
    const token = localStorage.getItem("token");
    if (token) {
      cargarContadorCarrito(token);
    }
  };

  // ✅ Exponer la función para que otros componentes puedan actualizar el contador
  useEffect(() => {
    // Crear un evento personalizado para actualizar el carrito desde otros componentes
    window.addEventListener("cartUpdated", actualizarContadorCarrito);

    return () => {
      window.removeEventListener("cartUpdated", actualizarContadorCarrito);
    };
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) {
      window.location.href = `/catalogo?busqueda=${encodeURIComponent(query)}`;
    }
  };

  const handleCartClick = () => {
    window.location.href = "/carrito";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    setCartCount(0); // ✅ Resetear contador al cerrar sesión
    window.location.href = "/";
  };

  const getNombreCompleto = () => {
    if (!usuario) return "";
    return `${usuario.primer_nombre} ${usuario.primer_apellido}`;
  };

  return (
    <header className="header">
      <div className="header-container">
        <a href="/" className="header-logo">
          <div className="header-logo-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="header-logo-text">Autocanje</span>
        </a>

        <form className="header-search" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              name="search"
              className="search-input"
              placeholder="Buscar partes, repuestos, accesorios..."
            />
          </div>
        </form>

        <div className="header-actions">
          <PremiumBadge />
          <button
            className="btn-base btn-icon-only btn-outlined cart-button"
            onClick={handleCartClick}
            aria-label="Carrito de compras"
          >
            <ShoppingCart size={24} />
            {/* ✅ ACTUALIZADO: Mostrar badge solo si hay productos */}
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {usuario ? (
            <>
              <a
                href="/perfil"
                className="btn-base btn-icon-only btn-outlined btn-profile"
                aria-label="Ver Perfil"
              >
                <User size={24} />
              </a>
              <button
                onClick={handleLogout}
                className="btn-base btn-icon-only btn-outlined btn-danger btn-logout-desktop"
                aria-label="Cerrar Sesión"
              >
                <LogOut size={24} />
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="btn-base btn-outlined text-sm btn-login width-btn"
              >
                Iniciar Sesión
              </a>
              <a
                href="/registro"
                className="btn-base btn-primary text-sm btn-register width-btn reg"
              >
                Registrarse
              </a>
            </>
          )}

          <button
            className="btn-base btn-icon-only mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Menú"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                name="search"
                className="search-input"
                placeholder="Buscar partes, repuestos..."
              />
            </div>
          </form>

          <div className="mobile-actions">
            {usuario ? (
              <>
                <div className="mobile-user-info flex-center gap-lg">
                  <UserCircle size={32} />
                  <div className="user-info">
                    <p className="text-semibold text-primary">
                      {getNombreCompleto()}
                    </p>
                    <p className="text-sm text-secondary">{usuario.email}</p>
                  </div>
                </div>
                <a
                  href="/perfil"
                  className="btn-base btn-outlined flex-center gap-md text-sm"
                >
                  <User size={18} /> Ver Perfil
                </a>
                <button
                  onClick={handleLogout}
                  className="btn-base btn-outlined btn-danger flex-center gap-md text-sm"
                >
                  <LogOut size={18} /> Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="btn-base btn-outlined text-sm">
                  Iniciar Sesión
                </a>
                <a href="/registro" className="btn-base btn-primary text-sm">
                  Registrarse
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, User, LogOut, UserCircle } from 'lucide-react';
import '../styles/components/header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount] = useState(3);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioData = localStorage.getItem('usuario');
    if (token && usuarioData) {
      try {
        const user = JSON.parse(usuarioData);
        setUsuario(user);
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const toggleUserMenu = () => setUserMenuOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) console.log('Buscando:', query);
  };

  const handleCartClick = () => console.log('Abriendo carrito');
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  const getNombreCompleto = () => {
    if (!usuario) return '';
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
          <button
            className="btn-base btn-icon-only btn-outlined cart-button relative"
            onClick={handleCartClick}
            aria-label="Carrito de compras"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && <span className="cart-badge absolute">{cartCount}</span>}
          </button>

          {usuario ? (
            <div className="user-menu-container">
              <button
                className="btn-base btn-outlined flex-center gap-sm user-menu-button"
                onClick={toggleUserMenu}
              >
                <UserCircle size={24} />
                <span className="user-name text-sm text-medium">{getNombreCompleto()}</span>
              </button>

              <div className={`dropdown ${userMenuOpen ? 'show' : ''}`}>
                <ul className="dropdown-menu">
                  <li>
                    <a href="/perfil" className="btn-base dropdown-item flex-center gap-md text-sm">
                      <User size={18} />
                      <span>Ver Perfil</span>
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="btn-base dropdown-item btn-danger flex-center gap-md text-sm"
                    >
                      <LogOut size={18} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <a href="/login" className="btn-base btn-outlined text-sm btn-login">
                Iniciar Sesión
              </a>
              <a href="/registro" className="btn-base btn-primary text-sm btn-register">
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
                    <p className="text-semibold text-primary">{getNombreCompleto()}</p>
                    <p className="text-sm text-secondary">{usuario.email}</p>
                  </div>
                </div>
                <a href="/perfil" className="btn-base btn-outlined flex-center gap-md text-sm">
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

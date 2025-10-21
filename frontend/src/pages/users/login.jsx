// frontend/src/pages/users/login.jsx

import React, { useState } from 'react';
import '../../styles/login.css';
import axios from 'axios';

/**
 * Componente de Inicio de Sesión
 * 
 * Permite a los usuarios autenticarse en la plataforma Autocanje
 * Incluye:
 * - Formulario de login con email y contraseña
 * - Opción "Recordarme"
 * - Enlace para recuperar contraseña
 * - Toggle para mostrar/ocultar contraseña
 * - Panel decorativo lateral con estadísticas
 */
const Login = () => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  // Estado para controlar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Maneja los cambios en los campos del formulario
   * @param {Event} e - Evento del input
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Alterna la visibilidad de la contraseña
   */
  const togglePassword = () => {
    setShowPassword(prev => !prev);
  };

  /**
   * Maneja el envío del formulario de login
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos
    if (!formData.email || !formData.password) {
      alert("Por favor ingresa tu correo y contraseña.");
      return;
    }

    try {
      // Enviar al backend con el campo "contrasena" que espera el servidor
      const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
        email: formData.email,
        contrasena: formData.password  // Convertir "password" a "contrasena" para el backend
      });

      if (response.data.token) {
        // Guardar token en localStorage
        localStorage.setItem("token", response.data.token);
        
        // Opcional: Guardar información del usuario
        if (response.data.usuario) {
          localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
        }

        alert("Inicio de sesión exitoso");
        console.log("Token JWT:", response.data.token);
        
        // Redirigir a la página principal
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error completo:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          alert("Credenciales incorrectas o usuario no encontrado.");
        } else if (error.response.status === 400) {
          alert(error.response.data.error || "Datos inválidos. Verifica tu email y contraseña.");
        } else {
          alert("Error al iniciar sesión. Por favor intenta de nuevo.");
        }
        console.error("Respuesta del servidor:", error.response.data);
      } else if (error.request) {
        alert("No se pudo conectar con el servidor. Verifica tu conexión.");
      } else {
        alert("Error inesperado. Ver consola para más detalles.");
      }
    }
  };

  return (
    <div className="login-wrapper">
      
      {/* ========================================
          LADO IZQUIERDO - Panel Decorativo
          ======================================== */}
      <div className="login-left-side">
        {/* Patrón de fondo con círculos decorativos */}
        <div className="login-background-pattern">
          <div className="login-circle login-circle-1"></div>
          <div className="login-circle login-circle-2"></div>
          <div className="login-circle login-circle-3"></div>
        </div>

        {/* Logo de Autocanje */}
        <div className="login-logo-section">
          <a href="/" className="login-logo">
            <div className="login-logo-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="login-logo-text">Autocanje</span>
          </a>
        </div>

        {/* Contenido principal del panel izquierdo */}
        <div className="login-content-section">
          <h1 className="login-main-title">
            Bienvenido de vuelta a tu marketplace de partes vehiculares
          </h1>
          <p className="login-main-description">
            Accede a miles de productos, gestiona tus ventas y disfruta de los beneficios premium.
          </p>

          {/* Grid de estadísticas */}
          <div className="login-stats-grid">
            <div className="login-stat-card">
              <div className="login-stat-number">15K+</div>
              <div className="login-stat-label">Productos disponibles</div>
            </div>
            <div className="login-stat-card">
              <div className="login-stat-number">8K+</div>
              <div className="login-stat-label">Usuarios activos</div>
            </div>
          </div>
        </div>

        {/* Footer del panel izquierdo */}
        <div className="login-footer-text">
          © 2025 Autocanje. Todos los derechos reservados.
        </div>
      </div>

      {/* ========================================
          LADO DERECHO - Formulario de Login
          ======================================== */}
      <div className="login-right-side">
        <div className="login-form-container">
          
          {/* Logo móvil (visible solo en pantallas pequeñas) */}
          <div className="login-mobile-logo">
            <a href="/" className="login-logo">
              <div className="login-logo-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="login-logo-text">Autocanje</span>
            </a>
          </div>

          {/* Encabezado del formulario */}
          <div className="login-form-header">
            <h2 className="login-form-title">Iniciar Sesión</h2>
            <p className="login-form-subtitle">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>

          {/* Formulario principal */}
          <form className="login-form" onSubmit={handleSubmit}>
            
            {/* Campo de correo electrónico */}
            <div className="login-form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com" 
                  required 
                />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div className="login-form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••" 
                  required 
                />
                
                {/* Botón para mostrar/ocultar contraseña */}
                <button 
                  type="button" 
                  className="login-password-toggle" 
                  onClick={togglePassword}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    // Icono de ojo tachado (ocultar)
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    // Icono de ojo (mostrar)
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Opciones del formulario */}
            <div className="login-form-options">
              {/* Checkbox "Recordarme" */}
              <div className="login-checkbox-wrapper">
                <input 
                  type="checkbox" 
                  id="remember" 
                  name="remember"
                  checked={formData.remember}
                  onChange={handleInputChange}
                />
                <label htmlFor="remember">Recordarme</label>
              </div>
              
              {/* Enlace para recuperar contraseña */}
              <a href="/forgot-password" className="login-forgot-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de submit */}
            <button type="submit" className="login-btn-primary">
              Iniciar Sesión
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </form>

          {/* Enlace para registrarse */}
          <p className="login-register-link">
            ¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
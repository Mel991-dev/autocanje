import React, { useState } from "react";
import "../../styles/registro.css";
import axios from 'axios';

/**
 * Componente de Registro de Usuario con Wizard Multi-paso
 *
 * Este componente maneja el flujo completo de registro de usuarios
 * dividido en 4 pasos:
 * 1. Información Personal
 * 2. Información de Contacto
 * 3. Dirección de Domicilio
 * 4. Rol y Seguridad
 */
const Registro = () => {
  // Estado para el paso actual del wizard (1-4)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    identificacion: "",
    email: "",
    telefono: "",
    direccion: "",
    role: "both",
    password: "",
    confirmPassword: "",
    terms: false,
    newsletter: false,
  });

  /**
   * Actualiza el progreso visual de la barra de progreso
   * @returns {number} Porcentaje de progreso (0-100)
   */
  const getProgress = () => {
    return (currentStep / totalSteps) * 100;
  };

  /**
   * Maneja el cambio de valores en los inputs del formulario
   * @param {Event} e - Evento del input
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Cambia el paso actual del wizard
   * @param {number} direction - Dirección del cambio (-1 para atrás, +1 para adelante)
   */
  const changeStep = (direction) => {
    const newStep = currentStep + direction;
    if (newStep >= 1 && newStep <= totalSteps) {
      setCurrentStep(newStep);
    }
  };

  /**
   * Selecciona un rol de usuario (buyer/seller/both)
   * @param {string} role - Rol seleccionado
   */
  const selectRole = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  /**
   * Maneja el envío del formulario de registro
   * @param {Event} e - Evento del formulario
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (
      !formData.primer_nombre ||
      !formData.primer_apellido ||
      !formData.email ||
      !formData.password
    ) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("El correo electrónico no tiene un formato válido.");
      return;
    }

    if (formData.password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    // Datos a enviar al backend
    const data = {
      identificacion: formData.identificacion,
      primer_nombre: formData.primer_nombre,
      segundo_nombre: formData.segundo_nombre || null,
      primer_apellido: formData.primer_apellido,
      segundo_apellido: formData.segundo_apellido || null,
      email: formData.email,
      contrasena: formData.password,
      telefono: formData.telefono,
      direccion: formData.direccion,
      es_vendedor: formData.role === "seller" || formData.role === "both",
      es_comprador: formData.role === "buyer" || formData.role === "both",
      es_admin: false,
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/auth/register",
        data
      );
      alert("¡Usuario registrado exitosamente!");
      console.log("Respuesta del servidor:", response.data);
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      alert("Error al registrar usuario. Ver consola.");
    }
  };

  return (
    <div className="registro-container">
      {/* Header con logo y título */}
      <div className="registro-header">
        <a href="/" className="registro-logo">
          <div className="registro-logo-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="registro-logo-text">Autocanje</span>
        </a>
        <h1>Crear Cuenta</h1>
        <p className="registro-subtitle">
          Completa el registro para comenzar a comprar y vender partes
          vehiculares
        </p>
      </div>

      {/* Barra de progreso del wizard */}
      <div className="registro-progress-section">
        <div className="registro-progress-info">
          <span>
            Paso {currentStep} de {totalSteps}
          </span>
          <span>{Math.round(getProgress())}% completado</span>
        </div>
        <div className="registro-progress-bar">
          <div
            className="registro-progress-fill"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Card principal con el formulario */}
      <div className="registro-card">
        <form onSubmit={handleSubmit}>
          {/* PASO 1: Información Personal */}
          {currentStep === 1 && (
            <div className="registro-form-step">
              <div className="registro-step-header">
                <div className="registro-step-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="registro-step-title">
                  <h2>Información Personal</h2>
                  <p>Ingresa tus datos básicos</p>
                </div>
              </div>

              <div className="registro-form-row">
                <div className="registro-form-group">
                  <label htmlFor="primer_nombre">Primer Nombre *</label>
                  <input
                    type="text"
                    id="primer_nombre"
                    name="primer_nombre"
                    value={formData.primer_nombre}
                    onChange={handleInputChange}
                    placeholder="Juan"
                    required
                  />
                </div>
                <div className="registro-form-group">
                  <label htmlFor="segundo_nombre">Segundo Nombre</label>
                  <input
                    type="text"
                    id="segundo_nombre"
                    name="segundo_nombre"
                    value={formData.segundo_nombre}
                    onChange={handleInputChange}
                    placeholder="Carlos"
                  />
                </div>
              </div>

              <div className="registro-form-row">
                <div className="registro-form-group">
                  <label htmlFor="primer_apellido">Primer Apellido *</label>
                  <input
                    type="text"
                    id="primer_apellido"
                    name="primer_apellido"
                    value={formData.primer_apellido}
                    onChange={handleInputChange}
                    placeholder="Pérez"
                    required
                  />
                </div>
                <div className="registro-form-group">
                  <label htmlFor="segundo_apellido">Segundo Apellido</label>
                  <input
                    type="text"
                    id="segundo_apellido"
                    name="segundo_apellido"
                    value={formData.segundo_apellido}
                    onChange={handleInputChange}
                    placeholder="García"
                  />
                </div>
              </div>

              <div className="registro-form-group">
                <label htmlFor="identificacion">
                  Identificación Personal *
                </label>
                <input
                  type="text"
                  id="identificacion"
                  name="identificacion"
                  value={formData.identificacion}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                  maxLength="15"
                  required
                />
                <p className="registro-help-text">
                  Cédula de ciudadanía, pasaporte u otro documento de identidad
                </p>
              </div>
            </div>
          )}

          {/* PASO 2: Información de Contacto */}
          {currentStep === 2 && (
            <div className="registro-form-step">
              <div className="registro-step-header">
                <div className="registro-step-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="registro-step-title">
                  <h2>Información de Contacto</h2>
                  <p>¿Cómo podemos comunicarnos contigo?</p>
                </div>
              </div>

              <div className="registro-form-group">
                <label htmlFor="email">Correo Electrónico *</label>
                <div className="registro-input-with-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    maxLength="191"
                    required
                  />
                </div>
              </div>

              <div className="registro-form-group">
                <label htmlFor="telefono">Teléfono *</label>
                <div className="registro-input-with-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+57 300 123 4567"
                    maxLength="15"
                    required
                  />
                </div>
                <p className="registro-help-text">
                  Incluye el código de país para mejor comunicación
                </p>
              </div>
            </div>
          )}

          {/* PASO 3: Dirección de Domicilio */}
          {currentStep === 3 && (
            <div className="registro-form-step">
              <div className="registro-step-header">
                <div className="registro-step-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="registro-step-title">
                  <h2>Dirección de Domicilio</h2>
                  <p>Para entregas y facturación</p>
                </div>
              </div>

              <div className="registro-form-group">
                <label htmlFor="direccion">Dirección Completa *</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Calle 123 #45-67"
                  maxLength="255"
                  required
                />
              </div>
            </div>
          )}

          {/* PASO 4: Rol y Seguridad */}
          {currentStep === 4 && (
            <div className="registro-form-step">
              <div className="registro-step-header">
                <div className="registro-step-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="registro-step-title">
                  <h2>Rol y Seguridad</h2>
                  <p>Define tu rol y protege tu cuenta</p>
                </div>
              </div>

              {/* Selector de roles */}
              <div className="registro-form-group">
                <label>¿Cómo deseas usar Autocanje? *</label>
                <div className="registro-role-options">
                  {/* Opción: Solo Comprador */}
                  <div
                    className={`registro-role-option ${
                      formData.role === "buyer" ? "selected" : ""
                    }`}
                    onClick={() => selectRole("buyer")}
                  >
                    <input
                      type="radio"
                      name="role"
                      id="buyer"
                      value="buyer"
                      checked={formData.role === "buyer"}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="buyer">
                      <div className="registro-role-header">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        <span>Solo Comprador</span>
                      </div>
                      <p className="registro-role-description">
                        Buscar y comprar partes vehiculares de otros vendedores
                      </p>
                    </label>
                  </div>

                  {/* Opción: Solo Vendedor */}
                  <div
                    className={`registro-role-option ${
                      formData.role === "seller" ? "selected" : ""
                    }`}
                    onClick={() => selectRole("seller")}
                  >
                    <input
                      type="radio"
                      name="role"
                      id="seller"
                      value="seller"
                      checked={formData.role === "seller"}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="seller">
                      <div className="registro-role-header">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span>Solo Vendedor</span>
                      </div>
                      <p className="registro-role-description">
                        Publicar y vender tus productos en la plataforma
                      </p>
                    </label>
                  </div>

                  {/* Opción: Comprador y Vendedor (Recomendado) */}
                  <div
                    className={`registro-role-option ${
                      formData.role === "both" ? "selected" : ""
                    }`}
                    onClick={() => selectRole("both")}
                  >
                    <input
                      type="radio"
                      name="role"
                      id="both"
                      value="both"
                      checked={formData.role === "both"}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="both">
                      <div className="registro-role-header">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        <span>Comprador y Vendedor</span>
                        <span className="registro-badge">Recomendado</span>
                      </div>
                      <p className="registro-role-description">
                        Acceso completo para comprar y vender (puedes cambiar
                        después)
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Campos de contraseña */}
              <div className="registro-form-group">
                <label htmlFor="password">Contraseña *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  maxLength="100"
                  required
                />
                <p className="registro-help-text">
                  Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
                </p>
              </div>

              <div className="registro-form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Términos y condiciones */}
              <div className="registro-terms-section">
                <div className="registro-checkbox-group">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="terms">
                    Acepto los <a href="#">Términos y Condiciones</a> y la{" "}
                    <a href="#">Política de Privacidad</a>
                  </label>
                </div>

                <div className="registro-checkbox-group">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="newsletter">
                    Deseo recibir ofertas especiales, promociones y novedades
                    por correo electrónico
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="registro-button-row">
            <button
              type="button"
              className="registro-btn-outline"
              onClick={() => changeStep(-1)}
              disabled={currentStep === 1}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Anterior
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                className="registro-btn-primary"
                onClick={() => changeStep(1)}
              >
                Siguiente
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ) : (
              <button type="submit" className="registro-btn-primary">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Crear Cuenta
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Footer con enlace a login */}
      <div className="registro-footer">
        ¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a>
      </div>
    </div>
  );
};

export default Registro;

// frontend/src/components/MembresiaStatus.jsx

import React, { useState, useEffect } from 'react';
import { Crown, Calendar, Clock, TrendingUp, Shield, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import '../styles/components/membresiaStatus.css';

const MembresiaStatus = () => {
  const [membresia, setMembresia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembresia();
  }, []);

  const fetchMembresia = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/membresias/mi-membresia', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.es_premium) {
        setMembresia(data.membresia);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="membresia-status-card loading">
        <div className="membresia-loading">
          <RefreshCw className="spin" size={32} />
          <p>Cargando información de membresía...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="membresia-status-card error">
        <AlertCircle size={32} />
        <p>Error al cargar membresía</p>
        <button onClick={fetchMembresia} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  // Usuario sin membresía premium
  if (!membresia) {
    return (
      <div className="membresia-status-card no-premium">
        <div className="no-premium-header">
          <Crown size={48} className="crown-icon" />
          <h3>¿Quieres ser Premium?</h3>
        </div>
        
        <p className="no-premium-description">
          Accede a descuentos exclusivos, entregas prioritarias, reserva de productos y mucho más
        </p>

        <div className="no-premium-benefits">
          <div className="benefit-item">
            <TrendingUp size={20} className="benefit-icon" />
            <span>Hasta 20% de descuento</span>
          </div>
          <div className="benefit-item">
            <Zap size={20} className="benefit-icon" />
            <span>Entrega en 1-3 días</span>
          </div>
          <div className="benefit-item">
            <Shield size={20} className="benefit-icon" />
            <span>Reserva de productos</span>
          </div>
        </div>

        <a href="/premium" className="btn-ver-planes">
          <Crown size={20} />
          Ver Planes Premium
        </a>
      </div>
    );
  }

  // Usuario con membresía premium activa
  const fechaInicio = new Date(membresia.fecha_inicio);
  const fechaFin = new Date(membresia.fecha_fin);
  const diasRestantes = membresia.dias_restantes;
  const esCritico = diasRestantes <= 7;

  return (
    <div className="membresia-status-card premium-active">
      {/* Header con nombre del plan */}
      <div className="premium-header">
        <div className="premium-icon-wrapper">
          <Crown size={40} className="premium-crown" />
        </div>
        <div className="premium-title">
          <h3>Membresía {membresia.nombre_plan}</h3>
          <span className={`premium-badge ${membresia.activa ? 'activa' : 'inactiva'}`}>
            {membresia.activa ? '✓ Activa' : '✗ Inactiva'}
          </span>
        </div>
      </div>

      {/* Descripción del plan */}
      <p className="premium-description">{membresia.descripcion}</p>

      {/* Información de fechas */}
      <div className="premium-dates">
        <div className="date-item">
          <Calendar size={20} />
          <div className="date-info">
            <span className="date-label">Inicio</span>
            <span className="date-value">
              {fechaInicio.toLocaleDateString('es-CO', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>

        <div className="date-item">
          <Calendar size={20} />
          <div className="date-info">
            <span className="date-label">Vencimiento</span>
            <span className="date-value">
              {fechaFin.toLocaleDateString('es-CO', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>

        <div className={`date-item dias-restantes ${esCritico ? 'critico' : ''}`}>
          <Clock size={20} />
          <div className="date-info">
            <span className="date-label">Días restantes</span>
            <span className="date-value-highlight">
              {diasRestantes} días
            </span>
          </div>
        </div>
      </div>

      {/* Alerta si está próximo a vencer */}
      {esCritico && (
        <div className="alerta-vencimiento">
          <AlertCircle size={20} />
          <div>
            <strong>¡Tu membresía está por vencer!</strong>
            <p>Renueva ahora para seguir disfrutando de tus beneficios</p>
          </div>
        </div>
      )}

      {/* Beneficios activos */}
      <div className="premium-benefits-section">
        <h4>Tus beneficios activos</h4>
        <div className="benefits-grid">
          <div className="benefit-card">
            <TrendingUp size={24} className="benefit-card-icon yellow" />
            <div className="benefit-card-content">
              <span className="benefit-value">{membresia.beneficios.descuento_porcentaje}%</span>
              <span className="benefit-label">Descuento</span>
            </div>
          </div>

          <div className="benefit-card">
            <Zap size={24} className="benefit-card-icon blue" />
            <div className="benefit-card-content">
              <span className="benefit-value">{membresia.beneficios.dias_envio} días</span>
              <span className="benefit-label">Envío Prioritario</span>
            </div>
          </div>

          {membresia.beneficios.permite_reservas && (
            <div className="benefit-card">
              <Shield size={24} className="benefit-card-icon green" />
              <div className="benefit-card-content">
                <span className="benefit-value">30 días</span>
                <span className="benefit-label">Reservas</span>
              </div>
            </div>
          )}
        </div>

        {/* Lista de beneficios adicionales */}
        <ul className="benefits-list">
          <li>
            <span className="check-icon">✓</span>
            {membresia.beneficios.descuento_porcentaje}% de descuento en todas las compras
          </li>
          <li>
            <span className="check-icon">✓</span>
            Entrega prioritaria en {membresia.beneficios.dias_envio} días
          </li>
          {membresia.beneficios.permite_reservas && (
            <li>
              <span className="check-icon">✓</span>
              Reserva de productos por hasta 30 días
            </li>
          )}
          <li>
            <span className="check-icon">✓</span>
            Soporte prioritario 24/7
          </li>
          <li>
            <span className="check-icon">✓</span>
            Sin comisiones adicionales
          </li>
        </ul>
      </div>

      {/* Renovación automática */}
      <div className="renovacion-info">
        <div className="renovacion-status">
          <RefreshCw size={16} />
          <span>
            Renovación automática: {membresia.renovacion_auto ? 'Activada' : 'Desactivada'}
          </span>
        </div>
        {membresia.renovacion_auto && (
          <p className="renovacion-note">
            Tu membresía se renovará automáticamente el {fechaFin.toLocaleDateString('es-CO')}
          </p>
        )}
      </div>

      {/* Botones de acción */}
      <div className="premium-actions">
        <a href="/premium" className="btn-cambiar-plan">
          Ver Otros Planes
        </a>
        <a href="/mis-reservas" className="btn-ver-reservas">
          <Shield size={18} />
          Mis Reservas
        </a>
      </div>
    </div>
  );
};

export default MembresiaStatus;
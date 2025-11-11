// frontend/src/components/DescuentoPremium.jsx

import React from 'react';
import { Crown, Tag, TrendingUp, Sparkles } from 'lucide-react';
import '../styles/components/descuentoPremium.css';

const DescuentoPremium = ({ descuento, subtotal, className = '' }) => {
  // Si no hay descuento o no es premium, no mostrar nada
  if (!descuento || !descuento.es_premium || descuento.descuento <= 0) {
    return null;
  }

  const porcentaje = descuento.porcentaje || 0;
  const montoDescuento = descuento.descuento || 0;
  const totalConDescuento = descuento.total_con_descuento || subtotal;

  return (
    <div className={`descuento-premium-wrapper ${className}`}>
      {/* Fila de descuento en resumen */}
      <div className="descuento-row">
        <div className="descuento-label">
          <Crown size={18} className="descuento-icon" />
          <span>Descuento Premium ({porcentaje}%)</span>
        </div>
        <div className="descuento-monto">
          -${montoDescuento.toLocaleString('es-CO')}
        </div>
      </div>

      {/* Banner de ahorro */}
      <div className="descuento-banner">
        <div className="descuento-banner-content">
          <Sparkles size={24} className="banner-icon" />
          <div className="banner-text">
            <strong>¡Ahorraste ${montoDescuento.toLocaleString('es-CO')}!</strong>
            <p>Gracias a tu membresía {descuento.membresia?.nombre || 'Premium'}</p>
          </div>
        </div>
        {descuento.membresia?.dias_restantes && descuento.membresia.dias_restantes <= 7 && (
          <div className="banner-renovar">
            <span>Tu membresía vence en {descuento.membresia.dias_restantes} días</span>
            <a href="/premium">Renovar</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescuentoPremium;
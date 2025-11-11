// frontend/src/hooks/useDescuentoPremium.js

import { useState, useEffect } from "react";

/**
 * Hook personalizado para calcular y aplicar descuentos premium
 *
 * @param {number} subtotal - Subtotal de la compra
 * @param {boolean} autoCalular - Si debe calcular automáticamente
 * @returns {Object} - Información del descuento
 */
export const useDescuentoPremium = (subtotal, autoCalcular = true) => {
  const [descuento, setDescuento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (autoCalcular && subtotal > 0) {
      calcularDescuento();
    }
  }, [subtotal, autoCalcular]);

  const calcularDescuento = async () => {
    const token = localStorage.getItem("token");

    if (!token || subtotal <= 0) {
      setDescuento({
        es_premium: false,
        descuento: 0,
        porcentaje: 0,
        total_con_descuento: subtotal,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/membresias/calcular-descuento",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subtotal }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setDescuento(data.resultado);
      } else {
        // Si no es premium o hay error, sin descuento
        setDescuento({
          es_premium: false,
          descuento: 0,
          porcentaje: 0,
          total_con_descuento: subtotal,
        });
      }
    } catch (err) {
      console.error("Error al calcular descuento:", err);
      setError(err.message);
      setDescuento({
        es_premium: false,
        descuento: 0,
        porcentaje: 0,
        total_con_descuento: subtotal,
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para recalcular manualmente
  const recalcular = () => {
    calcularDescuento();
  };

  return {
    descuento,
    loading,
    error,
    recalcular,
    // Helpers
    esPremium: descuento?.es_premium || false,
    montoDescuento: descuento?.descuento || 0,
    porcentaje: descuento?.porcentaje || 0,
    totalConDescuento: descuento?.total_con_descuento || subtotal,
    ahorro: descuento?.descuento || 0,
  };
};

// frontend/src/pages/producto/Carrito.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  Plus,
  Minus,
  ShoppingBag,
  AlertCircle,
  Crown,
  Package,
  Loader,
  Tag,
  Sparkles,
} from "lucide-react";
import { useDescuentoPremium } from "../../hooks/useDescuentoPremium";
import DescuentoPremium from "../../components/DescuentoPremium";
import "../../styles/producto/carrito.css";
import Header from "../../components/header";
import Footer from "../../components/footer";

const API_URL = "http://127.0.0.1:5000/api";

const Carrito = () => {
  const navigate = useNavigate();

  const [carrito, setCarrito] = useState([]);
  const [totales, setTotales] = useState({
    subtotal: 0,
    envio: 0,
    descuento_premium: 0,
    total: 0,
    total_items: 0,
    total_productos: 0,
    es_premium: false,
    envio_gratis_en: 100000,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  // ✨ NUEVO: Hook para calcular descuento premium
  const {
    descuento,
    loading: loadingDescuento,
    esPremium,
    montoDescuento,
    totalConDescuento,
    ahorro,
  } = useDescuentoPremium(totales.subtotal, true);

  // Cargar carrito al montar el componente
  useEffect(() => {
    cargarCarrito();
  }, []);

  const cargarCarrito = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/carrito/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setCarrito(response.data.carrito || []);
        setTotales(response.data.totales || totales);

        // Mostrar alerta si hay items con problemas
        if (
          response.data.items_problematicos &&
          response.data.items_problematicos.length > 0
        ) {
          const problemas = response.data.items_problematicos
            .map((item) => item.nombre_producto)
            .join(", ");
          setError(`Algunos productos tienen problemas de stock: ${problemas}`);
        }
      }
    } catch (err) {
      console.error("Error al cargar carrito:", err);
      setError("Error al cargar el carrito");
    } finally {
      setLoading(false);
    }
  };

  // ✨ NUEVO: Calcular envío según membresía premium
  const calcularEnvio = () => {
    // Si es premium (del hook), envío gratis o reducido
    if (esPremium) {
      return 0; // Envío gratis para premium
    }
    // Usar el envío del backend o valor por defecto
    return totales.envio || 5000;
  };

  // ✨ MODIFICADO: Calcular total final con descuento premium
  const envio = calcularEnvio();
  const totalFinal = (totalConDescuento || totales.subtotal) + envio;

  const actualizarCantidad = async (id_carrito, nueva_cantidad) => {
    const token = localStorage.getItem("token");
    setProcesando(true);

    try {
      const response = await axios.put(
        `${API_URL}/carrito/${id_carrito}/cantidad`,
        { cantidad: nueva_cantidad },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setCarrito(response.data.carrito);
        setTotales(response.data.totales);
        setError("");
      } else {
        setError(response.data.error || "Error al actualizar cantidad");
      }
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
      setError(err.response?.data?.error || "Error al actualizar cantidad");
    } finally {
      setProcesando(false);
    }
  };

  const eliminarItem = async (id_carrito) => {
    const token = localStorage.getItem("token");
    setProcesando(true);

    try {
      const response = await axios.delete(`${API_URL}/carrito/${id_carrito}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setCarrito(response.data.carrito);
        setTotales(response.data.totales);
        setError("");
      }
    } catch (err) {
      console.error("Error al eliminar item:", err);
      setError("Error al eliminar el producto");
    } finally {
      setProcesando(false);
    }
  };

  const handleCantidadChange = (id_carrito, cantidad_actual, delta) => {
    const nueva_cantidad = cantidad_actual + delta;
    if (nueva_cantidad >= 1) {
      actualizarCantidad(id_carrito, nueva_cantidad);
    }
  };

  const handleProcederAlPago = () => {
    if (carrito.length === 0) {
      return;
    }
    navigate("/checkout");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Loading state
  if (loading) {
    return (
      <div className="carrito-container">
        <Header />
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Cargando carrito...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <Header />

      <div className="carrito-content">
        <h1 className="carrito-title">Carrito de Compras</h1>

        {/* Alerta de error */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="carrito-layout">
          {/* Columna izquierda - Productos */}
          <div className="carrito-productos">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <ShoppingBag size={20} />
                  Productos en el Carrito ({totales.total_items})
                </h2>
              </div>

              <div className="card-content">
                {carrito.length === 0 ? (
                  <div className="empty-cart">
                    <ShoppingBag size={64} />
                    <h3>Tu carrito está vacío</h3>
                    <p>Agrega productos para comenzar tu compra</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate("/catalogo")}
                    >
                      Explorar Productos
                    </button>
                  </div>
                ) : (
                  <div className="productos-list">
                    {carrito.map((item) => (
                      <div key={item.id_carrito} className="producto-item">
                        <div className="producto-imagen">
                          {item.imagen_principal ? (
                            <img
                              src={item.imagen_principal}
                              alt={item.nombre_producto}
                            />
                          ) : (
                            <div className="imagen-placeholder">
                              <Package size={32} />
                            </div>
                          )}
                        </div>

                        <div className="producto-info">
                          <h3
                            className="producto-nombre"
                            onClick={() =>
                              navigate(`/producto/${item.fk_producto}`)
                            }
                          >
                            {item.nombre_producto}
                          </h3>
                          <p className="producto-meta">
                            Vendedor: {item.vendedor_nombre}{" "}
                            {item.vendedor_apellido} • {item.categoria}
                          </p>

                          <div className="producto-actions">
                            <div className="cantidad-controls">
                              <button
                                className="btn-cantidad"
                                onClick={() =>
                                  handleCantidadChange(
                                    item.id_carrito,
                                    item.cantidad,
                                    -1
                                  )
                                }
                                disabled={item.cantidad <= 1 || procesando}
                              >
                                <Minus size={16} />
                              </button>
                              <span className="cantidad-valor">
                                {item.cantidad}
                              </span>
                              <button
                                className="btn-cantidad"
                                onClick={() =>
                                  handleCantidadChange(
                                    item.id_carrito,
                                    item.cantidad,
                                    1
                                  )
                                }
                                disabled={
                                  item.cantidad >= item.stock || procesando
                                }
                              >
                                <Plus size={16} />
                              </button>
                              <span className="stock-info">
                                ({item.stock} disponibles)
                              </span>
                            </div>

                            <div className="precio-info">
                              <div className="precio-total">
                                {formatPrice(item.subtotal_item)}
                              </div>
                              <div className="precio-unitario">
                                {formatPrice(item.precio)} c/u
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn-eliminar"
                          onClick={() => eliminarItem(item.id_carrito)}
                          disabled={procesando}
                          title="Eliminar"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha - Resumen */}
          <div className="carrito-resumen">
            <div className="card resumen-card">
              <div className="card-header">
                <h2 className="card-title">Resumen del Pedido</h2>
              </div>

              <div className="card-content">
                {/* Subtotal */}
                <div className="resumen-linea">
                  <span>Subtotal ({totales.total_productos} productos)</span>
                  <span className="valor">{formatPrice(totales.subtotal)}</span>
                </div>

                {/* ✨ NUEVO: Componente de descuento premium */}
                {!loadingDescuento && totales.subtotal > 0 && (
                  <DescuentoPremium 
                    descuento={descuento} 
                    subtotal={totales.subtotal} 
                  />
                )}

                {/* Envío */}
                <div className="resumen-linea">
                  <span>
                    Envío
                    {esPremium && (
                      <span className="badge-premium-envio">
                        <Crown size={14} />
                        Premium
                      </span>
                    )}
                  </span>
                  <span className={`valor ${envio === 0 ? "gratis" : ""}`}>
                    {envio === 0 ? (
                      <span className="envio-gratis-text">
                        <Sparkles size={16} />
                        ¡Gratis!
                      </span>
                    ) : (
                      formatPrice(envio)
                    )}
                  </span>
                </div>

                <div className="separator"></div>

                {/* Total final */}
                <div className="resumen-total">
                  <span>Total</span>
                  <span className="valor-total">{formatPrice(totalFinal)}</span>
                </div>

                {/* ✨ NUEVO: Mostrar ahorro total si es premium */}
                {esPremium && ahorro > 0 && (
                  <div className="ahorro-total-badge">
                    <Tag size={18} />
                    <div className="ahorro-info">
                      <span className="ahorro-label">Ahorro total con Premium:</span>
                      <span className="ahorro-monto">
                        {formatPrice(ahorro)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Badge de entrega prioritaria */}
                {esPremium && (
                  <div className="premium-badge">
                    <Crown size={16} />
                    <span>Entrega prioritaria: 1-3 días hábiles</span>
                  </div>
                )}

                {/* Botones de acción */}
                <button
                  className="btn btn-primary btn-checkout"
                  onClick={handleProcederAlPago}
                  disabled={carrito.length === 0}
                >
                  Proceder al Pago
                  <ArrowRight size={20} />
                </button>

                <button
                  className="btn btn-outline"
                  onClick={() => navigate("/catalogo")}
                >
                  Continuar Comprando
                </button>

                {/* ✨ NUEVO: Banner para usuarios no premium */}
                {!esPremium && !loadingDescuento && carrito.length > 0 && (
                  <div className="banner-upgrade-premium">
                    <div className="banner-upgrade-content">
                      <Crown size={24} className="banner-icon" />
                      <div className="banner-text">
                        <strong>¿Sabías que podrías ahorrar hasta 20%?</strong>
                        <p>Hazte Premium y obtén descuentos en todas tus compras + envío gratis</p>
                      </div>
                    </div>
                    <a href="/premium" className="btn-ver-premium">
                      Ver Planes Premium
                    </a>
                  </div>
                )}

                {/* Alerta de envío gratis */}
                {!esPremium && totales.envio_gratis_en > 0 && (
                  <div className="envio-gratis-alert">
                    <AlertCircle size={16} />
                    <span>
                      Agrega {formatPrice(totales.envio_gratis_en)} más para
                      envío gratis
                    </span>
                  </div>
                )}

                {/* Seguridad */}
                <div className="resumen-seguridad">
                  <span>🔒 Compra 100% segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Carrito;
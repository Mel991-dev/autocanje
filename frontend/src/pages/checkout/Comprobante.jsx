// frontend/src/pages/checkout/Comprobante.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle2,
  Download,
  Mail,
  Package,
  Truck,
  Crown,
  Loader,
  AlertCircle,
} from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import "../../styles/checkout/comprobante.css";

const API_URL = "http://127.0.0.1:5000/api";

const Comprobante = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarComprobante();
  }, [id]);

  const cargarComprobante = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/compras/${id}/comprobante`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setCompra(response.data.compra);
      } else {
        setError(response.data.error || "Error al cargar el comprobante");
      }
    } catch (err) {
      console.error("Error al cargar comprobante:", err);
      setError(err.response?.data?.error || "Error al cargar el comprobante");
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = () => {
    // Simulación de descarga de PDF
    console.log("Descargando PDF del comprobante:", id);
    alert("Función de descarga de PDF en desarrollo");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="comprobante-container">
        <Header />
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Cargando comprobante...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !compra) {
    return (
      <div className="comprobante-container">
        <Header />
        <div className="error-container">
          <AlertCircle size={64} style={{ color: "#dc2626" }} />
          <h2>Error al cargar el comprobante</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary volver-inicio"
          >
            Volver al Inicio
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="comprobante-container">
      <Header />

      <main className="comprobante-content">
        <div className="comprobante-wrapper">
          {/* Mensaje de Éxito */}
          <div className="success-message">
            <div className="success-icon">
              <CheckCircle2 size={48} />
            </div>
            <h1>¡Compra Exitosa!</h1>
            <p>Tu pedido ha sido procesado correctamente</p>
          </div>

          {/* Card Principal del Comprobante */}
          <div className="comprobante-card">
            {/* Header del Comprobante */}
            <div className="comprobante-header">
              <div>
                <h2>Pedido #{compra.id_compra}</h2>
                <p className="fecha">{formatDate(compra.fecha_compra)}</p>
              </div>
              <button className="btn-download" onClick={descargarPDF}>
                <Download size={16} />
                Descargar PDF
              </button>
            </div>

            {/* Confirmación de Email */}
            <div className="email-notice">
              <Mail size={20} />
              <div>
                <p className="notice-title">Confirmación enviada</p>
                <p className="notice-text">
                  Hemos enviado un comprobante digital a{" "}
                  <strong>{compra.email}</strong>
                </p>
              </div>
            </div>

            {/* Información del Comprador */}
            <section className="comprobante-section">
              <h3>Información del Comprador</h3>
              <div className="info-grid">
                <div>
                  <strong>Nombre:</strong> {compra.primer_nombre}{" "}
                  {compra.primer_apellido}
                </div>
                <div>
                  <strong>Email:</strong> {compra.email}
                </div>
                <div>
                  <strong>Teléfono:</strong> {compra.telefono}
                </div>
                <div>
                  <strong>Dirección:</strong> {compra.direccion}
                </div>
              </div>
            </section>

            <div className="separator"></div>

            {/* Productos */}
            <section className="comprobante-section">
              <h3>Productos</h3>
              <div className="productos-list">
                {compra.detalles &&
                  compra.detalles.map((item, index) => (
                    <div key={index} className="producto-item">
                      <div className="producto-imagen">
                        <Package size={24} />
                      </div>
                      <div className="producto-info">
                        <p className="producto-nombre">
                          {item.nombre_producto}
                        </p>
                        <p className="producto-cantidad">
                          Cantidad: {item.cantidad}
                        </p>
                        <p className="producto-precio">
                          {formatPrice(item.subtotal_detalle)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            <div className="separator"></div>

            {/* Resumen de Precios */}
            <section className="comprobante-section">
              <div className="totales">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span className="valor">{formatPrice(compra.subtotal)}</span>
                </div>
                <div className="total-row">
                  <span>Envío</span>
                  <span className="valor gratis">Gratis</span>
                </div>
                {compra.compra_premium && compra.descuento_aplicado > 0 && (
                  <div className="total-row descuento">
                    <span className="descuento-label">
                      <Crown size={16} />
                      Descuento Premium
                    </span>
                    <span className="valor descuento-valor">
                      -{formatPrice(compra.descuento_aplicado)}
                    </span>
                  </div>
                )}
                <div className="separator"></div>
                <div className="total-row total-final">
                  <span>Total Pagado</span>
                  <span className="valor-final">
                    {formatPrice(compra.total)}
                  </span>
                </div>
                {compra.pago && (
                  <p className="metodo-pago">
                    Método de pago: {compra.pago.nombre_metodo_pago}
                  </p>
                )}
              </div>
            </section>

            <div className="separator"></div>

            {/* Información de Entrega */}
            <section className="comprobante-section">
              <div className="entrega-card">
                <Truck size={20} />
                <div>
                  <p className="entrega-title">Información de Entrega</p>
                  {compra.compra_premium && (
                    <div className="premium-badge">
                      <Crown size={16} />
                      <span>Entrega Prioritaria</span>
                    </div>
                  )}
                  <p className="entrega-tiempo">
                    Tiempo estimado:{" "}
                    <strong>
                      {compra.compra_premium ? "1-3" : "3-7"} días hábiles
                    </strong>
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Botones de Acción */}
          <div className="acciones">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/perfil")}
            >
              <Package size={16} />
              Ver Mis Pedidos
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate("/catalogo")}
            >
              Seguir Comprando
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Comprobante;

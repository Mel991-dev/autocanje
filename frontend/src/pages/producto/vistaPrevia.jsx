// frontend/src/pages/producto/vistaPrevia.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Heart,
  Share2,
  ShoppingCart,
  CheckCircle,
  Package,
  Shield,
  RefreshCw,
  Clock,
  Star,
  Loader,
} from "lucide-react";
import "../../styles/producto/vistaprevia.css";
import Header from "../../components/header";
import Footer from "../../components/footer";

const API_URL = "http://127.0.0.1:5000/api";

const VistaPrevia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados del componente
  const [producto, setProducto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isFavorite, setIsFavorite] = useState(false);

  // Cargar producto al montar
  useEffect(() => {
    cargarProducto();
  }, [id]);

  const cargarProducto = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/catalogo/${id}`);
      
      if (response.data.success) {
        setProducto(response.data.producto);
        setRelacionados(response.data.relacionados || []);
      } else {
        setError(response.data.error || "Producto no encontrado");
      }
    } catch (err) {
      console.error("Error al cargar producto:", err);
      setError("Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (index) => {
    setActiveImage(index);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (producto?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAddToCart = () => {
    console.log("Agregado al carrito:", { productId: producto.id_producto, quantity });
    alert(`Agregado al carrito: ${quantity} unidad(es)`);
  };

  const handleBuyNow = () => {
    console.log("Compra directa:", { productId: producto.id_producto, quantity });
    alert("Redirigiendo al checkout...");
  };

  const handleReserve = () => {
    console.log("Producto reservado:", { productId: producto.id_producto, quantity });
    alert("Producto reservado por 72 horas (Función Premium)");
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < count ? "#FFC107" : "none"}
        color={i < count ? "#FFC107" : "#d1d5db"}
      />
    ));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calcularDescuento = (precioActual, precioOriginal) => {
    if (!precioOriginal || precioOriginal <= precioActual) return 0;
    return Math.round(((precioOriginal - precioActual) / precioOriginal) * 100);
  };

  const calcularStockPercentage = (stock) => {
    const maxStock = 100;
    return Math.min((stock / maxStock) * 100, 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="vista-previa-container">
        <Header />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <Loader size={48} className="spinner" style={{ animation: "spin 1s linear infinite" }} />
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !producto) {
    return (
      <div className="vista-previa-container">
        <Header />
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2>Producto no encontrado</h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate("/catalogo")}>
            Volver al Catálogo
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Datos del producto
  const imagenes = producto.imagenes && producto.imagenes.length > 0 
    ? producto.imagenes 
    : [{ url_imagen: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&h=600&fit=crop" }];

  const descuento = calcularDescuento(producto.precio, producto.precio * 1.33); // Precio original estimado
  const stockPercentage = calcularStockPercentage(producto.stock);

  const beneficios = [
    {
      icon: Package,
      title: "Envío Gratis",
      description: "En pedidos mayores a $100,000",
    },
    {
      icon: Shield,
      title: "Garantía de 12 meses",
      description: "Protección del fabricante",
    },
    {
      icon: RefreshCw,
      title: "Devolución Gratis",
      description: "Hasta 30 días después de la compra",
    },
    {
      icon: Clock,
      title: "Entrega Estimada",
      description: "3-7 días hábiles (1-3 días Premium)",
    },
  ];

  return (
    <div className="vista-previa-container">
      <Header />
      
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="/">Inicio</a>
        <span>/</span>
        <a href="/catalogo">Catálogo</a>
        <span>/</span>
        <a href={`/catalogo?categoria=${producto.fk_categoria}`}>{producto.nombre_categoria}</a>
        <span>/</span>
        <span className="current">{producto.nombre_producto}</span>
      </nav>

      {/* Layout del producto */}
      <div className="product-layout">
        {/* Galería de imágenes */}
        <div className="product-images">
          <div className="main-image">
            <img 
              src={imagenes[activeImage]?.url_imagen || imagenes[0].url_imagen} 
              alt={producto.nombre_producto} 
            />
          </div>
          {imagenes.length > 1 && (
            <div className="thumbnail-grid">
              {imagenes.map((imagen, index) => (
                <div
                  key={index}
                  className={`thumbnail ${activeImage === index ? "active" : ""}`}
                  onClick={() => handleImageChange(index)}
                >
                  <img src={imagen.url_imagen} alt={`Vista ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="product-info">
          {/* Header del producto */}
          <div className="product-header">
            <div>
              <span className="category-badge">{producto.nombre_categoria}</span>
              <h1 className="product-title">{producto.nombre_producto}</h1>
              <div className="product-meta">
                <div className="rating">
                  <Star size={16} fill="#FFC107" color="#FFC107" />
                  <span className="rating-value">
                    {producto.promedio_valoracion?.toFixed(1) || "N/A"}
                  </span>
                  <span>({producto.valoraciones || 0} reseñas)</span>
                </div>
                <span>|</span>
                <span>Vendido por: {producto.vendedor_nombre} {producto.vendedor_apellido}</span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="action-buttons">
              <button
                className="btn-icon"
                onClick={handleFavoriteToggle}
                title="Favorito"
              >
                <Heart
                  size={20}
                  fill={isFavorite ? "#ef4444" : "none"}
                  color={isFavorite ? "#ef4444" : "#6b7280"}
                />
              </button>
              <button className="btn-icon" title="Compartir">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Sección de precio */}
          <div className="price-section">
            <div className="price-row">
              <span className="current-price">
                {formatPrice(producto.precio)}
              </span>
              {descuento > 0 && (
                <>
                  <span className="original-price">
                    {formatPrice(producto.precio * 1.33)}
                  </span>
                  <span className="discount-badge">-{descuento}% OFF</span>
                </>
              )}
            </div>
            <p className="price-note">Precio incluye IVA</p>
          </div>

          {/* Sección de stock */}
          <div className="stock-section">
            <div className="stock-status">
              <CheckCircle size={20} color="#16a34a" />
              <span className="stock-text">
                {producto.stock > 0 
                  ? `Disponible - ${producto.stock} unidades` 
                  : "Sin stock disponible"}
              </span>
            </div>
            {producto.stock > 0 && (
              <div className="stock-bar">
                <div
                  className="stock-fill"
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
            )}
          </div>

          {/* Control de cantidad */}
          {producto.stock > 0 && (
            <div className="quantity-section">
              <label className="quantity-label">Cantidad</label>
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= producto.stock}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Botones de acción principales */}
          <div className="actions">
            <button 
              className="btn btn-primary" 
              onClick={handleAddToCart}
              disabled={producto.stock === 0}
            >
              <ShoppingCart size={20} />
              {producto.stock > 0 ? "Agregar al Carrito" : "Sin Stock"}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleBuyNow}
              disabled={producto.stock === 0}
            >
              Comprar Ahora
            </button>
            <button 
              className="btn btn-premium" 
              onClick={handleReserve}
              disabled={producto.stock === 0}
            >
              <Star size={20} />
              Reservar (Premium)
            </button>
          </div>

          {/* Beneficios */}
          <div className="benefits-card">
            {beneficios.map((beneficio, index) => {
              const IconComponent = beneficio.icon;
              return (
                <div key={index} className="benefit-item">
                  <IconComponent className="benefit-icon" size={20} />
                  <div className="benefit-content">
                    <div className="benefit-title">{beneficio.title}</div>
                    <div className="benefit-description">
                      {beneficio.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs (Descripción y Reseñas) */}
      <div className="tabs">
        <div className="tabs-list">
          <button
            className={`tab-button ${
              activeTab === "description" ? "active" : ""
            }`}
            onClick={() => handleTabChange("description")}
          >
            Descripción
          </button>
          <button
            className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => handleTabChange("reviews")}
          >
            Reseñas ({producto.valoraciones || 0})
          </button>
        </div>

        {/* Tab de Descripción */}
        {activeTab === "description" && (
          <div className="tab-content">
            <div className="description-card">
              <h2 className="description-title">Descripción del Producto</h2>
              <div className="description-text">
                {producto.descripcion || "Sin descripción disponible"}
              </div>
              
              {/* Información adicional */}
              <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                <div>
                  <strong>Categoría:</strong> {producto.nombre_categoria}
                </div>
                <div>
                  <strong>Tipo de Vehículo:</strong> {producto.nombre_tipo_vehiculo || "No especificado"}
                </div>
                <div>
                  <strong>Vendedor:</strong> {producto.vendedor_nombre} {producto.vendedor_apellido}
                </div>
                <div>
                  <strong>Contacto:</strong> {producto.vendedor_telefono || "No disponible"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab de Reseñas */}
        {activeTab === "reviews" && (
          <div className="tab-content">
            <div className="description-card">
              <h2 className="description-title">Reseñas de Clientes</h2>

              {/* Header de reseñas */}
              <div className="reviews-header">
                <div className="reviews-score">
                  <div className="big-rating">
                    {producto.promedio_valoracion?.toFixed(1) || "0.0"}
                  </div>
                  <div className="rating-stars-big">
                    {renderStars(Math.round(producto.promedio_valoracion || 0))}
                  </div>
                  <div className="reviews-count">
                    {producto.valoraciones || 0} reseñas
                  </div>
                </div>

                {/* Desglose de ratings */}
                <div className="reviews-breakdown">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="breakdown-row">
                      <span className="breakdown-label">{stars}★</span>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-fill"
                          style={{ width: `${Math.random() * 100}%` }}
                        />
                      </div>
                      <span className="breakdown-percent">
                        {Math.floor(Math.random() * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista de reseñas */}
              <div className="reviews-list">
                {producto.valoraciones_detalle && producto.valoraciones_detalle.length > 0 ? (
                  producto.valoraciones_detalle.map((review) => (
                    <div key={review.id_valoracion} className="review-item">
                      <div className="review-header">
                        <img
                          className="review-avatar"
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.primer_nombre}`}
                          alt={review.primer_nombre}
                        />
                        <div className="review-user">
                          <div className="review-name">
                            {review.primer_nombre} {review.primer_apellido}
                          </div>
                          <div className="review-meta">
                            <div className="review-stars">
                              {renderStars(review.calificacion)}
                            </div>
                            <span>{review.fecha_formateada}</span>
                          </div>
                        </div>
                      </div>
                      <p className="review-text">{review.comentario}</p>
                      <button className="review-helpful">
                        Útil (0)
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
                    <p>Aún no hay reseñas para este producto.</p>
                    <p>¡Sé el primero en opinar!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Productos relacionados */}
      {relacionados.length > 0 && (
        <div style={{ margin: "3rem 1rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>
            Productos Relacionados
          </h2>
          <div className="products-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
            {relacionados.map((prod) => (
              <div 
                key={prod.id_producto} 
                className="product-card"
                onClick={() => navigate(`/producto/${prod.id_producto}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="product-image">
                  <img src={prod.imagen_principal || "https://via.placeholder.com/300"} alt={prod.nombre_producto} />
                </div>
                <div className="product-info">
                  <span className="category-badge">{prod.nombre_categoria}</span>
                  <h3 className="product-name">{prod.nombre_producto}</h3>
                  <div className="product-rating">
                    <Star size={14} fill="#FFC107" color="#FFC107" />
                    <span className="rating-value">{prod.promedio_valoracion?.toFixed(1) || "N/A"}</span>
                  </div>
                  <div className="product-price">
                    <span className="current-price">{formatPrice(prod.precio)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default VistaPrevia;
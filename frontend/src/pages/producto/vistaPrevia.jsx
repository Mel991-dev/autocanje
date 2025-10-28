// frontend/src/pages/producto/vistaPrevia.jsx

import React, { useState } from "react";
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
} from "lucide-react";
import "../../styles/producto/vistaprevia.css";
import Header from "../../components/header";
import Footer from "../../components/footer";

/**
 * Componente Vista Previa del Producto
 *
 * Muestra la información detallada de un producto incluyendo:
 * - Galería de imágenes
 * - Información del producto (título, precio, rating)
 * - Control de cantidad
 * - Botones de acción (Agregar al carrito, Comprar, Reservar)
 * - Beneficios del producto
 * - Tabs de Descripción y Reseñas
 */
const VistaPrevia = () => {
  // Estados del componente
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isFavorite, setIsFavorite] = useState(false);

  // Datos del producto (ejemplo)
  const product = {
    id: 1,
    category: "Frenos",
    name: "Pastillas de Freno Cerámicas Premium",
    rating: 4.8,
    reviewsCount: 124,
    soldCount: 456,
    currentPrice: 89900,
    originalPrice: 120000,
    discount: 25,
    stock: 23,
    stockPercentage: 46,
    description: `Pastillas de freno cerámicas de alta calidad diseñadas para ofrecer un rendimiento superior y una vida útil prolongada. Fabricadas con materiales de primera calidad que garantizan una frenada segura y eficiente en todas las condiciones.

Características principales:
• Material cerámico de alta densidad
• Bajo nivel de ruido y vibración
• Excelente disipación de calor
• Compatible con la mayoría de vehículos
• Instalación sencilla y rápida`,
    images: [
      "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=600&fit=crop",
    ],
    benefits: [
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
    ],
    reviews: [
      {
        id: 1,
        name: "Carlos Rodríguez",
        rating: 5,
        date: "15 de Marzo, 2024",
        comment:
          "Excelente producto, la calidad es superior a las originales. Muy recomendado.",
        helpful: 12,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      },
      {
        id: 2,
        name: "María González",
        rating: 4,
        date: "10 de Marzo, 2024",
        comment:
          "Buena relación calidad-precio. Llegaron rápido y bien empacadas.",
        helpful: 8,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      },
      {
        id: 3,
        name: "Juan Pérez",
        rating: 5,
        date: "5 de Marzo, 2024",
        comment: "Perfectas para mi vehículo. El frenado mejoró notablemente.",
        helpful: 15,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan",
      },
    ],
    ratingBreakdown: [
      { stars: 5, percentage: 70 },
      { stars: 4, percentage: 20 },
      { stars: 3, percentage: 10 },
      { stars: 2, percentage: 10 },
      { stars: 1, percentage: 10 },
    ],
  };

  /**
   * Cambia la imagen principal
   */
  const handleImageChange = (index) => {
    setActiveImage(index);
  };

  /**
   * Incrementa o decrementa la cantidad
   */
  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  /**
   * Cambia la pestaña activa
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  /**
   * Agrega el producto al carrito
   */
  const handleAddToCart = () => {
    console.log("Agregado al carrito:", { productId: product.id, quantity });
    alert(`Agregado al carrito: ${quantity} unidad(es)`);
  };

  /**
   * Compra directa del producto
   */
  const handleBuyNow = () => {
    console.log("Compra directa:", { productId: product.id, quantity });
    alert("Redirigiendo al checkout...");
  };

  /**
   * Reserva el producto (Premium)
   */
  const handleReserve = () => {
    console.log("Producto reservado:", { productId: product.id, quantity });
    alert("Producto reservado por 72 horas (Función Premium)");
  };

  /**
   * Toggle favorito
   */
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  /**
   * Renderiza las estrellas del rating
   */
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

  return (
    <div className="vista-previa-container">
      <Header />
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="/">Inicio</a>
        <span>/</span>
        <a href="/catalog">Catálogo</a>
        <span>/</span>
        <a href="/catalog/frenos">Frenos</a>
        <span>/</span>
        <span className="current">{product.name}</span>
      </nav>

      {/* Layout del producto */}
      <div className="product-layout">
        {/* Galería de imágenes */}
        <div className="product-images">
          <div className="main-image">
            <img src={product.images[activeImage]} alt={product.name} />
          </div>
          <div className="thumbnail-grid">
            {product.images.map((image, index) => (
              <div
                key={index}
                className={`thumbnail ${activeImage === index ? "active" : ""}`}
                onClick={() => handleImageChange(index)}
              >
                <img src={image} alt={`Vista ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Información del producto */}
        <div className="product-info">
          {/* Header del producto */}
          <div className="product-header">
            <div>
              <span className="category-badge">{product.category}</span>
              <h1 className="product-title">{product.name}</h1>
              <div className="product-meta">
                <div className="rating">
                  <Star size={16} fill="#FFC107" color="#FFC107" />
                  <span className="rating-value">{product.rating}</span>
                  <span>({product.reviewsCount} reseñas)</span>
                </div>
                <span>|</span>
                <span>{product.soldCount} vendidos</span>
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
                ${product.currentPrice.toLocaleString("es-CO")}
              </span>
              <span className="original-price">
                ${product.originalPrice.toLocaleString("es-CO")}
              </span>
              <span className="discount-badge">-{product.discount}% OFF</span>
            </div>
            <p className="price-note">Precio incluye IVA</p>
          </div>

          {/* Sección de stock */}
          <div className="stock-section">
            <div className="stock-status">
              <CheckCircle size={20} color="#16a34a" />
              <span className="stock-text">
                Disponible - {product.stock} unidades
              </span>
            </div>
            <div className="stock-bar">
              <div
                className="stock-fill"
                style={{ width: `${product.stockPercentage}%` }}
              />
            </div>
          </div>

          {/* Control de cantidad */}
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
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Botones de acción principales */}
          <div className="actions">
            <button className="btn btn-primary" onClick={handleAddToCart}>
              <ShoppingCart size={20} />
              Agregar al Carrito
            </button>
            <button className="btn btn-secondary" onClick={handleBuyNow}>
              Comprar Ahora
            </button>
            <button className="btn btn-premium" onClick={handleReserve}>
              <Star size={20} />
              Reservar (Premium)
            </button>
          </div>

          {/* Beneficios */}
          <div className="benefits-card">
            {product.benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="benefit-item">
                  <IconComponent className="benefit-icon" size={20} />
                  <div className="benefit-content">
                    <div className="benefit-title">{benefit.title}</div>
                    <div className="benefit-description">
                      {benefit.description}
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
            Reseñas ({product.reviewsCount})
          </button>
        </div>

        {/* Tab de Descripción */}
        {activeTab === "description" && (
          <div className="tab-content">
            <div className="description-card">
              <h2 className="description-title">Descripción del Producto</h2>
              <div className="description-text">{product.description}</div>
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
                  <div className="big-rating">{product.rating}</div>
                  <div className="rating-stars-big">{renderStars(5)}</div>
                  <div className="reviews-count">
                    {product.reviewsCount} reseñas
                  </div>
                </div>

                {/* Desglose de ratings */}
                <div className="reviews-breakdown">
                  {product.ratingBreakdown.map((item, index) => (
                    <div key={index} className="breakdown-row">
                      <span className="breakdown-label">{item.stars}★</span>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-fill"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="breakdown-percent">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista de reseñas */}
              <div className="reviews-list">
                {product.reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <img
                        className="review-avatar"
                        src={review.avatar}
                        alt={review.name}
                      />
                      <div className="review-user">
                        <div className="review-name">{review.name}</div>
                        <div className="review-meta">
                          <div className="review-stars">
                            {renderStars(review.rating)}
                          </div>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="review-text">{review.comment}</p>
                    <button className="review-helpful">
                      Útil ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>

              {/* Botón para ver todas las reseñas */}
              <div className="reviews-footer">
                <button className="btn btn-secondary">
                  Ver Todas las Reseñas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VistaPrevia;

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
  Image as ImageIcon,
} from "lucide-react";
import "../../styles/producto/vistaprevia.css";
import Header from "../../components/header";
import Footer from "../../components/footer";

const API_URL = "http://127.0.0.1:5000/api";

const VistaPrevia = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isFavorite, setIsFavorite] = useState(false);

  // Estados de agregar al carrito
  const [agregandoCarrito, setAgregandoCarrito] = useState(false);
  const [mensajeCarrito, setMensajeCarrito] = useState("");

  // ✅ ESTADOS PARA RESEÑAS
  const [puedeValorar, setPuedeValorar] = useState(false);
  const [yaValoro, setYaValoro] = useState(false);
  const [mostrarFormReview, setMostrarFormReview] = useState(false);
  const [calificacionNueva, setCalificacionNueva] = useState(0);
  const [comentarioNuevo, setComentarioNuevo] = useState("");
  const [enviandoReview, setEnviandoReview] = useState(false);
  const [valoraciones, setValoraciones] = useState([]);

  useEffect(() => {
    cargarProducto();
    verificarPermisosValoracion();
  }, [id]);

  const cargarProducto = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/catalogo/${id}`);

      if (response.data.success) {
        setProducto(response.data.producto);
        setRelacionados(response.data.relacionados || []);

        // ✅ Cargar valoraciones del producto
        cargarValoraciones();
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

    const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatRating = (rating) => {
    const numRating = parseFloat(rating);
    return isNaN(numRating) ? "0.0" : numRating.toFixed(1);
  };

  // ✅ NUEVA FUNCIÓN: Cargar valoraciones
  const cargarValoraciones = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/valoraciones/producto/${id}`
      );

      if (response.data.success) {
        setValoraciones(response.data.valoraciones || []);
      }
    } catch (err) {
      console.error("Error al cargar valoraciones:", err);
    }
  };

  // ✅ NUEVA FUNCIÓN: Verificar permisos de valoración
  const verificarPermisosValoracion = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setPuedeValorar(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/valoraciones/permisos/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPuedeValorar(response.data.puede_valorar);
        setYaValoro(response.data.ya_valoro);
      }
    } catch (err) {
      console.error("Error al verificar permisos:", err);
      setPuedeValorar(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Enviar reseña
  const handleEnviarReview = async (e) => {
    e.preventDefault();

    if (calificacionNueva === 0) {
      alert("Debes seleccionar una calificación");
      return;
    }

    if (comentarioNuevo.trim().length < 10) {
      alert("El comentario debe tener al menos 10 caracteres");
      return;
    }

    setEnviandoReview(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/valoraciones/`,
        {
          fk_producto: producto.id_producto,
          calificacion: calificacionNueva,
          comentario: comentarioNuevo.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("¡Reseña publicada con éxito!");

        // Actualizar estados
        setYaValoro(true);
        setPuedeValorar(false);
        setMostrarFormReview(false);
        setCalificacionNueva(0);
        setComentarioNuevo("");

        // Recargar producto y valoraciones
        cargarProducto();
        verificarPermisosValoracion();
      } else {
        alert(response.data.error || "Error al publicar reseña");
      }
    } catch (err) {
      console.error("Error al enviar reseña:", err);
      alert(err.response?.data?.error || "Error al publicar reseña");
    } finally {
      setEnviandoReview(false);
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

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMensajeCarrito("Debes iniciar sesión para agregar al carrito");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    setAgregandoCarrito(true);
    setMensajeCarrito("");

    try {
      const response = await axios.post(
        `${API_URL}/carrito/agregar`,
        {
          fk_producto: producto.id_producto,
          cantidad: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMensajeCarrito(`✓ ${quantity} producto(s) agregado(s) al carrito`);

        setTimeout(() => {
          setQuantity(1);
          setMensajeCarrito("");
        }, 3000);
      } else {
        setMensajeCarrito(
          `✗ ${response.data.error || "Error al agregar al carrito"}`
        );
      }
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
      setMensajeCarrito(
        `✗ ${err.response?.data?.error || "Error al agregar al carrito"}`
      );
    } finally {
      setAgregandoCarrito(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    setTimeout(() => navigate("/carrito"), 1000);
  };

  const handleReserve = () => {
    console.log("Producto reservado:", {
      productId: producto.id_producto,
      quantity,
    });
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

  const calcularDescuento = (precioActual, precioOriginal) => {
    if (!precioOriginal || precioOriginal <= precioActual) return 0;
    return Math.round(((precioOriginal - precioActual) / precioOriginal) * 100);
  };

  const calcularStockPercentage = (stock) => {
    const maxStock = 100;
    return Math.min((stock / maxStock) * 100, 100);
  };

  const ProductImageWithFallback = ({ src, alt, className = "" }) => {
    const [imageError, setImageError] = useState(false);

    if (!src || imageError) {
      return (
        <div
          className={className}
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            gap: "1rem",
          }}
        >
          <ImageIcon size={64} strokeWidth={1.5} />
          <span style={{ fontSize: "1rem", fontWeight: "500" }}>
            Sin Imagen Disponible
          </span>
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setImageError(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  };

  if (loading) {
    return (
      <div className="vista-previa-container">
        <Header />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <Loader
            size={48}
            className="spinner"
            style={{ animation: "spin 1s linear infinite" }}
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="vista-previa-container">
        <Header />
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2>Producto no encontrado</h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/catalogo")}
          >
            Volver al Catálogo
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const imagenes =
    producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes
      : null;

  const descuento = calcularDescuento(producto.precio, producto.precio * 1.33);
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

      <nav className="breadcrumb">
        <a href="/">Inicio</a>
        <span>/</span>
        <a href="/catalogo">Catálogo</a>
        <span>/</span>
        <a href={`/catalogo?categoria=${producto.fk_categoria}`}>
          {producto.nombre_categoria}
        </a>
        <span>/</span>
        <span className="current">{producto.nombre_producto}</span>
      </nav>

      <div className="product-layout">
        <div className="product-images">
          <div className="main-image">
            {imagenes ? (
              <ProductImageWithFallback
                src={
                  imagenes[activeImage]?.url_imagen || imagenes[0].url_imagen
                }
                alt={producto.nombre_producto}
              />
            ) : (
              <ProductImageWithFallback src={null} alt="Sin imagen" />
            )}
          </div>

          {imagenes && imagenes.length > 1 && (
            <div className="thumbnail-grid">
              {imagenes.map((imagen, index) => (
                <div
                  key={index}
                  className={`thumbnail ${
                    activeImage === index ? "active" : ""
                  }`}
                  onClick={() => handleImageChange(index)}
                >
                  <ProductImageWithFallback
                    src={imagen.url_imagen}
                    alt={`Vista ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info info-catalogo">
          <div className="product-header">
            <div>
              <span className="category-badge">
                {producto.nombre_categoria}
              </span>
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
                <span>
                  Vendido por: {producto.vendedor_nombre}{" "}
                  {producto.vendedor_apellido}
                </span>
              </div>
            </div>

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

              {mensajeCarrito && (
                <div
                  className={`mensaje-carrito ${
                    mensajeCarrito.includes("✓") ? "exito" : "error"
                  }`}
                >
                  {mensajeCarrito}
                </div>
              )}
            </div>
          )}

          <div className="actions">
            <button
              className="btn btn-primary agregar-carrito"
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

        {activeTab === "description" && (
          <div className="tab-content">
            <div className="description-card">
              <h2 className="description-title">Descripción del Producto</h2>
              <div className="description-text">
                {producto.descripcion || "Sin descripción disponible"}
              </div>

              <div
                style={{
                  marginTop: "2rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1rem",
                }}
              >
                <div>
                  <strong>Categoría:</strong> {producto.nombre_categoria}
                </div>
                <div>
                  <strong>Tipo de Vehículo:</strong>{" "}
                  {producto.nombre_tipo_vehiculo || "No especificado"}
                </div>
                <div>
                  <strong>Vendedor:</strong> {producto.vendedor_nombre}{" "}
                  {producto.vendedor_apellido}
                </div>
                <div>
                  <strong>Contacto:</strong>{" "}
                  {producto.vendedor_telefono || "No disponible"}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="tab-content">
            <div className="description-card">
              <h2 className="description-title">Reseñas de Clientes</h2>

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

                <div className="reviews-breakdown">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const totalReviews = producto.valoraciones || 1;
                    const reviewsWithStars = valoraciones.filter(
                      (r) => r.calificacion === stars
                    ).length;
                    const percentage = (reviewsWithStars / totalReviews) * 100;

                    return (
                      <div key={stars} className="breakdown-row">
                        <span className="breakdown-label">{stars}★</span>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="breakdown-percent">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ✅ BOTÓN PARA ESCRIBIR RESEÑA */}
              {puedeValorar && !mostrarFormReview && (
                <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                  <button
                    onClick={() => setMostrarFormReview(true)}
                    className="btn btn-primary"
                    style={{ width: "100%", maxWidth: "300px" }}
                  >
                    <Star size={18} />
                    Escribir una reseña
                  </button>
                </div>
              )}

              {/* ✅ MENSAJE SI YA VALORÓ */}
              {yaValoro && (
                <div
                  style={{
                    padding: "1rem",
                    background: "#dcfce7",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    color: "#166534",
                    marginTop: "1rem",
                    marginBottom: "2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <CheckCircle size={20} />
                  <span>Ya has valorado este producto</span>
                </div>
              )}

              {/* ✅ FORMULARIO DE RESEÑA */}
              {mostrarFormReview && (
                <form
                  onSubmit={handleEnviarReview}
                  style={{
                    background: "#f9fafb",
                    padding: "2rem",
                    borderRadius: "12px",
                    marginTop: "2rem",
                    marginBottom: "2rem",
                    border: "2px solid #007BFF",
                  }}
                >
                  <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>
                    Escribe tu reseña
                  </h3>

                  {/* Selector de estrellas */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 600,
                        marginBottom: "0.75rem",
                        color: "#374151",
                      }}
                    >
                      Calificación *
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={32}
                          style={{ cursor: "pointer" }}
                          fill={star <= calificacionNueva ? "#FFC107" : "none"}
                          color={
                            star <= calificacionNueva ? "#FFC107" : "#d1d5db"
                          }
                          onClick={() => setCalificacionNueva(star)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comentario */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 600,
                        marginBottom: "0.75rem",
                        color: "#374151",
                      }}
                    >
                      Comentario * (mínimo 10 caracteres)
                    </label>
                    <textarea
                      value={comentarioNuevo}
                      onChange={(e) => setComentarioNuevo(e.target.value)}
                      placeholder="Comparte tu experiencia con este producto..."
                      rows={5}
                      maxLength={500}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontFamily: "inherit",
                        fontSize: "0.95rem",
                        resize: "vertical",
                      }}
                      required
                    />
                    <small style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                      {comentarioNuevo.length}/500 caracteres
                    </small>
                  </div>

                  {/* Botones */}
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        enviandoReview ||
                        calificacionNueva === 0 ||
                        comentarioNuevo.length < 10
                      }
                      style={{ flex: 1 }}
                    >
                      {enviandoReview ? (
                        <>
                          <Loader size={18} className="spinner" />
                          Publicando...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Publicar Reseña
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarFormReview(false);
                        setCalificacionNueva(0);
                        setComentarioNuevo("");
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* ✅ LISTA DE RESEÑAS */}
              <div className="reviews-list">
                {valoraciones && valoraciones.length > 0 ? (
                  valoraciones.map((review) => (
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
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#6b7280",
                    }}
                  >
                    <p>Aún no hay reseñas para este producto.</p>
                    <p>¡Sé el primero en opinar!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {relacionados.length > 0 && (
        <div style={{ margin: "3rem 1rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "1.5rem",
            }}
          >
            Productos Relacionados
          </h2>
          <div
            className="products-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {relacionados.map((prod) => (
              <div
                key={prod.id_producto}
                className="product-card"
                onClick={() => {
                  setActiveImage(0);
                  navigate(`/producto/${prod.id_producto}`);
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="product-image">
                  <ProductImageWithFallback
                    src={prod.imagen_principal}
                    alt={prod.nombre_producto}
                  />
                </div>
                <div className="product-info">
                  <span className="category-badge">
                    {prod.nombre_categoria}
                  </span>
                  <h3 className="product-name">{prod.nombre_producto}</h3>
                  <div className="product-rating">
                    <Star size={14} fill="#FFC107" color="#FFC107" />
                    <span className="rating-value">
                      {prod.promedio_valoracion?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                  <div className="product-price">
                    <span className="current-price">
                      {formatPrice(prod.precio)}
                    </span>
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

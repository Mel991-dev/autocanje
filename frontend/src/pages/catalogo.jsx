import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  X,
  SlidersHorizontal,
  ShoppingCart,
  Star,
  Search,
  Package,
} from "lucide-react";
import "../styles/catalogo.css";
import Header from "../components/header";
import Footer from "../components/footer";

const API_URL = "http://127.0.0.1:5000/api";

const Catalogo = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [agregandoCarrito, setAgregandoCarrito] = useState({});
  const [mensajesCarrito, setMensajesCarrito] = useState({});

  const [filtros, setFiltros] = useState({
    busqueda: "",
    categoria: [],
    tipo_vehiculo: [],
    precio_min: 0,
    precio_max: 1000000,
    valoracion_min: null,
    orden: "reciente",
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [filtros]);

  const cargarDatosIniciales = async () => {
    try {
      const [categoriasRes, tiposRes] = await Promise.all([
        fetch(`${API_URL}/productos/categorias`),
        fetch(`${API_URL}/productos/tipos-vehiculo`),
      ]);

      const categoriasData = await categoriasRes.json();
      const tiposData = await tiposRes.json();

      setCategorias(
        categoriasData.categorias ||
          (categoriasData.success
            ? categoriasData.categorias
            : categoriasData) ||
          []
      );
      setTiposVehiculo(
        tiposData.tipos_vehiculo ||
          tiposData.tipos ||
          (tiposData.success ? tiposData.tipos_vehiculo : tiposData) ||
          []
      );
    } catch (err) {
      console.error("Error cargando datos iniciales:", err);
    }
  };

  const cargarProductos = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filtros.busqueda) params.append("busqueda", filtros.busqueda);
      filtros.categoria.forEach((cat) => params.append("categoria[]", cat));
      filtros.tipo_vehiculo.forEach((tipo) =>
        params.append("tipo_vehiculo[]", tipo)
      );

      if (filtros.precio_min > 0)
        params.append("precio_min", filtros.precio_min);
      if (filtros.precio_max < 1000000)
        params.append("precio_max", filtros.precio_max);
      if (filtros.valoracion_min)
        params.append("valoracion_min", filtros.valoracion_min);
      params.append("orden", filtros.orden);

      const response = await fetch(`${API_URL}/catalogo?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProductos(data.productos || []);
      } else {
        setError(data.error || "Error al cargar productos");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBusquedaChange = (e) => {
    setFiltros((prev) => ({
      ...prev,
      busqueda: e.target.value,
    }));
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => {
      if (
        campo === "orden" ||
        campo === "precio_min" ||
        campo === "precio_max" ||
        campo === "valoracion_min"
      ) {
        return { ...prev, [campo]: valor };
      }
      const currentValues = prev[campo] || [];
      if (currentValues.includes(valor)) {
        return { ...prev, [campo]: currentValues.filter((v) => v !== valor) };
      } else {
        return { ...prev, [campo]: [...currentValues, valor] };
      }
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      categoria: [],
      tipo_vehiculo: [],
      precio_min: 0,
      precio_max: 1000000,
      valoracion_min: null,
      orden: "reciente",
    });
  };

  // ✅ ACTUALIZADO: Agregar al carrito con backend
  const agregarAlCarrito = async (e, producto) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
      setMensajesCarrito({
        [producto.id_producto]: "Debes iniciar sesión",
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    setAgregandoCarrito((prev) => ({ ...prev, [producto.id_producto]: true }));
    setMensajesCarrito((prev) => ({ ...prev, [producto.id_producto]: "" }));

    try {
      const response = await axios.post(
        `${API_URL}/carrito/agregar`,
        {
          fk_producto: producto.id_producto,
          cantidad: 1, // Por defecto 1 desde el catálogo
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMensajesCarrito((prev) => ({
          ...prev,
          [producto.id_producto]: "✓ Agregado",
        }));

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          setMensajesCarrito((prev) => {
            const newMessages = { ...prev };
            delete newMessages[producto.id_producto];
            return newMessages;
          });
        }, 3000);
      } else {
        setMensajesCarrito((prev) => ({
          ...prev,
          [producto.id_producto]: "✗ Error",
        }));
      }
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
      setMensajesCarrito((prev) => ({
        ...prev,
        [producto.id_producto]: "✗ Error al agregar",
      }));
    } finally {
      setAgregandoCarrito((prev) => ({
        ...prev,
        [producto.id_producto]: false,
      }));
    }
  };

  const verProducto = (idProducto) => {
    navigate(`/producto/${idProducto}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // ✅ Componente para renderizar imagen con fallback
  const ProductImage = ({ src, alt }) => {
    const [imageError, setImageError] = useState(false);

    if (!src || imageError) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            gap: "0.5rem",
          }}
        >
          <Package size={48} strokeWidth={1.5} />
          <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
            Sin Imagen
          </span>
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        onError={() => setImageError(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  };

  const FiltersSection = ({ isMobile = false }) => (
    <div className="filters-content">
      <div className="filter-section">
        <h3 className="filter-title">Buscar</h3>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={filtros.busqueda}
            onChange={handleBusquedaChange}
            className="search-input"
          />
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Categorías</h3>
        <div className="filter-options">
          {categorias.length > 0 ? (
            categorias.map((cat) => (
              <label key={cat.id_categoria} className="filter-option">
                <input
                  type="checkbox"
                  checked={filtros.categoria.includes(cat.id_categoria)}
                  onChange={() =>
                    handleFiltroChange("categoria", cat.id_categoria)
                  }
                />
                <span>{cat.nombre}</span>
              </label>
            ))
          ) : (
            <p>No se cargaron categorías.</p>
          )}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Tipo de Vehículo</h3>
        <div className="filter-options">
          {tiposVehiculo.length > 0 ? (
            tiposVehiculo.map((tipo) => (
              <label key={tipo.id_tipo} className="filter-option">
                <input
                  type="checkbox"
                  checked={filtros.tipo_vehiculo.includes(tipo.id_tipo)}
                  onChange={() =>
                    handleFiltroChange("tipo_vehiculo", tipo.id_tipo)
                  }
                />
                <span>{tipo.nombre}</span>
              </label>
            ))
          ) : (
            <p>No se cargaron tipos de vehículo.</p>
          )}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Rango de Precio</h3>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Mín"
            value={filtros.precio_min}
            onChange={(e) =>
              handleFiltroChange("precio_min", parseInt(e.target.value) || 0)
            }
            className="price-input"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Máx"
            value={filtros.precio_max}
            onChange={(e) =>
              handleFiltroChange(
                "precio_max",
                parseInt(e.target.value) || 1000000
              )
            }
            className="price-input"
          />
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Valoración Mínima</h3>
        <div className="filter-options">
          {[5, 4, 3].map((rating) => (
            <label key={rating} className="filter-option rating-option">
              <input
                type="radio"
                name={isMobile ? "rating-mobile" : "rating"}
                checked={filtros.valoracion_min === rating}
                onChange={() => handleFiltroChange("valoracion_min", rating)}
              />
              <div className="stars">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} size={14} fill="#FFC107" color="#FFC107" />
                ))}
              </div>
              <span className="text-sm text-gray-600">y más</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={limpiarFiltros} className="btn-clear">
        <X size={16} />
        Limpiar Filtros
      </button>
    </div>
  );

  return (
    <div className="catalogo-container">
      <Header />
      <div className="page-header">
        <h1 className="page-title">Catálogo de Productos</h1>
        <p className="page-description">
          Explora nuestra amplia selección de partes vehiculares
        </p>
      </div>

      <div className="catalog-layout">
        <aside className="sidebar">
          <div className="filters-card">
            <div className="filters-header">
              <h2 className="filters-title">Filtros</h2>
              <SlidersHorizontal size={20} color="#6b7280" />
            </div>
            <FiltersSection />
          </div>
        </aside>

        <main className="main-content">
          <div className="toolbar">
            <div className="toolbar-left">
              <button
                className="btn-filters-mobile"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <SlidersHorizontal size={16} />
                Filtros
              </button>
              <span className="product-count">
                {loading
                  ? "Cargando..."
                  : `Mostrando ${productos.length} productos`}
              </span>
            </div>

            <select
              className="sort-select"
              value={filtros.orden}
              onChange={(e) => handleFiltroChange("orden", e.target.value)}
            >
              <option value="reciente">Más Recientes</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="valoracion">Mejor Valorados</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Cargando productos...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : productos.length === 0 ? (
            <div className="empty-state">
              No se encontraron productos con los filtros seleccionados
            </div>
          ) : (
            <div className="products-grid">
              {productos.map((producto) => (
                <div
                  key={producto.id_producto}
                  className="product-card"
                  onClick={() => verProducto(producto.id_producto)}
                >
                  <div className="product-image">
                    <ProductImage
                      src={producto.imagen_principal}
                      alt={producto.nombre_producto}
                    />
                  </div>
                  <div className="product-info">
                    <span className="category-badge">
                      {producto.nombre_categoria}
                    </span>
                    <h3 className="product-name">{producto.nombre_producto}</h3>
                    <div className="product-rating">
                      <Star size={16} fill="#FFC107" color="#FFC107" />
                      <span className="rating-value">
                        {producto.promedio_valoracion?.toFixed(1) || "N/A"}
                      </span>
                      <span className="rating-count">
                        ({producto.valoraciones || 0})
                      </span>
                    </div>
                    <div className="product-price">
                      <span className="current-price">
                        {formatPrice(producto.precio)}
                      </span>
                    </div>
                    {/* ✅ MENSAJE DE FEEDBACK */}
                    {mensajesCarrito[producto.id_producto] && (
                      <div
                        className={`mensaje-carrito-catalogo ${
                          mensajesCarrito[producto.id_producto].includes("✓")
                            ? "Producto añadido al carrito"
                            : "error"
                        }`}
                      >
                        {mensajesCarrito[producto.id_producto]}
                      </div>
                    )}

                    <button
                      className="btn-add-cart"
                      onClick={(e) => agregarAlCarrito(e, producto)}
                    >
                      <ShoppingCart size={18} />
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <div
        className={`mobile-sidebar-overlay ${
          mobileSidebarOpen ? "active" : ""
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      />
      <aside className={`mobile-sidebar ${mobileSidebarOpen ? "active" : ""}`}>
        <div className="mobile-sidebar-header">
          <h2 className="filters-title">Filtros</h2>
          <button
            className="mobile-sidebar-close"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={24} color="#6b7280" />
          </button>
        </div>
        <FiltersSection isMobile={true} />
      </aside>
      <Footer />
    </div>
  );
};

export default Catalogo;

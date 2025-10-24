// frontend/src/pages/home.jsx

import React from 'react';
import '../styles/home.css';
import Header from '../components/header';
import Footer from '../components/footer';
import ProductosPanel from './vendedor/ProductosPanel';
import { 
  Star, 
  Shield, 
  Zap, 
  TrendingUp, 
  Crown 
} from 'lucide-react';


/**
 * Componente principal del Home/Landing Page
 * 
 * Incluye:
 * - Hero section con imagen destacada
 * - Productos destacados con ofertas
 * - Indicadores de confianza
 * - Categorías populares
 * - Beneficios de membresía premium
 */
const Home = () => {
  
  // Datos de categorías
  const categories = [
    { name: "Motor", icon: "🔧", count: 1234 },
    { name: "Frenos", icon: "🛑", count: 856 },
    { name: "Suspensión", icon: "⚙️", count: 642 },
    { name: "Eléctrico", icon: "⚡", count: 923 },
    { name: "Transmisión", icon: "🔩", count: 534 },
    { name: "Carrocería", icon: "🚗", count: 1456 },
  ];

  // Datos de productos destacados
  const featuredProducts = [
    {
      id: 1,
      name: "Pastillas de Freno Cerámicas",
      price: 89900,
      originalPrice: 120000,
      image: "/images/brake-pads.jpg",
      rating: 4.8,
      reviews: 124,
      seller: "AutoPartes Pro",
      discount: 25,
    },
    {
      id: 2,
      name: "Filtro de Aceite Premium",
      price: 24900,
      image: "/images/oil-filter.jpg",
      rating: 4.6,
      reviews: 89,
      seller: "Repuestos Express",
    },
    {
      id: 3,
      name: "Amortiguadores Deportivos",
      price: 345000,
      originalPrice: 420000,
      image: "/images/shock-absorbers.jpg",
      rating: 4.9,
      reviews: 67,
      seller: "Performance Parts",
      discount: 18,
    },
    {
      id: 4,
      name: "Batería 12V 75Ah",
      price: 289000,
      image: "/images/car-battery.jpg",
      rating: 4.7,
      reviews: 156,
      seller: "Energía Total",
    },
  ];

  return (
    
    <div className="home-wrapper">
      <Header />
      {/* ========================================
          HERO SECTION
          ======================================== */}
      <section className="home-hero">
        <div className="home-hero-container">
          <div className="home-hero-content">
            {/* Badge de membresía premium */}
            <div className="home-premium-badge">
              <Crown size={14} />
              <span>Membresía Premium Disponible</span>
            </div>

            {/* Título principal */}
            <h1 className="home-hero-title">
              Encuentra las mejores partes para tu vehículo
            </h1>

            {/* Descripción */}
            <p className="home-hero-description">
              Marketplace líder en partes vehiculares y repuestos. Compra y vende 
              con confianza, entregas rápidas y garantía de calidad.
            </p>

            {/* Botones de acción */}
            <div className="home-hero-buttons">
              <a href="/catalog" className="home-btn-hero-primary">
                Explorar Catálogo
              </a>
              <a href="/productos" className="home-btn-hero-outline">
                Ver tus Productos
              </a>
            </div>
          </div>

          {/* Imagen del hero */}
          <div className="home-hero-image">
            <img 
              src="/images/automotive-parts-display.jpg" 
              alt="Partes vehiculares en estantería"
            />
          </div>
        </div>
      </section>

      {/* ========================================
          PRODUCTOS DESTACADOS
          ======================================== */}
      <section className="home-featured-products">
        <div className="home-section-container">
          {/* Encabezado de sección */}
          <div className="home-section-header">
            <div>
              <h2 className="home-section-title">Productos Destacados</h2>
              <p className="home-section-subtitle">Las mejores ofertas de la semana</p>
            </div>
            <a href="/catalog" className="home-btn-view-all">
              Ver Todos
            </a>
          </div>

          {/* Grid de productos */}
          <div className="home-products-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} className="home-product-card">
                {/* Imagen del producto */}
                <div className="home-product-image">
                  <img src={product.image} alt={product.name} />
                  {product.discount && (
                    <span className="home-product-discount">-{product.discount}%</span>
                  )}
                </div>

                {/* Contenido del producto */}
                <div className="home-product-content">
                  <h3 className="home-product-name">{product.name}</h3>

                  {/* Rating */}
                  <div className="home-product-rating">
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <span className="home-rating-value">{product.rating}</span>
                    <span className="home-rating-count">({product.reviews})</span>
                  </div>

                  {/* Vendedor */}
                  <p className="home-product-seller">{product.seller}</p>

                  {/* Precio */}
                  <div className="home-product-price">
                    <span className="home-price-current">
                      ${product.price.toLocaleString('es-CO')}
                    </span>
                    {product.originalPrice && (
                      <span className="home-price-original">
                        ${product.originalPrice.toLocaleString('es-CO')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Botón de agregar al carrito */}
                <button className="home-product-button">
                  Agregar al Carrito
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          INDICADORES DE CONFIANZA
          ======================================== */}
      <section className="home-trust-indicators">
        <div className="home-section-container">
          <div className="home-trust-grid">
            
            <div className="home-trust-item">
              <div className="home-trust-icon">
                <Shield size={24} />
              </div>
              <h3 className="home-trust-title">Compra Segura</h3>
              <p className="home-trust-description">
                Protección en todas tus transacciones
              </p>
            </div>

            <div className="home-trust-item">
              <div className="home-trust-icon">
                <Zap size={24} />
              </div>
              <h3 className="home-trust-title">Envío Rápido</h3>
              <p className="home-trust-description">
                Entregas en 3-7 días hábiles
              </p>
            </div>

            <div className="home-trust-item">
              <div className="home-trust-icon">
                <Star size={24} />
              </div>
              <h3 className="home-trust-title">Calidad Garantizada</h3>
              <p className="home-trust-description">
                Productos verificados y certificados
              </p>
            </div>

            <div className="home-trust-item">
              <div className="home-trust-icon">
                <TrendingUp size={24} />
              </div>
              <h3 className="home-trust-title">Mejor Precio</h3>
              <p className="home-trust-description">
                Precios competitivos del mercado
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================
          CATEGORÍAS POPULARES
          ======================================== */}
      <section className="home-categories">
        <div className="home-section-container">
          {/* Encabezado de sección */}
          <div className="home-section-header-center">
            <h2 className="home-section-title">Categorías Populares</h2>
            <p className="home-section-subtitle">Encuentra lo que necesitas por categoría</p>
          </div>

          {/* Grid de categorías */}
          <div className="home-categories-grid">
            {categories.map((category) => (
              <a 
                key={category.name} 
                href={`/catalog?category=${category.name}`}
                className="home-category-card"
              >
                <div className="home-category-icon">{category.icon}</div>
                <h3 className="home-category-name">{category.name}</h3>
                <p className="home-category-count">{category.count} productos</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          BENEFICIOS PREMIUM
          ======================================== */}
      <section className="home-premium-benefits">
        <div className="home-section-container">
          {/* Encabezado de sección */}
          <div className="home-section-header-center">
            <div className="home-premium-badge-large">
              <Crown size={16} />
              <span>Membresía Premium</span>
            </div>
            <h2 className="home-section-title">Beneficios Exclusivos</h2>
            <p className="home-section-subtitle">
              Mejora tu experiencia con nuestra membresía premium y disfruta de ventajas únicas
            </p>
          </div>

          {/* Grid de beneficios */}
          <div className="home-benefits-grid">
            
            <div className="home-benefit-card">
              <div className="home-benefit-icon">
                <Zap size={24} />
              </div>
              <h3 className="home-benefit-title">Entregas Prioritarias</h3>
              <p className="home-benefit-description">
                Recibe tus pedidos hasta 3 días antes que los usuarios regulares
              </p>
            </div>

            <div className="home-benefit-card">
              <div className="home-benefit-icon">
                <TrendingUp size={24} />
              </div>
              <h3 className="home-benefit-title">Descuentos Especiales</h3>
              <p className="home-benefit-description">
                Hasta 20% de descuento en productos seleccionados cada semana
              </p>
            </div>

            <div className="home-benefit-card">
              <div className="home-benefit-icon">
                <Shield size={24} />
              </div>
              <h3 className="home-benefit-title">Reserva de Productos</h3>
              <p className="home-benefit-description">
                Reserva productos para comprarlos más tarde sin perder disponibilidad
              </p>
            </div>

          </div>

          {/* Botón CTA */}
          <div className="home-premium-cta">
            <a href="/premium" className="home-btn-premium">
              <Crown size={20} />
              Ver Planes Premium
            </a>
          </div>
        </div>
      </section>
        <Footer/>
    </div>
  );
};

export default Home;
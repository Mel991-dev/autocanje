// frontend/src/pages/premiumPage.jsx

import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Clock, Tag, Shield, Bolt, Check, X, ChevronDown, CreditCard } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import '../styles/premium.css';

const PremiumPage = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  const API_URL = 'http://localhost:5000/api/membresias';

  useEffect(() => {
    fetchPlanes();
  }, []);

  const fetchPlanes = async () => {
    try {
      const response = await fetch(`${API_URL}/planes`);
      const data = await response.json();
      if (data.success) {
        setPlanes(data.planes);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleComprar = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para comprar una membresía');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`${API_URL}/comprar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fk_plan: selectedPlan.id_plan,
          renovacion_auto: true
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('¡Membresía activada con éxito!');
        setShowModal(false);
        window.location.reload();
      } else {
        alert(data.error || 'Error al activar membresía');
      }
    } catch (error) {
      alert('Error al procesar la compra');
    }
  };

  const faqs = [
    {
      q: '¿Puedo cancelar mi membresía en cualquier momento?',
      a: 'Sí, puedes cancelar tu membresía cuando quieras desde tu perfil. No hay penalizaciones ni cargos adicionales.'
    },
    {
      q: '¿Los descuentos se aplican automáticamente?',
      a: 'Sí, todos los descuentos premium se aplican automáticamente al momento de realizar tu compra. No necesitas códigos ni cupones.'
    },
    {
      q: '¿Qué pasa si no uso mi membresía durante un mes?',
      a: 'Tu membresía sigue activa y puedes usarla cuando quieras. Los beneficios están disponibles durante todo el período contratado.'
    },
    {
      q: '¿Puedo cambiar de plan después de suscribirme?',
      a: 'Sí, puedes actualizar o cambiar tu plan en cualquier momento. El cambio se aplicará en tu próximo ciclo de facturación.'
    },
    {
      q: '¿La entrega prioritaria tiene costo adicional?',
      a: 'No, la entrega prioritaria está incluida en tu membresía premium sin costos adicionales en todos tus pedidos.'
    },
    {
      q: '¿Cómo funciona la reserva de productos?',
      a: 'Cuando encuentres un producto que te interese, puedes reservarlo por hasta 30 días. El producto quedará apartado para ti y podrás comprarlo cuando estés listo.'
    }
  ];

  return (
    <div className="premium-wrapper">
      <Header />
      
      {/* Hero Section */}
      <section className="premium-hero">
        <div className="premium-hero-content">
          <div className="premium-badge">
            <Sparkles size={16} />
            <span>Únete a más de 10,000 usuarios premium</span>
          </div>

          <h1 className="premium-hero-title">
            Lleva tu experiencia al
            <span className="premium-highlight">siguiente nivel</span>
          </h1>

          <p className="premium-hero-description">
            Accede a entregas más rápidas, descuentos exclusivos y beneficios únicos
          </p>

          <div className="premium-hero-buttons">
            <a href="#plans" className="premium-btn-primary">
              <Crown size={20} />
              Comenzar ahora
            </a>
            <a href="#comparison" className="premium-btn-secondary">
              Ver comparación
            </a>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="premium-section">
        <div className="premium-container">
          <div className="premium-section-header">
            <h2>¿Por qué elegir Premium?</h2>
            <p>Descubre todos los beneficios exclusivos</p>
          </div>

          <div className="premium-benefits-grid">
            <div className="premium-benefit-card">
              <div className="premium-benefit-icon blue">
                <Clock size={32} />
              </div>
              <h3>Entrega Prioritaria</h3>
              <div className="premium-benefit-stat blue">1-2 días</div>
              <p>Recibe hasta 5x más rápido</p>
            </div>

            <div className="premium-benefit-card">
              <div className="premium-benefit-icon yellow">
                <Tag size={32} />
              </div>
              <h3>Descuentos Exclusivos</h3>
              <div className="premium-benefit-stat yellow">Hasta 20%</div>
              <p>Ahorra en cada compra</p>
            </div>

            <div className="premium-benefit-card">
              <div className="premium-benefit-icon green">
                <Shield size={32} />
              </div>
              <h3>Reserva de Productos</h3>
              <div className="premium-benefit-stat green">30 días</div>
              <p>Asegura tus productos</p>
            </div>

            <div className="premium-benefit-card">
              <div className="premium-benefit-icon purple">
                <Bolt size={32} />
              </div>
              <h3>Soporte Prioritario</h3>
              <div className="premium-benefit-stat purple">24/7</div>
              <p>Atención inmediata</p>
            </div>
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section className="premium-section premium-section-gray">
        <div className="premium-container">
          <h2 className="premium-section-title">Proceso Simple y Rápido</h2>
          <p className="premium-section-subtitle">Activa tu membresía premium en solo 4 pasos</p>
          
          <div className="premium-process-grid">
            {[
              { num: 1, title: 'Seleccionar Plan', desc: 'Elige el plan que mejor se adapte' },
              { num: 2, title: 'Procesar Pago', desc: 'Completa el pago de forma segura' },
              { num: 3, title: 'Activar Beneficios', desc: 'Los beneficios se activan inmediatamente' },
              { num: 4, title: 'Disfrutar Premium', desc: 'Comienza a disfrutar de todas tus ventajas' }
            ].map((step) => (
              <div key={step.num} className="premium-process-card">
                <div className="premium-process-number">{step.num}</div>
                <h3>{step.num}. {step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="plans" className="premium-section">
        <div className="premium-container">
          <div className="premium-section-header">
            <h2>Elige el plan perfecto para ti</h2>
            <p>Todos los planes incluyen acceso completo a beneficios premium. Sin permanencia.</p>
          </div>

          {loading ? (
            <div className="premium-loading">Cargando planes...</div>
          ) : (
            <div className="premium-plans-grid">
              {planes.map((plan, idx) => {
                const isPopular = idx === 1;
                return (
                  <div key={plan.id_plan} className={`premium-plan-card ${isPopular ? 'popular' : ''}`}>
                    {isPopular && <div className="premium-plan-badge">Más Popular</div>}
                    
                    <Shield size={48} className="premium-plan-icon" />
                    <h3 className="premium-plan-name">{plan.nombre_plan}</h3>
                    <p className="premium-plan-description">{plan.desc_plan}</p>
                    
                    <div className="premium-plan-price">${plan.precio_plan}</div>
                    <div className="premium-plan-period">/{plan.duracion_dias} días</div>

                    <div className="premium-plan-features">
                      <div className="premium-feature-item">
                        <Check size={20} />
                        <span>Entrega prioritaria ({plan.dias_envio_red} días)</span>
                      </div>
                      <div className="premium-feature-item">
                        <Check size={20} />
                        <span>{plan.porc_descuento}% de descuento en todas las compras</span>
                      </div>
                      {plan.permite_reservas && (
                        <div className="premium-feature-item">
                          <Check size={20} />
                          <span>Reserva de productos</span>
                        </div>
                      )}
                      <div className="premium-feature-item">
                        <Check size={20} />
                        <span>Soporte prioritario 24/7</span>
                      </div>
                      <div className="premium-feature-item">
                        <Check size={20} />
                        <span>Sin comisiones adicionales</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`premium-plan-button ${isPopular ? 'primary' : 'secondary'}`}
                    >
                      {isPopular && <Crown size={20} />}
                      Seleccionar plan
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Comparación */}
      <section id="comparison" className="premium-section premium-section-gray">
        <div className="premium-container">
          <h2 className="premium-section-title">Premium vs Regular</h2>
          <p className="premium-section-subtitle">Compara y descubre todo lo que obtienes con Premium</p>
          
          <div className="premium-comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Regular</th>
                  <th className="premium-header">
                    <Crown size={16} />
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Tiempo de entrega', regular: '5-7 días', premium: '1-2 días' },
                  { feature: 'Descuentos', regular: 'Ofertas ocasionales', premium: 'Hasta 20% siempre' },
                  { feature: 'Reserva de productos', regular: false, premium: 'Hasta 30 días' },
                  { feature: 'Soporte', regular: 'Email (48h)', premium: '24/7 prioritario' },
                  { feature: 'Comisiones', regular: '3% por transacción', premium: 'Sin comisiones' },
                  { feature: 'Devoluciones', regular: 'Costo adicional', premium: 'Gratis' },
                  { feature: 'Garantía extendida', regular: 'No incluida', premium: 'Incluida' },
                  { feature: 'Acceso anticipado', regular: false, premium: true }
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.feature}</td>
                    <td className="regular-cell">
                      {typeof row.regular === 'boolean' ? (
                        row.regular ? <Check size={20} className="icon-check" /> : <X size={20} className="icon-cross" />
                      ) : row.regular}
                    </td>
                    <td className="premium-cell">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? <Check size={20} className="icon-check" /> : <X size={20} className="icon-cross" />
                      ) : row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="premium-section">
        <div className="premium-container premium-container-narrow">
          <h2 className="premium-section-title">Preguntas Frecuentes</h2>
          <p className="premium-section-subtitle">Resolvemos tus dudas sobre la membresía premium</p>
          
          <div className="premium-faq-container">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`premium-faq-item ${activeFaq === idx ? 'active' : ''}`}>
                <button
                  className="premium-faq-question"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={20} />
                </button>
                <div className="premium-faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="premium-cta">
        <div className="premium-cta-content">
          <Crown size={64} className="premium-cta-icon" />
          <h2>¿Listo para ser Premium?</h2>
          <p>Únete a miles de usuarios que ya disfrutan de beneficios exclusivos</p>
          <a href="#plans" className="premium-btn-primary">
            <Sparkles size={20} />
            Comenzar ahora
          </a>
        </div>
      </section>

      {/* Modal */}
      {showModal && selectedPlan && (
        <div className="premium-modal" onClick={() => setShowModal(false)}>
          <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="premium-modal-header">
              <div>
                <h3>Activar plan {selectedPlan.nombre_plan}</h3>
                <p>Resumen de tu compra y activación de beneficios</p>
              </div>
              <button className="premium-modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="premium-modal-body">
              <div className="premium-modal-summary">
                <div className="premium-summary-row">
                  <span>Plan {selectedPlan.nombre_plan}</span>
                  <span className="premium-summary-price">${selectedPlan.precio_plan}</span>
                </div>
                <div className="premium-summary-row small">
                  <span>Duración</span>
                  <span>{selectedPlan.duracion_dias} días</span>
                </div>
                <div className="premium-summary-row total">
                  <span>Total</span>
                  <span>${selectedPlan.precio_plan}</span>
                </div>
              </div>

              <div className="premium-modal-benefits">
                <h4>Beneficios que recibirás:</h4>
                <div className="premium-modal-benefit">
                  <Check size={20} />
                  <span>Entrega prioritaria ({selectedPlan.dias_envio_red} días)</span>
                </div>
                <div className="premium-modal-benefit">
                  <Check size={20} />
                  <span>{selectedPlan.porc_descuento}% de descuento en compras</span>
                </div>
                {selectedPlan.permite_reservas && (
                  <div className="premium-modal-benefit">
                    <Check size={20} />
                    <span>Reserva de productos</span>
                  </div>
                )}
                <div className="premium-modal-benefit">
                  <Check size={20} />
                  <span>Soporte prioritario 24/7</span>
                </div>
              </div>
            </div>

            <div className="premium-modal-footer">
              <button onClick={handleComprar} className="premium-btn-primary full-width">
                <CreditCard size={20} />
                Proceder al Pago
              </button>
              <p className="premium-modal-note">
                Al continuar aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PremiumPage;
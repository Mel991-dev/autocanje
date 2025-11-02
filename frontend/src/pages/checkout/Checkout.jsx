import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/checkout/checkout.css';
import Header from '../../components/header';
import Footer from '../../components/footer';
import {
  CreditCard,
  Truck,
  ShoppingBag,
  Crown,
  Package,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const API_URL = 'http://127.0.0.1:5000/api';

const Checkout = () => {
  const navigate = useNavigate();
  
  const [usuario, setUsuario] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [totales, setTotales] = useState({});
  const [metodosPago, setMetodosPago] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [direccionEntrega, setDireccionEntrega] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const token = localStorage.getItem('token');
    const usuarioData = localStorage.getItem('usuario');

    if (!token || !usuarioData) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(usuarioData);
      setUsuario(user);
      setDireccionEntrega(user.direccion || '');

      // Cargar carrito
      const carritoRes = await axios.get(`${API_URL}/carrito/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (carritoRes.data.success) {
        setCarrito(carritoRes.data.carrito || []);
        setTotales(carritoRes.data.totales || {});
      }

      // Cargar métodos de pago
      const metodosRes = await axios.get(`${API_URL}/compras/metodos-pago`);
      if (metodosRes.data.success) {
        setMetodosPago(metodosRes.data.metodos_pago || []);
        if (metodosRes.data.metodos_pago.length > 0) {
          setMetodoSeleccionado(metodosRes.data.metodos_pago[0].id_metodo_pago);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
      setLoading(false);
    }
  };

  const handleProcesarCompra = async (e) => {
    e.preventDefault();
    
    if (!metodoSeleccionado) {
      setError('Selecciona un método de pago');
      return;
    }

    if (!direccionEntrega.trim()) {
      setError('La dirección de entrega es requerida');
      return;
    }

    setProcesando(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/compras/procesar`,
        {
          fk_metodo_pago: metodoSeleccionado,
          direccion_entrega: direccionEntrega
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Redirigir al comprobante
        navigate(`/checkout/comprobante/${response.data.id_compra}`);
      } else {
        setError(response.data.error || 'Error al procesar la compra');
      }
    } catch (err) {
      console.error('Error al procesar compra:', err);
      setError(err.response?.data?.error || 'Error al procesar la compra');
    } finally {
      setProcesando(false);
    }
  };

  const getMetodoIcon = (nombre) => {
    if (nombre.toLowerCase().includes('paypal')) return '💳';
    if (nombre.toLowerCase().includes('mercadopago')) return '💰';
    if (nombre.toLowerCase().includes('nequi')) return '📱';
    return '💵';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <Loader size={48} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Cargando checkout...</p>
      </div>
    );
  }

  if (carrito.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <ShoppingBag size={64} style={{ color: '#d1d5db' }} />
        <h2>Tu carrito está vacío</h2>
        <button
          onClick={() => navigate('/catalogo')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Ir al Catálogo
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>
          Finalizar Compra
        </h1>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '2rem'
        }}>
          {/* Columna Izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Información de Entrega */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Truck size={20} />
                Información de Entrega
              </h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}>
                  Destinatario
                </label>
                <input
                  type="text"
                  value={`${usuario?.primer_nombre || ''} ${usuario?.primer_apellido || ''}`}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#f9fafb',
                    color: '#6b7280'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}>
                  Teléfono
                </label>
                <input
                  type="text"
                  value={usuario?.telefono || ''}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#f9fafb',
                    color: '#6b7280'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}>
                  Dirección de Entrega *
                </label>
                <textarea
                  value={direccionEntrega}
                  onChange={(e) => setDireccionEntrega(e.target.value)}
                  placeholder="Ingresa la dirección completa de entrega"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {totales.es_premium && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 193, 7, 0.1)',
                  border: '1px solid #FFC107',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#7c5f00',
                  fontSize: '0.875rem'
                }}>
                  <Crown size={16} />
                  <span><strong>Entrega Prioritaria:</strong> 1-3 días hábiles</span>
                </div>
              )}
            </div>

            {/* Método de Pago */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CreditCard size={20} />
                Método de Pago
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {metodosPago.map((metodo) => (
                  <label
                    key={metodo.id_metodo_pago}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      border: metodoSeleccionado === metodo.id_metodo_pago
                        ? '2px solid #007BFF'
                        : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: metodoSeleccionado === metodo.id_metodo_pago
                        ? 'rgba(0, 123, 255, 0.05)'
                        : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="radio"
                      name="metodo_pago"
                      value={metodo.id_metodo_pago}
                      checked={metodoSeleccionado === metodo.id_metodo_pago}
                      onChange={() => setMetodoSeleccionado(metodo.id_metodo_pago)}
                      style={{ marginRight: '1rem', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>
                      {getMetodoIcon(metodo.nombre)}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{metodo.nombre}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Pago seguro con {metodo.nombre}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha - Resumen */}
          <div>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              position: 'sticky',
              top: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ShoppingBag size={20} />
                Resumen del Pedido
              </h2>

              {/* Productos */}
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                marginBottom: '1rem',
                paddingRight: '0.5rem'
              }}>
                {carrito.map((item) => (
                  <div key={item.id_carrito} style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      background: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Package size={24} style={{ color: '#9ca3af' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        marginBottom: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.nombre_producto}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Cantidad: {item.cantidad}
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#007BFF' }}>
                        {formatPrice(item.subtotal_item)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div style={{
                borderTop: '2px solid #e5e7eb',
                paddingTop: '1rem',
                marginTop: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                  fontSize: '0.95rem'
                }}>
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>{formatPrice(totales.subtotal)}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                  fontSize: '0.95rem'
                }}>
                  <span style={{ color: '#6b7280' }}>Envío</span>
                  <span style={{ fontWeight: 600, color: totales.envio === 0 ? '#16a34a' : '#1a1a1a' }}>
                    {totales.envio === 0 ? 'Gratis' : formatPrice(totales.envio)}
                  </span>
                </div>

                {totales.es_premium && totales.descuento_premium > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem'
                  }}>
                    <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Crown size={14} style={{ color: '#FFC107' }} />
                      Descuento Premium
                    </span>
                    <span style={{ fontWeight: 600, color: '#16a34a' }}>
                      -{formatPrice(totales.descuento_premium)}
                    </span>
                  </div>
                )}

                <div style={{
                  borderTop: '2px solid #e5e7eb',
                  paddingTop: '1rem',
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.25rem',
                  fontWeight: 700
                }}>
                  <span>Total</span>
                  <span style={{ color: '#007BFF' }}>{formatPrice(totales.total)}</span>
                </div>
              </div>

              {/* Botón de Compra */}
              <button
                onClick={handleProcesarCompra}
                disabled={procesando}
                style={{
                  width: '100%',
                  padding: '1rem',
                  marginTop: '1.5rem',
                  background: procesando ? '#9ca3af' : 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: procesando ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                {procesando ? (
                  <>
                    <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Confirmar y Pagar
                  </>
                )}
              </button>

              <p style={{
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                Al confirmar, aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
// frontend/src/pages/users/Perfil.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Lock, Save, Edit, Shield, TrendingUp, Package, DollarSign, Star } from 'lucide-react';
import ProductosPanel from '../vendedor/ProductosPanel';
import '../../styles/perfil.css';
import '../../styles/vendedor/productosPanel.css';
import '../../styles/globals.css';
import Header from '../../components/header';
import Footer from '../../components/footer';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  
  const [tabActivo, setTabActivo] = useState('personal');
  const [modoEdicion, setModoEdicion] = useState(false);
  
  const [formData, setFormData] = useState({
    identificacion: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    es_vendedor: false,
    es_comprador: false,
    es_admin: false
  });
  
  const [passwordData, setPasswordData] = useState({
    contrasena_actual: '',
    contrasena_nueva: '',
    confirmar_contrasena: ''
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const response = await axios.get(
        'http://127.0.0.1:5000/api/auth/perfil',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        const userData = response.data.usuario;
        setUsuario(userData);
        
        setFormData({
          identificacion: userData.identificacion || '',
          primer_nombre: userData.primer_nombre || '',
          segundo_nombre: userData.segundo_nombre || '',
          primer_apellido: userData.primer_apellido || '',
          segundo_apellido: userData.segundo_apellido || '',
          email: userData.email || '',
          telefono: userData.telefono || '',
          direccion: userData.direccion || '',
          es_vendedor: userData.es_vendedor || false,
          es_comprador: userData.es_comprador || false,
          es_admin: userData.es_admin || false
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
      } else {
        setError('Error al cargar el perfil');
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleModoEdicion = () => {
    setModoEdicion(!modoEdicion);
    if (modoEdicion) {
      cargarPerfil();
    }
  };

  const guardarInformacion = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    setExito('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        'http://127.0.0.1:5000/api/auth/perfil',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setExito('Perfil actualizado correctamente');
        
        const usuarioActualizado = response.data.usuario;
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        setUsuario(usuarioActualizado);
        setModoEdicion(false);
        
        setFormData({
          identificacion: usuarioActualizado.identificacion || '',
          primer_nombre: usuarioActualizado.primer_nombre || '',
          segundo_nombre: usuarioActualizado.segundo_nombre || '',
          primer_apellido: usuarioActualizado.primer_apellido || '',
          segundo_apellido: usuarioActualizado.segundo_apellido || '',
          email: usuarioActualizado.email || '',
          telefono: usuarioActualizado.telefono || '',
          direccion: usuarioActualizado.direccion || '',
          es_vendedor: usuarioActualizado.es_vendedor || false,
          es_comprador: usuarioActualizado.es_comprador || false,
          es_admin: usuarioActualizado.es_admin || false
        });
        
        setTimeout(() => setExito(''), 3000);
      }
      
    } catch (error) {
      console.error('Error al guardar:', error);
      setError(error.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarContrasena = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    setExito('');
    
    if (passwordData.contrasena_nueva !== passwordData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      setGuardando(false);
      return;
    }
    
    if (passwordData.contrasena_nueva.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setGuardando(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://127.0.0.1:5000/api/auth/cambiar-contrasena',
        {
          contrasena_actual: passwordData.contrasena_actual,
          contrasena_nueva: passwordData.contrasena_nueva
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setExito('Contraseña actualizada correctamente');
        
        setPasswordData({
          contrasena_actual: '',
          contrasena_nueva: '',
          confirmar_contrasena: ''
        });
        
        setTimeout(() => setExito(''), 3000);
      }
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setError(error.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setGuardando(false);
    }
  };

  const getNombreCompleto = () => {
    if (!usuario) return '';
    return `${usuario.primer_nombre} ${usuario.primer_apellido}`;
  };

  const getRoles = () => {
    const roles = [];
    if (usuario?.es_admin) roles.push({ label: 'Premium', clase: 'badge-premium' });
    if (usuario?.es_vendedor) roles.push({ label: 'Vendedor', clase: 'badge-outline' });
    if (usuario?.es_comprador) roles.push({ label: 'Comprador', clase: 'badge-outline' });
    return roles;
  };

  if (loading) {
    return (
      <div className="perfil-loading">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="container-perfil">
      <Header/>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="avatar">
            <User size={48} />
          </div>
          
          <div className="profile-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{getNombreCompleto()}</h1>
              {getRoles().map((rol, index) => (
                <span key={index} className={`badge ${rol.clase}`}>
                  {rol.label}
                </span>
              ))}
            </div>
            <p className="profile-email">{usuario?.email}</p>
            <div className="profile-details">
              {usuario?.telefono && (
                <div className="profile-detail">
                  <Phone size={16} />
                  <span>{usuario.telefono}</span>
                </div>
              )}
              {usuario?.direccion && (
                <div className="profile-detail">
                  <MapPin size={16} />
                  <span>{usuario.direccion}</span>
                </div>
              )}
            </div>
          </div>

          <button className="btn btn-outline btn-editar" onClick={toggleModoEdicion}>
            {modoEdicion ? (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Cancelar
              </>
            ) : (
              <>
                <Edit size={16} />
                Editar Perfil
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      
      {exito && (
        <div className="alert alert-success">
          <span>{exito}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <div className="tabs-list">
          <button
            className={`tab-button ${tabActivo === 'personal' ? 'active' : ''}`}
            onClick={() => setTabActivo('personal')}
          >
            <User size={16} />
            <span>Información Personal</span>
          </button>
          
          <button
            className={`tab-button ${tabActivo === 'security' ? 'active' : ''}`}
            onClick={() => setTabActivo('security')}
          >
            <Shield size={16} />
            <span>Seguridad</span>
          </button>
          
          {usuario?.es_vendedor && (
            <>
              <button
                className={`tab-button ${tabActivo === 'seller' ? 'active' : ''}`}
                onClick={() => setTabActivo('seller')}
              >
                <TrendingUp size={16} />
                <span>Panel Vendedor</span>
              </button>
              
              <button
                className={`tab-button ${tabActivo === 'products' ? 'active' : ''}`}
                onClick={() => setTabActivo('products')}
              >
                <Package size={16} />
                <span>Mis Productos</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Content: Personal */}
      {tabActivo === 'personal' && (
        <div className="tab-content active">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Información Personal</h2>
              <p className="card-description">Actualiza tus datos personales y de contacto</p>
            </div>
            <form onSubmit={guardarInformacion}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="primer_nombre">Nombres</label>
                  <input
                    type="text"
                    id="primer_nombre"
                    name="primer_nombre"
                    value={formData.primer_nombre}
                    onChange={handleInputChange}
                    placeholder="Primer nombre"
                    disabled={!modoEdicion}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="primer_apellido">Apellidos</label>
                  <input
                    type="text"
                    id="primer_apellido"
                    name="primer_apellido"
                    value={formData.primer_apellido}
                    onChange={handleInputChange}
                    placeholder="Primer apellido"
                    disabled={!modoEdicion}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="segundo_nombre">Segundo Nombre</label>
                  <input
                    type="text"
                    id="segundo_nombre"
                    name="segundo_nombre"
                    value={formData.segundo_nombre}
                    onChange={handleInputChange}
                    placeholder="Segundo nombre (opcional)"
                    disabled={!modoEdicion}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="segundo_apellido">Segundo Apellido</label>
                  <input
                    type="text"
                    id="segundo_apellido"
                    name="segundo_apellido"
                    value={formData.segundo_apellido}
                    onChange={handleInputChange}
                    placeholder="Segundo apellido (opcional)"
                    disabled={!modoEdicion}
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="identificacion">Identificación Personal</label>
                  <input
                    type="text"
                    id="identificacion"
                    name="identificacion"
                    value={formData.identificacion}
                    onChange={handleInputChange}
                    placeholder="Número de identificación"
                    disabled={!modoEdicion}
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    disabled={!modoEdicion}
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+57 300 123 4567"
                    disabled={!modoEdicion}
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="direccion">Dirección Completa</label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Calle, ciudad, código postal..."
                    disabled={!modoEdicion}
                  />
                </div>
              </div>
              {modoEdicion && (
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={guardando}>
                    <Save size={16} />
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={toggleModoEdicion}>
                    Cancelar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Tab Content: Security */}
      {tabActivo === 'security' && (
        <div className="tab-content active">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Cambiar Contraseña</h2>
              <p className="card-description">Actualiza tu contraseña para mantener tu cuenta segura</p>
            </div>
            <form onSubmit={cambiarContrasena}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="contrasena_actual">Contraseña Actual</label>
                  <input
                    type="password"
                    id="contrasena_actual"
                    name="contrasena_actual"
                    value={passwordData.contrasena_actual}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="contrasena_nueva">Nueva Contraseña</label>
                  <input
                    type="password"
                    id="contrasena_nueva"
                    name="contrasena_nueva"
                    value={passwordData.contrasena_nueva}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                  />
                  <span className="help-text">Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números</span>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="confirmar_contrasena">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    id="confirmar_contrasena"
                    name="confirmar_contrasena"
                    value={passwordData.confirmar_contrasena}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  <Lock size={16} />
                  {guardando ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content: Seller Dashboard */}
      {tabActivo === 'seller' && (
        <div className="tab-content active">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Total Productos</span>
                <Package className="stat-icon" size={20} />
              </div>
              <div className="stat-value">0</div>
              <div className="stat-description">0 activos</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Ventas Totales</span>
                <TrendingUp className="stat-icon" size={20} />
              </div>
              <div className="stat-value">0</div>
              <div className="stat-description">Próximamente</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Ingresos Totales</span>
                <DollarSign className="stat-icon" size={20} />
              </div>
              <div className="stat-value">$0</div>
              <div className="stat-description">COP</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Calificación</span>
                <Star className="stat-icon" size={20} style={{fill: '#FFC107', stroke: '#FFC107'}} />
              </div>
              <div className="stat-value">0/5.0</div>
              <div className="stat-description">Sin reseñas aún</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Ventas Recientes</h2>
              <p className="card-description">Últimas transacciones de tus productos</p>
            </div>
            <div style={{padding: '2rem', textAlign: 'center', color: '#6b7280'}}>
              <p>No hay ventas registradas aún</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Products */}
      {tabActivo === 'products' && (
        <div className="tab-content active">
          <ProductosPanel />
        </div>
      )}
      <Footer/>
    </div>
  );
};

export default Perfil;
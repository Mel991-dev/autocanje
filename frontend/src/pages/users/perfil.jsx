// frontend/src/pages/users/Perfil.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Mail, Phone, MapPin, Lock, Save, AlertCircle, 
  CheckCircle, Shield, Package, Plus, Eye, Edit, Trash2, Play
} from 'lucide-react';
import '../../styles/perfil.css';
import Header from '../../components/header';
import Footer from '../../components/footer';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  
  // Tab activo
  const [tabActivo, setTabActivo] = useState('informacion');
  
  // Formulario de información personal
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
  
  // Formulario de cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    contrasena_actual: '',
    contrasena_nueva: '',
    confirmar_contrasena: ''
  });

  // Productos del vendedor (mock data por ahora)
  const [productos, setProductos] = useState([]);

  // Cargar datos del usuario al montar
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
        
        // Actualizar token si viene en la respuesta (roles cambiaron)
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        setUsuario(usuarioActualizado);
        
        // Actualizar formData con los nuevos valores
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
    if (usuario?.es_admin) roles.push('Admin');
    if (usuario?.es_vendedor) roles.push('Vendedor');
    if (usuario?.es_comprador) roles.push('Comprador');
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
    
    <div className="perfil-page">
      <Header/>
      {/* Header del Perfil */}
      <div className="perfil-header-card">
        <div className="perfil-header-left">
          <div className="perfil-avatar">
            <User size={40} />
          </div>
          <div className="perfil-header-info">
            <h1 className="perfil-nombre">{getNombreCompleto()}</h1>
            <p className="perfil-email">{usuario?.email}</p>
            <div className="perfil-contacto">
              {usuario?.telefono && (
                <span className="perfil-contacto-item">
                  <Phone size={14} />
                  {usuario.telefono}
                </span>
              )}
              {usuario?.direccion && (
                <span className="perfil-contacto-item">
                  <MapPin size={14} />
                  {usuario.direccion}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="perfil-header-right">
          <div className="perfil-badges">
            {usuario?.es_admin && (
              <span className="badge badge-premium">Premium</span>
            )}
            {getRoles().map(rol => (
              <span key={rol} className="badge badge-role">{rol}</span>
            ))}
          </div>
          <button className="btn-edit-perfil" onClick={() => setTabActivo('informacion')}>
            <Edit size={18} />
            Editar Perfil
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      
      {exito && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{exito}</span>
        </div>
      )}

      {/* Tabs de navegación */}
      <div className="perfil-tabs-container">
        <button
          className={`perfil-tab ${tabActivo === 'informacion' ? 'active' : ''}`}
          onClick={() => setTabActivo('informacion')}
        >
          <User size={20} />
          <span>Información Personal</span>
        </button>
        
        <button
          className={`perfil-tab ${tabActivo === 'seguridad' ? 'active' : ''}`}
          onClick={() => setTabActivo('seguridad')}
        >
          <Shield size={20} />
          <span>Seguridad</span>
        </button>
        
        {usuario?.es_vendedor && (
          <button
            className={`perfil-tab ${tabActivo === 'vendedor' ? 'active' : ''}`}
            onClick={() => setTabActivo('vendedor')}
          >
            <Package size={20} />
            <span>Panel Vendedor</span>
          </button>
        )}
        
        <button
          className={`perfil-tab ${tabActivo === 'productos' ? 'active' : ''}`}
          onClick={() => setTabActivo('productos')}
        >
          <Package size={20} />
          <span>Mis Productos</span>
        </button>
      </div>

      {/* Contenido de tabs */}
      <div className="perfil-content-wrapper">
        {/* TAB: Información Personal */}
        {tabActivo === 'informacion' && (
          <div className="perfil-content-card">
            <div className="content-header">
              <h2>Información Personal</h2>
              <p>Actualiza tus datos personales y de contacto</p>
            </div>

            <form onSubmit={guardarInformacion}>
              {/* Sección: Datos Personales */}
              <div className="form-section-perfil">
                <h3 className="section-title-perfil">Nombres</h3>
                <div className="form-row">
                  <div className="form-field">
                    <label>Primer Nombre *</label>
                    <input
                      type="text"
                      name="primer_nombre"
                      value={formData.primer_nombre}
                      onChange={handleInputChange}
                      placeholder="Juan Carlos"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Segundo Nombre</label>
                    <input
                      type="text"
                      name="segundo_nombre"
                      value={formData.segundo_nombre}
                      onChange={handleInputChange}
                      placeholder="Alonso"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section-perfil">
                <h3 className="section-title-perfil">Apellidos</h3>
                <div className="form-row">
                  <div className="form-field">
                    <label>Primer Apellido *</label>
                    <input
                      type="text"
                      name="primer_apellido"
                      value={formData.primer_apellido}
                      onChange={handleInputChange}
                      placeholder="Pérez García"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Segundo Apellido</label>
                    <input
                      type="text"
                      name="segundo_apellido"
                      value={formData.segundo_apellido}
                      onChange={handleInputChange}
                      placeholder="Duarte"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section-perfil">
                <h3 className="section-title-perfil">Identificación Personal</h3>
                <div className="form-row">
                  <div className="form-field">
                    <label>Identificación</label>
                    <input
                      type="text"
                      name="identificacion"
                      value={formData.identificacion}
                      onChange={handleInputChange}
                      placeholder="1234567890"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section-perfil">
                <h3 className="section-title-perfil">Información de Contacto</h3>
                <div className="form-row">
                  <div className="form-field">
                    <label>Correo Electrónico *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="juan.perez@email.com"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section-perfil">
                <h3 className="section-title-perfil">Dirección</h3>
                <div className="form-row">
                  <div className="form-field full-width">
                    <label>Dirección Completa</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      placeholder="Calle 123 #45-67"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section-perfil">
                <h3 className="section-title-perfil">Roles</h3>
                <div className="roles-grid">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="es_vendedor"
                      checked={formData.es_vendedor}
                      onChange={handleInputChange}
                    />
                    <span>Soy Vendedor</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="es_comprador"
                      checked={formData.es_comprador}
                      onChange={handleInputChange}
                    />
                    <span>Soy Comprador</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="es_admin"
                      checked={formData.es_admin}
                      onChange={handleInputChange}
                    />
                    <span>Soy Administrador</span>
                  </label>
                </div>
              </div>

              <div className="form-actions-perfil">
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  <Save size={18} />
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: Seguridad */}
        {tabActivo === 'seguridad' && (
          <div className="perfil-content-card">
            <div className="content-header">
              <h2>Cambiar Contraseña</h2>
              <p>Actualiza tu contraseña para mantener tu cuenta segura</p>
            </div>

            <form onSubmit={cambiarContrasena} className="security-form">
              <div className="form-section-perfil">
                <div className="form-row single-column">
                  <div className="form-field">
                    <label>Contraseña Actual *</label>
                    <input
                      type="password"
                      name="contrasena_actual"
                      value={passwordData.contrasena_actual}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Nueva Contraseña *</label>
                    <input
                      type="password"
                      name="contrasena_nueva"
                      value={passwordData.contrasena_nueva}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                    />
                    <small>Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números</small>
                  </div>

                  <div className="form-field">
                    <label>Confirmar Nueva Contraseña *</label>
                    <input
                      type="password"
                      name="confirmar_contrasena"
                      value={passwordData.confirmar_contrasena}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions-perfil">
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  <Lock size={18} />
                  {guardando ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: Panel Vendedor / Mis Productos */}
        {(tabActivo === 'vendedor' || tabActivo === 'productos') && (
          <div className="perfil-content-card">
            <div className="content-header productos-header">
              <div>
                <h2>Mis Productos</h2>
                <p>Gestiona tu inventario y publicaciones</p>
              </div>
              <button className="btn btn-primary">
                <Plus size={18} />
                Nuevo Producto
              </button>
            </div>

            {productos.length === 0 ? (
              <div className="empty-state">
                <Package size={64} className="empty-icon" />
                <h3>No tienes productos publicados</h3>
                <p>Comienza a vender publicando tu primer producto</p>
                <button className="btn btn-primary btn-lg">
                  <Plus size={20} />
                  Crear Producto
                </button>
              </div>
            ) : (
              <div className="productos-table">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Ventas</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Los productos se renderizarán aquí */}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default Perfil;
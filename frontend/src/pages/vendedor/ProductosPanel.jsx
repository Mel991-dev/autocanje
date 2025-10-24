// frontend/src/pages/vendedor/ProductosPanel.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Package, AlertCircle, 
  CheckCircle, Search, Filter, X
} from 'lucide-react';
import '../../styles/vendedor/productosPanel.css';

const ProductosPanel = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  
  // Modal de crear/editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  
  // Catálogos
  const [categorias, setCategorias] = useState([]);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  // Formulario
  const [formData, setFormData] = useState({
    nombre_producto: '',
    descripcion: '',
    fk_categoria: '',
    fk_tipo_vehiculo: '',
    precio: '',
    stock: '',
    pausado: false
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([
      cargarProductos(),
      cargarCategorias(),
      cargarTiposVehiculo()
    ]);
  };

  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const response = await axios.get(
        'http://127.0.0.1:5000/api/productos/mis-productos',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setProductos(response.data.productos);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar los productos');
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/productos/categorias');
      
      if (response.data.success) {
        setCategorias(response.data.categorias);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const cargarTiposVehiculo = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/productos/tipos-vehiculo');
      
      if (response.data.success) {
        setTiposVehiculo(response.data.tipos_vehiculo);
      }
    } catch (error) {
      console.error('Error al cargar tipos de vehículo:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setProductoEditando(null);
    setFormData({
      nombre_producto: '',
      descripcion: '',
      fk_categoria: '',
      fk_tipo_vehiculo: '',
      precio: '',
      stock: '',
      pausado: false
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto) => {
    setModoEdicion(true);
    setProductoEditando(producto);
    setFormData({
      nombre_producto: producto.nombre_producto,
      descripcion: producto.descripcion || '',
      fk_categoria: producto.fk_categoria || '',
      fk_tipo_vehiculo: producto.fk_tipo_vehiculo || '',
      precio: producto.precio,
      stock: producto.stock,
      pausado: producto.pausado
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
    setProductoEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    
    // Validaciones
    if (!formData.nombre_producto.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }
    
    if (!formData.fk_categoria) {
      setError('Debes seleccionar una categoría');
      return;
    }
    
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      setError('El precio debe ser mayor a cero');
      return;
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('El stock no puede ser negativo');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (modoEdicion) {
        // Actualizar producto
        const response = await axios.put(
          `http://127.0.0.1:5000/api/productos/${productoEditando.id_producto}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          setExito('Producto actualizado con éxito');
          await cargarProductos();
          cerrarModal();
          setTimeout(() => setExito(''), 3000);
        }
      } else {
        // Crear producto
        const response = await axios.post(
          'http://127.0.0.1:5000/api/productos/',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          setExito('Producto creado con éxito');
          await cargarProductos();
          cerrarModal();
          setTimeout(() => setExito(''), 3000);
        }
      }
      
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setError(error.response?.data?.error || 'Error al guardar el producto');
    }
  };

  const togglePausarProducto = async (producto) => {
    try {
      const token = localStorage.getItem('token');
      const nuevoPausado = !producto.pausado;
      
      const response = await axios.patch(
        `http://127.0.0.1:5000/api/productos/${producto.id_producto}/pausar`,
        { pausado: nuevoPausado },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setExito(response.data.message);
        await cargarProductos();
        setTimeout(() => setExito(''), 3000);
      }
      
    } catch (error) {
      console.error('Error al pausar producto:', error);
      setError(error.response?.data?.error || 'Error al cambiar el estado');
    }
  };

  const eliminarProducto = async (producto) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${producto.nombre_producto}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `http://127.0.0.1:5000/api/productos/${producto.id_producto}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setExito('Producto eliminado con éxito');
        await cargarProductos();
        setTimeout(() => setExito(''), 3000);
      }
      
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      setError(error.response?.data?.error || 'Error al eliminar el producto');
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const matchBusqueda = producto.nombre_producto.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = !filtroCategoria || producto.fk_categoria == filtroCategoria;
    const matchEstado = filtroEstado === 'todos' || 
                        (filtroEstado === 'activos' && !producto.pausado) ||
                        (filtroEstado === 'pausados' && producto.pausado);
    
    return matchBusqueda && matchCategoria && matchEstado;
  });

  if (loading) {
    return (
      <div className="productos-loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="productos-panel">
      {/* Header */}
      <div className="productos-header">
        <div>
          <h1>Mis Productos</h1>
          <p>Gestiona tu inventario y publicaciones</p>
        </div>
        <button className="btn btn-primary" onClick={abrirModalCrear}>
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {/* Alertas */}
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

      {/* Filtros */}
      <div className="productos-filtros">
        <div className="filtro-busqueda">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="filtro-select"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat.id_categoria} value={cat.id_categoria}>
              {cat.nombre}
            </option>
          ))}
        </select>
        
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="filtro-select"
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="pausados">Pausados</option>
        </select>
      </div>

      {/* Lista de productos */}
      {productosFiltrados.length === 0 ? (
        <div className="empty-state">
          <Package size={64} />
          <h3>No hay productos</h3>
          <p>
            {busqueda || filtroCategoria || filtroEstado !== 'todos'
              ? 'No se encontraron productos con los filtros aplicados'
              : 'Comienza a vender publicando tu primer producto'}
          </p>
          {!busqueda && !filtroCategoria && filtroEstado === 'todos' && (
            <button className="btn btn-primary btn-lg" onClick={abrirModalCrear}>
              <Plus size={20} />
              Crear Primer Producto
            </button>
          )}
        </div>
      ) : (
        <div className="productos-table-wrapper">
          <table className="productos-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Tipo Vehículo</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(producto => (
                <tr key={producto.id_producto}>
                  <td>
                    <div className="producto-info">
                      <div className="producto-imagen-placeholder">
                        <Package size={24} />
                      </div>
                      <div>
                        <div className="producto-nombre">{producto.nombre_producto}</div>
                        <div className="producto-fecha">
                          {new Date(producto.fecha_publicacion).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{producto.nombre_categoria || '-'}</td>
                  <td>{producto.nombre_tipo_vehiculo || '-'}</td>
                  <td className="producto-precio">${parseFloat(producto.precio).toLocaleString()}</td>
                  <td>
                    <span className={`stock-badge ${producto.stock === 0 ? 'agotado' : ''}`}>
                      {producto.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`estado-badge ${producto.pausado ? 'pausado' : 'activo'}`}>
                      {producto.pausado ? 'Pausado' : 'Activo'}
                    </span>
                  </td>
                  <td>
                    <div className="producto-acciones">
                      <button
                        className="btn-icon"
                        onClick={() => togglePausarProducto(producto)}
                        title={producto.pausado ? 'Activar' : 'Pausar'}
                      >
                        {producto.pausado ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => abrirModalEditar(producto)}
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => eliminarProducto(producto)}
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Crear/Editar */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button className="btn-close" onClick={cerrarModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid-modal">
                <div className="form-field full-width">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    name="nombre_producto"
                    value={formData.nombre_producto}
                    onChange={handleInputChange}
                    placeholder="Ej: Pastillas de Freno Cerámicas"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Describe las características del producto..."
                    rows={4}
                  />
                </div>

                <div className="form-field">
                  <label>Categoría *</label>
                  <select
                    name="fk_categoria"
                    value={formData.fk_categoria}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Tipo de Vehículo</label>
                  <select
                    name="fk_tipo_vehiculo"
                    value={formData.fk_tipo_vehiculo}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposVehiculo.map(tipo => (
                      <option key={tipo.id_tipo} value={tipo.id_tipo}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Precio *</label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label className="checkbox-label-inline">
                    <input
                      type="checkbox"
                      name="pausado"
                      checked={formData.pausado}
                      onChange={handleInputChange}
                    />
                    <span>Pausar producto (no visible en el catálogo)</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {modoEdicion ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosPanel;
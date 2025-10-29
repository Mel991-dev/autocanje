// frontend/src/pages/vendedor/ProductosPanel.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Upload,
  X,
  Package,
  Image as ImageIcon,
} from "lucide-react";
import "../../styles/vendedor/productosPanel.css";
import "../../styles/perfil.css";
import Perfil from "../users/perfil";
import "../../styles/globals.css";

const ProductosPanel = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);

  // Estado para imágenes
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
  const [imagenesPreview, setImagenesPreview] = useState([]);

  const [formData, setFormData] = useState({
    nombre_producto: "",
    descripcion: "",
    fk_categoria: "",
    fk_tipo_vehiculo: "",
    precio: "",
    stock: "",
    pausado: false,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([
      cargarProductos(),
      cargarCategorias(),
      cargarTiposVehiculo(),
    ]);
  };

  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await axios.get(
        "http://127.0.0.1:5000/api/productos/mis-productos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setProductos(response.data.productos);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setError("Error al cargar los productos");
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/api/productos/categorias"
      );

      if (response.data.success) {
        setCategorias(response.data.categorias);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const cargarTiposVehiculo = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/api/productos/tipos-vehiculo"
      );

      if (response.data.success) {
        setTiposVehiculo(response.data.tipos_vehiculo);
      }
    } catch (error) {
      console.error("Error al cargar tipos de vehículo:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Manejo de imágenes
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imagenesSeleccionadas.length > 5) {
      setError("Máximo 5 imágenes permitidas");
      return;
    }

    // Validar tamaño y tipo
    const validas = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} excede el tamaño máximo de 5MB`);
        return false;
      }
      if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
        setError(`${file.name} no es un formato válido`);
        return false;
      }
      return true;
    });

    setImagenesSeleccionadas((prev) => [...prev, ...validas]);

    // Crear previews
    validas.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenesPreview((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const eliminarImagenPreview = (index) => {
    setImagenesSeleccionadas((prev) => prev.filter((_, i) => i !== index));
    setImagenesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setProductoEditando(null);
    setFormData({
      nombre_producto: "",
      descripcion: "",
      fk_categoria: "",
      fk_tipo_vehiculo: "",
      precio: "",
      stock: "",
      pausado: false,
    });
    setImagenesSeleccionadas([]);
    setImagenesPreview([]);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
    setProductoEditando(null);
    setError("");
    setImagenesSeleccionadas([]);
    setImagenesPreview([]);
  };

  const abrirModalEditar = (producto) => {
    setModoEdicion(true);
    setProductoEditando(producto);
    setFormData({
      nombre_producto: producto.nombre_producto,
      descripcion: producto.descripcion || "",
      fk_categoria: producto.fk_categoria || "",
      fk_tipo_vehiculo: producto.fk_tipo_vehiculo || "",
      precio: producto.precio,
      stock: producto.stock,
      pausado: producto.pausado,
    });
    setImagenesSeleccionadas([]);
    setImagenesPreview([]);
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!formData.nombre_producto.trim()) {
      setError("El nombre del producto es requerido");
      return;
    }

    if (!formData.fk_categoria) {
      setError("Debes seleccionar una categoría");
      return;
    }

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      setError("El precio debe ser mayor a cero");
      return;
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError("El stock no puede ser negativo");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (modoEdicion) {
        const response = await axios.put(
          `http://127.0.0.1:5000/api/productos/${productoEditando.id_producto}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          // Si hay imágenes nuevas, subirlas
          if (imagenesSeleccionadas.length > 0) {
            await subirImagenes(productoEditando.id_producto);
          }

          setExito("Producto actualizado con éxito");
          await cargarProductos();
          cerrarModal();
          setTimeout(() => setExito(""), 3000);
        }
      } else {
        const response = await axios.post(
          "http://127.0.0.1:5000/api/productos/",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          const idProducto = response.data.id_producto;

          // Subir imágenes si hay
          if (imagenesSeleccionadas.length > 0) {
            await subirImagenes(idProducto);
          }

          setExito("Producto creado con éxito");
          await cargarProductos();
          cerrarModal();
          setTimeout(() => setExito(""), 3000);
        }
      }
    } catch (error) {
      console.error("Error al guardar producto:", error);
      setError(error.response?.data?.error || "Error al guardar el producto");
    }
  };

  const subirImagenes = async (idProducto) => {
    const token = localStorage.getItem("token");
    const formDataImages = new FormData();

    formDataImages.append("id_producto", idProducto);

    imagenesSeleccionadas.forEach((imagen) => {
      formDataImages.append("imagenes", imagen);
    });

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/productos/imagenes/subir",
        formDataImages,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data.success) {
        console.error("Error al subir imágenes:", response.data.error);
      }
    } catch (error) {
      console.error("Error al subir imágenes:", error);
    }
  };

  const togglePausarProducto = async (producto) => {
    try {
      const token = localStorage.getItem("token");
      const nuevoPausado = !producto.pausado;

      const response = await axios.patch(
        `http://127.0.0.1:5000/api/productos/${producto.id_producto}/pausar`,
        { pausado: nuevoPausado },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setExito(response.data.message);
        await cargarProductos();
        setTimeout(() => setExito(""), 3000);
      }
    } catch (error) {
      console.error("Error al pausar producto:", error);
      setError(error.response?.data?.error || "Error al cambiar el estado");
      setTimeout(() => setError(""), 3000);
    }
  };

  const eliminarProducto = async (producto) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar "${producto.nombre_producto}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `http://127.0.0.1:5000/api/productos/${producto.id_producto}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setExito("Producto eliminado con éxito");
        await cargarProductos();
        setTimeout(() => setExito(""), 3000);
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setError(error.response?.data?.error || "Error al eliminar el producto");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "3rem" }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div className="section-header">
        <div className="section-info">
          <h2>Mis Productos</h2>
          <p>Gestiona tu inventario y publicaciones</p>
        </div>
        <button className="btn btn-primary" onClick={abrirModalCrear}>
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

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

      <div className="card">
        {productos.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <Package
              size={64}
              style={{ color: "#d1d5db", margin: "0 auto 1.5rem" }}
            />
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              No tienes productos publicados
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              Comienza a vender publicando tu primer producto
            </p>
            <button className="btn btn-primary" onClick={abrirModalCrear}>
              <Plus size={20} />
              Crear Primer Producto
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id_producto}>
                    <td>
                      <div className="product-info">
                        <div className="product-image">
                          <Package size={24} />
                        </div>
                        <span className="product-name">
                          {producto.nombre_producto}
                        </span>
                      </div>
                    </td>
                    <td>{producto.nombre_categoria || "-"}</td>
                    <td style={{ fontWeight: 600 }}>
                      ${parseFloat(producto.precio).toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={producto.stock === 0 ? "stock-warning" : ""}
                      >
                        {producto.stock}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-status ${
                          producto.pausado ? "badge-pausado" : "badge-activo"
                        }`}
                      >
                        {producto.pausado ? "Pausado" : "Activo"}
                      </span>
                    </td>
                    <td>
                      <div className="product-actions">
                        <button
                          className="btn-icon"
                          onClick={() => togglePausarProducto(producto)}
                          title={producto.pausado ? "Activar" : "Pausar"}
                        >
                          {producto.pausado ? (
                            <Play size={18} />
                          ) : (
                            <Pause size={18} />
                          )}
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
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-productos" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modoEdicion ? "Editar Producto" : "Publicar Nuevo Producto"}
              </h2>
              <button className="modal-close" onClick={cerrarModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-content">
              {error && (
                <div
                  className="alert alert-error"
                  style={{ marginBottom: "1rem" }}
                >
                  <span>{error}</span>
                </div>
              )}

              <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
                Completa la información del producto
              </p>

              <form id="formProducto" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="nombre_producto">
                      Nombre del Producto{" "}
                      <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="nombre_producto"
                      name="nombre_producto"
                      value={formData.nombre_producto}
                      onChange={handleInputChange}
                      placeholder="Ej: Pastillas de Freno Cerámicas"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="descripcion">
                      Descripción <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      placeholder="Describe las características, compatibilidad y condición del producto..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fk_categoria">
                      Categoría <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <select
                      id="fk_categoria"
                      name="fk_categoria"
                      value={formData.fk_categoria}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="fk_tipo_vehiculo">
                      Tipo de Vehículo{" "}
                      <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <select
                      id="fk_tipo_vehiculo"
                      name="fk_tipo_vehiculo"
                      value={formData.fk_tipo_vehiculo}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecciona tipo</option>
                      {tiposVehiculo.map((tipo) => (
                        <option key={tipo.id_tipo} value={tipo.id_tipo}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="precio">
                      Precio (COP) <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="number"
                      id="precio"
                      name="precio"
                      value={formData.precio}
                      onChange={handleInputChange}
                      placeholder="89000"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock">
                      Cantidad en Stock{" "}
                      <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="10"
                      min="0"
                      required
                    />
                  </div>
                  
                  {/* SECCIÓN DE IMÁGENES */}
                  <div className="form-group full-width">
                    <label>
                      <ImageIcon size={16} style={{ display: "inline", marginRight: "0.5rem" }} />
                      Imágenes del Producto (Máximo 5)
                    </label>
                    
                    <div className="upload-images-container">
                      <input
                        type="file"
                        id="imagenes-input"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        multiple
                        onChange={handleImagenesChange}
                        style={{ display: "none" }}
                      />
                      
                      <label
                        htmlFor="imagenes-input"
                        className="btn-upload-images"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          padding: "1rem",
                          border: "2px dashed #d1d5db",
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          backgroundColor: "#f9fafb",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#FFC107";
                          e.currentTarget.style.backgroundColor = "#fffbeb";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#d1d5db";
                          e.currentTarget.style.backgroundColor = "#f9fafb";
                        }}
                      >
                        <Upload size={20} />
                        <span>Seleccionar Imágenes</span>
                      </label>

                      {imagenesPreview.length > 0 && (
                        <div
                          className="preview-images-grid"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                            gap: "0.75rem",
                            marginTop: "1rem",
                          }}
                        >
                          {imagenesPreview.map((preview, index) => (
                            <div
                              key={index}
                              className="preview-image-item"
                              style={{
                                position: "relative",
                                aspectRatio: "1",
                                borderRadius: "8px",
                                overflow: "hidden",
                                border: "2px solid #e5e7eb",
                              }}
                            >
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => eliminarImagenPreview(index)}
                                style={{
                                  position: "absolute",
                                  top: "4px",
                                  right: "4px",
                                  background: "#dc2626",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "24px",
                                  height: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  padding: 0,
                                }}
                              >
                                <X size={14} />
                              </button>
                              {index === 0 && (
                                <span
                                  style={{
                                    position: "absolute",
                                    bottom: "4px",
                                    left: "4px",
                                    background: "#007BFF",
                                    color: "white",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontSize: "0.65rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  Principal
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          marginTop: "0.5rem",
                        }}
                      >
                        Formatos: JPG, PNG, GIF, WEBP (máx. 5MB cada una). La
                        primera imagen será la principal.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={cerrarModal}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="formProducto"
                className="btn btn-primary"
              >
                {modoEdicion ? "Guardar Cambios" : "Publicar Producto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductosPanel;
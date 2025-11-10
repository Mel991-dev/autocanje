# controllers/producto_controller.py
from flask import request, jsonify
from models.producto_model import (
    crear_producto, obtener_productos_vendedor, obtener_producto_por_id,
    actualizar_producto, eliminar_producto, pausar_producto,
    obtener_categorias, obtener_tipos_vehiculo,
    crear_imagen_producto, obtener_imagenes_producto, eliminar_imagen_producto
)
from utils.auth_middleware import token_requerido
import os
from werkzeug.utils import secure_filename
from datetime import datetime

# Configuración de subida de archivos
UPLOAD_FOLDER = 'uploads/productos'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Crear carpeta si no existe
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@token_requerido
def subir_imagenes_producto(usuario_id):
    """
    Sube hasta 5 imágenes para un producto
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Obtener el id del producto
        id_producto = request.form.get('id_producto')
        
        if not id_producto:
            return jsonify({
                'success': False,
                'error': 'ID de producto requerido'
            }), 400
        
        # Verificar que el producto pertenezca al usuario
        producto = obtener_producto_por_id(id_producto)
        
        if not producto:
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
        
        if producto['fk_vendedor'] != usuario_id:
            return jsonify({
                'success': False,
                'error': 'No tienes permiso para subir imágenes a este producto'
            }), 403
        
        # Verificar cuántas imágenes tiene el producto actualmente
        imagenes_actuales = obtener_imagenes_producto(id_producto)
        total_imagenes_actuales = len(imagenes_actuales)
        
        # Obtener archivos
        files = request.files.getlist('imagenes')
        
        if not files or len(files) == 0:
            return jsonify({
                'success': False,
                'error': 'No se enviaron imágenes'
            }), 400
        
        # ✅ DEBUG después de obtener todas las variables
        print("=" * 60)
        print("🖼️ SUBIR IMÁGENES - DEBUG")
        print(f"id_producto: {id_producto}")
        print(f"usuario_id: {usuario_id}")
        print(f"Imágenes actuales: {total_imagenes_actuales}")
        print(f"Archivos recibidos: {len(files)}")
        print("=" * 60)
        
        # Validar que no exceda las 5 imágenes totales
        total_imagenes_nuevas = total_imagenes_actuales + len(files)
        if total_imagenes_nuevas > 5:
            return jsonify({
                'success': False,
                'error': f'Solo puedes tener máximo 5 imágenes. Actualmente tienes {total_imagenes_actuales}'
            }), 400
        
        urls_guardadas = []
        
        # Solo la primera imagen será principal si NO hay imágenes previas
        tiene_principal = any(img.get('es_principal') for img in imagenes_actuales)
        debe_ser_principal = not tiene_principal
        
        for index, file in enumerate(files):
            if file and allowed_file(file.filename):
                # Validar tamaño
                file.seek(0, os.SEEK_END)
                file_length = file.tell()
                
                if file_length > MAX_FILE_SIZE:
                    return jsonify({
                        'success': False,
                        'error': f'El archivo {file.filename} excede el tamaño máximo de 5MB'
                    }), 400
                
                file.seek(0)
                
                # Generar nombre único
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
                filename = secure_filename(file.filename)
                nombre_unico = f"{id_producto}_{timestamp}_{filename}"
                
                # Guardar archivo
                filepath = os.path.join(UPLOAD_FOLDER, nombre_unico)
                file.save(filepath)
                
                print(f"✅ Archivo guardado en: {filepath}")
                
                # Guardar URL completa
                url_imagen = f"http://127.0.0.1:5000/uploads/productos/{nombre_unico}"
                
                # Solo la PRIMERA imagen nueva será principal, Y solo si no hay ninguna principal ya
                es_principal_esta = debe_ser_principal and index == 0
                
                print(f"📝 Guardando en BD: {url_imagen}")
                print(f"   Es principal: {es_principal_esta}")
                
                try:
                    id_imagen = crear_imagen_producto(
                        fk_producto=id_producto,
                        url_imagen=url_imagen,
                        es_principal=es_principal_esta
                    )
                    
                    if id_imagen:
                        urls_guardadas.append({
                            'id': id_imagen,
                            'url': url_imagen,
                            'es_principal': es_principal_esta
                        })
                        print(f"✅ Imagen guardada en BD con ID: {id_imagen}")
                    else:
                        # Si falla crear_imagen_producto, eliminar el archivo
                        if os.path.exists(filepath):
                            os.remove(filepath)
                        print(f"❌ Error al guardar imagen en BD: {nombre_unico}")
                        
                except Exception as e:
                    # Si hay error, eliminar el archivo
                    if os.path.exists(filepath):
                        os.remove(filepath)
                    print(f"❌ Excepción al guardar imagen: {str(e)}")
                    raise e
        
        if len(urls_guardadas) == 0:
            return jsonify({
                'success': False,
                'error': 'No se pudieron guardar las imágenes'
            }), 500
        
        print(f"✅ Total de imágenes guardadas: {len(urls_guardadas)}")
        print("=" * 60)
        
        return jsonify({
            'success': True,
            'message': f'{len(urls_guardadas)} imagen(es) subida(s) con éxito',
            'imagenes': urls_guardadas
        }), 200
        
    except Exception as e:
        print(f"❌ Error al subir imágenes: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Error al subir imágenes: {str(e)}'
        }), 500


@token_requerido
def eliminar_imagen_producto_controller(usuario_id, id_imagen):
    """
    Elimina una imagen de producto (con verificación de permisos)
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        from config.database import conexion
        conn = conexion()
        cursor = conn.cursor(dictionary=True)
        
        # Obtener información de la imagen y verificar permisos
        cursor.execute("""
            SELECT 
                ip.id_imagen_prod,
                ip.fk_producto,
                ip.url_imagen,
                p.fk_vendedor
            FROM imagen_producto ip
            INNER JOIN producto p ON ip.fk_producto = p.id_producto
            WHERE ip.id_imagen_prod = %s
        """, (id_imagen,))
        
        imagen_info = cursor.fetchone()
        
        if not imagen_info:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Imagen no encontrada'
            }), 404
        
        # Verificar permisos
        if imagen_info['fk_vendedor'] != usuario_id:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'No tienes permiso para eliminar esta imagen'
            }), 403
        
        # Eliminar archivo físico
        url_imagen = imagen_info['url_imagen']
        if url_imagen and url_imagen.startswith('http://127.0.0.1:5000/uploads/productos/'):
            nombre_archivo = url_imagen.split('/')[-1]
            filepath = os.path.join('uploads/productos', nombre_archivo)
            
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                    print(f"✅ Archivo eliminado: {filepath}")
                except Exception as e:
                    print(f"⚠️ Error al eliminar archivo: {str(e)}")
        
        # Eliminar de BD
        cursor.execute("DELETE FROM imagen_producto WHERE id_imagen_prod = %s", (id_imagen,))
        conn.commit()
        
        filas_afectadas = cursor.rowcount
        cursor.close()
        conn.close()
        
        if filas_afectadas > 0:
            return jsonify({
                'success': True,
                'message': 'Imagen eliminada con éxito'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'No se pudo eliminar'
            }), 500
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@token_requerido
def obtener_imagenes_producto_controller(usuario_id, id_producto):
    """
    Obtiene todas las imágenes de un producto
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Verificar que el producto exista y pertenezca al usuario
        producto = obtener_producto_por_id(id_producto)
        
        if not producto:
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
        
        if producto['fk_vendedor'] != usuario_id:
            return jsonify({
                'success': False,
                'error': 'No tienes permiso para ver las imágenes de este producto'
            }), 403
        
        imagenes = obtener_imagenes_producto(id_producto)
        
        return jsonify({
            'success': True,
            'imagenes': imagenes
        }), 200
        
    except Exception as e:
        print(f"Error al obtener imágenes: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener imágenes'
        }), 500


@token_requerido
def crear_producto_controller(usuario_id):
    """
    Crea un nuevo producto
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json() or {}
        
        # Validaciones
        nombre_producto = data.get('nombre_producto', '').strip()
        fk_categoria = data.get('fk_categoria')
        precio = data.get('precio')
        stock = data.get('stock')
        
        if not nombre_producto:
            return jsonify({
                'success': False,
                'error': 'El nombre del producto es requerido'
            }), 400
        
        if not fk_categoria:
            return jsonify({
                'success': False,
                'error': 'La categoría es requerida'
            }), 400
        
        if precio is None or float(precio) <= 0:
            return jsonify({
                'success': False,
                'error': 'El precio debe ser mayor a cero'
            }), 400
        
        if stock is None or int(stock) < 0:
            return jsonify({
                'success': False,
                'error': 'El stock no puede ser negativo'
            }), 400
        
        # Crear producto
        id_producto = crear_producto(
            fk_vendedor=usuario_id,
            fk_categoria=fk_categoria,
            fk_tipo_vehiculo=data.get('fk_tipo_vehiculo'),
            nombre_producto=nombre_producto,
            descripcion=data.get('descripcion', ''),
            precio=float(precio),
            stock=int(stock),
            pausado=data.get('pausado', False)
        )
        
        if not id_producto:
            return jsonify({
                'success': False,
                'error': 'Error al crear el producto'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Producto creado con éxito',
            'id_producto': id_producto
        }), 201
        
    except Exception as e:
        print(f"Error al crear producto: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Error al crear producto: {str(e)}'
        }), 500


@token_requerido
def obtener_mis_productos(usuario_id):
    """
    Obtiene todos los productos del vendedor autenticado
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        productos = obtener_productos_vendedor(usuario_id)
        
        return jsonify({
            'success': True,
            'productos': productos
        }), 200
        
    except Exception as e:
        print(f"Error al obtener productos: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al obtener productos: {str(e)}'
        }), 500


@token_requerido
def actualizar_producto_controller(usuario_id, id_producto):
    """
    Actualiza un producto existente (solo datos, NO imágenes)
    Las imágenes se manejan por separado en subir_imagenes_producto()
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    print("\n" + "="*70)
    print("🔧 ACTUALIZAR PRODUCTO - Backend")
    print("="*70)
    
    try:
        print(f"📋 Método: {request.method}")
        print(f"📋 Content-Type: {request.content_type}")
        print(f"📋 ID Producto: {id_producto}")
        print(f"📋 Usuario ID: {usuario_id}")
        
        # 1. Verificar que el producto existe
        producto = obtener_producto_por_id(id_producto)
        
        if not producto:
            print("❌ ERROR: Producto no encontrado")
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
        
        print(f"✅ Producto encontrado: {producto.get('nombre_producto')}")
        
        # 2. Verificar permisos
        if producto['fk_vendedor'] != usuario_id:
            print(f"❌ ERROR: Usuario {usuario_id} no es dueño del producto")
            return jsonify({
                'success': False,
                'error': 'No tienes permiso para editar este producto'
            }), 403
        
        print("✅ Permisos verificados")
        
        # 3. Obtener datos del JSON
        data = request.get_json()
        
        if not data:
            print("❌ ERROR: No se recibieron datos")
            return jsonify({
                'success': False,
                'error': 'No se recibieron datos'
            }), 400
        
        print(f"\n📦 Datos recibidos (RAW):")
        for key, value in data.items():
            print(f"   {key}: {value} ({type(value).__name__})")
        
        # 4. Campos permitidos
        campos_permitidos = {
            'nombre_producto', 'descripcion', 'fk_categoria', 
            'fk_tipo_vehiculo', 'precio', 'stock', 'pausado'
        }
        
        # 5. Filtrar y normalizar datos
        datos_actualizacion = {}
        
        for campo in campos_permitidos:
            if campo not in data:
                continue
            
            valor = data[campo]
            
            # Normalización por tipo de campo
            try:
                if campo == 'nombre_producto' or campo == 'descripcion':
                    # Strings
                    datos_actualizacion[campo] = str(valor).strip() if valor else ''
                    
                elif campo == 'fk_categoria':
                    # Entero requerido
                    datos_actualizacion[campo] = int(valor)
                    
                elif campo == 'fk_tipo_vehiculo':
                    # Entero opcional (puede ser NULL)
                    datos_actualizacion[campo] = int(valor) if valor else None
                    
                elif campo == 'precio':
                    # Float positivo
                    datos_actualizacion[campo] = float(valor)
                    
                elif campo == 'stock':
                    # Entero no negativo
                    datos_actualizacion[campo] = int(valor)
                    
                elif campo == 'pausado':
                    # Boolean
                    if isinstance(valor, bool):
                        datos_actualizacion[campo] = valor
                    elif isinstance(valor, str):
                        datos_actualizacion[campo] = valor.lower() in ['true', '1', 'yes']
                    else:
                        datos_actualizacion[campo] = bool(valor)
                        
            except (ValueError, TypeError) as e:
                print(f"⚠️ Error normalizando {campo}: {e}")
                return jsonify({
                    'success': False,
                    'error': f'Formato inválido en campo: {campo}'
                }), 400
        
        print(f"\n🔄 Datos normalizados:")
        for campo, valor in datos_actualizacion.items():
            print(f"   {campo}: {valor} ({type(valor).__name__})")
        
        # 6. Validar que haya algo que actualizar
        if not datos_actualizacion:
            print("❌ ERROR: No hay campos para actualizar")
            return jsonify({
                'success': False,
                'error': 'No hay campos para actualizar'
            }), 400
        
        # 7. Validaciones de negocio
        if 'precio' in datos_actualizacion:
            if datos_actualizacion['precio'] <= 0:
                print(f"❌ ERROR: Precio inválido: {datos_actualizacion['precio']}")
                return jsonify({
                    'success': False,
                    'error': 'El precio debe ser mayor a cero'
                }), 400
        
        if 'stock' in datos_actualizacion:
            if datos_actualizacion['stock'] < 0:
                print(f"❌ ERROR: Stock negativo: {datos_actualizacion['stock']}")
                return jsonify({
                    'success': False,
                    'error': 'El stock no puede ser negativo'
                }), 400
        
        print("\n✅ Todas las validaciones pasadas")
        
        # 8. Actualizar en BD
        print(f"\n💾 Actualizando producto en BD...")
        actualizado = actualizar_producto(id_producto, datos_actualizacion)
        
        if not actualizado:
            print("❌ ERROR: No se pudo actualizar")
            return jsonify({
                'success': False,
                'error': 'Error al actualizar el producto en la base de datos'
            }), 500
        
        print("✅ Producto actualizado en BD")
        
        # 9. Obtener producto actualizado
        producto_actualizado = obtener_producto_por_id(id_producto)
        
        print("\n" + "="*70)
        print("✅✅✅ ACTUALIZACIÓN EXITOSA ✅✅✅")
        print(f"   Producto: {producto_actualizado.get('nombre_producto')}")
        print(f"   Campos actualizados: {len(datos_actualizacion)}")
        print("="*70 + "\n")
        
        return jsonify({
            'success': True,
            'message': 'Producto actualizado con éxito',
            'producto': producto_actualizado
        }), 200
        
    except Exception as e:
        print("\n" + "="*70)
        print("❌❌❌ ERROR CRÍTICO ❌❌❌")
        print("="*70)
        print(f"Tipo: {type(e).__name__}")
        print(f"Mensaje: {str(e)}")
        
        import traceback
        print("\n📜 Stack trace:")
        traceback.print_exc()
        print("="*70 + "\n")
        
        return jsonify({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }), 500


@token_requerido
def eliminar_producto_controller(usuario_id, id_producto):
    """
    Elimina un producto
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Verificar que el producto pertenezca al vendedor
        producto = obtener_producto_por_id(id_producto)
        
        if not producto:
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
        
        if producto['fk_vendedor'] != usuario_id:
            return jsonify({
                'success': False,
                'error': 'No tienes permiso para eliminar este producto'
            }), 403
        
        # Eliminar
        eliminado = eliminar_producto(id_producto)
        
        if not eliminado:
            return jsonify({
                'success': False,
                'error': 'Error al eliminar el producto'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Producto eliminado con éxito'
        }), 200
        
    except Exception as e:
        print(f"Error al eliminar producto: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al eliminar producto: {str(e)}'
        }), 500


@token_requerido
def pausar_producto_controller(usuario_id, id_producto):
    """
    Pausa o activa un producto
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Verificar que el producto pertenezca al vendedor
        producto = obtener_producto_por_id(id_producto)
        
        if not producto:
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
        
        if producto['fk_vendedor'] != usuario_id:
            return jsonify({
                'success': False,
                'error': 'No tienes permiso para pausar este producto'
            }), 403
        
        data = request.get_json() or {}
        pausado = data.get('pausado', True)
        
        # Pausar/Activar
        actualizado = pausar_producto(id_producto, pausado)
        
        if not actualizado:
            return jsonify({
                'success': False,
                'error': 'Error al cambiar el estado del producto'
            }), 500
        
        mensaje = 'Producto pausado' if pausado else 'Producto activado'
        
        return jsonify({
            'success': True,
            'message': mensaje
        }), 200
        
    except Exception as e:
        print(f"Error al pausar producto: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al pausar producto: {str(e)}'
        }), 500


# Endpoints públicos (sin autenticación)

def obtener_categorias_controller():
    """
    Obtiene todas las categorías
    """
    try:
        categorias = obtener_categorias()
        
        return jsonify({
            'success': True,
            'categorias': categorias
        }), 200
        
    except Exception as e:
        print(f"Error al obtener categorías: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener categorías'
        }), 500


def obtener_tipos_vehiculo_controller():
    """
    Obtiene todos los tipos de vehículo
    """
    try:
        tipos = obtener_tipos_vehiculo()
        
        return jsonify({
            'success': True,
            'tipos_vehiculo': tipos
        }), 200
        
    except Exception as e:
        print(f"Error al obtener tipos de vehículo: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener tipos de vehículo'
        }), 500
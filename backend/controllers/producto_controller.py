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
import base64
from werkzeug.utils import secure_filename
from datetime import datetime

# Configuración de subida de archivos
UPLOAD_FOLDER = 'uploads/productos'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
MAX_FILE_SIZE =  5 * 1024 * 1024 #5MB

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
    print("="*60)
    print("🖼️ SUBIR IMÁGENES - DEBUG")
    
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Obtener el id del producto
        id_producto = request.form.get('id_producto')
        
        print(f"id_producto recibido: {id_producto}")
        print(f"usuario_id: {usuario_id}")
        
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
        
        # ✅ Verificar cuántas imágenes tiene el producto actualmente
        imagenes_actuales = obtener_imagenes_producto(id_producto)
        total_imagenes_actuales = len(imagenes_actuales)
        
        print(f"Imágenes actuales en BD: {total_imagenes_actuales}")
        
        # Obtener archivos
        files = request.files.getlist('imagenes')
        
        print(f"Archivos recibidos: {len(files)}")
        
        if not files or len(files) == 0:
            return jsonify({
                'success': False,
                'error': 'No se enviaron imágenes'
            }), 400
        
        # ✅ Validar que no exceda las 5 imágenes totales
        total_imagenes_nuevas = total_imagenes_actuales + len(files)
        
        print(f"Total después de subir: {total_imagenes_nuevas}")
        
        if total_imagenes_nuevas > 5:
            return jsonify({
                'success': False,
                'error': f'Solo puedes tener máximo 5 imágenes. Actualmente tienes {total_imagenes_actuales}'
            }), 400
        
        urls_guardadas = []
        
        # ✅ NUEVA LÓGICA: Solo la primera imagen será principal si NO hay imágenes previas
        tiene_principal = any(img.get('es_principal') for img in imagenes_actuales)
        debe_ser_principal = not tiene_principal
        
        print(f"Tiene principal: {tiene_principal}")
        print(f"Debe ser principal: {debe_ser_principal}")
        
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
                
                # ✅ Solo la PRIMERA imagen nueva será principal, Y solo si no hay ninguna principal ya
                es_principal_esta = debe_ser_principal and index == 0
                
                print(f"Imagen {index + 1} - Principal: {es_principal_esta}")
                
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
                        print(f"✅ Imagen {index + 1} guardada en BD con ID: {id_imagen}")
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
        print("="*60)
        
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
        
        # Query sin filtrar por id_producto
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
        # ✅ Verificar que el producto exista y pertenezca al usuario
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
    Actualiza un producto existente (datos + imágenes opcionales)
    Soporta:
    - JSON puro (solo datos del producto)
    - FormData (datos + imágenes)
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        print("\n" + "="*60)
        print("📝 ACTUALIZAR PRODUCTO - DEBUG")
        print(f"ID Producto: {id_producto}")
        print(f"Usuario ID: {usuario_id}")
        print(f"Content-Type: {request.content_type}")
        print("="*60)
        
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
                'error': 'No tienes permiso para editar este producto'
            }), 403
        
        # ✅ DETECTAR TIPO DE PETICIÓN
        es_form_data = 'multipart/form-data' in request.content_type if request.content_type else False
        
        if es_form_data:
            print("📦 Petición con FormData (datos + posibles imágenes)")
            # Extraer datos del formulario
            datos_actualizacion = {}
            
            # Mapeo de campos permitidos
            campos_permitidos = {
                'nombre_producto', 'descripcion', 'fk_categoria', 
                'fk_tipo_vehiculo', 'precio', 'stock', 'pausado'
            }
            
            for campo in campos_permitidos:
                if campo in request.form:
                    valor = request.form.get(campo)
                    
                    # Convertir tipos
                    if campo == 'pausado':
                        datos_actualizacion[campo] = valor.lower() in ['true', '1', 'yes']
                    elif campo in ['precio', 'stock', 'fk_categoria', 'fk_tipo_vehiculo']:
                        try:
                            if campo == 'precio':
                                datos_actualizacion[campo] = float(valor) if valor else None
                            else:
                                datos_actualizacion[campo] = int(valor) if valor else None
                        except ValueError:
                            pass
                    else:
                        datos_actualizacion[campo] = valor
            
            print(f"Datos extraídos del form: {datos_actualizacion}")
            
        else:
            print("📄 Petición con JSON puro (solo datos)")
            data = request.get_json() or {}
            
            # Campos permitidos para actualizar
            campos_permitidos = {
                'nombre_producto', 'descripcion', 'fk_categoria', 
                'fk_tipo_vehiculo', 'precio', 'stock', 'pausado'
            }
            
            datos_actualizacion = {
                campo: data[campo] 
                for campo in campos_permitidos 
                if campo in data
            }
        
        # ✅ VALIDACIONES
        if not datos_actualizacion:
            return jsonify({
                'success': False,
                'error': 'No hay campos para actualizar'
            }), 400
        
        if 'precio' in datos_actualizacion:
            if float(datos_actualizacion['precio']) <= 0:
                return jsonify({
                    'success': False,
                    'error': 'El precio debe ser mayor a cero'
                }), 400
        
        if 'stock' in datos_actualizacion:
            if int(datos_actualizacion['stock']) < 0:
                return jsonify({
                    'success': False,
                    'error': 'El stock no puede ser negativo'
                }), 400
        
        print(f"Datos a actualizar: {datos_actualizacion}")
        
        # ✅ ACTUALIZAR PRODUCTO
        actualizado = actualizar_producto(id_producto, datos_actualizacion)
        
        if not actualizado:
            return jsonify({
                'success': False,
                'error': 'Error al actualizar el producto'
            }), 500
        
        print("✅ Producto actualizado en BD")
        
        # ✅ PROCESAR IMÁGENES SI ES FORMDATA
        imagenes_guardadas = []
        
        if es_form_data and 'imagenes' in request.files:
            print("\n🖼️ Procesando imágenes adjuntas...")
            
            files = request.files.getlist('imagenes')
            print(f"Archivos recibidos: {len(files)}")
            
            if len(files) > 0:
                # Verificar límite de imágenes
                imagenes_actuales = obtener_imagenes_producto(id_producto)
                total_imagenes_actuales = len(imagenes_actuales)
                total_imagenes_nuevas = total_imagenes_actuales + len(files)
                
                print(f"Imágenes actuales: {total_imagenes_actuales}")
                print(f"Total después de subir: {total_imagenes_nuevas}")
                
                if total_imagenes_nuevas > 5:
                    return jsonify({
                        'success': False,
                        'error': f'Solo puedes tener máximo 5 imágenes. Actualmente tienes {total_imagenes_actuales}'
                    }), 400
                
                # Determinar si hay una imagen principal
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
                                'error': f'El archivo {file.filename} excede 5MB'
                            }), 400
                        
                        file.seek(0)
                        
                        # Generar nombre único
                        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
                        filename = secure_filename(file.filename)
                        nombre_unico = f"{id_producto}_{timestamp}_{filename}"
                        
                        # Guardar archivo
                        filepath = os.path.join(UPLOAD_FOLDER, nombre_unico)
                        file.save(filepath)
                        
                        # URL de la imagen
                        url_imagen = f"http://127.0.0.1:5000/uploads/productos/{nombre_unico}"
                        
                        # Solo la primera es principal si no hay ninguna
                        es_principal_esta = debe_ser_principal and index == 0
                        
                        try:
                            id_imagen = crear_imagen_producto(
                                fk_producto=id_producto,
                                url_imagen=url_imagen,
                                es_principal=es_principal_esta
                            )
                            
                            if id_imagen:
                                imagenes_guardadas.append({
                                    'id': id_imagen,
                                    'url': url_imagen,
                                    'es_principal': es_principal_esta
                                })
                                print(f"✅ Imagen {index + 1} guardada: {nombre_unico}")
                            else:
                                if os.path.exists(filepath):
                                    os.remove(filepath)
                                print(f"❌ Error al guardar imagen en BD")
                                
                        except Exception as e:
                            if os.path.exists(filepath):
                                os.remove(filepath)
                            print(f"❌ Error: {str(e)}")
                            raise e
        
        # ✅ OBTENER PRODUCTO ACTUALIZADO
        producto_actualizado = obtener_producto_por_id(id_producto)
        
        print(f"\n✅ Actualización completada")
        print(f"   - Datos actualizados: {len(datos_actualizacion)} campos")
        print(f"   - Imágenes nuevas: {len(imagenes_guardadas)}")
        print("="*60 + "\n")
        
        respuesta = {
            'success': True,
            'message': 'Producto actualizado con éxito',
            'producto': producto_actualizado
        }
        
        if imagenes_guardadas:
            respuesta['imagenes_nuevas'] = imagenes_guardadas
        
        return jsonify(respuesta), 200
        
    except Exception as e:
        print(f"❌ ERROR AL ACTUALIZAR PRODUCTO: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Error al actualizar producto: {str(e)}'
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
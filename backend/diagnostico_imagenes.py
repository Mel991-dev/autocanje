#!/usr/bin/env python3
"""
Script de diagnóstico para verificar las imágenes de productos
Ejecutar desde la carpeta backend/: python diagnostico_imagenes.py
"""

import mysql.connector
import os
from pathlib import Path

# Configuración de la base de datos
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'autocanje'
}

def diagnosticar():
    print("=" * 60)
    print("DIAGNÓSTICO DE IMÁGENES - AUTOCANJE")
    print("=" * 60)
    
    # 1. Verificar carpeta de uploads
    print("\n1. Verificando carpeta uploads/productos/")
    upload_path = Path('uploads/productos')
    
    if not upload_path.exists():
        print("   ❌ ERROR: La carpeta uploads/productos/ NO existe")
        print("   Creándola...")
        upload_path.mkdir(parents=True, exist_ok=True)
        print("   ✅ Carpeta creada")
    else:
        print("   ✅ La carpeta existe")
    
    # Listar archivos en la carpeta
    archivos = list(upload_path.glob('*'))
    print(f"   📁 Archivos encontrados: {len(archivos)}")
    
    if archivos:
        print("   Listado de archivos:")
        for archivo in archivos[:5]:  # Mostrar solo los primeros 5
            size = archivo.stat().st_size / 1024  # Tamaño en KB
            print(f"      - {archivo.name} ({size:.2f} KB)")
        if len(archivos) > 5:
            print(f"      ... y {len(archivos) - 5} más")
    
    # 2. Verificar base de datos
    print("\n2. Verificando registros en la base de datos")
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Contar imágenes
        cursor.execute("SELECT COUNT(*) as total FROM imagen_producto")
        result = cursor.fetchone()
        print(f"   📊 Total de registros: {result['total']}")
        
        # Obtener ejemplos
        cursor.execute("""
            SELECT 
                ip.id_imagen_prod,
                ip.fk_producto,
                ip.url_imagen,
                ip.es_principal,
                p.nombre_producto
            FROM imagen_producto ip
            LEFT JOIN producto p ON ip.fk_producto = p.id_producto
            LIMIT 5
        """)
        
        imagenes = cursor.fetchall()
        
        if imagenes:
            print("\n   Ejemplos de registros:")
            for img in imagenes:
                print(f"\n   ID Imagen: {img['id_imagen_prod']}")
                print(f"   Producto: {img['nombre_producto']}")
                print(f"   URL: {img['url_imagen']}")
                print(f"   Principal: {'Sí' if img['es_principal'] else 'No'}")
                
                # Verificar si el archivo existe
                filename = img['url_imagen'].split('/')[-1]
                filepath = upload_path / filename
                
                if filepath.exists():
                    print(f"   ✅ Archivo existe en disco")
                else:
                    print(f"   ❌ Archivo NO existe en disco")
                    print(f"   Buscando: {filepath}")
        
        # 3. Verificar productos sin imagen
        cursor.execute("""
            SELECT 
                p.id_producto,
                p.nombre_producto,
                COUNT(ip.id_imagen_prod) as num_imagenes
            FROM producto p
            LEFT JOIN imagen_producto ip ON p.id_producto = ip.fk_producto
            GROUP BY p.id_producto, p.nombre_producto
            HAVING num_imagenes = 0
        """)
        
        sin_imagen = cursor.fetchall()
        
        print(f"\n3. Productos sin imagen: {len(sin_imagen)}")
        if sin_imagen:
            for prod in sin_imagen[:3]:
                print(f"   - {prod['nombre_producto']} (ID: {prod['id_producto']})")
        
        # 4. Verificar formato de URLs
        cursor.execute("""
            SELECT DISTINCT 
                SUBSTRING_INDEX(url_imagen, '/', 4) as patron_url,
                COUNT(*) as cantidad
            FROM imagen_producto
            GROUP BY patron_url
        """)
        
        patrones = cursor.fetchall()
        
        print("\n4. Patrones de URLs encontrados:")
        for patron in patrones:
            print(f"   {patron['patron_url']}... ({patron['cantidad']} registros)")
            
            # Verificar si el patrón es correcto
            if 'http://127.0.0.1:5000' in patron['patron_url']:
                print(f"      ✅ Patrón correcto (URL completa)")
            elif patron['patron_url'].startswith('/uploads/productos'):
                print(f"      ⚠️  Patrón relativo (necesita corrección)")
            else:
                print(f"      ❌ Patrón incorrecto")
        
        cursor.close()
        conn.close()
        
        # 5. Recomendaciones
        print("\n" + "=" * 60)
        print("RECOMENDACIONES:")
        print("=" * 60)
        
        if not archivos:
            print("❌ No hay archivos de imagen. Sube productos con imágenes.")
        
        # Verificar si hay URLs relativas
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM imagen_producto 
            WHERE url_imagen NOT LIKE 'http%'
        """)
        urls_relativas = cursor.fetchone()[0]
        
        if urls_relativas > 0:
            print(f"\n⚠️  Hay {urls_relativas} URL(s) relativa(s) que necesitan corrección")
            print("Ejecuta este SQL para corregirlas:")
            print("""
UPDATE imagen_producto 
SET url_imagen = CONCAT('http://127.0.0.1:5000', url_imagen)
WHERE url_imagen NOT LIKE 'http%' 
  AND url_imagen LIKE '/uploads/productos/%';
""")
        
        cursor.close()
        conn.close()
        
    except mysql.connector.Error as err:
        print(f"   ❌ Error de base de datos: {err}")
    
    print("\n" + "=" * 60)
    print("DIAGNÓSTICO COMPLETADO")
    print("=" * 60)

if __name__ == '__main__':
    diagnosticar()
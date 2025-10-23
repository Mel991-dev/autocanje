# 🚗 Autocanje - Plataforma de Comercio de Partes Vehiculares

## 📋 Tabla de Contenidos
- [Descripción General del Proyecto](#-descripción-general-del-proyecto)
- [Configuración del Backend (Flask)](#️-configuración-del-backend-flask)
- [Configuración del Frontend (React + Vite)](#-configuración-del-frontend-react--vite)

---

## 📖 Descripción General del Proyecto

### ¿Qué es Autocanje?

**Autocanje** es una plataforma de comercio electrónico especializada en la compra y venta de partes vehiculares y repuestos. Está diseñada para ser intuitiva y accesible tanto para usuarios casuales como para vendedores profesionales, ofreciendo una experiencia completa de marketplace con características premium.

### 🎯 Objetivo Principal

Conectar compradores y vendedores de partes vehiculares en una plataforma segura, confiable y fácil de usar, donde los usuarios puedan:
- **Comprar**: Buscar, comparar y adquirir repuestos con garantía de calidad
- **Vender**: Publicar productos, gestionar inventario y procesar ventas
- **Beneficiarse**: Acceder a membresías premium con ventajas exclusivas

### ✨ Características Principales

#### 1. **Gestión de Usuarios**
- Registro con validación completa de datos personales
- Sistema de autenticación seguro con JWT
- Perfiles editables con información de contacto
- Recuperación de contraseña por correo electrónico
- Roles flexibles: Comprador, Vendedor o Ambos

#### 2. **Sistema Dual de Roles**
Los usuarios pueden actuar como:
- **Compradores**: Navegar catálogo, comprar productos, reservar artículos
- **Vendedores**: Publicar productos, gestionar inventario, ver estadísticas de ventas
- Alternancia fluida entre roles según necesidad

#### 3. **Catálogo y Búsqueda Avanzada**
- Vista de productos con imágenes y detalles completos
- Filtros dinámicos por:
  - Categoría (Motor, Frenos, Suspensión, Eléctrico, etc.)
  - Tipo de vehículo
  - Rango de precio
  - Valoraciones de usuarios
- Búsqueda inteligente por palabras clave
- Información detallada del vendedor

#### 4. **Membresía Premium** 🌟
Sistema de suscripción con 3 planes:
- **Mensual**: Flexibilidad mes a mes
- **Trimestral**: Ahorro intermedio
- **Anual**: Máximo descuento

**Beneficios Premium:**
- ⚡ **Entregas Prioritarias**: Reducción de 3-5 días en tiempos de entrega
- 💰 **Descuentos Especiales**: Hasta 20% en productos seleccionados
- 🔒 **Reservas de Productos**: Bloqueo temporal para compra futura
- 📦 **Gestión Avanzada**: Panel mejorado para vendedores

#### 5. **Sistema de Compras Completo**
- **Carrito de Compras**: Añadir, modificar y gestionar productos
- **Compra Directa**: Checkout rápido desde la página del producto
- **Reservas** (Premium): Sistema de apartado temporal
- **Múltiples Métodos de Pago**:
  - PayPal
  - MercadoPago
  - Nequi

#### 6. **Logística y Seguimiento**
- Cálculo automático de tiempos de entrega
- Diferenciación entre usuarios regulares y premium
- Seguimiento en tiempo real del estado del pedido
- Notificaciones automáticas por correo
- Historial completo de compras con recibos PDF descargables

#### 7. **Sistema de Valoraciones**
- Calificación por estrellas (1-5)
- Comentarios públicos visibles
- Promedio de valoración por producto
- Sistema de confianza entre usuarios

### 🏗️ Arquitectura del Sistema

El proyecto está dividido en **11 módulos principales**:

1. **Gestión de Usuarios**: Registro, autenticación, perfiles
2. **Gestión de Productos**: CRUD completo para vendedores
3. **Catálogo y Búsqueda**: Navegación y filtrado
4. **Membresía Premium**: Planes y beneficios
5. **Carrito y Reservas**: Manejo de compras
6. **Compras y Pagos**: Procesamiento de transacciones
7. **Logística y Entregas**: Seguimiento de pedidos
8. **Valoraciones y Opiniones**: Sistema de reseñas
9. **Seguridad y Control de Acceso**: Encriptación y JWT
10. **Interfaz y Usabilidad**: Responsive design
11. **Escalabilidad**: Preparado para crecimiento

### 🔒 Seguridad

- **Encriptación**: Contraseñas con Werkzeug (pbkdf2:sha256)
- **Autenticación**: JWT (JSON Web Tokens) con expiración
- **Conexiones Seguras**: HTTPS/SSL ready
- **Protección de Datos**: Cumplimiento GDPR
- **Validaciones**: En frontend y backend

### 📱 Compatibilidad

- ✅ Navegadores modernos (Chrome, Edge, Firefox, Safari)
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Accesibilidad básica implementada

### 🎨 Diseño y UX

- **Interfaz limpia y moderna** con paleta de colores profesional
- **Navegación intuitiva** con feedback visual constante
- **Carga progresiva** de datos para mejor rendimiento
- **Animaciones suaves** que mejoran la experiencia

### 🚀 Estado Actual del Proyecto (v1.0)

**Funcionalidades Implementadas:**
- ✅ Sistema completo de autenticación y registro
- ✅ Gestión de perfiles de usuario
- ✅ Cambio de contraseña seguro
- ✅ Alternancia de roles (comprador/vendedor/admin)
- ✅ Header con navegación responsive
- ✅ Footer informativo
- ✅ Landing page completa
- ✅ Diseño responsive en todas las vistas

**En Desarrollo (Próximas Versiones):**
- 🔄 Gestión de productos (CRUD)
- 🔄 Carrito de compras funcional
- 🔄 Sistema de reservas premium
- 🔄 Integración de pasarelas de pago
- 🔄 Panel de vendedor con estadísticas
- 🔄 Sistema de valoraciones
- 🔄 Búsqueda y filtrado avanzado

### 📊 Tecnologías Principales

**Backend:**
- Python 3.x + Flask
- MySQL para base de datos
- JWT para autenticación
- Werkzeug para seguridad

**Frontend:**
- React 19.x
- Vite como build tool
- React Router para navegación
- Axios para peticiones HTTP
- Bootstrap + CSS personalizado

---

## 🛠️ Configuración del Backend (Flask)

### Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- **Python 3.8 o superior** ([Descargar aquí](https://www.python.org/downloads/))
- **MySQL Server 5.7 o superior** ([Descargar aquí](https://dev.mysql.com/downloads/mysql/))
- **pip** (gestor de paquetes de Python, viene con Python)
- **git** (opcional, para clonar el repositorio)

### Paso 1: Configuración del Entorno

#### 1.1 Crear Entorno Virtual

Es **altamente recomendado** usar un entorno virtual para aislar las dependencias:

```bash
# Navegar a la carpeta del backend
cd backend

# Crear entorno virtual (Windows)
python -m venv venv

# Crear entorno virtual (macOS/Linux)
python3 -m venv venv
```

#### 1.2 Activar Entorno Virtual

```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

Una vez activado, verás `(venv)` al inicio de tu línea de comandos.

### Paso 2: Instalación de Dependencias

#### 2.1 Instalar todas las dependencias

```bash
pip install -r requerimientos.txt
```

#### 2.2 Dependencias Detalladas

El archivo `requerimientos.txt` contiene las siguientes librerías:

##### **Flask (v3.0.x)**
```bash
pip install flask
```
- **Propósito**: Framework web principal del backend
- **Uso en el proyecto**: Manejo de rutas, requests, responses y estructura general de la API
- **Archivo principal**: `app.py`

##### **Flask-CORS (v4.0.x)**
```bash
pip install flask-cors
```
- **Propósito**: Habilitar Cross-Origin Resource Sharing
- **Uso en el proyecto**: Permitir que el frontend (puerto 5173) se comunique con el backend (puerto 5000)
- **Implementación**: Configurado en `app.py` con `@app.before_request` y `@app.after_request`

##### **mysql-connector-python (v8.0.x)**
```bash
pip install mysql-connector-python
```
- **Propósito**: Conector oficial de MySQL para Python
- **Uso en el proyecto**: Establecer conexión con la base de datos MySQL
- **Archivo de configuración**: `config/database.py`
- **Nota**: Asegúrate de que MySQL esté corriendo en tu sistema

##### **python-dotenv (v1.0.x)**
```bash
pip install python-dotenv
```
- **Propósito**: Cargar variables de entorno desde archivos `.env`
- **Uso en el proyecto**: Gestionar configuraciones sensibles (credenciales de BD, claves secretas)
- **Recomendación**: Crear un archivo `.env` para producción

##### **Werkzeug (v3.0.x)**
```bash
pip install werkzeug
```
- **Propósito**: Librería de utilidades WSGI (viene con Flask pero se especifica por separado)
- **Uso en el proyecto**: 
  - Hashing seguro de contraseñas con `generate_password_hash`
  - Verificación de contraseñas con `check_password_hash`
- **Archivo de uso**: `utils/hash.py`
- **Algoritmo**: pbkdf2:sha256 (altamente seguro)

##### **PyJWT (v2.8.x)**
```bash
pip install PyJWT
```
- **Propósito**: Crear y verificar JSON Web Tokens
- **Uso en el proyecto**:
  - Generar tokens de autenticación después del login
  - Verificar tokens en rutas protegidas
  - Incluir información del usuario (id, roles) en el payload
- **Archivo de uso**: `utils/jwt_manager.py`
- **Configuración**: Token con expiración de 3 horas

##### **Flask-JWT-Extended (v4.5.x)** *(Opcional)*
```bash
pip install flask-jwt-extended
```
- **Propósito**: Extensión avanzada de JWT para Flask
- **Estado**: Incluida en requirements pero no implementada actualmente
- **Uso futuro**: Refresh tokens, blacklisting, protección CSRF

---

### Paso 3. Base de datos en mysql del proyecto Autocanje

A continuación, se enviará el script sql para poder importar la base de datos, utilizando principalmente phpmyadmin

### 📥 Descargar base de datos

Haz clic en el siguiente enlace para descargar el script:

👉 [Descargar](autocanje.sql)

### ⚙️ Importar el script en MySQL

#### 1. Crea una base de datos vacía en tu servidor MySQL
   ```bash
   CREATE DATABASE autocanje;
   ```

#### 2. Importar script sql a [http://localhost/phpmyadmin](http://localhost/phpmyadmin)

#### 3. Configurar Conexión

Edita el archivo `backend/config/database.py`:

```python
import mysql.connector

def conexion():
    return mysql.connector.connect(
        host="localhost",        # Cambiar si usas un servidor remoto
        user="root",             # Tu usuario de MySQL
        password="",             # Tu contraseña de MySQL
        database="autocanje"     # Nombre de la base de datos
    )
```

**⚠️ IMPORTANTE PARA PRODUCCIÓN:**
- **NUNCA** subas credenciales reales a repositorios públicos
- Usa variables de entorno con `python-dotenv`:

```python
# .env (crear en la raíz del backend)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_seguro
DB_NAME=autocanje

# database.py (versión mejorada)
import os
from dotenv import load_dotenv

load_dotenv()

def conexion():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
```

### Paso 4: Estructura del Backend

```
backend/
│
├── app.py                      # Aplicación principal de Flask
├── requirements.txt            # Dependencias del proyecto
│
├── config/
│   └── database.py            # Configuración de MySQL
│
├── controllers/
│   └── auth_controller.py     # Lógica de autenticación
│
├── models/
│   └── usuario_model.py       # Operaciones CRUD de usuarios
│
├── routes/
│   └── auth_routes.py         # Rutas de autenticación
│
└── utils/
    ├── hash.py                # Funciones de hashing
    ├── jwt_manager.py         # Gestión de JWT
    └── auth_middleware.py     # Middleware de autenticación
```

### Paso 5: Ejecutar el Servidor

#### 5.1 Verificar configuración

Asegúrate de:
- ✅ MySQL está corriendo
- ✅ Base de datos `autocanje` existe
- ✅ Todas las tablas estén creadas 
- ✅ Credenciales en `database.py` son correctas

#### 5.2 Iniciar servidor Flask

```bash
# Desde la carpeta backend/ con el entorno virtual activado
python app.py
```

Deberías ver algo como:
```
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
```

#### 5.3 Verificar funcionamiento

Prueba estos endpoints con Postman, cURL o tu navegador:

**Health Check:**
```bash
curl http://127.0.0.1:5000/
```

**Registro de usuario:**
```bash
curl -X POST http://127.0.0.1:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "primer_nombre": "Juan",
  "primer_apellido": "Pérez",
  "email": "juan@example.com",
  "contrasena": "password123",
  "telefono": "3001234567",
  "identificacion": "1234567890"
}'
```

**Login:**
```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "juan@example.com",
  "password": "password123"
}'
```

### Paso 6: Endpoints Disponibles

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/perfil` | Obtener perfil del usuario | Sí (JWT) |
| PUT | `/api/auth/perfil` | Actualizar perfil | Sí (JWT) |
| POST | `/api/auth/cambiar-contrasena` | Cambiar contraseña | Sí (JWT) |

### Paso 7: Solución de Problemas Comunes

#### Error: "ModuleNotFoundError: No module named 'flask'"
```bash
# Asegúrate de que el entorno virtual esté activado
pip install flask
```

#### Error: "Can't connect to MySQL server"
```bash
# Verifica que MySQL esté corriendo
# Windows: Servicios → MySQL
# Linux: sudo systemctl status mysql
# macOS: mysql.server status

# Verifica credenciales en database.py
```

#### Error: "Access denied for user 'root'@'localhost'"
```sql
-- Resetear contraseña de root en MySQL
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nueva_password';
FLUSH PRIVILEGES;
```

#### Error de CORS al conectar con frontend
```python
# Verifica que app.py tenga estos decoradores:
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 200

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
```

### Paso 8: Mejores Prácticas

1. **Nunca** expongas credenciales en el código
2. Usa variables de entorno (`.env`)
3. Mantén el entorno virtual actualizado
4. Documenta cambios en requirements.txt
5. Implementa logging para debugging
6. Valida datos en el backend aunque el frontend lo haga

---

## 🎨 Configuración del Frontend (React + Vite)

### Requisitos Previos
     
Antes de comenzar, asegúrate de tener instalado:
- **Node.js 20.19.0 o superior** ([Descargar aquí](https://nodejs.org/))
  - Incluye **npm** (Node Package Manager)
  - Verificar instalación: `node --version` y `npm --version`
- **Git** (opcional, para clonar el repositorio)

### Paso 1: Instalación Inicial

#### 1.1 Navegar a la carpeta del frontend

```bash
cd frontend
```

#### 1.2 Instalar dependencias del proyecto

```bash
npm install
```

Este comando leerá el archivo `package.json` e instalará todas las dependencias necesarias.

### Paso 2: Dependencias del Proyecto

El proyecto utiliza las siguientes dependencias divididas en dos categorías:

---

### 📦 Dependencias de Producción

Estas librerías son necesarias para que la aplicación funcione en producción:

#### **React (v19.2.0)**
```bash
npm install react@19.2.0
```
- **Propósito**: Librería principal para construir interfaces de usuario
- **Uso en el proyecto**: Base de todos los componentes de la aplicación
- **Archivos principales**: Todos los `.jsx` en `src/`
- **Características usadas**: Hooks (useState, useEffect), componentes funcionales

#### **React-DOM (v19.2.0)**
```bash
npm install react-dom@19.2.0
```
- **Propósito**: Renderizar componentes React en el DOM
- **Uso en el proyecto**: Montar la aplicación en el elemento `#root`
- **Archivo principal**: `src/main.jsx`
- **Nota**: Debe coincidir con la versión de React

#### **React Router DOM (v7.9.4)**
```bash
npm install react-router-dom@7.9.4
```
- **Propósito**: Enrutamiento y navegación entre páginas
- **Uso en el proyecto**:
  - Navegación entre Login, Registro, Home, Perfil
  - Manejo de rutas protegidas (próximamente)
  - Manejo de parámetros de URL
- **Archivo principal**: `src/App.jsx`
- **Componentes usados**: `BrowserRouter`, `Routes`, `Route`, `Link`, `useNavigate`

#### **Axios (v1.12.2)**
```bash
npm install axios@1.12.2
```
- **Propósito**: Cliente HTTP para hacer peticiones al backend
- **Uso en el proyecto**:
  - Registro de usuarios (`POST /api/auth/register`)
  - Login (`POST /api/auth/login`)
  - Obtener perfil (`GET /api/auth/perfil`)
  - Actualizar perfil (`PUT /api/auth/perfil`)
  - Cambiar contraseña (`POST /api/auth/cambiar-contrasena`)
- **Archivos de uso**: Todos los componentes que se conectan con el backend
- **Ventajas**: Interceptors, manejo automático de JSON, mejor manejo de errores que fetch

**Ejemplo de uso:**
```javascript
import axios from 'axios';

const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
  email: 'usuario@example.com',
  password: 'password123'
}, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Para rutas protegidas
  }
});
```

#### **Bootstrap (v5.3.8)**
```bash
npm install bootstrap@5.3.8
```
- **Propósito**: Framework CSS para estilos base y componentes
- **Uso en el proyecto**: 
  - Sistema de grid responsive
  - Componentes base (botones, cards, forms)
  - Normalización de estilos
- **Importación**: `import 'bootstrap/dist/css/bootstrap.min.css'` en `App.jsx`
- **Nota**: Se complementa con CSS personalizado para mantener la identidad visual

#### **Lucide React (v0.546.0)**
```bash
npm install lucide-react@0.546.0
```
- **Propósito**: Librería de iconos SVG optimizados
- **Uso en el proyecto**:
  - Iconos en header (Search, ShoppingCart, Menu, User, LogOut)
  - Iconos en footer (Mail, Phone, MapPin, Facebook, Instagram, Twitter)
  - Iconos en perfil (User, Save, AlertCircle, CheckCircle, Shield, Package)
  - Iconos en home (Star, Shield, Zap, TrendingUp, Crown)
- **Archivos de uso**: `Header.jsx`, `Footer.jsx`, `Perfil.jsx`, `Home.jsx`
- **Ventajas**: Tree-shakeable, ligero, personalizable

**Ejemplo de uso:**
```javascript
import { User, Mail, Lock } from 'lucide-react';

<User size={24} color="#007BFF" />
<Mail size={20} strokeWidth={2} />
```

#### **React Icons (v5.5.0)**
```bash
npm install react-icons@5.5.0
```
- **Propósito**: Colección alternativa de iconos (Font Awesome, Material Design, etc.)
- **Uso en el proyecto**: Complemento a Lucide para iconos específicos
- **Ventajas**: Más de 10,000 iconos disponibles

#### **Classnames (v2.5.1)**
```bash
npm install classnames@2.5.1
```
- **Propósito**: Utilidad para manejar clases CSS condicionales
- **Uso en el proyecto**: Aplicar clases dinámicamente según estado
- **Ejemplo de uso**:
```javascript
import classnames from 'classnames';

<div className={classnames({
  'perfil-tab': true,
  'active': tabActivo === 'informacion',
  'disabled': loading
})}>
```

---

### Paso 3: Estructura del Frontend

```
frontend/
│
├── public/
│   └── vite.svg               # Logo de Vite (placeholder)
│
├── src/
│   ├── assets/
│   │   └── react.svg          # Logo de React
│   │
│   ├── components/
│   │   ├── header.jsx         # Navegación principal
│   │   └── footer.jsx         # Pie de página
│   │
│   ├── pages/
│   │   ├── home.jsx           # Landing page
│   │   └── users/
│   │       ├── login.jsx      # Inicio de sesión
│   │       ├── registro.jsx   # Registro de usuarios
│   │       └── perfil.jsx     # Perfil de usuario
│   │
│   ├── styles/
│   │   ├── home.css           # Estilos del home
│   │   ├── login.css          # Estilos del login
│   │   ├── registro.css       # Estilos del registro
│   │   ├── perfil.css         # Estilos del perfil
│   │   └── components/
│   │       ├── header.css     # Estilos del header
│   │       └── footer.css     # Estilos del footer
│   │
│   ├── App.jsx                # Componente principal
│   ├── App.css                # Estilos globales
│   ├── main.jsx               # Punto de entrada
│   └── index.css              # Reset CSS
│
├── index.html                 # HTML base
├── package.json               # Dependencias y scripts
├── vite.config.js            # Configuración de Vite
├── eslint.config.js          # Configuración de ESLint
└── .gitignore                # Archivos ignorados por Git
```
---

### Paso 5: Ejecutar el Proyecto

#### 5.1 Modo Desarrollo

```bash
npm run dev
```

Esto iniciará:
- ✅ Servidor de desarrollo en `http://localhost:5173`
- ✅ Hot Module Replacement (HMR) activado
- ✅ Apertura automática del navegador

Deberías ver en la terminal:
```
  VITE v7.1.7  ready in 324 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

#### 5.2 Build para Producción

```bash
npm run build
```

Este comando:
- 📦 Optimiza el código (minificación, tree-shaking)
- 🗜️ Comprime assets (imágenes, CSS)
- 📁 Genera carpeta `dist/` con archivos estáticos
- ⚡ Divide código en chunks para carga más rápida

#### 5.3 Preview del Build

```bash
npm run preview
```

Sirve la versión de producción localmente para testing antes de deployment.

#### 5.4 Linting del Código

```bash
npm run lint
```

Ejecuta ESLint para verificar errores y problemas de estilo.

### Paso 6: Conexión con el Backend

#### 6.1 Configuración de URLs

En el código actual, las URLs del backend están hardcodeadas:

```javascript
// src/pages/users/login.jsx, registro.jsx, perfil.jsx
const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
  // datos...
});
```

**Mejora recomendada:** Crear un archivo de configuración

```javascript
// src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    PROFILE: `${API_BASE_URL}/api/auth/perfil`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/cambiar-contrasena`
  }
};
```

Luego crear un archivo `.env` en la raíz del frontend:
```
VITE_API_URL=http://127.0.0.1:5000
```

#### 6.2 Manejo de Autenticación

El proyecto usa **localStorage** para guardar:
- **Token JWT**: `localStorage.getItem('token')`
- **Datos del usuario**: `localStorage.getItem('usuario')`

**Flujo de autenticación:**

1. **Login exitoso** → Guardar token y usuario en localStorage
2. **Navegación** → Leer token de localStorage
3. **Peticiones protegidas** → Enviar token en header Authorization
4. **Logout** → Limpiar localStorage y redirigir

```javascript
// Ejemplo de petición autenticada
const token = localStorage.getItem('token');

const response = await axios.get('http://127.0.0.1:5000/api/auth/perfil', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Paso 7: Páginas y Componentes Principales

#### 7.1 Home (`src/pages/home.jsx`)

**Descripción:** Landing page principal con:
- Hero section con CTA
- Productos destacados
- Indicadores de confianza
- Categorías populares
- Beneficios premium

**Ruta:** `/`

**Componentes utilizados:**
- Header (navegación)
- Footer (información)

#### 7.2 Registro (`src/pages/users/registro.jsx`)

**Descripción:** Wizard de registro en 4 pasos:
1. Información Personal (nombres, apellidos, identificación)
2. Información de Contacto (email, teléfono)
3. Dirección de Domicilio
4. Rol y Seguridad (buyer/seller/both + contraseña)

**Ruta:** `/registro`

**Características:**
- Barra de progreso visual
- Validación en tiempo real
- Navegación entre pasos
- Selección de roles con descripciones

**Estados gestionados:**
```javascript
const [currentStep, setCurrentStep] = useState(1); // Paso actual
const [formData, setFormData] = useState({
  primer_nombre: "",
  segundo_nombre: "",
  // ... más campos
});
```

#### 7.3 Login (`src/pages/users/login.jsx`)

**Descripción:** Inicio de sesión con:
- Panel lateral decorativo (solo desktop)
- Formulario de email y contraseña
- Toggle de visibilidad de contraseña
- Checkbox "Recordarme"
- Enlace a recuperación de contraseña
- Enlace a registro

**Ruta:** `/login`

**Funcionalidad:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
    email: formData.email,
    contrasena: formData.password  // Backend espera "contrasena"
  });
  
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
    window.location.href = "/";
  }
};
```

#### 7.4 Perfil (`src/pages/users/perfil.jsx`)

**Descripción:** Gestión completa del perfil con tabs:
- **Información Personal**: Editar todos los datos del usuario
- **Seguridad**: Cambiar contraseña
- **Panel Vendedor**: Gestión de productos (próximamente)
- **Mis Productos**: Lista de productos publicados (próximamente)

**Ruta:** `/perfil` (requiere autenticación)

**Características:**
- Header con avatar y badges de roles
- Sistema de tabs para navegación
- Formularios con validación
- Actualización en tiempo real
- Mensajes de éxito/error

**Hooks principales:**
```javascript
const [usuario, setUsuario] = useState(null);
const [loading, setLoading] = useState(true);
const [guardando, setGuardando] = useState(false);
const [tabActivo, setTabActivo] = useState('informacion');
const [formData, setFormData] = useState({...});
```

**Protección de ruta:**
```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login'; // Redirigir si no hay token
  }
}, []);
```

#### 7.5 Header (`src/components/header.jsx`)

**Descripción:** Navegación principal con:
- Logo clickeable
- Barra de búsqueda
- Carrito con badge de cantidad
- Botones de login/registro (no autenticado)
- Menú de usuario con dropdown (autenticado)
- Menú móvil responsive

**Características:**
- Sticky (se queda fijo al hacer scroll)
- Dropdown de usuario con detección de clicks externos
- Responsive con hamburger menu

**Estado:**
```javascript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [userMenuOpen, setUserMenuOpen] = useState(false);
const [usuario, setUsuario] = useState(null);
```

#### 7.6 Footer (`src/components/footer.jsx`)

**Descripción:** Pie de página con:
- Información sobre Autocanje
- Enlaces rápidos (Catálogo, Premium, Ayuda)
- Enlaces legales (Términos, Privacidad, Devoluciones)
- Información de contacto
- Redes sociales
- Copyright

**Estructura:**
```javascript
const quickLinks = [
  { label: 'Catálogo', href: '/catalog' },
  { label: 'Membresía Premium', href: '/premium' },
  // ...
];

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  // ...
];
```

### Paso 8: Estilos y Diseño

#### 8.1 Sistema de Colores

```css
/* Colores principales definidos en los CSS */
--color-primary: #007BFF;      /* Azul principal */
--color-primary-hover: #0056b3; /* Azul oscuro (hover) */
--color-text: #1f2937;          /* Texto principal */
--color-text-secondary: #6b7280; /* Texto secundario */
--color-bg: #ffffff;            /* Fondo blanco */
--color-bg-secondary: #f3f4f6;  /* Fondo gris claro */
--color-border: #e5e7eb;        /* Bordes */
--color-danger: #dc2626;        /* Rojo para errores */
```

#### 8.2 Responsive Design

**Breakpoints utilizados:**
- **Desktop**: > 1024px (diseño completo)
- **Tablet**: 768px - 1024px (ajustes moderados)
- **Mobile**: < 768px (diseño móvil)

**Ejemplo:**
```css
/* Desktop por defecto */
.header-container {
  display: flex;
  gap: 2rem;
}

/* Tablet */
@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .header-search {
    display: none; /* Ocultar búsqueda en header móvil */
  }
  
  .mobile-menu {
    display: block; /* Mostrar menú hamburguesa */
  }
}
```

#### 8.3 Iconografía

**Lucide React** se usa de forma consistente:
```javascript
import { User, Mail, Lock, Save, AlertCircle } from 'lucide-react';

// Uso con props
<User size={24} color="#007BFF" strokeWidth={2} />
<Mail size={20} /> // Por defecto hereda color del CSS
```

**Tamaños estándar:**
- 16px: Iconos pequeños (inputs)
- 20px: Iconos medianos (botones)
- 24px: Iconos grandes (headers)
- 48px-64px: Iconos decorativos (empty states)

### Paso 9: Flujo de Trabajo de Desarrollo

#### 9.1 Flujo típico de desarrollo

1. **Iniciar backend** (Terminal 1)
```bash
cd backend
source venv/bin/activate  # o venv\Scripts\activate en Windows
python app.py
```

2. **Iniciar frontend** (Terminal 2)
```bash
cd frontend
npm run dev
```

3. **Desarrollo**
- Editar código en `src/`
- Guardar archivo → HMR recarga automáticamente
- Ver cambios en el navegador instantáneamente

4. **Testing**
- Probar funcionalidades en el navegador
- Verificar console para errores
- Usar React DevTools para debugging

#### 9.2 Workflow de Git

```bash
# Crear rama para nueva funcionalidad
git checkout -b feature/nombre-funcionalidad

# Hacer commits frecuentes
git add .
git commit -m "feat: descripción del cambio"

# Pushear cambios
git push origin feature/nombre-funcionalidad

# Crear Pull Request en GitHub
```

**Convenciones de commits:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `style:` Cambios de estilo (CSS)
- `refactor:` Refactorización de código
- `docs:` Documentación
- `test:` Tests

### Paso 10: Solución de Problemas Comunes

#### Error: "Cannot find module 'react'"
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules
npm install
```

#### Error: "Port 5173 is already in use"
```bash
# Opción 1: Matar el proceso
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:5173 | xargs kill

# Opción 2: Cambiar puerto en vite.config.js
server: {
  port: 3000
}
```

#### Error de CORS al conectar con backend
**Asegúrate de:**
1. Backend está corriendo (`python app.py`)
2. CORS está configurado en `app.py`
3. URLs son correctas (`http://127.0.0.1:5000`)

#### No se guardan los cambios en el navegador
```bash
# Limpiar caché de Vite
rm -rf node_modules/.vite
npm run dev
```

#### Error: "localStorage is not defined"
- localStorage solo funciona en el navegador
- No usar en server-side rendering (SSR)
- Verificar que el código se ejecute en el cliente





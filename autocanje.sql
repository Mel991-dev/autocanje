-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 22-10-2025 a las 02:18:44
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.2.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `autocanje`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

DROP TABLE IF EXISTS `carrito`;
CREATE TABLE IF NOT EXISTS `carrito` (
  `id_carrito` int NOT NULL AUTO_INCREMENT,
  `fk_usuario` int DEFAULT NULL,
  `fk_producto` int DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `fecha_agregado` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_carrito`),
  UNIQUE KEY `id_carrito` (`id_carrito`),
  KEY `fk_usuario` (`fk_usuario`),
  KEY `fk_producto` (`fk_producto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

DROP TABLE IF EXISTS `categoria`;
CREATE TABLE IF NOT EXISTS `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `id_categoria` (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra`
--

DROP TABLE IF EXISTS `compra`;
CREATE TABLE IF NOT EXISTS `compra` (
  `id_compra` int NOT NULL AUTO_INCREMENT,
  `fk_comprador` int DEFAULT NULL,
  `fecha_compra` datetime DEFAULT CURRENT_TIMESTAMP,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `descuento_aplicado` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `compra_premium` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_compra`),
  UNIQUE KEY `id_compra` (`id_compra`),
  KEY `fk_comprador` (`fk_comprador`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_compra`
--

DROP TABLE IF EXISTS `detalle_compra`;
CREATE TABLE IF NOT EXISTS `detalle_compra` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `fk_compra` int DEFAULT NULL,
  `fk_producto` int DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal_detalle` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_detalle`),
  UNIQUE KEY `id_detalle` (`id_detalle`),
  KEY `fk_compra` (`fk_compra`),
  KEY `fk_producto` (`fk_producto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `envio`
--

DROP TABLE IF EXISTS `envio`;
CREATE TABLE IF NOT EXISTS `envio` (
  `id_envio` int NOT NULL AUTO_INCREMENT,
  `fk_compra` int DEFAULT NULL,
  `fk_estado_envio` int DEFAULT NULL,
  `direccion_entrega` varchar(255) DEFAULT NULL,
  `fecha_estimada` datetime DEFAULT NULL,
  `es_prioritario` tinyint(1) DEFAULT NULL,
  `dias_estimados` int DEFAULT NULL,
  PRIMARY KEY (`id_envio`),
  UNIQUE KEY `id_envio` (`id_envio`),
  KEY `fk_compra` (`fk_compra`),
  KEY `fk_estado_envio` (`fk_estado_envio`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_envio`
--

DROP TABLE IF EXISTS `estado_envio`;
CREATE TABLE IF NOT EXISTS `estado_envio` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `id_estado` (`id_estado`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagen_producto`
--

DROP TABLE IF EXISTS `imagen_producto`;
CREATE TABLE IF NOT EXISTS `imagen_producto` (
  `id_imagen_prod` int NOT NULL AUTO_INCREMENT,
  `fk_producto` int DEFAULT NULL,
  `url_imagen` text,
  `es_principal` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_imagen_prod`),
  UNIQUE KEY `id_imagen_prod` (`id_imagen_prod`),
  KEY `fk_producto` (`fk_producto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `membresia_usuario`
--

DROP TABLE IF EXISTS `membresia_usuario`;
CREATE TABLE IF NOT EXISTS `membresia_usuario` (
  `id_membresia` int NOT NULL AUTO_INCREMENT,
  `fk_usuario` int DEFAULT NULL,
  `fk_plan` int DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_fin` datetime DEFAULT NULL,
  `activa` tinyint(1) DEFAULT NULL,
  `renovacion_auto` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_membresia`),
  UNIQUE KEY `id_membresia` (`id_membresia`),
  KEY `fk_usuario` (`fk_usuario`),
  KEY `fk_plan` (`fk_plan`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodo_pago`
--

DROP TABLE IF EXISTS `metodo_pago`;
CREATE TABLE IF NOT EXISTS `metodo_pago` (
  `id_metodo_pago` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_metodo_pago`),
  UNIQUE KEY `id_metodo_pago` (`id_metodo_pago`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

DROP TABLE IF EXISTS `pago`;
CREATE TABLE IF NOT EXISTS `pago` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `fk_compra` int DEFAULT NULL,
  `fk_metodo_pago` int DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `transaccion_id` varchar(255) DEFAULT NULL,
  `fecha_pago` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pago`),
  UNIQUE KEY `id_pago` (`id_pago`),
  KEY `fk_compra` (`fk_compra`),
  KEY `fk_metodo_pago` (`fk_metodo_pago`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_membresia`
--

DROP TABLE IF EXISTS `plan_membresia`;
CREATE TABLE IF NOT EXISTS `plan_membresia` (
  `id_plan` int NOT NULL AUTO_INCREMENT,
  `nombre_plan` varchar(100) DEFAULT NULL,
  `desc_plan` varchar(100) DEFAULT NULL,
  `precio_plan` decimal(8,2) DEFAULT NULL,
  `duracion_dias` int DEFAULT NULL,
  `porc_descuento` int DEFAULT NULL,
  `dias_envio_red` int DEFAULT NULL,
  `permite_reservas` tinyint(1) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_plan`),
  UNIQUE KEY `id_plan` (`id_plan`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

DROP TABLE IF EXISTS `producto`;
CREATE TABLE IF NOT EXISTS `producto` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `fk_vendedor` int DEFAULT NULL,
  `fk_categoria` int DEFAULT NULL,
  `fk_tipo_vehiculo` int DEFAULT NULL,
  `nombre_producto` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `precio` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `pausado` tinyint(1) DEFAULT NULL,
  `fecha_publicacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `promedio_valoracion` decimal(3,2) DEFAULT NULL,
  `valoraciones` int DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `id_producto` (`id_producto`),
  KEY `fk_vendedor` (`fk_vendedor`),
  KEY `fk_categoria` (`fk_categoria`),
  KEY `fk_tipo_vehiculo` (`fk_tipo_vehiculo`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva`
--

DROP TABLE IF EXISTS `reserva`;
CREATE TABLE IF NOT EXISTS `reserva` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `fk_usuario` int DEFAULT NULL,
  `fk_producto` int DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `fecha_reserva` datetime DEFAULT NULL,
  `fecha_exp` datetime DEFAULT NULL,
  `activa` tinyint(1) DEFAULT NULL,
  `convertida_compra` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_reserva`),
  UNIQUE KEY `id_reserva` (`id_reserva`),
  KEY `fk_usuario` (`fk_usuario`),
  KEY `fk_producto` (`fk_producto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_vehiculo`
--

DROP TABLE IF EXISTS `tipo_vehiculo`;
CREATE TABLE IF NOT EXISTS `tipo_vehiculo` (
  `id_tipo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_tipo`),
  UNIQUE KEY `id_tipo` (`id_tipo`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE IF NOT EXISTS `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `identificacion` varchar(15) DEFAULT NULL,
  `primer_nombre` varchar(100) DEFAULT NULL,
  `segundo_nombre` varchar(100) DEFAULT NULL,
  `primer_apellido` varchar(100) DEFAULT NULL,
  `segundo_apellido` varchar(100) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `contrasena` text,
  `telefono` varchar(15) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `es_vendedor` tinyint(1) DEFAULT NULL,
  `es_comprador` tinyint(1) DEFAULT NULL,
  `es_admin` tinyint(1) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  `ultima_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  UNIQUE KEY `identificacion` (`identificacion`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `telefono` (`telefono`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `identificacion`, `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`, `email`, `contrasena`, `telefono`, `direccion`, `es_vendedor`, `es_comprador`, `es_admin`, `fecha_registro`, `ultima_actualizacion`) VALUES
(1, '4565465474', 'wilfer', 'alonso', 'ortiz', 'duarte', 'admin@quickexit.com', 'scrypt:32768:8:1$PSYF17PE2BIZijI9$6d6a3d1f3e3f078b6f3c4489e19c518fe542c84b256552e9ae4be7b107411f810d5809906e7d52624cfe4739da5b6e713df7476f96cc5ffc5552fe2bce5afa87', '57567563543', 'Calle 7 Barrio la consolata', 1, 1, 0, '2025-10-19 11:43:30', '2025-10-21 16:02:26'),
(2, '437656756', 'fgjfgjfgj', '', 'dfhdfhdhdh', '', 'ortizwilfer503@gmail.com', 'scrypt:32768:8:1$ixf8REwpEcEUOohs$4ae90e33cd10e07640a7394ba3f42db2e20d97391423be209c7a1a9fa1b3fc9d953d7b8e44615d02b11d9c409a15c2f49c9524da9392defd52676476292b00a0', '435345664', 'Calle 7 Barrio la consolata', 0, 1, 0, '2025-10-20 16:04:54', '2025-10-21 16:37:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `valoracion`
--

DROP TABLE IF EXISTS `valoracion`;
CREATE TABLE IF NOT EXISTS `valoracion` (
  `id_valoracion` int NOT NULL AUTO_INCREMENT,
  `fk_usuario` int DEFAULT NULL,
  `fk_producto` int DEFAULT NULL,
  `fk_compra` int DEFAULT NULL,
  `calificacion` int DEFAULT NULL,
  `comentario` text,
  `fecha_valoracion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_valoracion`),
  UNIQUE KEY `id_valoracion` (`id_valoracion`),
  KEY `fk_usuario` (`fk_usuario`),
  KEY `fk_producto` (`fk_producto`),
  KEY `fk_compra` (`fk_compra`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

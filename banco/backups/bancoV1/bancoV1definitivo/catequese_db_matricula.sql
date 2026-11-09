CREATE DATABASE  IF NOT EXISTS `catequese_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `catequese_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: catequese_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `matricula`
--

DROP TABLE IF EXISTS `matricula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matricula` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `data_solicitacao` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `observacao` text COLLATE utf8mb4_unicode_ci,
  `data_aprovacao` datetime DEFAULT NULL,
  `responsavel_id` bigint DEFAULT NULL,
  `responsavel_nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `responsavel_cpf` varchar(14) COLLATE utf8mb4_unicode_ci NOT NULL,
  `responsavel_parentesco` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `responsavel_data_nascimento` date NOT NULL,
  `responsavel_telefone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `responsavel_whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `responsavel_email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `catequizando_nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `catequizando_data_nascimento` date NOT NULL,
  `catequizando_endereco` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `catequizando_telefone_emergencia` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `etapa_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_matricula_responsavel` (`responsavel_id`),
  KEY `fk_matricula_etapa` (`etapa_id`),
  CONSTRAINT `fk_matricula_etapa` FOREIGN KEY (`etapa_id`) REFERENCES `etapa_catequetica` (`id`),
  CONSTRAINT `fk_matricula_responsavel` FOREIGN KEY (`responsavel_id`) REFERENCES `responsavel` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matricula`
--

LOCK TABLES `matricula` WRITE;
/*!40000 ALTER TABLE `matricula` DISABLE KEYS */;
/*!40000 ALTER TABLE `matricula` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-09 17:10:49

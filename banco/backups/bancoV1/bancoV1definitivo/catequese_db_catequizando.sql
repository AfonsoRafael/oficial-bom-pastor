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
-- Table structure for table `catequizando`
--

DROP TABLE IF EXISTS `catequizando`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catequizando` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `matricula_id` bigint DEFAULT NULL,
  `responsavel_id` bigint NOT NULL,
  `turma_id` bigint DEFAULT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_nascimento` date NOT NULL,
  `sexo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endereco` text COLLATE utf8mb4_unicode_ci,
  `telefone_emergencia` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `situacao` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_ingresso` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricula_id` (`matricula_id`),
  KEY `fk_catequizando_responsavel` (`responsavel_id`),
  KEY `fk_catequizando_turma` (`turma_id`),
  CONSTRAINT `fk_catequizando_matricula` FOREIGN KEY (`matricula_id`) REFERENCES `matricula` (`id`),
  CONSTRAINT `fk_catequizando_responsavel` FOREIGN KEY (`responsavel_id`) REFERENCES `responsavel` (`id`),
  CONSTRAINT `fk_catequizando_turma` FOREIGN KEY (`turma_id`) REFERENCES `turma` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catequizando`
--

LOCK TABLES `catequizando` WRITE;
/*!40000 ALTER TABLE `catequizando` DISABLE KEYS */;
/*!40000 ALTER TABLE `catequizando` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-09 19:03:45

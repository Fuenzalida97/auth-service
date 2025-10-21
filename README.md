# Microservicio de Autenticación (Auth-Service)

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow)

Este microservicio es el pilar de la seguridad y gestión de usuarios para el ecosistema de aplicaciones del restaurante. Su principal responsabilidad es manejar el registro, inicio de sesión y la generación de tokens de acceso (JWT).

## 🚀 Características Actuales

-   ✅ **Registro de Usuarios:** Creación de cuentas con correo electrónico y contraseña.
-   🔒 **Hashing de Contraseñas:** Uso de `bcrypt` para almacenar las contraseñas de forma segura.
-   🔑 **Generación de JWT:** Emisión de JSON Web Tokens al iniciar sesión para autenticar al usuario en otros microservicios.
-   🐳 **Contenerizado con Docker:** Configuración completa para ejecutarse como un contenedor Docker.

## 🗺️ Roadmap / Características Futuras

-   [ ] **Autenticación con Google (OAuth 2.0):** Permitir a los usuarios registrarse e iniciar sesión con sus cuentas de Google.
-   [ ] **Gestión de Perfil:** Añadir endpoints para que los usuarios puedan ver y actualizar su información.
-   [ ] **Subida de Imagen de Perfil:** Integración con un servicio de almacenamiento (ej. AWS S3) para las fotos de perfil.
-   [ ] **Documentación con Swagger:** Implementar Swagger para generar una documentación interactiva de la API.
-   [ ] **Pruebas Unitarias y E2E:** Desarrollar un conjunto de pruebas robusto para garantizar la fiabilidad del servicio.
-   [ ] **Roles de Usuario:** Implementación de roles (`user`, `admin`) en el payload del JWT.

## 🛠️ Tecnologías Utilizadas

-   **Framework:** NestJS
-   **Base de Datos:** PostgreSQL
-   **ORM:** TypeORM
-   **Autenticación:** JWT (JSON Web Tokens), bcrypt
-   **Contenerización:** Docker

## ⚙️ Instalación y Uso

### 1. Requisitos Previos

-   Node.js (v18+)
-   Docker y Docker Compose

### 2. Configuración Local

1.  **Clonar el repositorio:**
    ```bash
    git clone <tu-repositorio>
    ```

2.  **Navegar a la carpeta del servicio:**
    ```bash
    cd auth-service
    ```

3.  **Instalar dependencias:**
    ```bash
    npm install
    ```

4.  **Configurar variables de entorno:**
    Crea un archivo `.env` a partir del `env.example` y rellena las variables necesarias.

5.  **Ejecutar la aplicación en modo de desarrollo:**
    ```bash
    npm run start:dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

### 3. Uso con Docker

Este servicio está diseñado para ser ejecutado con Docker Compose desde la raíz del proyecto.

```bash
# Desde la carpeta raíz del monorepo
docker-compose up -d --build auth-service

![P1_Extract](https://github.com/user-attachments/assets/fbf18472-4e37-43c1-afa2-833651ed7f79)
![P2_Transform](https://github.com/user-attachments/assets/61925346-c31c-4ee6-95f9-0444966c8db1)

Proyecto ETL con Neo4j y PostgreSQL

Este proyecto es una implementación de un pipeline ETL (Extract, Transform, Load) utilizando Neo4j y PostgreSQL con un backend en Node.js y Express. Se encarga de extraer datos desde Neo4j, transformarlos y cargarlos en PostgreSQL.

📌 Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalados los siguientes componentes:

Docker y Docker Compose

Git

Node.js (versión recomendada: 18+)

Neo4j Desktop (opcional si deseas probarlo sin Docker)

PostgreSQL (opcional si deseas probarlo sin Docker)

🚀 Instalación y configuración

1️⃣ Clonar el repositorio

Ejecuta el siguiente comando en la terminal para clonar el repositorio:

git clone https://github.com/CASILA-19/PARCIAL1_SD
cd tu-repositorio

2️⃣ Configurar las variables de entorno

Crea un archivo .env en la raíz del proyecto con la siguiente configuración:

# Configuración de Neo4j
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=yourpassword

# Configuración de PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=etl_database

# Configuración del servidor Express
EXPRESS_PORT=3000

3️⃣ Iniciar los servicios con Docker

Para levantar Neo4j y PostgreSQL en contenedores, usa:

docker-compose up -d

Esto iniciará los contenedores en segundo plano.

4️⃣ Instalar dependencias

Antes de ejecutar el backend, instala las dependencias de Node.js:

npm install

5️⃣ Ejecutar el servidor

Inicia el servidor Express con:

npm start

Si prefieres un entorno de desarrollo con autorecarga, usa:

npm run dev

📡 Endpoints disponibles

Una vez que el servidor está en ejecución, puedes probar los siguientes endpoints:

🔍 Extraer datos de Neo4j

GET http://localhost:3000/api/extract

🔄 Transformar los datos

GET http://localhost:3000/api/transform

💾 Cargar los datos en PostgreSQL

GET http://localhost:3000/api/load

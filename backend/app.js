require("dotenv").config();
const express = require("express");
const neo4j = require("neo4j-driver");
const { Pool } = require("pg");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;

// Conectar a Neo4j
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Conexión a PostgreSQL
const pgPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: "postgres",
  database: "etl_database",
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Función para convertir a camelCase
const toCamelCase = (str) => {
  if (!str || typeof str !== 'string') {
    return ''; // Manejo de casos inválidos
  }

  // Convertir la primera letra a minúscula y dejar el resto igual
  return str.charAt(0).toLowerCase() + str.slice(1);
};
// Función para clasificar la popularidad
const classifyPopularity = (score) => {
  if (score < 30) return "Poco Usado";
  if (score >= 30 && score <= 70) return "Moderado";
  return "Muy Popular";
};

// Función para clasificar la velocidad
const classifySpeed = (score) => {
  if (score < 40) return "Lento";
  if (score >= 40 && score <= 70) return "Rápido";
  return "Muy Rápido";
};

// endpoint para obtener los datos originales desde Neo4j
app.get("/api/extract", async (req, res) => {
  const session = driver.session();
  try {
    // Consulta Neo4j para obtener todos los datos originales de los lenguajes
    const result = await session.run("MATCH (l:Lenguaje) RETURN l");

    // Extrae los datos originales sin transformaciones
    const languages = result.records.map(record => {
      const lang = record.get("l").properties;
      return {
        id: lang.id,
        nombre: lang.nombre,
        popularidad: parseInt(lang.popularidad), 
        velocidad: parseInt(lang.velocidad),
        paradigma: lang.paradigma,
        año_creacion: parseInt(lang.año_creacion)
      };
    });

    res.json({ languages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});


// Endpoint para extraer y transformar datos
app.get("/api/transform", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (l:Lenguaje) RETURN l");

    const formattedData = result.records.map((record) => {
      const lenguaje = record.get("l").properties;
      const popularidad = parseInt(lenguaje.popularidad);
      const velocidad = parseInt(lenguaje.velocidad);
      const eficiencia = (popularidad + velocidad) / 2;

      return {
        id: lenguaje.id,
        nombre_formateado: toCamelCase(lenguaje.nombre), // 🔹 Transformación 1: camelCase
        popularidad_categoria: classifyPopularity(popularidad), // 🔹 Transformación 2: Clasificación de popularidad
        velocidad_categoria: classifySpeed(velocidad), // 🔹 Transformación 3: Clasificación de velocidad
        eficiencia: eficiencia.toFixed(2), // 🔹 Transformación 4: Índice de eficiencia
        fecha_procesamiento: new Date().toLocaleString(), // Ejemplo: "10/5/2023, 10:48:00 AM"
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error("Error al extraer datos:", error);
    res.status(500).json({ error: "Error al obtener los datos" });
  } finally {
    await session.close();
  }
});

// Endpoint para cargar los datos transformados en PostgreSQL
app.post("/api/load", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (l:Lenguaje) RETURN l");
    const transformedData = result.records.map(record => {
      const lenguaje = record.get("l").properties;
      return {
        id: lenguaje.id,
        nombre_formateado: toCamelCase(lenguaje.nombre),
        popularidad_categoria: classifyPopularity(parseInt(lenguaje.popularidad)),
        velocidad_categoria: classifySpeed(parseInt(lenguaje.velocidad)),
        eficiencia: ((parseInt(lenguaje.popularidad) + parseInt(lenguaje.velocidad)) / 2).toFixed(2),
        fecha_procesamiento: new Date().toISOString(),
      };
    });

    for (const data of transformedData) {
      await pgPool.query(
        `INSERT INTO etl_data (id, nombre_formateado, popularidad_categoria, velocidad_categoria, eficiencia, fecha_procesamiento)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           nombre_formateado = EXCLUDED.nombre_formateado,
           popularidad_categoria = EXCLUDED.popularidad_categoria,
           velocidad_categoria = EXCLUDED.velocidad_categoria,
           eficiencia = EXCLUDED.eficiencia,
           fecha_procesamiento = EXCLUDED.fecha_procesamiento`,
        [data.id, data.nombre_formateado, data.popularidad_categoria, data.velocidad_categoria, data.eficiencia, data.fecha_procesamiento]
      );
    }

    res.json({ message: "Datos almacenados en PostgreSQL correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al cargar datos en PostgreSQL" });
  } finally {
    await session.close();
  }
});



// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

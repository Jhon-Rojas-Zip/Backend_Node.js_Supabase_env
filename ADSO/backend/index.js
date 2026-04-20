// Importación de librerías en Express
import express from 'express';

import dotenv from "dotenv";
import { conectarDB, supabase } from "./db/db.js";
dotenv.config();

//Crear App de Express
const app = express();

conectarDB();

//Leer formato JSON
app.use(express.json());

//Crear primera ruta (Mensaje)
app.get('/', (req, res) => {
    res.send({
        mensaje: 'Bienvenido a mi primera ruta'
    });
});

// Crear segunda ruta (Saludo)
app.get('/saludar', (req, res) => {
    res.send({
        mensaje: '¡Aprendiz!, bienvenido a mi curso de JavaScript',
        hora:new Date().toLocaleTimeString()
    });
});


// Crear tercera ruta (Presentación Personal)
app.get('/presentacion', (req, res) => {
    res.send({
        nombre: 'Jhon Edison',
        apellido: 'Rojas Henao',
        edad: 20,
        sexo: 'Masculino',
        fecha_nacimiento: '18/05/2005',
        direccion: 'Cll 1B Sur #19A 03',
        telefono: '+57 321 947 5147',
        email: 'rojashenaojhonedison@gmail.com',
        web: 'https://www.jhonrojas.com',
        codigo_postal: '414020',
        hora:new Date().toLocaleTimeString()
    });
});

app.get("/usuarios", async (req, res) => {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*");

  if (error) {
    console.error("Error:", error);
    return res.status(500).json({ error });
  }

  // 👇 Mostrar en consola
  console.log("Usuarios obtenidos:", data);

  // 👇 Respuesta al cliente (solo UNA vez)
  res.json({
    total: data.length,
    usuarios: data
  });
});

//Definir puerto del servidor
const PORT=3000;
app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`http://localhost:${PORT}/`);});
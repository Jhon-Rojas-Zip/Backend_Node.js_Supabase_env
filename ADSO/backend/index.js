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
        hora: new Date().toLocaleTimeString()
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
        hora: new Date().toLocaleTimeString()
    });
});

//============================================
// RUTA PARA TRAER INFO DEL SERVER - USUARIOS
//============================================
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

//============================================
// RUTA PARA ENVIAR INFO AL SERVER - USUARIOS
//============================================
app.post("/crear_usuario", async (req, res) => {
    const { nombre, apellido, telefono, correo, rol } = req.body;

    //Verificar que los campos no estén vacíos
    if (!nombre || !apellido || !telefono || !correo || !rol) {
        console.error("❌ ERROR: FALTAN INFORMACIÓN");
        return res.status(400).json({ error: "❌ ERROR: FALTAN INFORMACIÓN" });
    }

    //Insertar datos tal cual en la estructura del Server
    const { data, error } = await supabase
        .from("usuarios")
        .insert([{ nombre, apellido, telefono, correo, rol }])
        .select();

    //Validar si hay error
    if (error) {
        console.error("❌ ERROR: NO SE PUDO CREAR EL USUARIO", error);
        return res.status(500).json({ error: "❌ ERROR: NO SE PUDO CREAR EL USUARIO" });
    }

    //Respuesta al cliente
    console.log("✅ USUARIO CREADO:", data);

    res.json({
        mensaje: "✅ USUARIO CREADO",
        usuario: data
    });
});

//================================================
//RUTA PARA ACTUALIZAR INFO DEL SERVER - USUARIOS
//================================================
app.put("/actualizar_usuario/:id", async (req, res) => {

    console.log("🎭 ACTUALIZANDO USUARIO", req.body);

    const { id } = req.params;
    const { nombre, apellido, telefono, correo, rol } = req.body;

    //Validar ID
    if (!id) {
        return res.status(400).json({ error: "❌ ERROR: FALTA EL ID" });
    }

    //Validar que exista mínimo un dato
    if (!nombre && !apellido && !telefono && !correo && !rol) {
        return res.status(400).json({ error: "❌ ERROR: NO HAY DATOS PARA ACTUALIZAR" });
    }

    //CONSTRUIR OBJETO DINÁMICO
    const datosActualizar = {};
    if (nombre) datosActualizar.nombre = nombre;
    if (apellido) datosActualizar.apellido = apellido;
    if (telefono) datosActualizar.telefono = telefono;
    if (correo) datosActualizar.correo = correo;
    if (rol) datosActualizar.rol = rol;

    console.log("📦 DATOS A ACTUALIZAR:", datosActualizar);

    //ACTUALIZAR DATOS EN SUPABASE
    const { data, error } = await supabase
        .from("usuarios")
        .update(datosActualizar)
        .eq("id", id)
        .select();

    //MOSTRAR DATOS ACTUALIZADOS EN CONSOLA
    console.log("🎭 DATOS ACTUALIZADOS EN SUPABASE", data);
    console.log("✖️ ERROR", error);

    if (error) {
        return res.status(500).json({ error: "❌ ERROR: NO SE PUDO ACTUALIZAR DATOS" });
    }

    //Validar si no encontró registros
    if (!data || data.length === 0) {
        return res.status(404).json({ error: "❌ ERROR: USUARIO NO ENCONTRADO" });
    }

    res.json({
        mensaje: "✅ USUARIO ACTUALIZADO",
        usuario: data
    });
});

//==============================================
//RUTA PARA ELIMINAR INFO DEL SERVER - USUARIOS
//==============================================
app.delete("/eliminar_usuario/:id", async (req, res) => {

    const { id } = req.params;

    //Validar ID
    if (!id) {
        return res.status(400).json({ error: "❌ ERROR: FALTA EL ID" });
    }

    //ELIMINAR DATOS EN SUPABASE
    const { data, error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", id)
        .select();

    //MOSTRAR DATOS ELIMINADOS EN CONSOLA
    console.log("🎭 DATOS ELIMINADOS EN SUPABASE", data);
    console.log("✖️ ERROR", error);

    if (error) {
        return res.status(500).json({ error: "❌ ERROR: NO SE PUDO ELIMINAR DATOS" });
    }

    //Validar si no encontró registros
    if (!data || data.length === 0) {
        return res.status(404).json({ error: "❌ ERROR: USUARIO NO ENCONTRADO" });
    }

    res.json({
        mensaje: "✅ USUARIO ELIMINADO",
        usuario: data
    });
});

//Definir puerto del servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`http://localhost:${PORT}/`);
});
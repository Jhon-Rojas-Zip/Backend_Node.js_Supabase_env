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

//================================================

//°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
// RUTA PARA CREAR PEDIDOS - POST
//°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
app.post("/api/pedidos", async (req, res) => {

    console.log("📦 CREANDO PEDIDO:", req.body);

    const { descripcion, cantidad, total, usuario_id } = req.body;

    // VALIDACIONES
    if (!descripcion || !cantidad || !total || !usuario_id) {
        return res.status(400).json({
            error: "❌ ERROR: TODOS LOS CAMPOS SON OBLIGATORIOS"
        });
    }

    // VALIDAR TIPOS
    if (isNaN(cantidad) || isNaN(total) || isNaN(usuario_id)) {
        return res.status(400).json({
            error: "❌ ERROR: cantidad, total y usuario_id deben ser numéricos"
        });
    }

    // INSERTAR EN SUPABASE
    const { data, error } = await supabase
        .from("pedidos")
        .insert([{
            descripcion,
            cantidad,
            total,
            usuario_id
        }])
        .select();

    // ERROR EN SUPABASE
    if (error) {
        console.error("❌ ERROR AL CREAR PEDIDO:", error);

        return res.status(400).json({
            error: "❌ NO SE PUDO CREAR EL PEDIDO",
            detalle: error.message
        });
    }

    // RESULTADO EN CONSOLA
    console.log("✅ PEDIDO CREADO:", data);

    res.status(201).json({
        mensaje: "✅ PEDIDO CREADO",
        pedido: data
    });
});

//°°°°°°°°°°°°°°°°°°°°°°°°°
// RUTA PARA BUSCAR PEDIDOS
//°°°°°°°°°°°°°°°°°°°°°°°°°
app.get("/api/pedidos/:usuario_id", async (req, res) => {

    const { usuario_id } = req.params;

    console.log("🔍 BUSCANDO PEDIDOS DEL USUARIO:", usuario_id);

    // VALIDAR ID
    if (!usuario_id || isNaN(usuario_id)) {
        return res.status(400).json({
            error: "❌ ERROR: usuario_id inválido"
        });
    }

    // CONSULTA CON JOIN
    const { data, error } = await supabase
        .from("pedidos")
        .select(`
            id,
            descripcion,
            cantidad,
            total,
            fecha_pedido,
            usuarios (
                nombre,
                correo
            )
        `)
        .eq("usuario_id", usuario_id);

    // ERROR EN SUPABASE
    if (error) {
        console.error("❌ ERROR AL OBTENER PEDIDOS:", error);
        return res.status(500).json({
            error: "❌ ERROR AL CONSULTAR PEDIDOS"
        });
    }

    // SIN RESULTADOS
    if (!data || data.length === 0) {
        return res.status(404).json({
            mensaje: "⚠️ NO HAY PEDIDOS PARA ESTE USUARIO"
        });
    }

    // RESULTADO EN CONSOLA
    console.log("✅ PEDIDOS ENCONTRADOS:", data);

    res.status(200).json({
        total: data.length,
        pedidos: data
    });
});

//°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
// RUTA PARA ACTUALIZAR PEDIDOS
//°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
app.put("/api/pedidos/:id", async (req, res) => {

    const { id } = req.params;
    const { descripcion, cantidad, total } = req.body;

    console.log("✏️ ACTUALIZANDO PEDIDO:", id, req.body);

    // VALIDAR ID
    if (!id || isNaN(id)) {
        return res.status(400).json({
            error: "❌ ERROR: ID inválido"
        });
    }

    // VALIDAR QUE HAYA DATOS
    if (!descripcion && !cantidad && !total) {
        return res.status(400).json({
            error: "❌ ERROR: NO HAY DATOS PARA ACTUALIZAR"
        });
    }

    // VALIDAR TIPOS
    if ((cantidad && isNaN(cantidad)) || (total && isNaN(total))) {
        return res.status(400).json({
            error: "❌ ERROR: cantidad y total deben ser numéricos"
        });
    }

    // CONSTRUIR OBJETO DINÁMICO
    const datosActualizar = {};
    if (descripcion) datosActualizar.descripcion = descripcion;
    if (cantidad) datosActualizar.cantidad = cantidad;
    if (total) datosActualizar.total = total;

    console.log("📦 DATOS A ACTUALIZAR:", datosActualizar);

    // ACTUALIZAR EN SUPABASE
    const { data, error } = await supabase
        .from("pedidos")
        .update(datosActualizar)
        .eq("id", id)
        .select();

    // ERROR EN SUPABASE
    if (error) {
        return res.status(500).json({
            error: "❌ NO SE PUDO ACTUALIZAR EL PEDIDO"
        });
    }

    // NO ENCONTRADO
    if (!data || data.length === 0) {
        return res.status(404).json({
            error: "❌ PEDIDO NO ENCONTRADO"
        });
    }

    // RESULTADO EN CONSOLA
    console.log("✅ PEDIDO ACTUALIZADO:", data);

    res.status(200).json({
        mensaje: "✅ PEDIDO ACTUALIZADO",
        pedido: data
    });
});

//°°°°°°°°°°°°°°°°°°°°°°°°°°°°
// RUTA PARA ELIMINAR PEDIDOS
//°°°°°°°°°°°°°°°°°°°°°°°°°°°°
app.delete("/api/pedidos/:id", async (req, res) => {

    const { id } = req.params;

    console.log("🗑️ ELIMINANDO PEDIDO:", id);

    // VALIDAR ID
    if (!id || isNaN(id)) {
        return res.status(400).json({
            error: "❌ ERROR: ID inválido"
        });
    }

    // ELIMINAR EN SUPABASE
    const { data, error } = await supabase
        .from("pedidos")
        .delete()
        .eq("id", id)
        .select();

    // ERROR EN SUPABASE
    if (error) {
        console.error("❌ ERROR AL ELIMINAR PEDIDO:", error);
        return res.status(500).json({
            error: "❌ NO SE PUDO ELIMINAR EL PEDIDO"
        });
    }

    // NO ENCONTRADO
    if (!data || data.length === 0) {
        return res.status(404).json({
            error: "❌ PEDIDO NO ENCONTRADO"
        });
    }

    // RESULTADO EN CONSOLA
    console.log("✅ PEDIDO ELIMINADO:", data);

    res.status(200).json({
        mensaje: "✅ PEDIDO ELIMINADO EXITOSAMENTE",
        pedido: data
    });
});


//Definir puerto del servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`http://localhost:${PORT}/`);
});

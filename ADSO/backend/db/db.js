import "dotenv/config"; // CARGA LAS VARIABLES AUTOMÁTICAMENTE AL IMPORTAR
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// VERIFICACIÓN DE SEGURIDAD PARA EVITAR QUE EL SERVIDOR ARRANQUE SIN DATOS
if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERROR: FALTAN LAS VARIABLES DE ENTORNO EN EL ARCHIVO .ENV");
    process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const conectarDB = () => {
    console.log("✅ CONEXIÓN CON SUPABASE CONFIGURADA");
};
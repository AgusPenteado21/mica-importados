import { NextResponse } from "next/server"
import { testCloudinaryConnection } from "@/lib/cloudinary-config"

export async function GET() {
    try {
        console.log("🧪 Iniciando test de conexión a Cloudinary...")
        console.log("🔧 Variables de entorno:")
        console.log("   CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME || "❌ NO CONFIGURADO")
        console.log("   CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY || "❌ NO CONFIGURADO")
        console.log("   CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ CONFIGURADO" : "❌ NO CONFIGURADO")

        // Verificar que todas las variables estén configuradas
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            return NextResponse.json({
                success: false,
                message: "CLOUDINARY_CLOUD_NAME no está configurado en .env.local",
                error: "Variable de entorno faltante",
                expected: "dwnjpcjhi",
                instructions: [
                    "1. Abre .env.local",
                    "2. Agrega: CLOUDINARY_CLOUD_NAME=dwnjpcjhi",
                    "3. Reinicia el servidor: npm run dev",
                ],
            })
        }

        if (!process.env.CLOUDINARY_API_KEY) {
            return NextResponse.json({
                success: false,
                message: "CLOUDINARY_API_KEY no está configurado en .env.local",
                error: "Variable de entorno faltante",
                expected: "163361771712489",
                instructions: [
                    "1. Abre .env.local",
                    "2. Agrega: CLOUDINARY_API_KEY=163361771712489",
                    "3. Reinicia el servidor: npm run dev",
                ],
            })
        }

        if (!process.env.CLOUDINARY_API_SECRET) {
            return NextResponse.json({
                success: false,
                message: "CLOUDINARY_API_SECRET no está configurado en .env.local",
                error: "Variable de entorno faltante - ESTE ES EL MÁS IMPORTANTE",
                expected: "2B67LzvudVSZxKLQLiENjzo3br8",
                instructions: [
                    "1. Abre .env.local",
                    "2. Agrega: CLOUDINARY_API_SECRET=2B67LzvudVSZxKLQLiENjzo3br8",
                    "3. Reinicia el servidor: npm run dev",
                ],
            })
        }

        // Verificar que las credenciales sean las correctas
        if (process.env.CLOUDINARY_CLOUD_NAME !== "dwnjpcjhi") {
            return NextResponse.json({
                success: false,
                message: "CLOUDINARY_CLOUD_NAME incorrecto",
                error: `Esperado: dwnjpcjhi, Actual: ${process.env.CLOUDINARY_CLOUD_NAME}`,
                instructions: ["Corrige CLOUDINARY_CLOUD_NAME=dwnjpcjhi en .env.local"],
            })
        }

        if (process.env.CLOUDINARY_API_KEY !== "163361771712489") {
            return NextResponse.json({
                success: false,
                message: "CLOUDINARY_API_KEY incorrecto",
                error: `Esperado: 163361771712489, Actual: ${process.env.CLOUDINARY_API_KEY}`,
                instructions: ["Corrige CLOUDINARY_API_KEY=163361771712489 en .env.local"],
            })
        }

        if (process.env.CLOUDINARY_API_SECRET !== "2B67LzvudVSZxKLQLiENjzo3br8") {
            return NextResponse.json({
                success: false,
                message: "CLOUDINARY_API_SECRET incorrecto",
                error: "El API Secret no coincide con el esperado",
                instructions: ["Corrige CLOUDINARY_API_SECRET=2B67LzvudVSZxKLQLiENjzo3br8 en .env.local"],
            })
        }

        console.log("✅ Todas las variables están configuradas correctamente")

        const result = await testCloudinaryConnection()

        console.log("✅ Test de Cloudinary completado:", result)

        return NextResponse.json(result)
    } catch (error) {
        console.error("❌ Error en test de Cloudinary:", error)

        const errorMessage = error instanceof Error ? error.message : "Error desconocido"

        return NextResponse.json(
            {
                success: false,
                message: `Error probando Cloudinary: ${errorMessage}`,
                error: errorMessage,
                timestamp: new Date().toISOString(),
                help: "Verifica que todas las variables de Cloudinary estén configuradas correctamente en .env.local",
                debug: {
                    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                    apiKey: process.env.CLOUDINARY_API_KEY,
                    apiSecretConfigured: !!process.env.CLOUDINARY_API_SECRET,
                },
            },
            { status: 500 },
        )
    }
}

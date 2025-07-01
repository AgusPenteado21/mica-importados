import { type NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary-config"

export async function POST(request: NextRequest) {
    try {
        console.log("📥 API de upload llamada")

        const body = await request.json()
        const { image, filename, contentType } = body

        if (!image) {
            console.error("❌ No se recibió imagen")
            return NextResponse.json({ success: false, error: "No se recibió imagen" }, { status: 400 })
        }

        if (!filename) {
            console.error("❌ No se recibió nombre de archivo")
            return NextResponse.json({ success: false, error: "No se recibió nombre de archivo" }, { status: 400 })
        }

        console.log(`📄 Procesando: ${filename} (${contentType})`)

        // Convertir base64 a Buffer
        let buffer
        try {
            buffer = Buffer.from(image, "base64")
            console.log(`📊 Buffer creado: ${buffer.length} bytes`)
        } catch (error) {
            console.error("❌ Error creando buffer:", error)
            return NextResponse.json({ success: false, error: "Error procesando la imagen" }, { status: 400 })
        }

        if (buffer.length === 0) {
            console.error("❌ Buffer vacío")
            return NextResponse.json({ success: false, error: "Imagen vacía" }, { status: 400 })
        }

        // Subir a Cloudinary
        console.log("🚀 Subiendo a Cloudinary...")
        const result = await uploadToCloudinary(buffer, "tienda-importados")

        if (!result || !result.secure_url) {
            console.error("❌ Resultado inválido de Cloudinary:", result)
            return NextResponse.json({ success: false, error: "Error en la respuesta de Cloudinary" }, { status: 500 })
        }

        const imageData = {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            originalFilename: filename,
        }

        console.log("✅ Imagen subida exitosamente:", imageData.url)

        return NextResponse.json({
            success: true,
            message: "Imagen subida correctamente",
            image: imageData,
        })
    } catch (error: any) {
        console.error("❌ Error en API de upload:", error)

        let errorMessage = "Error interno del servidor"

        if (error.message) {
            errorMessage = error.message
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                details: process.env.NODE_ENV === "development" ? error.stack : undefined,
            },
            { status: 500 },
        )
    }
}

import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary con variables de entorno
const configureCloudinary = () => {
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME
        const apiKey = process.env.CLOUDINARY_API_KEY
        const apiSecret = process.env.CLOUDINARY_API_SECRET

        console.log("🔧 Configurando Cloudinary...")
        console.log("   Cloud Name:", cloudName ? "✅ Configurado" : "❌ Faltante")
        console.log("   API Key:", apiKey ? "✅ Configurado" : "❌ Faltante")
        console.log("   API Secret:", apiSecret ? "✅ Configurado" : "❌ Faltante")

        if (!cloudName || !apiKey || !apiSecret) {
            console.error("❌ Configuración incompleta de Cloudinary")
            console.error("💡 Verifica las variables en .env.local")
            return
        }

        // Configurar Cloudinary con las credenciales exactas
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true, // Usar HTTPS
        })

        console.log("✅ Cloudinary configurado correctamente")
    } catch (error) {
        console.error("❌ Error configurando Cloudinary:", error)
    }
}

// Configurar al importar
configureCloudinary()

/**
 * Sube una imagen a Cloudinary
 * @param {Buffer} buffer - Buffer de la imagen
 * @param {string} folder - Carpeta en Cloudinary
 * @param {string} publicId - ID público (opcional)
 * @returns {Promise} Resultado de la subida
 */
export const uploadToCloudinary = async (buffer, folder = "tienda-importados", publicId = null) => {
    try {
        console.log(`📤 Subiendo imagen a Cloudinary (carpeta: ${folder})...`)

        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder,
                resource_type: "image",
                quality: "auto:good",
                fetch_format: "auto",
                // Simplificar las transformaciones para evitar problemas de firma
                transformation: [{ width: 1200, height: 1200, crop: "limit" }, { quality: "auto:good" }],
            }

            if (publicId) {
                uploadOptions.public_id = publicId
            }

            const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    console.error("❌ Error subiendo a Cloudinary:", error)
                    reject(new Error(`Error de Cloudinary: ${error.message}`))
                } else {
                    console.log("✅ Imagen subida a Cloudinary:", result.secure_url)
                    resolve(result)
                }
            })

            uploadStream.end(buffer)
        })
    } catch (error) {
        console.error("❌ Error en uploadToCloudinary:", error)
        throw new Error(`Error subiendo imagen: ${error.message}`)
    }
}

/**
 * Elimina una imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen
 * @returns {Promise} Resultado de la eliminación
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        console.log(`🗑️ Eliminando imagen de Cloudinary: ${publicId}`)
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("✅ Imagen eliminada de Cloudinary")
        return result
    } catch (error) {
        console.error("❌ Error eliminando de Cloudinary:", error)
        throw new Error(`Error eliminando imagen: ${error.message}`)
    }
}

/**
 * Verifica la configuración de Cloudinary
 * @returns {Object} Estado de la configuración
 */
export const verifyCloudinaryConfig = () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    console.log("🔧 Verificando configuración de Cloudinary...")
    console.log("Cloud Name:", cloudName ? "✅ Configurado" : "❌ Faltante")
    console.log("API Key:", apiKey ? "✅ Configurado" : "❌ Faltante")
    console.log("API Secret:", apiSecret ? "✅ Configurado" : "❌ Faltante")

    const isConfigured = !!(cloudName && apiKey && apiSecret)

    if (!isConfigured) {
        const missingVars = []
        if (!cloudName) missingVars.push("CLOUDINARY_CLOUD_NAME")
        if (!apiKey) missingVars.push("CLOUDINARY_API_KEY")
        if (!apiSecret) missingVars.push("CLOUDINARY_API_SECRET")

        return {
            success: false,
            cloudName: cloudName || "No configurado",
            apiKey: apiKey ? `${apiKey.substring(0, 6)}...` : "No configurado",
            apiSecret: apiSecret ? "Configurado" : "No configurado",
            message: `Faltan variables: ${missingVars.join(", ")}`,
            missingVars,
        }
    }

    return {
        success: isConfigured,
        cloudName: cloudName,
        apiKey: apiKey ? `${apiKey.substring(0, 6)}...` : "No configurado",
        apiSecret: apiSecret ? "Configurado" : "No configurado",
        message: isConfigured ? "Cloudinary configurado correctamente" : "Configuración incompleta",
    }
}

/**
 * Prueba la conexión con Cloudinary - VERSIÓN SIMPLIFICADA
 * @returns {Promise} Resultado de la prueba
 */
export const testCloudinaryConnection = async () => {
    try {
        console.log("🧪 Probando conexión con Cloudinary...")

        const config = verifyCloudinaryConfig()

        if (!config.success) {
            return {
                success: false,
                message: `Configuración incompleta: ${config.message}`,
                details: config,
                instructions: [
                    "1. Verifica que .env.local tenga las credenciales correctas",
                    "2. Reinicia el servidor: npm run dev",
                    "3. Revisa la consola para errores",
                ],
            }
        }

        // Probar con una imagen de prueba muy pequeña (1x1 pixel PNG)
        const testImageBuffer = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "base64",
        )

        console.log("📤 Subiendo imagen de prueba...")

        // Usar configuración más simple para el test
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "test",
                    public_id: `connection-test-${Date.now()}`,
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) {
                        console.error("❌ Error en test:", error)
                        reject(error)
                    } else {
                        console.log("✅ Test exitoso:", result.secure_url)
                        resolve(result)
                    }
                },
            )
            uploadStream.end(testImageBuffer)
        })

        console.log("🗑️ Eliminando imagen de prueba...")
        await deleteFromCloudinary(result.public_id)

        return {
            success: true,
            message: "Conexión exitosa con Cloudinary",
            cloudName: config.cloudName,
            testUrl: result.secure_url,
        }
    } catch (error) {
        console.error("❌ Error en test de conexión:", error)

        let errorMessage = error.message
        let suggestions = []

        if (error.message.includes("Invalid Signature")) {
            errorMessage = "API Secret incorrecto o mal configurado"
            suggestions = [
                "1. Verifica que el API Secret sea exactamente: 2B67LzvudVSZxKLQLiENjzo3br8",
                "2. Asegúrate de que no haya espacios extra en .env.local",
                "3. Reinicia el servidor: npm run dev",
                "4. Verifica que las variables estén bien escritas",
            ]
        } else if (error.message.includes("Invalid API Key")) {
            errorMessage = "API Key incorrecto"
            suggestions = ["1. Verifica que el API Key sea: 163361771712489", "2. Reemplaza en .env.local sin espacios extra"]
        } else if (error.message.includes("Invalid cloud name")) {
            errorMessage = "Cloud Name incorrecto"
            suggestions = ["1. Verifica que el Cloud Name sea: dwnjpcjhi", "2. Reemplaza en .env.local sin espacios extra"]
        }

        return {
            success: false,
            message: `Error de conexión: ${errorMessage}`,
            error: error.message,
            suggestions,
        }
    }
}

export default cloudinary

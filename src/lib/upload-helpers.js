/**
 * Valida archivos de imagen
 * @param {File[]} files - Array de archivos
 * @returns {Object} Resultado de la validación
 */
export const validateImages = (files) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    const maxSize = 10 * 1024 * 1024 // 10MB
    const maxFiles = 10

    const validFiles = []
    const errors = []
    let invalidCount = 0

    console.log(`📋 Validando ${files.length} archivo(s)...`)

    if (files.length > maxFiles) {
        errors.push(`Máximo ${maxFiles} archivos permitidos`)
        return {
            valid: false,
            validFiles: [],
            errors,
            invalidCount: files.length,
        }
    }

    files.forEach((file, index) => {
        console.log(`📄 Archivo ${index + 1}: ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`)

        if (!file.type || !validTypes.includes(file.type.toLowerCase())) {
            errors.push(`${file.name}: Tipo no válido (solo JPG, PNG, WebP, GIF)`)
            invalidCount++
            return
        }

        if (file.size > maxSize) {
            errors.push(`${file.name}: Muy grande (máximo 10MB)`)
            invalidCount++
            return
        }

        if (file.size === 0) {
            errors.push(`${file.name}: Archivo vacío`)
            invalidCount++
            return
        }

        validFiles.push(file)
    })

    // ✅ LÓGICA CORREGIDA: Es válido si hay al menos un archivo válido
    const isValid = validFiles.length > 0

    console.log(`✅ Archivos válidos: ${validFiles.length}`)
    console.log(`❌ Archivos inválidos: ${invalidCount}`)
    if (errors.length > 0) {
        console.log(`🚨 Errores:`, errors)
    }

    return {
        valid: isValid,
        validFiles,
        errors,
        invalidCount,
    }
}

/**
 * Sube múltiples imágenes a Cloudinary
 * @param {File[]} files - Array de archivos válidos
 * @returns {Promise<Object>} Resultado de la subida
 */
export const uploadImages = async (files) => {
    console.log(`🚀 Iniciando subida de ${files.length} imagen(es) a Cloudinary...`)

    const results = {
        success: false,
        uploaded: 0,
        failed: 0,
        images: [],
        errors: [],
    }

    try {
        const uploadPromises = files.map(async (file, index) => {
            try {
                console.log(`📤 Subiendo imagen ${index + 1}/${files.length}: ${file.name}`)

                // Convertir File a Buffer
                const arrayBuffer = await file.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                // Llamar a la API de upload
                const response = await fetch("/api/upload-images", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        image: buffer.toString("base64"),
                        filename: file.name,
                        contentType: file.type,
                    }),
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || `Error HTTP ${response.status}`)
                }

                if (data.success && data.image) {
                    console.log(`✅ Imagen ${index + 1} subida: ${data.image.url}`)
                    results.uploaded++
                    results.images.push(data.image)
                    return data.image
                } else {
                    throw new Error(data.error || "Respuesta inválida del servidor")
                }
            } catch (error) {
                console.error(`❌ Error subiendo imagen ${index + 1} (${file.name}):`, error)
                results.failed++
                results.errors.push(`${file.name}: ${error.message}`)
                return null
            }
        })

        // Esperar a que todas las subidas terminen
        await Promise.all(uploadPromises)

        results.success = results.uploaded > 0

        console.log(`📊 Resultado final: ${results.uploaded} exitosas, ${results.failed} fallidas`)

        return results
    } catch (error) {
        console.error("❌ Error general en uploadImages:", error)
        return {
            success: false,
            uploaded: 0,
            failed: files.length,
            images: [],
            errors: [`Error general: ${error.message}`],
        }
    }
}

/**
 * Verifica el estado de Cloudinary
 * @returns {Promise<Object>} Estado de la conexión
 */
export const checkCloudinaryStatus = async () => {
    try {
        console.log("🔍 Verificando estado de Cloudinary...")

        const response = await fetch("/api/test-cloudinary")
        const data = await response.json()

        console.log("📋 Estado de Cloudinary:", data)

        return data
    } catch (error) {
        console.error("❌ Error verificando Cloudinary:", error)
        return {
            success: false,
            message: `Error de conexión: ${error.message}`,
            error: error.message,
        }
    }
}

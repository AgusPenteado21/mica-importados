// Configuración y helpers para Firebase Storage
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./firebase"

// 🔥 FUNCIÓN PARA VERIFICAR CONFIGURACIÓN DE FIREBASE
export const verifyFirebaseConfig = () => {
    try {
        console.log("🔧 Verificando configuración de Firebase...")

        if (!storage) {
            throw new Error("Firebase Storage no está inicializado")
        }

        // Verificar que la configuración tenga los campos necesarios
        const config = storage.app.options

        console.log("📋 Configuración actual:", {
            projectId: config.projectId,
            storageBucket: config.storageBucket,
            apiKey: config.apiKey ? "✅ Configurado" : "❌ Faltante",
            authDomain: config.authDomain,
        })

        if (!config.storageBucket) {
            throw new Error("storageBucket no está configurado en firebase.js")
        }

        if (!config.projectId) {
            throw new Error("projectId no está configurado en firebase.js")
        }

        if (!config.apiKey) {
            throw new Error("apiKey no está configurado en firebase.js")
        }

        // Verificar que storageBucket tenga el formato correcto
        if (!config.storageBucket.includes(".appspot.com") && !config.storageBucket.includes(".firebasestorage.app")) {
            console.warn("⚠️ El storageBucket debería terminar en .appspot.com o .firebasestorage.app")
        }

        console.log("✅ Configuración de Firebase válida")
        return {
            success: true,
            config: {
                storageBucket: config.storageBucket,
                projectId: config.projectId,
                authDomain: config.authDomain,
            },
        }
    } catch (error) {
        console.error("❌ Error en configuración:", error)
        return {
            success: false,
            error: error.message,
        }
    }
}

// 🔥 FUNCIÓN PARA VERIFICAR CONEXIÓN A STORAGE - MEJORADA
export const testStorageConnection = async () => {
    try {
        console.log("🔍 Verificando conexión a Firebase Storage...")

        // Primero verificar configuración
        const configCheck = verifyFirebaseConfig()
        if (!configCheck.success) {
            throw new Error(`Configuración inválida: ${configCheck.error}`)
        }

        // Verificar que storage esté inicializado
        if (!storage) {
            throw new Error("Firebase Storage no está inicializado")
        }

        console.log("📝 Intentando crear referencia de prueba...")

        // Crear un archivo de prueba muy pequeño
        const testData = new Blob(["test-connection-" + Date.now()], { type: "text/plain" })
        const testFileName = `test/connection_test_${Date.now()}.txt`
        const testRef = ref(storage, testFileName)

        console.log("📁 Archivo de prueba:", testFileName)
        console.log("📍 Referencia creada:", testRef.fullPath)

        // Intentar subir
        console.log("⬆️ Subiendo archivo de prueba...")
        const snapshot = await uploadBytes(testRef, testData)
        console.log("✅ Subida de prueba exitosa:", snapshot.metadata.fullPath)

        // Intentar obtener URL
        console.log("🔗 Obteniendo URL de descarga...")
        const url = await getDownloadURL(testRef)
        console.log("✅ URL de prueba obtenida:", url)

        // Limpiar archivo de prueba
        console.log("🗑️ Eliminando archivo de prueba...")
        await deleteObject(testRef)
        console.log("✅ Archivo de prueba eliminado")

        return {
            success: true,
            message: "Conexión a Storage exitosa",
            url: url,
            bucket: storage.app.options.storageBucket,
        }
    } catch (error) {
        console.error("❌ Error detallado en test de conexión:", error)

        // Analizar el tipo de error específico
        let errorMessage = "Error de conexión desconocido"
        let suggestions = []

        if (error.code === "storage/unauthorized") {
            errorMessage = "Sin permisos para acceder a Storage"
            suggestions = [
                "Verifica las reglas de seguridad en Firebase Console",
                "Ve a Storage > Rules y asegúrate de permitir lectura/escritura",
                "Regla sugerida: allow read, write: if true;",
            ]
        } else if (error.code === "storage/invalid-url") {
            errorMessage = "URL de Storage inválida"
            suggestions = [
                "Verifica que storageBucket en firebase.js sea correcto",
                "Debe terminar en .appspot.com o .firebasestorage.app",
                "Ve a Firebase Console > Storage para ver la URL correcta",
            ]
        } else if (error.code === "storage/network-error") {
            errorMessage = "Error de red"
            suggestions = ["Verifica tu conexión a internet", "Intenta recargar la página"]
        } else if (error.code === "storage/unknown") {
            errorMessage = "Error desconocido de Storage"
            suggestions = [
                "Verifica que Firebase Storage esté habilitado en tu proyecto",
                "Ve a Firebase Console > Storage > Get Started",
            ]
        } else if (error.message.includes("Configuración inválida")) {
            errorMessage = error.message
            suggestions = [
                "Completa todos los campos en src/lib/firebase.js",
                "Ve a Firebase Console > Configuración del proyecto",
                "Copia la configuración de 'Tus aplicaciones'",
            ]
        } else if (error.message) {
            errorMessage = error.message
        }

        console.error("💡 Sugerencias para solucionar:", suggestions)

        return {
            success: false,
            message: errorMessage,
            code: error.code || "unknown",
            suggestions: suggestions,
            fullError: error.toString(),
        }
    }
}

// 🔥 FUNCIÓN MEJORADA PARA SUBIR IMÁGENES
export const uploadProductImage = async (file, productName = "product") => {
    try {
        console.log("🚀 Iniciando subida de imagen:", file.name)

        // Validar archivo
        if (!file) {
            throw new Error("No se proporcionó archivo")
        }

        // Validar tamaño (máximo 10MB)
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
            throw new Error(`Archivo muy grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo 10MB.`)
        }

        // Validar tipo
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if (!validTypes.includes(file.type)) {
            throw new Error(`Tipo de archivo no válido: ${file.type}. Solo JPG, PNG, WebP.`)
        }

        // Crear nombre único y seguro
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 15)
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
        const fileName = `products/${timestamp}_${randomId}_${cleanFileName}`

        console.log("📁 Nombre del archivo:", fileName)

        // Crear referencia
        const storageRef = ref(storage, fileName)
        console.log("📍 Referencia creada:", storageRef.fullPath)

        // Subir archivo con metadata
        const metadata = {
            contentType: file.type,
            customMetadata: {
                uploadedBy: "admin-panel",
                productName: productName,
                originalName: file.name,
            },
        }

        console.log("⬆️ Subiendo archivo...")
        const snapshot = await uploadBytes(storageRef, file, metadata)
        console.log("✅ Archivo subido exitosamente")

        // Obtener URL de descarga
        console.log("🔗 Obteniendo URL de descarga...")
        const downloadURL = await getDownloadURL(snapshot.ref)
        console.log("✅ URL obtenida:", downloadURL)

        return {
            url: downloadURL,
            path: fileName,
            size: file.size,
            type: file.type,
            name: file.name,
        }
    } catch (error) {
        console.error("❌ Error en uploadProductImage:", error)
        throw new Error(`Error al subir imagen: ${error.message}`)
    }
}

// 🔥 FUNCIÓN PARA SUBIR MÚLTIPLES IMÁGENES
export const uploadMultipleImages = async (files, productName = "product") => {
    console.log(`📤 Subiendo ${files.length} imágenes...`)

    const results = []
    const errors = []

    for (let i = 0; i < files.length; i++) {
        try {
            console.log(`📸 Procesando imagen ${i + 1}/${files.length}`)
            const result = await uploadProductImage(files[i], productName)
            results.push(result)
            console.log(`✅ Imagen ${i + 1} subida exitosamente`)
        } catch (error) {
            console.error(`❌ Error en imagen ${i + 1}:`, error)
            errors.push({ file: files[i].name, error: error.message })
        }
    }

    if (errors.length > 0) {
        console.warn("⚠️ Algunas imágenes fallaron:", errors)
    }

    return {
        success: results,
        errors: errors,
        total: files.length,
        uploaded: results.length,
        failed: errors.length,
    }
}

// 🔥 FUNCIÓN PARA ELIMINAR IMAGEN
export const deleteProductImage = async (imagePath) => {
    try {
        const imageRef = ref(storage, imagePath)
        await deleteObject(imageRef)
        console.log("🗑️ Imagen eliminada:", imagePath)
        return true
    } catch (error) {
        console.error("❌ Error eliminando imagen:", error)
        return false
    }
}

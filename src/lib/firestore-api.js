// 🔥 API FUNCTIONS PARA FIRESTORE - CONSULTAS ULTRA SIMPLIFICADAS
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    limit,
} from "firebase/firestore"
import { db } from "./firebase"
import { COLLECTIONS, getAvailableSizes, validateProductSizes } from "./firestore-helpers"

/**
 * 🎯 PRODUCTOS - Obtiene productos con consultas ULTRA SIMPLES
 * @param filters - Filtros a aplicar
 * @returns Productos filtrados
 */
export const getProducts = async (filters = {}) => {
    try {
        console.log("🔍 [getProducts] Iniciando con filtros:", filters)
        const { category, subcategory, size, search, minPrice, maxPrice, inStock } = filters

        const products = []

        // 🔥 ESTRATEGIA: CONSULTA MÁS SIMPLE POSIBLE
        try {
            console.log("📋 [getProducts] Intentando consulta simple...")

            // Solo filtrar por inStock si se especifica, sino traer todos
            let q = collection(db, COLLECTIONS.PRODUCTS)

            if (inStock !== undefined) {
                console.log("📋 [getProducts] Filtrando por inStock:", inStock)
                q = query(q, where("inStock", "==", inStock))
            }

            // Agregar ordenamiento simple
            q = query(q, orderBy("createdAt", "desc"))

            // Limitar resultados
            q = query(q, limit(100))

            console.log("📋 [getProducts] Ejecutando consulta Firestore...")
            const querySnapshot = await getDocs(q)

            querySnapshot.forEach((doc) => {
                const productData = {
                    id: doc.id,
                    ...doc.data(),
                }
                products.push(productData)
            })

            console.log(`✅ [getProducts] Obtenidos ${products.length} productos de Firestore`)
        } catch (firestoreError) {
            console.error("❌ [getProducts] Error en consulta Firestore:", firestoreError)

            // Si falla la consulta con filtros, intentar sin filtros
            console.log("🔄 [getProducts] Intentando consulta sin filtros...")
            try {
                const simpleQuery = query(collection(db, COLLECTIONS.PRODUCTS), orderBy("createdAt", "desc"), limit(50))

                const querySnapshot = await getDocs(simpleQuery)
                querySnapshot.forEach((doc) => {
                    products.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })

                console.log(`🔄 [getProducts] Consulta simple exitosa: ${products.length} productos`)
            } catch (simpleError) {
                console.error("❌ [getProducts] Error en consulta simple:", simpleError)
                throw simpleError
            }
        }

        // 🔥 APLICAR TODOS LOS FILTROS EN MEMORIA
        let filteredProducts = [...products]

        // Filtrar por inStock en memoria si no se hizo en Firestore
        if (inStock !== undefined) {
            const beforeFilter = filteredProducts.length
            filteredProducts = filteredProducts.filter((product) => product.inStock === inStock)
            console.log(`📋 [getProducts] Filtro inStock en memoria: ${beforeFilter} → ${filteredProducts.length}`)
        }

        // Filtrar por categoría en memoria
        if (category && category !== "Todas") {
            const beforeFilter = filteredProducts.length
            filteredProducts = filteredProducts.filter((product) => product.category === category)
            console.log(`📋 [getProducts] Filtro categoría "${category}": ${beforeFilter} → ${filteredProducts.length}`)
        }

        // Filtrar por subcategoría en memoria
        if (subcategory && subcategory !== "Todas") {
            const beforeFilter = filteredProducts.length
            filteredProducts = filteredProducts.filter((product) => product.subcategory === subcategory)
            console.log(`📋 [getProducts] Filtro subcategoría "${subcategory}": ${beforeFilter} → ${filteredProducts.length}`)
        }

        // Filtrar por talle en memoria
        if (size && size !== "Todos") {
            const beforeFilter = filteredProducts.length
            filteredProducts = filteredProducts.filter((product) => {
                if (!product.sizes || product.sizes.length === 0) return true
                return product.sizes.includes(size)
            })
            console.log(`📋 [getProducts] Filtro talle "${size}": ${beforeFilter} → ${filteredProducts.length}`)
        }

        // Filtrar por búsqueda en memoria
        if (search) {
            const searchLower = search.toLowerCase()
            const beforeFilter = filteredProducts.length
            filteredProducts = filteredProducts.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchLower) ||
                    product.category.toLowerCase().includes(searchLower) ||
                    product.subcategory.toLowerCase().includes(searchLower) ||
                    (product.description && product.description.toLowerCase().includes(searchLower)),
            )
            console.log(`📋 [getProducts] Filtro búsqueda "${search}": ${beforeFilter} → ${filteredProducts.length}`)
        }

        // Filtrar por precio en memoria
        if (minPrice) {
            const beforeFilter = filteredProducts.length
            filteredProducts = filteredProducts.filter((product) => product.price >= minPrice)
            console.log(`📋 [getProducts] Filtro precio mínimo ${minPrice}: ${beforeFilter} → ${filteredProducts.length}`)
        }

        if (maxPrice) {
            const beforeFilter = filteredProducts.length
            filteredProducts = filteredProducts.filter((product) => product.price <= maxPrice)
            console.log(`📋 [getProducts] Filtro precio máximo ${maxPrice}: ${beforeFilter} → ${filteredProducts.length}`)
        }

        console.log(`🎯 [getProducts] Resultado final: ${filteredProducts.length} productos`)
        return filteredProducts
    } catch (error) {
        console.error("❌ [getProducts] Error general:", error)
        console.error("❌ [getProducts] Stack trace:", error.stack)

        // Mensaje de error más específico
        if (error.message.includes("requires an index")) {
            console.error("🔥 [getProducts] ERROR DE ÍNDICE DETECTADO")
            throw new Error("Error de índice en Firestore. Verifica la consola para más detalles.")
        }

        throw error
    }
}

/**
 * 🎯 PRODUCTOS DESTACADOS - Consulta súper simple
 * @returns Productos destacados
 */
export const getFeaturedProducts = async () => {
    try {
        console.log("⭐ [getFeaturedProducts] Iniciando...")

        // Consulta lo más simple posible
        const q = query(collection(db, COLLECTIONS.PRODUCTS), orderBy("createdAt", "desc"), limit(12))

        console.log("⭐ [getFeaturedProducts] Ejecutando consulta...")
        const querySnapshot = await getDocs(q)
        const products = []

        querySnapshot.forEach((doc) => {
            const productData = {
                id: doc.id,
                ...doc.data(),
            }
            // Solo incluir productos en stock
            if (productData.inStock !== false) {
                products.push(productData)
            }
        })

        console.log(`⭐ [getFeaturedProducts] Obtenidos ${products.length} productos destacados`)
        return products
    } catch (error) {
        console.error("❌ [getFeaturedProducts] Error:", error)

        // Si falla, intentar consulta aún más simple
        try {
            console.log("🔄 [getFeaturedProducts] Intentando consulta ultra simple...")
            const simpleQuery = query(collection(db, COLLECTIONS.PRODUCTS), limit(10))
            const querySnapshot = await getDocs(simpleQuery)
            const products = []

            querySnapshot.forEach((doc) => {
                products.push({
                    id: doc.id,
                    ...doc.data(),
                })
            })

            console.log(`🔄 [getFeaturedProducts] Consulta ultra simple exitosa: ${products.length} productos`)
            return products.filter((p) => p.inStock !== false)
        } catch (simpleError) {
            console.error("❌ [getFeaturedProducts] Error en consulta ultra simple:", simpleError)
            throw simpleError
        }
    }
}

/**
 * 🎯 PRODUCTOS POR CATEGORÍA - Consulta simple sin índices complejos
 * @param category - Categoría específica
 * @returns Productos de la categoría
 */
export const getProductsByCategory = async (category) => {
    try {
        console.log(`📂 [getProductsByCategory] Iniciando para categoría: ${category}`)

        // Primero obtener todos los productos y filtrar en memoria
        const allProducts = await getFeaturedProducts() // Reutilizar la función que ya funciona

        const categoryProducts = allProducts.filter((product) => product.category === category && product.inStock !== false)

        console.log(`📂 [getProductsByCategory] Productos de ${category}: ${categoryProducts.length}`)
        return categoryProducts
    } catch (error) {
        console.error(`❌ [getProductsByCategory] Error para categoría ${category}:`, error)
        return [] // Retornar array vacío en lugar de fallar
    }
}

/**
 * 🎯 CONTEO SIMPLE POR CATEGORÍA
 * @param category - Categoría específica
 * @returns Número de productos
 */
export const getProductCountByCategory = async (category) => {
    try {
        console.log(`📊 [getProductCountByCategory] Contando productos de: ${category}`)

        const products = await getProductsByCategory(category)
        const count = products.length

        console.log(`📊 [getProductCountByCategory] ${category}: ${count} productos`)
        return count
    } catch (error) {
        console.error(`❌ [getProductCountByCategory] Error para ${category}:`, error)
        return 0
    }
}

/**
 * 🎯 Obtiene un producto por ID
 * @param productId - ID del producto
 * @returns Producto
 */
export const getProductById = async (productId) => {
    try {
        console.log(`🔍 [getProductById] Obteniendo producto: ${productId}`)

        const docRef = doc(db, COLLECTIONS.PRODUCTS, productId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const product = {
                id: docSnap.id,
                ...docSnap.data(),
            }
            console.log(`✅ [getProductById] Producto encontrado: ${product.name}`)
            return product
        } else {
            throw new Error("Producto no encontrado")
        }
    } catch (error) {
        console.error(`❌ [getProductById] Error:`, error)
        throw error
    }
}

/**
 * 🎯 Crea un nuevo producto con talles
 * @param productData - Datos del producto
 * @returns Producto creado
 */
export const createProduct = async (productData) => {
    try {
        console.log(`📝 [createProduct] Creando producto: ${productData.name}`)

        const { sizes, ...rest } = productData

        // Validar talles si existen
        if (sizes && !validateProductSizes({ sizes })) {
            throw new Error("Talles inválidos")
        }

        const newProduct = {
            ...rest,
            sizes: sizes || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            inStock: rest.inStock !== undefined ? rest.inStock : true,
            stockCount: rest.stockCount || 0,
        }

        const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), newProduct)

        console.log(`✅ [createProduct] Producto creado con ID: ${docRef.id}`)
        return {
            id: docRef.id,
            ...newProduct,
        }
    } catch (error) {
        console.error("❌ [createProduct] Error:", error)
        throw error
    }
}

/**
 * 🎯 Actualiza un producto
 * @param productId - ID del producto
 * @param updateData - Datos a actualizar
 * @returns Producto actualizado
 */
export const updateProduct = async (productId, updateData) => {
    try {
        console.log(`📝 [updateProduct] Actualizando producto: ${productId}`)

        const { sizes, ...rest } = updateData

        // Validar talles si se están actualizando
        if (sizes && !validateProductSizes({ sizes })) {
            throw new Error("Talles inválidos")
        }

        const updatePayload = {
            ...rest,
            updatedAt: serverTimestamp(),
        }

        if (sizes !== undefined) {
            updatePayload.sizes = sizes
        }

        const docRef = doc(db, COLLECTIONS.PRODUCTS, productId)
        await updateDoc(docRef, updatePayload)

        console.log(`✅ [updateProduct] Producto actualizado: ${productId}`)
        return { success: true, productId, updateData }
    } catch (error) {
        console.error("❌ [updateProduct] Error:", error)
        throw error
    }
}

/**
 * 🎯 Elimina un producto
 * @param productId - ID del producto
 * @returns Resultado de la eliminación
 */
export const deleteProduct = async (productId) => {
    try {
        console.log(`🗑️ [deleteProduct] Eliminando producto: ${productId}`)

        await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId))

        console.log(`✅ [deleteProduct] Producto eliminado: ${productId}`)
        return { success: true, productId }
    } catch (error) {
        console.error("❌ [deleteProduct] Error:", error)
        throw error
    }
}

/**
 * 🎯 CATEGORÍAS - Obtiene todas las categorías
 * @returns Categorías
 */
export const getCategories = async () => {
    try {
        console.log("📂 [getCategories] Obteniendo categorías...")

        const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.CATEGORIES), orderBy("name")))

        const categories = []
        querySnapshot.forEach((doc) => {
            categories.push({
                id: doc.id,
                ...doc.data(),
            })
        })

        console.log(`📂 [getCategories] Obtenidas ${categories.length} categorías`)
        return categories
    } catch (error) {
        console.error("❌ [getCategories] Error:", error)
        return [] // Retornar array vacío en lugar de fallar
    }
}

/**
 * 🎯 Obtiene talles disponibles para filtros (desde productos reales)
 * @param category - Categoría
 * @param subcategory - Subcategoría
 * @returns Talles disponibles
 */
export const getAvailableSizesForFilters = async (category, subcategory) => {
    try {
        console.log(`👕 [getAvailableSizesForFilters] Obteniendo talles para: ${category} - ${subcategory}`)

        const products = await getProducts({ category, subcategory, inStock: true })
        const sizes = getAvailableSizes(products, category, subcategory)

        console.log(`👕 [getAvailableSizesForFilters] Talles encontrados:`, sizes)
        return sizes
    } catch (error) {
        console.error("❌ [getAvailableSizesForFilters] Error:", error)
        return []
    }
}

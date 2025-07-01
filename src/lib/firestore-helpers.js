// 🎯 COLECCIONES DE FIRESTORE
export const COLLECTIONS = {
    CATEGORIES: "categories",
    SUBCATEGORIES: "subcategories",
    PRODUCTS: "products",
}

// 🎯 TIPOS DE DATOS
const Product = {
    id: "",
    name: "",
    description: "",
    price: 0,
    category: "",
    subcategory: "",
    badge: "",
    sizes: [],
    images: [],
    mainImage: "",
    inStock: false,
    stockCount: 0,
    whatsappMessage: "",
    features: [],
    createdAt: "",
    updatedAt: "",
}

/**
 * 🎯 Obtiene talles únicos disponibles para una categoría/subcategoría
 * @param products - Array de productos de Firestore
 * @param category - Categoría seleccionada
 * @param subcategory - Subcategoría seleccionada
 * @returns Array de talles únicos ordenados
 */
export const getAvailableSizes = (products, category = "Todas", subcategory = "Todas") => {
    // Filtrar productos que coincidan con los criterios
    const filteredProducts = products.filter((product) => {
        const matchesCategory = category === "Todas" || product.category === category
        const matchesSubcategory = subcategory === "Todas" || product.subcategory === subcategory
        return matchesCategory && matchesSubcategory && product.sizes && product.sizes.length > 0
    })

    // Extraer todos los talles
    const allSizes = filteredProducts.flatMap((product) => product.sizes || [])

    // Obtener talles únicos
    const uniqueSizes = [...new Set(allSizes)]

    // Ordenar talles: números primero, luego letras
    return uniqueSizes.sort((a, b) => {
        const aIsNumber = !isNaN(Number(a))
        const bIsNumber = !isNaN(Number(b))

        if (aIsNumber && bIsNumber) {
            return Number(a) - Number(b)
        }
        if (aIsNumber && !bIsNumber) return -1
        if (!aIsNumber && bIsNumber) return 1
        return a.localeCompare(b)
    })
}

/**
 * 🎯 Filtra productos por talles disponibles
 * @param products - Array de productos
 * @param selectedSize - Talle seleccionado
 * @returns Productos filtrados
 */
export const filterProductsBySize = (products, selectedSize) => {
    if (selectedSize === "Todos") return products

    return products.filter((product) => {
        // Si el producto no tiene talles, lo incluimos (ej: perfumes, joyas)
        if (!product.sizes || product.sizes.length === 0) return true

        // Si tiene talles, verificar que incluya el talle seleccionado
        return product.sizes.includes(selectedSize)
    })
}

/**
 * 🎯 Valida si un producto tiene talles válidos
 * @param product - Producto a validar
 * @returns True si los talles son válidos
 */
export const validateProductSizes = (product) => {
    // Si no tiene talles, es válido (productos como perfumes)
    if (!product.sizes) return true

    // Si tiene talles, debe ser un array no vacío
    if (!Array.isArray(product.sizes) || product.sizes.length === 0) return false

    // Todos los talles deben ser strings no vacíos
    return product.sizes.every((size) => typeof size === "string" && size.trim().length > 0)
}

/**
 * 🎯 Formatea talles para mostrar en UI
 * @param sizes - Array de talles
 * @param maxDisplay - Máximo número de talles a mostrar
 * @returns Talles formateados
 */
export const formatSizesForDisplay = (sizes, maxDisplay = 4) => {
    if (!sizes || sizes.length === 0) {
        return { visible: [], hidden: 0, hasMore: false, total: 0 }
    }

    const visible = sizes.slice(0, maxDisplay)
    const hidden = Math.max(0, sizes.length - maxDisplay)

    return {
        visible,
        hidden,
        hasMore: hidden > 0,
        total: sizes.length,
    }
}

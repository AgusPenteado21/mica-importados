"use client"

// 🔥 HOOK PERSONALIZADO PARA PRODUCTOS - CON MEJOR MANEJO DE ERRORES
import { useState, useEffect } from "react"
import { getProducts, getFeaturedProducts, getProductsByCategory } from "@/lib/firestore-api"
import { getAvailableSizes } from "@/lib/firestore-helpers"

// 🎯 TIPOS DE DATOS
interface Product {
    id: string
    name: string
    description: string
    price: number
    category: string
    subcategory: string
    badge?: string
    sizes?: string[] | null
    images?: string[]
    mainImage?: string
    inStock: boolean
    stockCount?: number
    whatsappMessage?: string
    features?: string[]
    createdAt?: any
    updatedAt?: any
}

interface UseProductsProps {
    category?: string
    subcategory?: string
    size?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    featured?: boolean
}

interface UseProductsReturn {
    products: Product[]
    availableSizes: string[]
    loading: boolean
    error: string | null
    refetch: () => void
}

export const useProducts = (filters: UseProductsProps = {}): UseProductsReturn => {
    const [products, setProducts] = useState<Product[]>([])
    const [availableSizes, setAvailableSizes] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProducts = async () => {
        try {
            setLoading(true)
            setError(null)

            console.log("🔄 [useProducts] Iniciando carga con filtros:", filters)

            let fetchedProducts: Product[] = []

            // 🔥 ESTRATEGIA SIMPLIFICADA
            if (filters.featured) {
                console.log("⭐ [useProducts] Cargando productos destacados...")
                fetchedProducts = (await getFeaturedProducts()) as Product[]
            } else if (filters.category && filters.category !== "Todas" && !filters.subcategory && !filters.search) {
                console.log(`📂 [useProducts] Cargando productos de categoría: ${filters.category}`)
                fetchedProducts = (await getProductsByCategory(filters.category)) as Product[]
            } else {
                console.log("🔍 [useProducts] Cargando productos con filtros...")
                fetchedProducts = (await getProducts(filters)) as Product[]
            }

            console.log(`✅ [useProducts] Productos cargados: ${fetchedProducts.length}`)
            setProducts(fetchedProducts)

            // Obtener talles disponibles
            const sizes = getAvailableSizes(fetchedProducts as Product[], filters.category, filters.subcategory)
            setAvailableSizes(sizes)
        } catch (err: any) {
            console.error("❌ [useProducts] Error:", err)
            console.error("❌ [useProducts] Stack:", err.stack)

            let errorMessage = "Error al cargar productos"

            if (err?.message?.includes("requires an index")) {
                errorMessage =
                    "Se requiere crear un índice en Firestore. Haz clic en el enlace del error para crearlo automáticamente."
            } else if (err?.message?.includes("índice")) {
                errorMessage = "Error de índice en Firestore. Verifica la consola para más detalles."
            } else if (err?.message) {
                errorMessage = err.message
            }

            setError(errorMessage)
            setProducts([]) // Limpiar productos en caso de error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [
        filters.category,
        filters.subcategory,
        filters.size,
        filters.search,
        filters.minPrice,
        filters.maxPrice,
        filters.inStock,
        filters.featured,
    ])

    const refetch = () => {
        console.log("🔄 [useProducts] Refetch solicitado")
        fetchProducts()
    }

    return {
        products,
        availableSizes,
        loading,
        error,
        refetch,
    }
}

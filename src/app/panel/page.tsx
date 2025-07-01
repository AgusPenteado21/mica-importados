"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    ArrowLeft,
    Plus,
    Upload,
    X,
    Save,
    Eye,
    Trash2,
    Package,
    Star,
    Loader2,
    ImageIcon,
    Tag,
    DollarSign,
    FileText,
    Palette,
    Ruler,
    CheckCircle,
    AlertCircle,
    Sparkles,
    EyeOff,
    TrendingUp,
    ShoppingCart,
    Cloud,
    RefreshCw,
    Settings,
    AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { createProduct, getProducts, deleteProduct, updateProduct } from "@/lib/firestore-api"
import { uploadImages, validateImages, checkCloudinaryStatus } from "@/lib/upload-helpers"

// Tipos para TypeScript
interface ValidationResult {
    valid: boolean
    validFiles: File[]
    errors: string[]
    invalidCount: number
}

interface UploadResult {
    success: boolean
    uploaded: number
    failed: number
    images: Array<{ url: string; publicId: string }>
    errors: string[]
}

interface CloudinaryStatusResult {
    success: boolean
    message: string
    error?: string
}

interface ProductFormData {
    name: string
    description: string
    price: number
    category: string
    subcategory: string
    badge: string
    sizes: string[]
    images: File[]
    imageUrls: string[]
    inStock: boolean
    stockCount: number
    features: string[]
}

export default function PanelPage() {
    const [activeTab, setActiveTab] = useState<"create" | "manage">("create")
    const [loading, setLoading] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)
    const [generatingDescription, setGeneratingDescription] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [cloudinaryStatus, setCloudinaryStatus] = useState<"checking" | "connected" | "error">("checking")
    const [cloudinaryError, setCloudinaryError] = useState<string>("")

    // 🎯 CATEGORÍAS CON TALLES INTELIGENTES
    const categoriesData = {
        Joyas: {
            subcategories: ["Anillos", "Pulseras", "Dijes", "Cadenas", "Aros", "Alianzas"],
            suggestedSizes: [],
            icon: "💎",
        },
        Perfumería: {
            subcategories: ["Perfumes Dama", "Perfumes Hombre", "Cremas", "Maquillaje"],
            suggestedSizes: [],
            icon: "🌸",
        },
        Blanquería: {
            subcategories: ["Acolchados", "Sábanas", "Toallas", "Cortinas"],
            suggestedSizes: ["Individual", "1 Plaza", "2 Plazas", "Queen", "King"],
            icon: "🛏️",
        },
        "Carteras y Bolsos": {
            subcategories: ["Carteras", "Bolsos", "Mochilas", "Billeteras"],
            suggestedSizes: ["Pequeño", "Mediano", "Grande"],
            icon: "👜",
        },
        "Juguetes y Peluches": {
            subcategories: ["Juguetes", "Peluches", "Educativos"],
            suggestedSizes: [],
            icon: "🧸",
        },
        Electrodomésticos: {
            subcategories: ["Cocina", "Limpieza", "Cuidado Personal"],
            suggestedSizes: [],
            icon: "⚡",
        },
        Zapatillas: {
            subcategories: ["Hombre", "Mujer", "Niños", "Deportivas"],
            suggestedSizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
            icon: "👟",
        },
        Ropa: {
            subcategories: ["Hombre", "Mujer", "Niños", "Accesorios"],
            suggestedSizes: ["XS", "S", "M", "L", "XL", "XXL"],
            icon: "👕",
        },
        "Ollas y Accesorios de Cocina": {
            subcategories: ["Ollas", "Sartenes", "Utensilios", "Vajilla"],
            suggestedSizes: ["Pequeño", "Mediano", "Grande"],
            icon: "🧑‍🍳",
        },
    }

    // 🎯 ESTADO DEL FORMULARIO
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        price: 0,
        category: "",
        subcategory: "",
        badge: "",
        sizes: [],
        images: [],
        imageUrls: [],
        inStock: true,
        stockCount: 1,
        features: [],
    })

    const [newSize, setNewSize] = useState("")
    const [newFeature, setNewFeature] = useState("")
    const [stockInput, setStockInput] = useState("1")

    // 🔥 VERIFICAR CONEXIÓN A CLOUDINARY AL CARGAR
    useEffect(() => {
        checkCloudinaryConnection()
    }, [])

    const checkCloudinaryConnection = async () => {
        try {
            setCloudinaryStatus("checking")
            setCloudinaryError("")

            console.log("🔧 Verificando conexión con Cloudinary...")

            const result = (await checkCloudinaryStatus()) as CloudinaryStatusResult

            if (result.success) {
                setCloudinaryStatus("connected")
                console.log("✅ Cloudinary conectado correctamente")
                showMessage("success", "Cloudinary conectado correctamente")
            } else {
                setCloudinaryStatus("error")
                setCloudinaryError(result.message || "Error desconocido")
                console.error("❌ Error de conexión a Cloudinary:", result.message)
                showMessage("error", `Error de Cloudinary: ${result.message}`)
            }
        } catch (error: any) {
            setCloudinaryStatus("error")
            const errorMsg = error.message || "Error desconocido"
            setCloudinaryError(errorMsg)
            console.error("❌ Error verificando Cloudinary:", error)
            showMessage("error", `No se pudo conectar a Cloudinary: ${errorMsg}`)
        }
    }

    // 🔥 MOSTRAR MENSAJE
    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 8000)
    }

    // 🔥 OBTENER TALLES SUGERIDOS PARA LA CATEGORÍA
    const getSuggestedSizes = (category: string): string[] => {
        const categoryData = categoriesData[category as keyof typeof categoriesData]
        return categoryData?.suggestedSizes || []
    }

    // 🔥 GENERAR DESCRIPCIÓN CON IA LOCAL INTELIGENTE
    const generateDescription = async () => {
        if (!formData.name.trim()) {
            showMessage("error", "Ingresa el nombre del producto primero")
            return
        }

        try {
            setGeneratingDescription(true)

            const response = await fetch("/api/generate-description", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    category: formData.category,
                    subcategory: formData.subcategory,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al generar descripción")
            }

            setFormData((prev) => ({
                ...prev,
                description: data.description,
            }))

            showMessage("success", "¡Descripción generada con IA!")
        } catch (error: any) {
            console.error("Error generating description:", error)
            showMessage("error", error.message || "Error al generar la descripción")
        } finally {
            setGeneratingDescription(false)
        }
    }

    // 🔥 MANEJAR CAMBIO DE CATEGORÍA
    const handleCategoryChange = (category: string) => {
        setFormData((prev) => ({
            ...prev,
            category,
            subcategory: "",
            sizes: [],
        }))
        setNewSize("")
    }

    // 🔥 MANEJAR CAMBIO DE STOCK
    const handleStockChange = (value: string) => {
        setStockInput(value)
        const numValue = Number.parseInt(value) || 0
        setFormData((prev) => ({
            ...prev,
            stockCount: Math.max(0, numValue),
        }))
    }

    // 🔥 CARGAR PRODUCTOS AL CAMBIAR TAB
    useEffect(() => {
        if (activeTab === "manage") {
            fetchProducts()
        }
    }, [activeTab])

    const fetchProducts = async () => {
        try {
            setLoadingProducts(true)
            const allProducts = await getProducts({})
            setProducts(allProducts)
        } catch (error) {
            console.error("Error fetching products:", error)
            showMessage("error", "Error al cargar productos")
        } finally {
            setLoadingProducts(false)
        }
    }

    // 🔥 MANEJAR SUBIDA DE IMÁGENES - CLOUDINARY MEJORADO CON TIPOS
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        console.log("📸 Archivos seleccionados:", files.length)

        // Verificar conexión a Cloudinary primero
        if (cloudinaryStatus !== "connected") {
            showMessage("error", "Error de conexión a Cloudinary. Haz clic en 'Reconectar' para intentar de nuevo.")
            return
        }

        // Validar archivos
        const validation = validateImages(files) as ValidationResult
        console.log("📋 Resultado de validación:", validation)

        // ✅ LÓGICA MEJORADA: Permitir archivos válidos aunque haya algunos inválidos
        if (!validation.valid) {
            console.error("❌ No hay archivos válidos:", validation.errors)
            showMessage("error", `No hay archivos válidos para subir: ${validation.errors.join(", ")}`)
            return
        }

        // Mostrar advertencia si hay archivos inválidos, pero continuar con los válidos
        if (validation.invalidCount > 0) {
            console.warn(`⚠️ ${validation.invalidCount} archivo(s) inválido(s) serán ignorados`)
            showMessage(
                "error",
                `${validation.invalidCount} archivo(s) inválido(s) ignorados. Subiendo ${validation.validFiles.length} archivo(s) válido(s).`,
            )
        }

        try {
            setUploadingImages(true)
            console.log("🔄 Iniciando subida de imágenes válidas a Cloudinary...")

            const result = (await uploadImages(validation.validFiles)) as UploadResult
            console.log("📊 Resultado de subida:", result)

            if (result.success && result.images && result.images.length > 0) {
                const newImageUrls = result.images.map((img) => img.url)

                setFormData((prev) => ({
                    ...prev,
                    images: [...prev.images, ...validation.validFiles.slice(0, result.uploaded)],
                    imageUrls: [...prev.imageUrls, ...newImageUrls],
                }))

                let successMessage = `${result.uploaded} imagen(es) subida(s) correctamente a Cloudinary`
                if (validation.invalidCount > 0) {
                    successMessage += ` (${validation.invalidCount} archivo(s) inválido(s) ignorados)`
                }
                showMessage("success", successMessage)
            } else {
                throw new Error(result.errors?.[0] || "No se pudieron subir las imágenes")
            }

            if (result.failed > 0 && result.errors && result.errors.length > 0) {
                console.warn("⚠️ Errores en subida:", result.errors)
                showMessage("error", `${result.failed} imagen(es) fallaron: ${result.errors.join(", ")}`)
            }

            // Limpiar el input
            e.target.value = ""
        } catch (error: any) {
            console.error("❌ Error uploading images:", error)
            showMessage("error", `Error al subir las imágenes: ${error.message}`)
        } finally {
            setUploadingImages(false)
        }
    }

    // 🔥 AGREGAR TALLE
    const addSize = () => {
        if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
            setFormData((prev) => ({
                ...prev,
                sizes: [...prev.sizes, newSize.trim()],
            }))
            setNewSize("")
        }
    }

    // 🔥 AGREGAR TALLE SUGERIDO
    const addSuggestedSize = (size: string) => {
        if (!formData.sizes.includes(size)) {
            setFormData((prev) => ({
                ...prev,
                sizes: [...prev.sizes, size],
            }))
        }
    }

    // 🔥 REMOVER TALLE
    const removeSize = (sizeToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            sizes: prev.sizes.filter((size) => size !== sizeToRemove),
        }))
    }

    // 🔥 AGREGAR CARACTERÍSTICA
    const addFeature = () => {
        if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
            setFormData((prev) => ({
                ...prev,
                features: [...prev.features, newFeature.trim()],
            }))
            setNewFeature("")
        }
    }

    // 🔥 REMOVER CARACTERÍSTICA
    const removeFeature = (featureToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features.filter((feature) => feature !== featureToRemove),
        }))
    }

    // 🔥 REMOVER IMAGEN
    const removeImage = (indexToRemove: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove),
            imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove),
        }))
    }

    // 🔥 LIMPIAR FORMULARIO
    const clearForm = () => {
        setFormData({
            name: "",
            description: "",
            price: 0,
            category: "",
            subcategory: "",
            badge: "",
            sizes: [],
            images: [],
            imageUrls: [],
            inStock: true,
            stockCount: 1,
            features: [],
        })
        setNewSize("")
        setNewFeature("")
        setStockInput("1")
    }

    // 🔥 CREAR PRODUCTO
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validaciones
        if (!formData.name.trim()) {
            showMessage("error", "El nombre del producto es obligatorio")
            return
        }

        if (!formData.category) {
            showMessage("error", "La categoría es obligatoria")
            return
        }

        if (!formData.subcategory) {
            showMessage("error", "La subcategoría es obligatoria")
            return
        }

        if (formData.price <= 0) {
            showMessage("error", "El precio debe ser mayor a 0")
            return
        }

        if (formData.imageUrls.length === 0) {
            showMessage("error", "Por favor sube al menos una imagen")
            return
        }

        try {
            setLoading(true)

            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: formData.price,
                category: formData.category,
                subcategory: formData.subcategory,
                badge: formData.badge.trim() || "Nuevo",
                sizes: formData.sizes.length > 0 ? formData.sizes : null,
                images: formData.imageUrls,
                mainImage: formData.imageUrls[0],
                inStock: formData.inStock,
                stockCount: formData.stockCount,
                whatsappMessage: `Hola! Me interesa el producto: ${formData.name}. ¿Podrías darme más información?`,
                features: formData.features,
            }

            await createProduct(productData)

            showMessage("success", "¡Producto creado exitosamente!")
            clearForm()

            if (activeTab === "manage") {
                fetchProducts()
            }
        } catch (error) {
            console.error("Error creating product:", error)
            showMessage("error", "Error al crear el producto. Intenta nuevamente.")
        } finally {
            setLoading(false)
        }
    }

    // 🔥 ELIMINAR PRODUCTO
    const handleDeleteProduct = async (productId: string, productName: string) => {
        if (!confirm(`¿Estás segura de que quieres eliminar "${productName}"?`)) return

        try {
            await deleteProduct(productId)
            showMessage("success", "Producto eliminado correctamente")
            fetchProducts()
        } catch (error) {
            console.error("Error deleting product:", error)
            showMessage("error", "Error al eliminar el producto")
        }
    }

    // 🔥 TOGGLE STOCK
    const handleToggleStock = async (product: any) => {
        try {
            await updateProduct(product.id, { inStock: !product.inStock })
            showMessage("success", `Producto ${!product.inStock ? "activado" : "desactivado"} correctamente`)
            fetchProducts()
        } catch (error) {
            console.error("Error updating stock:", error)
            showMessage("error", "Error al actualizar el stock")
        }
    }

    // Estadísticas
    const totalProducts = products.length
    const activeProducts = products.filter((p: any) => p.inStock).length
    const totalValue = products.reduce((sum: number, p: any) => sum + p.price * (p.stockCount || 1), 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f0ed] to-[#ebcfc4]">
            {/* Header */}
            <header className="bg-white/95 backdrop-blur-md border-b border-[#ebcfc4] sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="text-[#9d6a4e] hover:bg-[#f5f0ed]">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Volver a la Tienda
                                </Button>
                            </Link>
                            <div className="h-6 w-px bg-[#ebcfc4]" />
                            <div>
                                <h1 className="text-xl font-bold text-[#9d6a4e]">Panel de Administración</h1>
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm text-[#b38872]">Gestiona tus productos con IA</p>
                                    <div className="flex items-center space-x-1">
                                        {cloudinaryStatus === "checking" && <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />}
                                        {cloudinaryStatus === "connected" && <Cloud className="w-3 h-3 text-green-500" />}
                                        {cloudinaryStatus === "error" && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                        <span className="text-xs text-gray-500">
                                            {cloudinaryStatus === "checking" && "Verificando..."}
                                            {cloudinaryStatus === "connected" && "Cloudinary OK"}
                                            {cloudinaryStatus === "error" && "Configuración requerida"}
                                        </span>
                                        {cloudinaryStatus === "error" && (
                                            <Button
                                                onClick={checkCloudinaryConnection}
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 px-2 text-xs text-red-600 hover:bg-red-50"
                                            >
                                                <RefreshCw className="w-3 h-3 mr-1" />
                                                Reconectar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={() => setActiveTab("create")}
                                variant={activeTab === "create" ? "default" : "outline"}
                                size="sm"
                                className={
                                    activeTab === "create"
                                        ? "bg-[#9d6a4e] hover:bg-[#b38872] text-white"
                                        : "border-[#ebcfc4] text-[#9d6a4e] hover:bg-[#f5f0ed]"
                                }
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Producto
                            </Button>
                            <Button
                                onClick={() => setActiveTab("manage")}
                                variant={activeTab === "manage" ? "default" : "outline"}
                                size="sm"
                                className={
                                    activeTab === "manage"
                                        ? "bg-[#9d6a4e] hover:bg-[#b38872] text-white"
                                        : "border-[#ebcfc4] text-[#9d6a4e] hover:bg-[#f5f0ed]"
                                }
                            >
                                <Package className="w-4 h-4 mr-2" />
                                Gestionar ({products.length})
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Message Alert */}
            {message && (
                <div className="container mx-auto px-4 pt-4">
                    <div
                        className={`flex items-center p-4 rounded-lg shadow-sm ${message.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-800"
                            : "bg-red-50 border border-red-200 text-red-800"
                            }`}
                    >
                        {message.type === "success" ? (
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        )}
                        <span className="font-medium">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="ml-auto text-current hover:opacity-70">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* 🔥 ALERTA DE CONFIGURACIÓN DE CLOUDINARY */}
            {cloudinaryStatus === "error" && (
                <div className="container mx-auto px-4 pt-4">
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                                <Settings className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-800 mb-2">⚡ Configuración de Cloudinary requerida</h3>
                                    <p className="text-red-700 mb-3">
                                        Para subir imágenes necesitas configurar Cloudinary (no Firebase). Error: {cloudinaryError}
                                    </p>
                                    <div className="bg-red-100 p-3 rounded-lg mb-3">
                                        <p className="text-sm text-red-800 font-medium mb-2">🔧 Pasos para configurar Cloudinary:</p>
                                        <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
                                            <li>
                                                Ve a <strong>cloudinary.com</strong> y crea una cuenta gratuita
                                            </li>
                                            <li>
                                                Ve a <strong>Dashboard → Settings → API Keys</strong>
                                            </li>
                                            <li>Copia: Cloud Name, API Key, API Secret</li>
                                            <li>
                                                En Railway, ve a tu proyecto → <strong>Variables</strong>
                                            </li>
                                            <li>Agrega estas variables de entorno:</li>
                                            <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                                                <li>
                                                    <code>CLOUDINARY_CLOUD_NAME=dwnjpcjhi</code>
                                                </li>
                                                <li>
                                                    <code>CLOUDINARY_API_KEY=163361771712489</code>
                                                </li>
                                                <li>
                                                    <code>CLOUDINARY_API_SECRET=tu_api_secret_aqui</code>
                                                </li>
                                            </ul>
                                            <li>
                                                Haz <strong>Redeploy</strong> en Railway
                                            </li>
                                        </ol>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <p className="text-sm text-blue-800 font-medium mb-1">☁️ ¿Por qué Cloudinary y no Firebase?</p>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• Railway tiene sistema de archivos efímero (se reinicia)</li>
                                            <li>• Cloudinary es gratuito hasta 25GB y 25,000 transformaciones/mes</li>
                                            <li>• Optimización automática de imágenes</li>
                                            <li>• CDN global para carga rápida</li>
                                            <li>• Mejor para aplicaciones en Railway/Vercel</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards - Solo en gestión */}
                {activeTab === "manage" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-[#b38872]">Total Productos</p>
                                        <p className="text-2xl font-bold text-[#9d6a4e]">{totalProducts}</p>
                                    </div>
                                    <Package className="w-8 h-8 text-[#ebcfc4]" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-[#b38872]">Productos Activos</p>
                                        <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-green-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-[#b38872]">Valor Total</p>
                                        <p className="text-2xl font-bold text-[#9d6a4e]">ARS ${totalValue.toLocaleString()}</p>
                                    </div>
                                    <ShoppingCart className="w-8 h-8 text-[#ebcfc4]" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Crear Producto */}
                {activeTab === "create" && (
                    <div className="max-w-4xl mx-auto">
                        <Card className="border-0 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-[#ebcfc4] to-[#d4b5a8] text-white">
                                <CardTitle className="flex items-center text-xl">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Crear Nuevo Producto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Información Básica */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="name" className="text-[#9d6a4e] font-medium flex items-center">
                                                    <Tag className="w-4 h-4 mr-2" />
                                                    Nombre del Producto *
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                                    placeholder="Ej: Nike Air Max 270 Hombre"
                                                    className="mt-1"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="price" className="text-[#9d6a4e] font-medium flex items-center">
                                                    <DollarSign className="w-4 h-4 mr-2" />
                                                    Precio (ARS) *
                                                </Label>
                                                <Input
                                                    id="price"
                                                    type="text"
                                                    value={formData.price === 0 ? "" : formData.price.toString()}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        const numValue = value === "" ? 0 : Number(value.replace(/[^0-9]/g, ""))
                                                        setFormData((prev) => ({ ...prev, price: numValue }))
                                                    }}
                                                    placeholder="25999"
                                                    className="mt-1"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="badge" className="text-[#9d6a4e] font-medium flex items-center">
                                                    <Star className="w-4 h-4 mr-2" />
                                                    Badge/Etiqueta
                                                </Label>
                                                <Input
                                                    id="badge"
                                                    value={formData.badge}
                                                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                                                    placeholder="Ej: Nuevo, Oferta, Premium"
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="stockCount" className="text-[#9d6a4e] font-medium flex items-center">
                                                    <Package className="w-4 h-4 mr-2" />
                                                    Cantidad en Stock
                                                </Label>
                                                <Input
                                                    id="stockCount"
                                                    type="text"
                                                    value={stockInput}
                                                    onChange={(e) => handleStockChange(e.target.value)}
                                                    placeholder="Ej: 10"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="category" className="text-[#9d6a4e] font-medium">
                                                    Categoría *
                                                </Label>
                                                <Select value={formData.category} onValueChange={handleCategoryChange}>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Seleccionar categoría" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(categoriesData).map(([category, data]) => (
                                                            <SelectItem key={category} value={category}>
                                                                <span className="flex items-center">
                                                                    <span className="mr-2">{data.icon}</span>
                                                                    {category}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="subcategory" className="text-[#9d6a4e] font-medium">
                                                    Subcategoría *
                                                </Label>
                                                <Select
                                                    value={formData.subcategory}
                                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategory: value }))}
                                                    disabled={!formData.category}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Seleccionar subcategoría" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {formData.category &&
                                                            categoriesData[formData.category as keyof typeof categoriesData]?.subcategories.map(
                                                                (subcategory) => (
                                                                    <SelectItem key={subcategory} value={subcategory}>
                                                                        {subcategory}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="inStock"
                                                    checked={formData.inStock}
                                                    onChange={(e) => setFormData((prev) => ({ ...prev, inStock: e.target.checked }))}
                                                    className="rounded border-[#ebcfc4]"
                                                />
                                                <Label htmlFor="inStock" className="text-[#9d6a4e] font-medium">
                                                    Producto disponible en stock
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Descripción con IA */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor="description" className="text-[#9d6a4e] font-medium flex items-center">
                                                <FileText className="w-4 h-4 mr-2" />
                                                Descripción
                                            </Label>
                                            <Button
                                                type="button"
                                                onClick={generateDescription}
                                                disabled={generatingDescription || !formData.name.trim()}
                                                size="sm"
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                                            >
                                                {generatingDescription ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Analizando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-4 h-4 mr-2" />
                                                        Generar con IA
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                            placeholder="Descripción detallada del producto... (o usa el botón 'Generar con IA')"
                                            className="mt-1"
                                            rows={4}
                                        />
                                    </div>

                                    {/* Talles */}
                                    <div>
                                        <Label className="text-[#9d6a4e] font-medium flex items-center">
                                            <Ruler className="w-4 h-4 mr-2" />
                                            Talles Disponibles
                                            {formData.category && (
                                                <span className="ml-2 text-sm text-gray-500">(Sugeridos para {formData.category})</span>
                                            )}
                                        </Label>

                                        {formData.category && getSuggestedSizes(formData.category).length > 0 && (
                                            <div className="mt-2 mb-3">
                                                <p className="text-sm text-gray-600 mb-2">Talles sugeridos para {formData.category}:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {getSuggestedSizes(formData.category).map((size) => (
                                                        <Button
                                                            key={size}
                                                            type="button"
                                                            onClick={() => addSuggestedSize(size)}
                                                            size="sm"
                                                            variant="outline"
                                                            className={`text-xs ${formData.sizes.includes(size)
                                                                ? "bg-[#ebcfc4] text-[#9d6a4e] border-[#ebcfc4]"
                                                                : "border-[#ebcfc4] text-[#9d6a4e] hover:bg-[#f5f0ed]"
                                                                }`}
                                                            disabled={formData.sizes.includes(size)}
                                                        >
                                                            {formData.sizes.includes(size) ? "✓ " : ""}
                                                            {size}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newSize}
                                                    onChange={(e) => setNewSize(e.target.value)}
                                                    placeholder={
                                                        formData.category === "Zapatillas"
                                                            ? "Ej: 38, 39, 40"
                                                            : formData.category === "Ropa"
                                                                ? "Ej: S, M, L"
                                                                : "Ej: Pequeño, Mediano, Grande"
                                                    }
                                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={addSize}
                                                    size="sm"
                                                    className="bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e]"
                                                    disabled={!newSize.trim()}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {formData.sizes.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.sizes.map((size, index) => (
                                                        <Badge key={index} variant="secondary" className="bg-[#f5f0ed] text-[#9d6a4e]">
                                                            {size}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSize(size)}
                                                                className="ml-2 text-red-500 hover:text-red-700"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Características */}
                                    <div>
                                        <Label className="text-[#9d6a4e] font-medium flex items-center">
                                            <Palette className="w-4 h-4 mr-2" />
                                            Características
                                        </Label>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newFeature}
                                                    onChange={(e) => setNewFeature(e.target.value)}
                                                    placeholder="Ej: Importado, Alta calidad, Garantía"
                                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={addFeature}
                                                    size="sm"
                                                    className="bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e]"
                                                    disabled={!newFeature.trim()}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            {formData.features.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.features.map((feature, index) => (
                                                        <Badge key={index} variant="secondary" className="bg-[#f5f0ed] text-[#9d6a4e]">
                                                            {feature}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFeature(feature)}
                                                                className="ml-2 text-red-500 hover:text-red-700"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 🔥 IMÁGENES CON CLOUDINARY */}
                                    <div>
                                        <Label className="text-[#9d6a4e] font-medium flex items-center">
                                            <ImageIcon className="w-4 h-4 mr-2" />
                                            Imágenes del Producto *
                                        </Label>

                                        <div className="mt-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <Cloud className="w-4 h-4 text-blue-600" />
                                                <p className="text-sm text-blue-800">
                                                    <strong>Cloudinary CDN:</strong> Las imágenes se suben a Cloudinary (no Firebase) y se
                                                    optimizan automáticamente. Compatible con Railway y otros hosts.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-2">
                                            <div
                                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${cloudinaryStatus === "connected"
                                                    ? "border-[#ebcfc4] hover:border-[#d4b5a8] bg-white"
                                                    : "border-red-300 bg-red-50"
                                                    }`}
                                            >
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    id="image-upload"
                                                    disabled={uploadingImages || cloudinaryStatus !== "connected"}
                                                />
                                                <label
                                                    htmlFor="image-upload"
                                                    className={`cursor-pointer block ${cloudinaryStatus !== "connected" ? "cursor-not-allowed" : ""}`}
                                                >
                                                    {uploadingImages ? (
                                                        <Loader2 className="w-12 h-12 mx-auto mb-3 text-[#9d6a4e] animate-spin" />
                                                    ) : cloudinaryStatus === "error" ? (
                                                        <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                                                    ) : (
                                                        <Upload className="w-12 h-12 mx-auto mb-3 text-[#9d6a4e]" />
                                                    )}
                                                    <p
                                                        className={`text-lg font-medium mb-2 ${cloudinaryStatus === "connected" ? "text-[#9d6a4e]" : "text-red-600"
                                                            }`}
                                                    >
                                                        {uploadingImages
                                                            ? "Subiendo a Cloudinary..."
                                                            : cloudinaryStatus === "error"
                                                                ? "Configuración de Cloudinary requerida"
                                                                : "Haz clic para subir imágenes"}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {cloudinaryStatus === "error"
                                                            ? "Configura Cloudinary para subir imágenes"
                                                            : "JPG, PNG, WebP, GIF - Máximo 10MB por imagen"}
                                                    </p>
                                                </label>
                                            </div>

                                            {/* Preview de imágenes */}
                                            {formData.imageUrls.length > 0 && (
                                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {formData.imageUrls.map((url, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={url || "/placeholder.svg"}
                                                                alt={`Imagen ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg border border-[#ebcfc4]"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                            {index === 0 && (
                                                                <Badge className="absolute bottom-1 left-1 text-xs bg-[#9d6a4e]">Principal</Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botones */}
                                    <div className="flex justify-between pt-6">
                                        <Button
                                            type="button"
                                            onClick={clearForm}
                                            variant="outline"
                                            className="border-[#ebcfc4] text-[#9d6a4e] hover:bg-[#f5f0ed] bg-transparent"
                                        >
                                            Limpiar
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={loading || uploadingImages || cloudinaryStatus !== "connected"}
                                            className="bg-[#9d6a4e] hover:bg-[#b38872] text-white"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Creando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Crear Producto
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Gestionar Productos */}
                {activeTab === "manage" && (
                    <div>
                        <Card className="border-0 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-[#ebcfc4] to-[#d4b5a8] text-white">
                                <CardTitle className="flex items-center text-xl">
                                    <Package className="w-5 h-5 mr-2" />
                                    Gestión de Productos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {loadingProducts ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#9d6a4e]" />
                                        <span className="ml-2 text-[#9d6a4e]">Cargando productos...</span>
                                    </div>
                                ) : products.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="w-16 h-16 mx-auto text-[#ebcfc4] mb-4" />
                                        <h3 className="text-lg font-medium text-[#9d6a4e] mb-2">No hay productos</h3>
                                        <p className="text-[#b38872] mb-4">Crea tu primer producto para comenzar</p>
                                        <Button
                                            onClick={() => setActiveTab("create")}
                                            className="bg-[#9d6a4e] hover:bg-[#b38872] text-white"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Crear Primer Producto
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {products.map((product: any) => (
                                            <Card key={product.id} className="border border-[#ebcfc4] hover:shadow-lg transition-shadow">
                                                <div className="relative">
                                                    <img
                                                        src={product.mainImage || product.images?.[0] || "/placeholder.svg?height=200&width=300"}
                                                        alt={product.name}
                                                        className="w-full h-48 object-cover rounded-t-lg"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement
                                                            target.src = "/placeholder.svg?height=200&width=300"
                                                        }}
                                                    />
                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                        <Badge
                                                            variant={product.inStock ? "default" : "secondary"}
                                                            className={product.inStock ? "bg-green-500" : "bg-gray-500"}
                                                        >
                                                            {product.inStock ? "En Stock" : "Sin Stock"}
                                                        </Badge>
                                                        {product.badge && <Badge className="bg-[#9d6a4e]">{product.badge}</Badge>}
                                                    </div>
                                                </div>
                                                <CardContent className="p-4">
                                                    <h3 className="font-semibold text-[#9d6a4e] mb-2 line-clamp-2">{product.name}</h3>
                                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-lg font-bold text-[#9d6a4e]">
                                                            ARS ${product.price?.toLocaleString()}
                                                        </span>
                                                        <span className="text-sm text-gray-500">Stock: {product.stockCount || 1}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleToggleStock(product)}
                                                            size="sm"
                                                            variant="outline"
                                                            className={`flex-1 ${product.inStock
                                                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                                                : "border-green-200 text-green-600 hover:bg-green-50"
                                                                }`}
                                                        >
                                                            {product.inStock ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                                                            {product.inStock ? "Ocultar" : "Mostrar"}
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeleteProduct(product.id, product.name)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}

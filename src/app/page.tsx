"use client"

import type React from "react"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"

import { Card, CardContent } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import { Input } from "@/components/ui/input"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Truck,
  Shield,
  CreditCard,
  MessageCircle,
  ArrowRight,
  Gem,
  Phone,
  MapPin,
  Plus,
  Loader2,
  Package,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react"

import Link from "next/link"

import { useRouter } from "next/navigation"

import { useCart } from "@/components/ui/cart-provider"

import { CartDrawer } from "@/components/ui/cart-drawer"

import { CompactNavigationMenu } from "@/components/compact-navigation-menu"

import { CategoriesCarousel } from "@/components/categories-carousel"

import { useProducts } from "@/hooks/useProducts"

import { getProductCountByCategory } from "@/lib/firestore-api"

// Importar funciones de Firestore para el PIN
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase" // Asumiendo que tienes la configuración de Firebase

interface Product {
  id: string

  name: string

  price: number

  images?: string[]

  image?: string

  mainImage?: string

  category: string

  subcategory: string

  badge?: string

  description?: string

  features?: string[]

  whatsappMessage?: string

  sizes?: string[] | null

  inStock?: boolean
}

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")

  const [isCartOpen, setIsCartOpen] = useState(false)

  const { state, dispatch } = useCart()

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({})

  const [loadingCounts, setLoadingCounts] = useState(true)

  const [countsError, setCountsError] = useState<string | null>(null)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 🔐 Estados para el PIN del panel
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState("")
  const [isVerifyingPin, setIsVerifyingPin] = useState(false)

  const router = useRouter()

  // PIN correcto
  const CORRECT_PIN = "753159"

  // 🔥 USAR HOOK DE PRODUCTOS PARA BÚSQUEDA

  const {
    products: searchResults,

    loading: searchLoading,

    error: searchError,
  } = useProducts({
    search: searchTerm || undefined,

    inStock: true,
  })

  // 🔥 USAR HOOK PARA PRODUCTOS DESTACADOS

  const {
    products: featuredProducts,

    loading: loadingFeatured,

    error: featuredError,

    refetch: refetchFeatured,
  } = useProducts({
    featured: true,

    inStock: true,
  })

  // 🔥 OBTENER CONTEOS POR CATEGORÍA (MÁS SIMPLE)

  const fetchCategoryCounts = async () => {
    try {
      setLoadingCounts(true)

      setCountsError(null)

      console.log("📊 [HomePage] Iniciando conteo de categorías...")

      const categoryNames = [
        "Joyas",

        "Perfumería",

        "Blanquería",

        "Carteras y Bolsos",

        "Juguetes y Peluches",

        "Electrodomésticos",

        "Zapatillas",

        "Ropa",

        "Ollas y Accesorios de Cocina",
      ]

      const counts: { [key: string]: number } = {}

      // Obtener conteos uno por uno para evitar problemas

      for (const categoryName of categoryNames) {
        try {
          console.log(`📊 [HomePage] Contando: ${categoryName}`)

          const count = await getProductCountByCategory(categoryName)

          counts[categoryName] = count

          console.log(`📊 [HomePage] ${categoryName}: ${count} productos`)

          // Pequeña pausa para no sobrecargar Firestore

          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.warn(`⚠️ [HomePage] Error contando ${categoryName}:`, error)

          counts[categoryName] = 0
        }
      }

      setCategoryCounts(counts)

      console.log("📊 [HomePage] Conteos completados:", counts)
    } catch (error) {
      console.error("❌ [HomePage] Error general en conteos:", error)

      setCountsError("Error al cargar conteos de categorías")

      setCategoryCounts({})
    } finally {
      setLoadingCounts(false)
    }
  }

  useEffect(() => {
    fetchCategoryCounts()
  }, [])

  // 🔐 FUNCIONES PARA EL PIN DEL PANEL

  const handlePanelClick = () => {
    setIsPinModalOpen(true)
    setPinInput("")
    setPinError("")
  }

  const handlePinSubmit = async () => {
    if (!pinInput.trim()) {
      setPinError("Por favor ingresa el PIN")
      return
    }

    if (pinInput !== CORRECT_PIN) {
      setPinError("PIN incorrecto")
      setPinInput("")
      return
    }

    setIsVerifyingPin(true)

    try {
      // Guardar el PIN en Firestore con timestamp
      const pinData = {
        pin: pinInput,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: "unknown", // En producción podrías obtener la IP del usuario
      }

      await setDoc(doc(db, "admin_access", `access_${Date.now()}`), pinData)

      // Guardar en localStorage para mantener la sesión
      localStorage.setItem("admin_authenticated", "true")
      localStorage.setItem("admin_auth_time", Date.now().toString())

      console.log("✅ PIN correcto, acceso autorizado")

      setIsPinModalOpen(false)
      router.push("/panel")
    } catch (error) {
      console.error("❌ Error guardando PIN:", error)
      setPinError("Error al verificar el PIN")
    } finally {
      setIsVerifyingPin(false)
    }
  }

  const handlePinKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePinSubmit()
    }
  }

  const closePinModal = () => {
    setIsPinModalOpen(false)
    setPinInput("")
    setPinError("")
  }

  // Categorías principales con subcategorías

  const categories = [
    {
      name: "Joyas",

      icon: "💎",

      count: categoryCounts["Joyas"] || 0,

      color: "from-[#ebcfc4] to-[#d4b5a8]",

      description: "Elegancia en cada detalle",

      subcategories: ["Anillos", "Pulseras", "Dijes", "Cadenas", "Aros", "Alianzas"],
    },

    {
      name: "Perfumería",

      icon: "🌸",

      count: categoryCounts["Perfumería"] || 0,

      color: "from-[#d4b5a8] to-[#c9a696]",

      description: "Fragancias exclusivas importadas",

      subcategories: ["Perfumes Dama", "Perfumes Hombre", "Cremas", "Maquillaje"],
    },

    {
      name: "Blanquería",

      icon: "🛏️",

      count: categoryCounts["Blanquería"] || 0,

      color: "from-[#c9a696] to-[#be9784]",

      description: "Ropa de cama y textiles premium",

      subcategories: ["Acolchados", "Sábanas", "Toallas", "Cortinas"],
    },

    {
      name: "Carteras y Bolsos",

      icon: "👜",

      count: categoryCounts["Carteras y Bolsos"] || 0,

      color: "from-[#be9784] to-[#b38872]",

      description: "Accesorios de lujo y funcionalidad",

      subcategories: ["Carteras", "Bolsos", "Mochilas", "Billeteras"],
    },

    {
      name: "Juguetes y Peluches",

      icon: "🧸",

      count: categoryCounts["Juguetes y Peluches"] || 0,

      color: "from-[#b38872] to-[#a67760]",

      description: "Diversión y entretenimiento",

      subcategories: ["Juguetes", "Peluches", "Educativos"],
    },

    {
      name: "Electrodomésticos",

      icon: "⚡",

      count: categoryCounts["Electrodomésticos"] || 0,

      color: "from-[#a67760] to-[#99664e]",

      description: "Tecnología para el hogar",

      subcategories: ["Cocina", "Limpieza", "Cuidado Personal"],
    },

    {
      name: "Zapatillas",

      icon: "👟",

      count: categoryCounts["Zapatillas"] || 0,

      color: "from-[#99664e] to-[#8c553c]",

      description: "Calzado deportivo y casual",

      subcategories: ["Hombre", "Mujer", "Niños", "Deportivas"],
    },

    {
      name: "Ropa",

      icon: "👕",

      count: categoryCounts["Ropa"] || 0,

      color: "from-[#8c553c] to-[#7f442a]",

      description: "Moda importada de calidad",

      subcategories: ["Hombre", "Mujer", "Niños", "Accesorios"],
    },

    {
      name: "Ollas y Accesorios de Cocina",

      icon: "🧑‍🍳",

      count: categoryCounts["Ollas y Accesorios de Cocina"] || 0,

      color: "from-[#7f442a] to-[#723318]",

      description: "Utensilios de cocina premium",

      subcategories: ["Ollas", "Sartenes", "Utensilios", "Vajilla"],
    },
  ]

  // Filtrar solo categorías que tienen productos

  const categoriesWithProducts = categories.filter((cat) => cat.count > 0)

  // Número de WhatsApp

  const whatsappNumber = "5491131819772"

  const handleWhatsAppClick = (product: Product) => {
    const message = encodeURIComponent(
      product.whatsappMessage || `Hola! Me interesa el producto: ${product.name}. ¿Podrías darme más información?`,
    )

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

    window.open(whatsappUrl, "_blank")
  }

  const handleGeneralWhatsApp = () => {
    const message = encodeURIComponent(
      "Hola! Me gustaría conocer más sobre sus productos importados. ¿Podrían ayudarme?",
    )

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

    window.open(whatsappUrl, "_blank")
  }

  const handleAddToCart = (product: Product) => {
    dispatch({
      type: "ADD_ITEM",

      payload: {
        id: String(product.id),

        name: product.name,

        price: product.price,

        image: product.image || product.mainImage || "/placeholder.svg",
      },
    })
  }

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)

    setCurrentImageIndex(0) // Resetear al abrir modal

    setIsProductModalOpen(true)
  }

  const handleCartCheckout = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const closeProductModal = () => {
    setIsProductModalOpen(false)

    setSelectedProduct(null)

    setCurrentImageIndex(0)
  }

  // 🖼️ FUNCIONES PARA EL CARRUSEL DE IMÁGENES

  const getProductImages = (product: Product): string[] => {
    const images: string[] = []

    // Agregar imagen principal si existe

    if (product.mainImage) {
      images.push(product.mainImage)
    }

    // Agregar imagen individual si existe y es diferente a la principal

    if (product.image && product.image !== product.mainImage) {
      images.push(product.image)
    }

    // Agregar array de imágenes si existe

    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !images.includes(img)) {
          images.push(img)
        }
      })
    }

    // Si no hay imágenes, usar placeholder

    if (images.length === 0) {
      images.push("/placeholder.svg")
    }

    return images
  }

  const nextImage = () => {
    if (selectedProduct) {
      const images = getProductImages(selectedProduct)

      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (selectedProduct) {
      const images = getProductImages(selectedProduct)

      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  // 🎯 LÓGICA DE PRODUCTOS A MOSTRAR

  const productsToShow = searchTerm ? searchResults : featuredProducts

  const isSearching = searchTerm.length > 0

  const hasSearchResults = searchResults.length > 0

  const hasFeaturedProducts = featuredProducts.length > 0

  const totalProducts = Object.values(categoryCounts).reduce((total, count) => total + count, 0)

  // Error principal a mostrar

  const mainError = isSearching ? searchError : featuredError

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f0ed] to-[#ebcfc4]">
      {/* Header */}

      <header className="bg-white/95 backdrop-blur-md border-b border-[#ebcfc4] sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}

            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#ebcfc4] to-[#d4b5a8] rounded-lg flex items-center justify-center shadow-md">
                <img src="/logo.png" alt="Moreian Multimarcas Logo" className="w-5 h-5 object-contain" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-[#9d6a4e]">Moreian Multimarcas</h1>

                <p className="text-xs text-[#b38872] leading-none">Premium</p>
              </div>
            </Link>

            {/* Navigation */}

            <nav className="hidden lg:flex items-center space-x-6">
              <Link href="/" className="text-sm text-[#9d6a4e] font-medium bg-[#f5f0ed] px-3 py-2 rounded-lg">
                Inicio
              </Link>

              <Link
                href="/productos"
                className="text-sm text-gray-700 hover:text-[#9d6a4e] font-medium transition-colors px-3 py-2 rounded-lg hover:bg-[#f5f0ed]"
              >
                Productos
              </Link>

              <CompactNavigationMenu />
            </nav>

            {/* Actions */}

            <div className="flex items-center space-x-3">
              {/* Search */}

              <div className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b38872]" />

                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 h-10 bg-[#f5f0ed] border-[#ebcfc4] focus:bg-white focus:border-[#d4b5a8]"
                  />

                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b38872] animate-spin" />
                  )}
                </div>
              </div>

              {/* Cart */}

              <Button variant="ghost" size="sm" className="relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="w-5 h-5 text-[#9d6a4e]" />

                {state.items.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-[#d4b5a8] text-xs">
                    {state.items.reduce((total, item) => total + item.quantity, 0)}
                  </Badge>
                )}
              </Button>

              {/* 🔐 Panel Button - Solo icono */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePanelClick}
                className="text-[#9d6a4e] hover:bg-[#f5f0ed]"
                title="Panel de Administración"
              >
                <Settings className="w-5 h-5" />
              </Button>

              {/* Mobile Menu */}

              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}

          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-[#ebcfc4]">
              <div className="pt-4 space-y-4">
                {/* Search Mobile */}

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b38872]" />

                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full h-10"
                  />

                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b38872] animate-spin" />
                  )}
                </div>

                {/* Navigation Links */}

                <div className="flex flex-col space-y-2">
                  <Link href="/" className="text-sm text-[#9d6a4e] font-medium py-2">
                    Inicio
                  </Link>

                  <Link href="/productos" className="text-sm text-gray-700 hover:text-[#9d6a4e] font-medium py-2">
                    Productos
                  </Link>
                </div>

                <CompactNavigationMenu onItemClick={() => setIsMenuOpen(false)} />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Solo mostrar si no hay búsqueda */}

      {!isSearching && (
        <section className="relative py-8 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-sm">
                <Gem className="w-4 h-4 mr-2 text-[#9d6a4e]" />

                <span className="text-sm font-medium text-[#9d6a4e]">Productos de Calidad Premium</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-6 text-[#9d6a4e] leading-tight">
                <span className="block">Moreian</span>

                <span className="block bg-gradient-to-r from-[#9d6a4e] to-[#b38872] bg-clip-text text-transparent">
                  Multimarcas
                </span>

                <span className="block text-2xl md:text-3xl lg:text-5xl text-[#b38872]">Productos Premium</span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-[#b38872] mb-8 leading-relaxed max-w-3xl mx-auto">
                Descubre nuestra colección exclusiva de joyas, perfumería, blanquería, carteras y mucho más. Productos
                importados directamente para ofrecerte lo mejor del mundo.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/productos">
                  <Button className="bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e] border-0 px-6 py-3 text-base font-semibold">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Explorar Productos
                  </Button>
                </Link>

                <Button
                  onClick={handleGeneralWhatsApp}
                  variant="outline"
                  className="border-[#ebcfc4] text-[#9d6a4e] hover:bg-[#f5f0ed] bg-transparent px-6 py-3 text-base font-semibold"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Consultar por WhatsApp
                </Button>
              </div>

              {/* Stats - SIN RATING */}

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-[#9d6a4e]">
                    {loadingCounts ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : countsError ? (
                      "?"
                    ) : totalProducts > 0 ? (
                      totalProducts
                    ) : (
                      "0"
                    )}
                  </div>

                  <div className="text-xs md:text-sm text-[#b38872]">Productos</div>
                </div>

                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-[#9d6a4e]">
                    {loadingCounts ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      categoriesWithProducts.length
                    )}
                  </div>

                  <div className="text-xs md:text-sm text-[#b38872]">Categorías</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features - Solo mostrar si no hay búsqueda */}

      {!isSearching && (
        <section className="py-8 bg-white/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#ebcfc4] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-6 h-6 text-[#9d6a4e]" />
                </div>

                <h3 className="text-lg font-bold text-[#9d6a4e] mb-2">Envío en el Día</h3>

                <p className="text-sm text-[#b38872]">
                  Entrega el mismo día en Moreno y alrededores. Rápido y confiable para que recibas tus productos al
                  instante.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-[#ebcfc4] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-[#9d6a4e]" />
                </div>

                <h3 className="text-lg font-bold text-[#9d6a4e] mb-2">Garantía Total</h3>

                <p className="text-sm text-[#b38872]">
                  Productos de calidad garantizada. 30 días para devoluciones sin preguntas.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-[#ebcfc4] rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-[#9d6a4e]" />
                </div>

                <h3 className="text-lg font-bold text-[#9d6a4e] mb-2">Pago Fácil</h3>

                <p className="text-sm text-[#b38872]">
                  Pago por transferencia bancaria. Te enviamos el alias al consultar por WhatsApp. Simple y seguro.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Carousel */}

      {!isSearching && !loadingCounts && categoriesWithProducts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-[#9d6a4e]">Explora por Categorías</h2>

              <p className="text-base md:text-lg text-[#b38872] max-w-2xl mx-auto">
                Encuentra exactamente lo que buscas en nuestras categorías disponibles
              </p>
            </div>

            <CategoriesCarousel categories={categoriesWithProducts} />
          </div>
        </section>
      )}

      {/* Products Section */}

      <section className="py-12 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center bg-[#f5f0ed] rounded-full px-4 py-2 mb-4">
              <Gem className="w-4 h-4 mr-2 text-[#9d6a4e]" />

              <span className="text-sm font-medium text-[#9d6a4e]">
                {isSearching ? "Resultados de Búsqueda" : "Productos Destacados"}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-[#9d6a4e]">
              {isSearching ? `Resultados para "${searchTerm}"` : "Nuestros Productos"}
            </h2>

            <p className="text-base md:text-lg text-[#b38872] max-w-2xl mx-auto">
              {isSearching
                ? `Encontramos ${productsToShow.length} producto${productsToShow.length !== 1 ? "s" : ""} que coinciden con tu búsqueda`
                : hasFeaturedProducts
                  ? "Una selección de nuestros mejores productos disponibles"
                  : "Próximamente tendremos productos disponibles para ti"}
            </p>
          </div>

          {/* Loading State */}

          {(searchLoading && isSearching) || (!isSearching && loadingFeatured) ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#9d6a4e]" />

              <p className="text-[#b38872]">
                {isSearching ? "Buscando productos..." : "Cargando productos destacados..."}
              </p>
            </div>
          ) : (
            <>
              {/* Error State */}

              {mainError && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚠️</div>

                  <h3 className="text-2xl font-bold text-red-600 mb-2">Error al cargar productos</h3>

                  <p className="text-red-700 mb-6 max-w-2xl mx-auto">{mainError}</p>

                  {/* Información de debugging */}

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto text-left">
                    <h4 className="font-semibold text-gray-800 mb-2">🔧 Información de Debug:</h4>

                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• Abre la consola del navegador (F12) para ver más detalles</li>

                      <li>• El índice está creado en Firebase Console</li>

                      <li>• Verifica que los productos existan en Firestore</li>

                      <li>• Intenta recargar la página</li>
                    </ul>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e]"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Recargar Página
                    </Button>

                    <Button
                      onClick={isSearching ? () => setSearchTerm("") : refetchFeatured}
                      variant="outline"
                      className="border-[#ebcfc4] text-[#9d6a4e] hover:bg-[#f5f0ed]"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reintentar
                    </Button>
                  </div>
                </div>
              )}

              {/* Products Grid - IMÁGENES MEJORADAS */}

              {!mainError && productsToShow.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {productsToShow.map((product: any) => {
                    const productImages = getProductImages(product)

                    return (
                      <Card
                        key={product.id}
                        className="hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group transform hover:scale-105"
                      >
                        <CardContent className="p-0">
                          {/* 🖼️ CONTENEDOR DE IMAGEN MEJORADO */}

                          <div className="relative overflow-hidden bg-white">
                            <div className="w-full h-56 flex items-center justify-center p-4">
                              <img
                                src={productImages[0] || "/placeholder.svg"}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                onClick={() => handleViewDetails(product)}
                              />
                            </div>

                            {/* Indicador de múltiples imágenes */}

                            {productImages.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                +{productImages.length - 1} fotos
                              </div>
                            )}

                            <div className="absolute top-3 left-3">
                              <Badge className="bg-gradient-to-r from-[#ebcfc4] to-[#d4b5a8] text-white border-0 px-2 py-1 text-xs font-semibold">
                                {product.badge || "Producto"}
                              </Badge>
                            </div>
                          </div>

                          <div className="p-4">
                            <div className="mb-2">
                              <Badge variant="secondary" className="text-xs bg-[#f5f0ed] text-[#9d6a4e] font-medium">
                                {product.category}
                              </Badge>

                              <div className="text-xs text-gray-500 mt-1">{product.subcategory}</div>
                            </div>

                            <h3 className="font-bold text-base mb-3 text-[#9d6a4e] group-hover:text-[#b38872] transition-colors line-clamp-2">
                              {product.name}
                            </h3>

                            {/* Mostrar talles si existen */}

                            {product.sizes && product.sizes.length > 0 && (
                              <div className="mb-2">
                                <div className="text-xs text-gray-600 mb-1">Talles:</div>

                                <div className="flex flex-wrap gap-1">
                                  {product.sizes.slice(0, 3).map((size: string) => (
                                    <span
                                      key={size}
                                      className="text-xs bg-[#f5f0ed] text-[#9d6a4e] px-2 py-0.5 rounded"
                                    >
                                      {size}
                                    </span>
                                  ))}

                                  {product.sizes.length > 3 && (
                                    <span className="text-xs text-gray-400">+{product.sizes.length - 3}</span>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <span className="text-xl font-bold text-[#9d6a4e]">
                                  ARS ${product.price.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAddToCart(product)}
                                className="flex-1 bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e] border-0 py-2 text-sm font-semibold h-9"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar
                              </Button>

                              <Button
                                onClick={() => handleWhatsAppClick(product)}
                                className="bg-green-500 hover:bg-green-600 text-white border-0 py-2 px-3 h-9"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* No Results - Búsqueda */}

              {!searchLoading && isSearching && !hasSearchResults && !searchError && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>

                  <h3 className="text-2xl font-bold text-[#9d6a4e] mb-2">No se encontraron productos</h3>

                  <p className="text-[#b38872] mb-6">
                    No hay productos que coincidan con "{searchTerm}". Intenta con otros términos de búsqueda.
                  </p>

                  <Button onClick={() => setSearchTerm("")} className="bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e]">
                    Limpiar búsqueda
                  </Button>
                </div>
              )}

              {/* No Products - Sin búsqueda */}

              {!loadingFeatured && !isSearching && !hasFeaturedProducts && !featuredError && (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6">📦</div>

                  <h3 className="text-3xl font-bold text-[#9d6a4e] mb-4">¡Próximamente!</h3>

                  <p className="text-lg text-[#b38872] mb-8 max-w-2xl mx-auto leading-relaxed">
                    Estamos preparando una increíble selección de productos premium para ti. Muy pronto tendrás acceso a
                    joyas, perfumería, blanquería y mucho más.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handleGeneralWhatsApp}
                      className="bg-green-500 hover:bg-green-600 text-white border-0 px-6 py-3 text-base font-semibold"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Consultar Disponibilidad
                    </Button>

                    <Button
                      variant="outline"
                      className="border-[#ebcfc4] text-[#9d6a4e] hover:bg-[#f5f0ed] bg-transparent px-6 py-3 text-base font-semibold"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Notificarme cuando lleguen
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Ver Todos los Productos */}

          {!isSearching && hasFeaturedProducts && !featuredError && (
            <div className="text-center mt-10">
              <Link href="/productos">
                <Button className="bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e] border-0 px-6 py-3 text-base font-semibold">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ver Todos los Productos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA - Solo mostrar si no hay búsqueda */}

      {!isSearching && (
        <section className="py-12 bg-gradient-to-r from-[#ebcfc4] to-[#d4b5a8]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <MessageCircle className="w-4 h-4 mr-2 text-white" />

                <span className="text-sm font-medium text-white">Atención Personalizada</span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white">
                ¿Tienes Preguntas?
                <span className="block text-xl md:text-2xl lg:text-3xl">¡Contáctanos!</span>
              </h2>

              <p className="text-base md:text-lg text-white/90 mb-8 leading-relaxed">
                Estamos aquí para ayudarte. Contáctanos por WhatsApp para consultas sobre productos, envíos,
                disponibilidad o cualquier duda que tengas. Te respondemos al instante.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleGeneralWhatsApp}
                  className="bg-green-500 hover:bg-green-600 text-white border-0 px-6 py-3 text-base font-semibold"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contactar por WhatsApp
                </Button>

                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#9d6a4e] px-6 py-3 text-base font-semibold bg-transparent"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Ver Teléfono
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Brand */}

            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#ebcfc4] to-[#d4b5a8] rounded-xl flex items-center justify-center">
                  <img src="/logo.png" alt="Moreian Multimarcas Logo" className="w-6 h-6 object-contain" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">Moreian Multimarcas</h3>

                  <p className="text-sm text-[#ebcfc4]">Productos Premium</p>
                </div>
              </div>

              <p className="text-gray-400 mb-4 leading-relaxed">
                Tu tienda de confianza para productos importados de calidad premium.
              </p>
            </div>

            {/* Categories - Columna 1 */}

            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Categorías</h4>

              <ul className="space-y-2">
                <li>
                  <Link
                    href="/productos?category=Joyas"
                    className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                  >
                    Joyas
                  </Link>
                </li>

                <li>
                  <Link
                    href="/productos?category=Perfumería"
                    className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                  >
                    Perfumería
                  </Link>
                </li>

                <li>
                  <Link
                    href="/productos?category=Blanquería"
                    className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                  >
                    Blanquería
                  </Link>
                </li>

                <li>
                  <Link
                    href="/productos?category=Carteras y Bolsos"
                    className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                  >
                    Carteras y Bolsos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories - Columna 2 */}

            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Más Categorías</h4>

              <ul className="space-y-2">
                <li>
                  <Link
                    href="/productos?category=Juguetes y Peluches"
                    className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                  >
                    Juguetes y Peluches
                  </Link>
                </li>

                <li>
                  <Link
                    href="/productos?category=Electrodomésticos"
                    className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                  >
                    Electrodomésticos
                  </Link>
                </li>

                <li>
                  <Link
                    href="/productos?category=Zapatillas"
                    className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                  >
                    Zapatillas
                  </Link>
                </li>

                <li>
                  <Link
                    href="/productos?category=Ropa"
                    className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                  >
                    Ropa
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}

            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Contacto</h4>

              <ul className="space-y-2">
                <li className="flex items-center text-gray-400">
                  <MessageCircle className="w-4 h-4 mr-2" />

                  <span>WhatsApp: +54 9 11 3181-9772</span>
                </li>

                <li className="flex items-center text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />

                  <span>Moreno, Buenos Aires</span>
                </li>
              </ul>

              <Button
                onClick={handleGeneralWhatsApp}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white border-0 w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contactar
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400">
              © 2024 Moreian Multimarcas. Todos los derechos reservados. Productos importados de calidad premium.
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        whatsappNumber={whatsappNumber}
        onCheckoutSuccess={handleCartCheckout}
      />

      {/* 🔐 MODAL DEL PIN */}
      <Dialog open={isPinModalOpen} onOpenChange={closePinModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#9d6a4e]">
              <Lock className="w-5 h-5" />
              Acceso al Panel de Administración
            </DialogTitle>
            <DialogDescription>Ingresa el PIN de administrador para acceder al panel de control.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium text-gray-700">
                PIN de Administrador
              </label>
              <Input
                id="pin"
                type="password"
                placeholder="Ingresa el PIN"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value)
                  setPinError("")
                }}
                onKeyPress={handlePinKeyPress}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                disabled={isVerifyingPin}
              />
              {pinError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  {pinError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={closePinModal}
                variant="outline"
                className="flex-1 bg-transparent"
                disabled={isVerifyingPin}
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePinSubmit}
                className="flex-1 bg-[#9d6a4e] hover:bg-[#b38872]"
                disabled={isVerifyingPin || !pinInput.trim()}
              >
                {isVerifyingPin ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Acceder
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">Solo el administrador puede acceder a esta sección</div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🖼️ MODAL DE PRODUCTO CON CARRUSEL DE IMÁGENES */}

      {isProductModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-[#9d6a4e]">{selectedProduct.name}</h2>

                <Button variant="ghost" size="sm" onClick={closeProductModal}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 🖼️ CARRUSEL DE IMÁGENES */}

                <div className="space-y-4">
                  {/* Imagen Principal */}

                  <div className="relative bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-center h-96">
                      <img
                        src={getProductImages(selectedProduct)[currentImageIndex] || "/placeholder.svg"}
                        alt={`${selectedProduct.name} - Imagen ${currentImageIndex + 1}`}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>

                    {/* Controles del carrusel - Solo mostrar si hay más de 1 imagen */}

                    {getProductImages(selectedProduct).length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>

                        {/* Contador de imágenes */}

                        <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                          {currentImageIndex + 1} / {getProductImages(selectedProduct).length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Miniaturas - Solo mostrar si hay más de 1 imagen */}

                  {getProductImages(selectedProduct).length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {getProductImages(selectedProduct).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                            ? "border-[#9d6a4e] ring-2 ring-[#9d6a4e]/20"
                            : "border-gray-200 hover:border-[#9d6a4e]/50"
                            }`}
                        >
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`${selectedProduct.name} - Miniatura ${index + 1}`}
                            className="w-full h-full object-contain p-1"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Información del Producto */}

                <div className="space-y-6">
                  <div>
                    <Badge className="bg-[#f5f0ed] text-[#9d6a4e] mb-2">{selectedProduct.category}</Badge>

                    <div className="text-sm text-gray-600">{selectedProduct.subcategory}</div>
                  </div>

                  <div className="text-3xl font-bold text-[#9d6a4e]">ARS ${selectedProduct.price.toLocaleString()}</div>

                  {selectedProduct.description && (
                    <div>
                      <h4 className="font-semibold text-[#9d6a4e] mb-2">Descripción</h4>

                      <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                    </div>
                  )}

                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[#9d6a4e] mb-3">Talles Disponibles</h4>

                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((size: string) => (
                          <span
                            key={size}
                            className="bg-[#f5f0ed] text-[#9d6a4e] px-4 py-2 rounded-lg text-sm font-medium border border-[#ebcfc4]"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProduct.features && selectedProduct.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[#9d6a4e] mb-3">Características</h4>

                      <ul className="space-y-2">
                        {selectedProduct.features.map((feature: string, index: number) => (
                          <li key={index} className="text-gray-700 flex items-start">
                            <span className="text-[#9d6a4e] mr-3 mt-1">•</span>

                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Información de envío */}

                  <div className="bg-[#f5f0ed] rounded-lg p-4">
                    <h4 className="font-semibold text-[#9d6a4e] mb-3">Información de Envío</h4>

                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-[#9d6a4e]" />
                        Envío en el día en Moreno y alrededores
                      </li>

                      <li className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-[#9d6a4e]" />
                        Garantía de 30 días
                      </li>

                      <li className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-[#9d6a4e]" />
                        Pago por transferencia bancaria
                      </li>
                    </ul>
                  </div>

                  {/* Botones de acción */}

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={() => {
                        handleAddToCart(selectedProduct)

                        closeProductModal()
                      }}
                      className="flex-1 bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e] border-0 py-3 text-lg font-semibold"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Agregar al Carrito
                    </Button>

                    <Button
                      onClick={() => {
                        handleWhatsAppClick(selectedProduct)

                        closeProductModal()
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white border-0 py-3 px-6 text-lg font-semibold"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

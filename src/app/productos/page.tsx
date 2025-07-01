"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Search, Menu, X, MessageCircle, Plus, Filter, Loader2, MapPin } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/components/ui/cart-provider"
import { CartDrawer } from "@/components/ui/cart-drawer"
import { useSearchParams } from "next/navigation"
import { useProducts } from "@/hooks/useProducts"

export default function ProductsPage() {
    const searchParams = useSearchParams()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("Todas")
    const [selectedSubcategory, setSelectedSubcategory] = useState("Todas")
    const [selectedSize, setSelectedSize] = useState("Todos")
    const [isCartOpen, setIsCartOpen] = useState(false)
    const { state, dispatch } = useCart()
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)

    // 🔥 USAR HOOK DE PRODUCTOS CON FIRESTORE
    const { products, availableSizes, loading, error } = useProducts({
        category: selectedCategory !== "Todas" ? selectedCategory : undefined,
        subcategory: selectedSubcategory !== "Todas" ? selectedSubcategory : undefined,
        size: selectedSize !== "Todos" ? selectedSize : undefined,
        search: searchTerm || undefined,
        inStock: true,
    })

    // Obtener parámetros de la URL
    const urlCategory = searchParams.get("categoria")
    const urlSubcategory = searchParams.get("subcategoria")

    // Efecto para actualizar filtros basado en URL
    useEffect(() => {
        if (urlCategory) {
            const categoryMap: { [key: string]: string } = {
                joyas: "Joyas",
                perfumeria: "Perfumería",
                blanqueria: "Blanquería",
                "carteras-bolsos": "Carteras y Bolsos",
                "juguetes-peluches": "Juguetes y Peluches",
                electrodomesticos: "Electrodomésticos",
                zapatillas: "Zapatillas",
                ropa: "Ropa",
                "ollas-cocina": "Ollas y Accesorios de Cocina",
            }
            setSelectedCategory(categoryMap[urlCategory] || "Todas")
        }

        if (urlSubcategory) {
            const subcategoryMap: { [key: string]: string } = {
                anillos: "Anillos",
                pulseras: "Pulseras",
                "perfumes-dama": "Perfumes Dama",
                "perfumes-hombre": "Perfumes Hombre",
                sabanas: "Sábanas",
                hombre: "Hombre",
                mujer: "Mujer",
                ninos: "Niños",
                carteras: "Carteras",
                juguetes: "Juguetes",
            }
            setSelectedSubcategory(subcategoryMap[urlSubcategory] || "Todas")
        }
    }, [urlCategory, urlSubcategory])

    // 📱 NÚMERO DE WHATSAPP ACTUALIZADO
    const whatsappNumber = "5491123255540"

    const handleWhatsAppClick = (product: any) => {
        const message = encodeURIComponent(
            product.whatsappMessage || `Hola! Me interesa el producto: ${product.name}. ¿Podrías darme más información?`,
        )
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
        window.open(whatsappUrl, "_blank")
    }

    const handleAddToCart = (product: any) => {
        dispatch({
            type: "ADD_ITEM",
            payload: {
                id: String(product.id),
                name: product.name,
                price: product.price,
                image: product.mainImage || product.images?.[0] || "/placeholder.svg",
            },
        })
    }

    const handleViewDetails = (product: any) => {
        setSelectedProduct(product)
        setIsProductModalOpen(true)
    }

    const handleCartCheckout = () => {
        dispatch({ type: "CLEAR_CART" })
    }

    const closeProductModal = () => {
        setIsProductModalOpen(false)
        setSelectedProduct(null)
    }

    // Obtener categorías únicas de los productos
    const uniqueCategories = ["Todas", ...Array.from(new Set(products.map((p: any) => p.category)))]

    // Obtener subcategorías únicas para la categoría seleccionada
    const uniqueSubcategories =
        selectedCategory === "Todas"
            ? ["Todas", ...Array.from(new Set(products.map((p: any) => p.subcategory)))]
            : [
                "Todas",
                ...Array.from(
                    new Set(products.filter((p: any) => p.category === selectedCategory).map((p: any) => p.subcategory)),
                ),
            ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f0ed] to-[#ebcfc4]">
            {/* Header Optimizado */}
            <header className="bg-white/95 backdrop-blur-md border-b border-[#ebcfc4] sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 py-2">
                    <div className="flex items-center justify-between">
                        {/* Logo Compacto */}
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#ebcfc4] to-[#d4b5a8] rounded-lg flex items-center justify-center">
                                <img src="/logo.png" alt="Moreian Multimarcas Logo" className="w-5 h-5 object-contain" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold text-[#9d6a4e]">Moreian Multimarcas</h1>
                            </div>
                        </Link>

                        {/* Desktop Navigation Compacta */}
                        <nav className="hidden md:flex items-center space-x-4">
                            <Link
                                href="/"
                                className="text-sm text-gray-700 hover:text-[#9d6a4e] font-medium transition-colors px-2 py-1 rounded hover:bg-[#f5f0ed]"
                            >
                                Inicio
                            </Link>
                            <Link href="/productos" className="text-sm text-[#9d6a4e] font-medium bg-[#f5f0ed] px-2 py-1 rounded">
                                Productos
                            </Link>
                        </nav>

                        {/* Search y Actions Compactos */}
                        <div className="flex items-center space-x-2">
                            {/* Search Desktop */}
                            <div className="hidden lg:flex items-center">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#b38872]" />
                                    <Input
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-7 w-48 h-8 text-sm bg-[#f5f0ed] border-[#ebcfc4] focus:bg-white focus:border-[#d4b5a8]"
                                    />
                                </div>
                            </div>

                            {/* Cart Button */}
                            <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0" onClick={() => setIsCartOpen(true)}>
                                <ShoppingCart className="w-4 h-4 text-[#9d6a4e]" />
                                {state.items.length > 0 && (
                                    <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-[#d4b5a8] text-xs">
                                        {state.items.reduce((total, item) => total + item.quantity, 0)}
                                    </Badge>
                                )}
                            </Button>

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden h-8 w-8 p-0"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu Compacto */}
                    {isMenuOpen && (
                        <div className="md:hidden mt-2 pb-2 border-t border-[#ebcfc4]">
                            <nav className="flex flex-col space-y-2 mt-2">
                                <Link href="/" className="text-sm text-gray-700 hover:text-[#9d6a4e] font-medium py-1">
                                    Inicio
                                </Link>
                                <Link href="/productos" className="text-sm text-[#9d6a4e] font-medium py-1">
                                    Productos
                                </Link>
                                {/* Search Mobile */}
                                <div className="pt-2">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#b38872]" />
                                        <Input
                                            placeholder="Buscar productos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-7 w-full h-8 text-sm"
                                        />
                                    </div>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Page Header Compacto */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#9d6a4e]">Productos</h1>
                    <p className="text-sm md:text-base text-[#b38872]">Descubre nuestra colección completa</p>
                </div>

                {/* Filtros Optimizados */}
                <div className="mb-6">
                    <div className="flex items-center mb-3">
                        <Filter className="w-4 h-4 mr-2 text-[#9d6a4e]" />
                        <h3 className="text-base font-semibold text-[#9d6a4e]">Filtros</h3>
                    </div>

                    {/* Category Filter Compacto */}
                    <div className="mb-3">
                        <h4 className="text-xs font-medium text-[#9d6a4e] mb-2">Categoría</h4>
                        <div className="flex flex-wrap gap-1">
                            {uniqueCategories.map((category) => (
                                <Button
                                    key={category}
                                    onClick={() => {
                                        setSelectedCategory(category)
                                        setSelectedSubcategory("Todas")
                                        setSelectedSize("Todos")
                                    }}
                                    variant={selectedCategory === category ? "default" : "outline"}
                                    size="sm"
                                    className={`h-7 px-2 text-xs ${selectedCategory === category
                                            ? "bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e] border-0"
                                            : "border-[#ebcfc4] text-[#9d6a4e] hover:bg-[#f5f0ed] bg-transparent"
                                        }`}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Subcategory Filter Compacto */}
                    {selectedCategory !== "Todas" && (
                        <div className="mb-3">
                            <h4 className="text-xs font-medium text-[#9d6a4e] mb-2">Subcategoría</h4>
                            <div className="flex flex-wrap gap-1">
                                {uniqueSubcategories.map((subcategory) => (
                                    <Button
                                        key={subcategory}
                                        onClick={() => {
                                            setSelectedSubcategory(subcategory)
                                            setSelectedSize("Todos")
                                        }}
                                        variant={selectedSubcategory === subcategory ? "default" : "outline"}
                                        size="sm"
                                        className={`h-7 px-2 text-xs ${selectedSubcategory === subcategory
                                                ? "bg-[#d4b5a8] hover:bg-[#c9a696] text-white border-0"
                                                : "border-[#d4b5a8] text-[#9d6a4e] hover:bg-[#f5f0ed] bg-transparent"
                                            }`}
                                    >
                                        {subcategory}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Filter Compacto */}
                    {availableSizes.length > 0 && (
                        <div className="mb-3">
                            <h4 className="text-xs font-medium text-[#9d6a4e] mb-2">
                                Talles Disponibles
                                <span className="text-xs text-gray-400 ml-1">(En stock)</span>
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                <Button
                                    onClick={() => setSelectedSize("Todos")}
                                    variant={selectedSize === "Todos" ? "default" : "outline"}
                                    size="sm"
                                    className={`h-7 px-2 text-xs ${selectedSize === "Todos"
                                            ? "bg-[#c9a696] hover:bg-[#be9784] text-white border-0"
                                            : "border-[#c9a696] text-[#9d6a4e] hover:bg-[#f5f0ed] bg-transparent"
                                        }`}
                                >
                                    Todos
                                </Button>
                                {availableSizes.map((size) => (
                                    <Button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        variant={selectedSize === size ? "default" : "outline"}
                                        size="sm"
                                        className={`h-7 px-2 text-xs ${selectedSize === size
                                                ? "bg-[#c9a696] hover:bg-[#be9784] text-white border-0"
                                                : "border-[#c9a696] text-[#9d6a4e] hover:bg-[#f5f0ed] bg-transparent"
                                            }`}
                                    >
                                        {size}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Products Count Compacto */}
                <div className="mb-4">
                    <p className="text-sm text-[#b38872]">
                        {loading ? (
                            <span className="flex items-center">
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Cargando...
                            </span>
                        ) : (
                            <>
                                {products.length} producto{products.length !== 1 ? "s" : ""}
                                {selectedCategory !== "Todas" && ` en ${selectedCategory}`}
                                {selectedSubcategory !== "Todas" && ` - ${selectedSubcategory}`}
                                {selectedSize !== "Todos" && ` - Talle ${selectedSize}`}
                                {searchTerm && ` para "${searchTerm}"`}
                            </>
                        )}
                    </p>
                </div>

                {/* Error State */}
                {error && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">❌</div>
                        <h3 className="text-2xl font-bold text-red-600 mb-2">Error al cargar productos</h3>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={() => window.location.reload()} className="bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e]">
                            Reintentar
                        </Button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-0">
                                    <div className="bg-gray-200 h-64 rounded-t-lg"></div>
                                    <div className="p-6">
                                        <div className="bg-gray-200 h-4 rounded mb-2"></div>
                                        <div className="bg-gray-200 h-6 rounded mb-4"></div>
                                        <div className="bg-gray-200 h-8 rounded"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product: any) => (
                            <Card
                                key={product.id}
                                className="hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group transform hover:scale-105"
                            >
                                <CardContent className="p-0">
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={product.mainImage || product.images?.[0] || "/placeholder.svg"}
                                            alt={product.name}
                                            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                                            onClick={() => handleViewDetails(product)}
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-gradient-to-r from-[#ebcfc4] to-[#d4b5a8] text-white border-0 px-3 py-1 text-sm font-semibold">
                                                {product.badge}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="mb-3">
                                            <Badge variant="secondary" className="text-xs bg-[#f5f0ed] text-[#9d6a4e] font-medium">
                                                {product.category}
                                            </Badge>
                                            <div className="text-xs text-gray-500 mt-1">{product.subcategory}</div>
                                        </div>

                                        <h3 className="font-bold text-lg mb-3 text-[#9d6a4e] group-hover:text-[#b38872] transition-colors line-clamp-2">
                                            {product.name}
                                        </h3>

                                        {/* 🔥 MOSTRAR TALLES DINÁMICOS DESDE FIRESTORE */}
                                        {product.sizes && product.sizes.length > 0 && (
                                            <div className="mb-3">
                                                <div className="text-xs text-gray-600 mb-1">Talles disponibles:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {product.sizes.slice(0, 4).map((size: string) => (
                                                        <span key={size} className="text-xs bg-[#f5f0ed] text-[#9d6a4e] px-2 py-1 rounded">
                                                            {size}
                                                        </span>
                                                    ))}
                                                    {product.sizes.length > 4 && (
                                                        <span className="text-xs text-gray-400">+{product.sizes.length - 4} más</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <span className="text-2xl font-bold text-[#9d6a4e]">ARS ${product.price.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleAddToCart(product)}
                                                className="flex-1 bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e] border-0 py-2 text-sm font-semibold"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Agregar
                                            </Button>
                                            <Button
                                                onClick={() => handleWhatsAppClick(product)}
                                                className="bg-green-500 hover:bg-green-600 text-white border-0 py-2 px-3"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-[#9d6a4e] mb-2">No se encontraron productos</h3>
                        <p className="text-[#b38872] mb-6">
                            {searchTerm
                                ? `No hay productos que coincidan con "${searchTerm}" en ${selectedCategory === "Todas" ? "ninguna categoría" : selectedCategory}`
                                : `No hay productos disponibles en la categoría ${selectedCategory}`}
                            {selectedSize !== "Todos" && ` con talle ${selectedSize}`}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => setSearchTerm("")} className="bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e]">
                                Limpiar búsqueda
                            </Button>
                            <Button
                                onClick={() => {
                                    setSelectedCategory("Todas")
                                    setSelectedSubcategory("Todas")
                                    setSelectedSize("Todos")
                                }}
                                variant="outline"
                                className="border-[#ebcfc4] text-[#9d6a4e] hover:bg-[#f5f0ed] bg-transparent"
                            >
                                Ver todas las categorías
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Details Modal */}
            {isProductModalOpen && selectedProduct && (
                <>
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={closeProductModal} />
                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="sticky top-0 bg-white border-b border-[#ebcfc4] p-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-[#9d6a4e]">Detalles del Producto</h2>
                                <Button variant="ghost" size="sm" onClick={closeProductModal}>
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <div className="p-6">
                                {/* Main Image */}
                                <div className="mb-6">
                                    <img
                                        src={selectedProduct.mainImage || selectedProduct.images?.[0] || "/placeholder.svg"}
                                        alt={selectedProduct.name}
                                        className="w-full h-80 object-cover rounded-xl"
                                    />
                                </div>

                                {/* Thumbnail Images */}
                                {selectedProduct.images && selectedProduct.images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-3 mb-6">
                                        {selectedProduct.images.map((image: string, index: number) => (
                                            <img
                                                key={index}
                                                src={image || "/placeholder.svg"}
                                                alt={`${selectedProduct.name} ${index + 1}`}
                                                className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-[#9d6a4e]"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Product Info */}
                                <div className="text-center mb-6">
                                    <div className="mb-2">
                                        <Badge variant="secondary" className="text-xs bg-[#f5f0ed] text-[#9d6a4e] font-medium mr-2">
                                            {selectedProduct.category}
                                        </Badge>
                                        <span className="text-xs text-gray-500">{selectedProduct.subcategory}</span>
                                    </div>
                                    <h1 className="text-2xl font-bold mb-3 text-[#9d6a4e]">{selectedProduct.name}</h1>

                                    {/* 🔥 MOSTRAR TALLES DISPONIBLES EN MODAL DESDE FIRESTORE */}
                                    {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-[#9d6a4e] mb-2">Talles disponibles:</h4>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {selectedProduct.sizes.map((size: string) => (
                                                    <span
                                                        key={size}
                                                        className="bg-[#f5f0ed] text-[#9d6a4e] px-3 py-1 rounded-lg text-sm font-medium border border-[#ebcfc4]"
                                                    >
                                                        {size}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="text-3xl font-bold text-[#9d6a4e] mb-2">
                                        ARS ${selectedProduct.price.toLocaleString()}
                                    </div>
                                    <p className="text-sm text-gray-600">Precio en pesos argentinos</p>
                                </div>

                                {/* Shipping Info */}
                                <div className="bg-[#f5f0ed] rounded-lg p-4 mb-6">
                                    <h4 className="font-semibold text-[#9d6a4e] mb-3 text-center">Información de Envío</h4>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li className="flex items-center justify-center">
                                            <span className="mr-2">🚚</span>
                                            Envío en el día en Moreno y alrededores
                                        </li>
                                        <li className="flex items-center justify-center">
                                            <span className="mr-2">🛡️</span>
                                            Garantía de 30 días
                                        </li>
                                        <li className="flex items-center justify-center">
                                            <span className="mr-2">💳</span>
                                            Pago por transferencia bancaria
                                        </li>
                                    </ul>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <Button
                                        onClick={() => {
                                            handleAddToCart(selectedProduct)
                                            closeProductModal()
                                        }}
                                        className="w-full bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e] border-0 py-3 text-lg font-semibold"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Agregar al Carrito
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleWhatsAppClick(selectedProduct)
                                            closeProductModal()
                                        }}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white border-0 py-3 text-lg font-semibold"
                                    >
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Consultar por WhatsApp
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
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
                                        href="/productos?categoria=joyas"
                                        className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                                    >
                                        Joyas
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/productos?categoria=perfumeria"
                                        className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                                    >
                                        Perfumería
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/productos?categoria=blanqueria"
                                        className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                                    >
                                        Blanquería
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/productos?categoria=carteras-bolsos"
                                        className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                                    >
                                        Carteras y Bolsos
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/productos?categoria=juguetes-peluches"
                                        className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                                    >
                                        Juguetes y Peluches
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
                                        href="/productos?categoria=electrodomesticos"
                                        className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                                    >
                                        Electrodomésticos
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/productos?categoria=zapatillas"
                                        className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                                    >
                                        Zapatillas
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/productos?categoria=ropa"
                                        className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                                    >
                                        Ropa
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/productos?categoria=ollas-cocina"
                                        className="text-gray-400 hover:text-[#ebcfc4] transition-colors"
                                    >
                                        Ollas y Cocina
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-bold text-lg mb-4 text-white">Contacto</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-center">
                                    <MessageCircle className="w-5 h-5 mr-3 text-green-400" />
                                    <div>
                                        <div className="font-medium text-white">WhatsApp</div>
                                        <div className="text-sm">+54 9 11 2325-5540</div>
                                    </div>
                                </li>
                                <li className="flex items-center">
                                    <MapPin className="w-5 h-5 mr-3 text-[#ebcfc4]" />
                                    <div>
                                        <div className="font-medium text-white">Ubicación</div>
                                        <div className="text-sm">Moreno, Buenos Aires</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-6">
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">© 2024 Moreian Multimarcas. Todos los derechos reservados.</p>
                        </div>
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
        </div>
    )
}

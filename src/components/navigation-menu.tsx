"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import Link from "next/link"

interface SubCategory {
    name: string
    slug: string
    count?: number
    sizes?: string[] // Para zapatillas y ropa
}

interface Category {
    name: string
    slug: string
    icon: string
    subcategories: SubCategory[]
}

const categories: Category[] = [
    {
        name: "Joyas",
        slug: "joyas",
        icon: "💎",
        subcategories: [
            { name: "Anillos", slug: "anillos", count: 45 },
            { name: "Pulseras", slug: "pulseras", count: 32 },
            { name: "Dijes", slug: "dijes", count: 28 },
            { name: "Cadenas", slug: "cadenas", count: 38 },
            { name: "Aros", slug: "aros", count: 42 },
            { name: "Alianzas", slug: "alianzas", count: 15 },
            { name: "Relojes", slug: "relojes", count: 25 },
        ],
    },
    {
        name: "Perfumería",
        slug: "perfumeria",
        icon: "🌸",
        subcategories: [
            { name: "Perfumes Dama", slug: "perfumes-dama", count: 65 },
            { name: "Perfumes Hombre", slug: "perfumes-hombre", count: 48 },
            { name: "Cremas Corporales", slug: "cremas-corporales", count: 35 },
            { name: "Cremas Faciales", slug: "cremas-faciales", count: 42 },
            { name: "Jabones", slug: "jabones", count: 28 },
            { name: "Tratamientos Capilares", slug: "tratamientos-capilares", count: 38 },
            { name: "Maquillaje", slug: "maquillaje", count: 55 },
            { name: "Niños", slug: "ninos", count: 22 },
        ],
    },
    {
        name: "Blanquería",
        slug: "blanqueria",
        icon: "🛏️",
        subcategories: [
            { name: "Acolchados", slug: "acolchados", count: 25 },
            { name: "Sábanas", slug: "sabanas", count: 45 },
            { name: "Toallas y Toallones", slug: "toallas-toallones", count: 32 },
            { name: "Mantelería", slug: "manteleria", count: 18 },
            { name: "Cortinas", slug: "cortinas", count: 28 },
            { name: "Cubrecamas y Mantas", slug: "cubrecamas-mantas", count: 22 },
            { name: "Bebés", slug: "bebes", count: 35 },
            { name: "Almohadas", slug: "almohadas", count: 15 },
            { name: "Alfombras", slug: "alfombras", count: 20 },
        ],
    },
    {
        name: "Carteras y Bolsos",
        slug: "carteras-bolsos",
        icon: "👜",
        subcategories: [
            { name: "Carteras", slug: "carteras", count: 85 },
            { name: "Bolsos", slug: "bolsos", count: 45 },
            { name: "Mochilas", slug: "mochilas", count: 32 },
            { name: "Billeteras", slug: "billeteras", count: 28 },
        ],
    },
    {
        name: "Juguetes y Peluches",
        slug: "juguetes-peluches",
        icon: "🧸",
        subcategories: [
            { name: "Juguetes", slug: "juguetes", count: 65 },
            { name: "Peluches", slug: "peluches", count: 42 },
            { name: "Útiles Escolares", slug: "utiles-escolares", count: 38 },
        ],
    },
    {
        name: "Electrodomésticos",
        slug: "electrodomesticos",
        icon: "⚡",
        subcategories: [
            { name: "Belleza", slug: "belleza", count: 35 },
            { name: "Hogar", slug: "hogar", count: 48 },
        ],
    },
    {
        name: "Zapatillas",
        slug: "zapatillas",
        icon: "👟",
        subcategories: [
            { name: "Hombre", slug: "hombre", count: 55, sizes: ["39", "40", "41", "42", "43", "44", "45"] },
            { name: "Mujer", slug: "mujer", count: 62, sizes: ["35", "36", "37", "38", "39", "40", "41"] },
            { name: "Niños", slug: "ninos", count: 38, sizes: ["22", "24", "26", "28", "30", "32", "34"] },
        ],
    },
    {
        name: "Ropa",
        slug: "ropa",
        icon: "👕",
        subcategories: [
            { name: "Mujer", slug: "mujer", count: 85, sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
            { name: "Hombre", slug: "hombre", count: 72, sizes: ["S", "M", "L", "XL", "XXL", "XXXL"] },
            { name: "Niños", slug: "ninos", count: 45, sizes: ["2", "4", "6", "8", "10", "12", "14"] },
        ],
    },
    {
        name: "Ollas y Accesorios de Cocina",
        slug: "ollas-cocina",
        icon: "🧑‍🍳",
        subcategories: [
            { name: "Ollas", slug: "ollas", count: 25 },
            { name: "Sartenes", slug: "sartenes", count: 32 },
            { name: "Utensilios", slug: "utensilios", count: 48 },
            { name: "Electrodomésticos Cocina", slug: "electrodomesticos-cocina", count: 28 },
        ],
    },
]

interface NavigationMenuProps {
    isMobile?: boolean
    onItemClick?: () => void
}

export function NavigationMenu({ isMobile = false, onItemClick }: NavigationMenuProps) {
    const [openCategory, setOpenCategory] = useState<string | null>(null)

    const toggleCategory = (categorySlug: string) => {
        setOpenCategory(openCategory === categorySlug ? null : categorySlug)
    }

    const handleItemClick = () => {
        if (onItemClick) {
            onItemClick()
        }
    }

    if (isMobile) {
        return (
            <div className="space-y-2">
                {categories.map((category) => (
                    <div key={category.slug} className="border-b border-[#ebcfc4] pb-2">
                        <button
                            onClick={() => toggleCategory(category.slug)}
                            className="flex items-center justify-between w-full text-left py-2 text-gray-700 hover:text-[#9d6a4e] font-medium transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <span className="text-lg">{category.icon}</span>
                                <span>{category.name}</span>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${openCategory === category.slug ? "rotate-180" : ""}`}
                            />
                        </button>
                        {openCategory === category.slug && (
                            <div className="ml-6 mt-2 space-y-2">
                                {category.subcategories.map((subcategory) => (
                                    <div key={subcategory.slug}>
                                        <Link
                                            href={`/productos?categoria=${category.slug}&subcategoria=${subcategory.slug}`}
                                            onClick={handleItemClick}
                                            className="block py-1 text-sm text-gray-600 hover:text-[#9d6a4e] transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{subcategory.name}</span>
                                                {subcategory.count && <span className="text-xs text-gray-400">({subcategory.count})</span>}
                                            </div>
                                        </Link>
                                        {/* Mostrar talles si existen */}
                                        {subcategory.sizes && (
                                            <div className="ml-4 mt-1 flex flex-wrap gap-1">
                                                {subcategory.sizes.slice(0, 4).map((size) => (
                                                    <span key={size} className="text-xs bg-[#f5f0ed] text-[#9d6a4e] px-2 py-1 rounded">
                                                        {size}
                                                    </span>
                                                ))}
                                                {subcategory.sizes.length > 4 && (
                                                    <span className="text-xs text-gray-400">+{subcategory.sizes.length - 4} más</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-[#9d6a4e] font-medium transition-colors">
                Inicio
            </Link>
            <Link href="/productos" className="text-gray-700 hover:text-[#9d6a4e] font-medium transition-colors">
                Productos
            </Link>

            {categories.map((category) => (
                <div key={category.slug} className="relative group">
                    <button className="flex items-center space-x-1 text-gray-700 hover:text-[#9d6a4e] font-medium transition-colors py-2">
                        <span className="text-sm">{category.icon}</span>
                        <span className="text-sm">{category.name}</span>
                        <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-[#ebcfc4] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="p-4">
                            <h3 className="font-semibold text-[#9d6a4e] mb-3 flex items-center">
                                <span className="mr-2">{category.icon}</span>
                                {category.name}
                            </h3>
                            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                                {category.subcategories.map((subcategory) => (
                                    <div key={subcategory.slug}>
                                        <Link
                                            href={`/productos?categoria=${category.slug}&subcategoria=${subcategory.slug}`}
                                            className="flex items-center justify-between py-2 px-3 text-sm text-gray-600 hover:text-[#9d6a4e] hover:bg-[#f5f0ed] rounded-md transition-colors"
                                        >
                                            <span>{subcategory.name}</span>
                                            {subcategory.count && (
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                                    {subcategory.count}
                                                </span>
                                            )}
                                        </Link>
                                        {/* Mostrar talles si existen */}
                                        {subcategory.sizes && (
                                            <div className="ml-3 mb-2 flex flex-wrap gap-1">
                                                {subcategory.sizes.slice(0, 6).map((size) => (
                                                    <span key={size} className="text-xs bg-[#f5f0ed] text-[#9d6a4e] px-2 py-1 rounded">
                                                        {size}
                                                    </span>
                                                ))}
                                                {subcategory.sizes.length > 6 && (
                                                    <span className="text-xs text-gray-400">+{subcategory.sizes.length - 6}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

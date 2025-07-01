"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Grid3X3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CompactNavigationMenuProps {
    onItemClick?: () => void
}

export function CompactNavigationMenu({ onItemClick }: CompactNavigationMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const categories = [
        {
            name: "Joyas",
            icon: "💎",
            subcategories: ["Anillos", "Pulseras", "Dijes", "Cadenas", "Aros", "Alianzas"],
        },
        {
            name: "Perfumería",
            icon: "🌸",
            subcategories: ["Perfumes Dama", "Perfumes Hombre", "Cremas", "Maquillaje"],
        },
        {
            name: "Blanquería",
            icon: "🛏️",
            subcategories: ["Acolchados", "Sábanas", "Toallas", "Cortinas"],
        },
        {
            name: "Carteras y Bolsos",
            icon: "👜",
            subcategories: ["Carteras", "Bolsos", "Mochilas", "Billeteras"],
        },
        {
            name: "Juguetes y Peluches",
            icon: "🧸",
            subcategories: ["Juguetes", "Peluches", "Educativos"],
        },
        {
            name: "Electrodomésticos",
            icon: "⚡",
            subcategories: ["Cocina", "Limpieza", "Cuidado Personal"],
        },
        {
            name: "Zapatillas",
            icon: "👟",
            subcategories: ["Hombre", "Mujer", "Niños", "Deportivas"],
        },
        {
            name: "Ropa",
            icon: "👕",
            subcategories: ["Hombre", "Mujer", "Niños", "Accesorios"],
        },
        {
            name: "Ollas y Accesorios de Cocina",
            icon: "🍳",
            subcategories: ["Ollas", "Sartenes", "Utensilios", "Vajilla"],
        },
    ]

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false)
        }, 200)
    }

    const handleItemClick = () => {
        setIsOpen(false)
        onItemClick?.()
    }

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return (
        <div className="relative">
            {/* Desktop Menu */}
            <div className="hidden lg:block">
                <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <Button
                        variant="ghost"
                        className="flex items-center text-sm text-gray-700 hover:text-[#9d6a4e] font-medium transition-colors px-3 py-2 rounded-lg hover:bg-[#f5f0ed]"
                    >
                        <Grid3X3 className="w-4 h-4 mr-2" />
                        Categorías
                        <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>

                    {/* Mega Menu Elegante */}
                    {isOpen && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-[720px]">
                            <div className="grid grid-cols-3 gap-4">
                                {categories.map((category) => (
                                    <div key={category.name} className="space-y-1.5">
                                        <div className="flex items-center space-x-2 pb-1.5 border-b border-gray-100">
                                            <span className="text-base">{category.icon}</span>
                                            <h3 className="font-semibold text-[#9d6a4e] text-sm">{category.name}</h3>
                                        </div>
                                        <div className="space-y-0.5">
                                            {category.subcategories.map((subcategory) => (
                                                <Link
                                                    key={subcategory}
                                                    href={`/productos?categoria=${category.name.toLowerCase().replace(/\s+/g, "-")}&subcategoria=${subcategory.toLowerCase().replace(/\s+/g, "-")}`}
                                                    className="block text-sm text-gray-600 hover:text-[#9d6a4e] hover:bg-gray-50 px-2 py-0.5 rounded transition-colors"
                                                    onClick={handleItemClick}
                                                >
                                                    {subcategory}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                                <Link
                                    href="/productos"
                                    className="inline-flex items-center text-sm font-medium text-[#9d6a4e] hover:text-[#b38872] transition-colors"
                                    onClick={handleItemClick}
                                >
                                    Ver todos los productos
                                    <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden">
                <Button
                    variant="ghost"
                    className="flex items-center justify-between w-full text-sm text-gray-700 hover:text-[#9d6a4e] font-medium py-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center">
                        <Grid3X3 className="w-4 h-4 mr-2" />
                        Categorías
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </Button>

                {isOpen && (
                    <div className="mt-2 space-y-3 pl-4">
                        {categories.map((category) => (
                            <div key={category.name} className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span>{category.icon}</span>
                                    <h4 className="font-medium text-[#9d6a4e] text-sm">{category.name}</h4>
                                </div>
                                <div className="pl-6 space-y-1">
                                    {category.subcategories.map((subcategory) => (
                                        <Link
                                            key={subcategory}
                                            href={`/productos?categoria=${category.name.toLowerCase().replace(/\s+/g, "-")}&subcategoria=${subcategory.toLowerCase().replace(/\s+/g, "-")}`}
                                            className="block text-xs text-gray-600 hover:text-[#9d6a4e] py-1"
                                            onClick={handleItemClick}
                                        >
                                            {subcategory}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Grid3X3, X } from "lucide-react"
import Link from "next/link"

interface CompactNavigationMenuProps {
    onItemClick?: () => void
}

export function CompactNavigationMenu({ onItemClick }: CompactNavigationMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const categories = [
        {
            name: "Joyas",
            icon: "💎",
            color: "from-[#ebcfc4] to-[#d4b5a8]",
            subcategories: ["Anillos", "Pulseras", "Dijes", "Cadenas", "Aros", "Alianzas"],
        },
        {
            name: "Perfumería",
            icon: "🌸",
            color: "from-[#d4b5a8] to-[#c9a696]",
            subcategories: ["Perfumes Dama", "Perfumes Hombre", "Cremas", "Maquillaje"],
        },
        {
            name: "Blanquería",
            icon: "🛏️",
            color: "from-[#c9a696] to-[#be9784]",
            subcategories: ["Acolchados", "Sábanas", "Toallas", "Cortinas"],
        },
        {
            name: "Carteras y Bolsos",
            icon: "👜",
            color: "from-[#be9784] to-[#b38872]",
            subcategories: ["Carteras", "Bolsos", "Mochilas", "Billeteras"],
        },
        {
            name: "Juguetes y Peluches",
            icon: "🧸",
            color: "from-[#b38872] to-[#a67760]",
            subcategories: ["Juguetes", "Peluches", "Educativos"],
        },
        {
            name: "Electrodomésticos",
            icon: "⚡",
            color: "from-[#a67760] to-[#99664e]",
            subcategories: ["Cocina", "Limpieza", "Cuidado Personal"],
        },
        {
            name: "Zapatillas",
            icon: "👟",
            color: "from-[#99664e] to-[#8c553c]",
            subcategories: ["Hombre", "Mujer", "Niños", "Deportivas"],
        },
        {
            name: "Ropa",
            icon: "👕",
            color: "from-[#8c553c] to-[#7f442a]",
            subcategories: ["Hombre", "Mujer", "Niños", "Accesorios"],
        },
        {
            name: "Ollas y Accesorios de Cocina",
            icon: "🧑‍🍳",
            color: "from-[#7f442a] to-[#723318]",
            subcategories: ["Ollas", "Sartenes", "Utensilios", "Vajilla"],
        },
    ]

    const handleItemClick = () => {
        setIsOpen(false)
        onItemClick?.()
    }

    return (
        <>
            {/* 🖥️ DESKTOP VERSION */}
            <div className="hidden lg:block">
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="text-sm text-gray-700 hover:text-[#9d6a4e] font-medium transition-colors px-3 py-2 rounded-lg hover:bg-[#f5f0ed]"
                        >
                            <Grid3X3 className="w-4 h-4 mr-2" />
                            Categorías
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="start" sideOffset={5}>
                        <div className="p-2">
                            <h3 className="font-semibold text-[#9d6a4e] mb-3 px-2">Explorar Categorías</h3>
                            <div className="space-y-1">
                                {categories.map((category) => (
                                    <div key={category.name}>
                                        <Link href={`/productos?category=${encodeURIComponent(category.name)}`}>
                                            <DropdownMenuItem
                                                className="cursor-pointer p-3 rounded-lg hover:bg-[#f5f0ed] focus:bg-[#f5f0ed]"
                                                onClick={handleItemClick}
                                            >
                                                <div className="flex items-center space-x-3 w-full">
                                                    <span className="text-lg">{category.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-[#9d6a4e]">{category.name}</div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {category.subcategories.slice(0, 3).join(", ")}
                                                            {category.subcategories.length > 3 && "..."}
                                                        </div>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        </Link>
                                        {category.name !== categories[categories.length - 1].name && (
                                            <DropdownMenuSeparator className="my-1" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* 📱 MOBILE/TABLET VERSION */}
            <div className="lg:hidden">
                <Button
                    variant="ghost"
                    onClick={() => setIsOpen(true)}
                    className="text-sm text-gray-700 hover:text-[#9d6a4e] font-medium transition-colors px-3 py-2 rounded-lg hover:bg-[#f5f0ed] w-full justify-start"
                >
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Ver Categorías
                </Button>

                {/* 📱 MODAL FULLSCREEN PARA MÓVIL */}
                {isOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
                        <div className="fixed inset-x-0 bottom-0 top-20 bg-white rounded-t-2xl shadow-2xl">
                            {/* Header del modal */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-2xl sticky top-0 z-10">
                                <h2 className="text-lg font-bold text-[#9d6a4e]">Categorías</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 p-2"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* 📱 CONTENIDO SCROLLEABLE */}
                            <div className="overflow-y-auto h-full pb-20">
                                <div className="p-4 space-y-3">
                                    {categories.map((category, index) => (
                                        <Link
                                            key={category.name}
                                            href={`/productos?category=${encodeURIComponent(category.name)}`}
                                            onClick={handleItemClick}
                                        >
                                            <Card className="hover:shadow-md transition-all duration-200 border-0 overflow-hidden">
                                                <CardContent className="p-0">
                                                    <div className={`bg-gradient-to-r ${category.color} p-4`}>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="text-2xl">{category.icon}</div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-white text-base mb-1">{category.name}</h3>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {category.subcategories.slice(0, 4).map((sub) => (
                                                                        <Badge
                                                                            key={sub}
                                                                            className="bg-white/20 text-white border-white/30 text-xs px-2 py-0.5"
                                                                        >
                                                                            {sub}
                                                                        </Badge>
                                                                    ))}
                                                                    {category.subcategories.length > 4 && (
                                                                        <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-0.5">
                                                                            +{category.subcategories.length - 4}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>

                                {/* 📱 ESPACIADO INFERIOR PARA EVITAR CORTE */}
                                <div className="h-8"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

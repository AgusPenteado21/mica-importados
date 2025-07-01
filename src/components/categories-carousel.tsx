"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Category {
    name: string
    icon: string
    count: number
    color: string
    description: string
    subcategories: string[]
}

interface CategoriesCarouselProps {
    categories: Category[]
}

export function CategoriesCarousel({ categories }: CategoriesCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isScrolling, setIsScrolling] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // 📱 CONFIGURACIÓN RESPONSIVE
    const [itemsPerView, setItemsPerView] = useState(1)

    useEffect(() => {
        const updateItemsPerView = () => {
            const width = window.innerWidth
            if (width < 640) {
                setItemsPerView(1) // Mobile: 1 item
            } else if (width < 768) {
                setItemsPerView(2) // Small tablet: 2 items
            } else if (width < 1024) {
                setItemsPerView(3) // Tablet: 3 items
            } else {
                setItemsPerView(4) // Desktop: 4 items
            }
        }

        updateItemsPerView()
        window.addEventListener("resize", updateItemsPerView)
        return () => window.removeEventListener("resize", updateItemsPerView)
    }, [])

    const maxIndex = Math.max(0, categories.length - itemsPerView)

    const nextSlide = () => {
        if (currentIndex < maxIndex) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    // 📱 SCROLL TOUCH PARA MÓVILES
    const handleTouchScroll = () => {
        if (!scrollContainerRef.current) return

        const container = scrollContainerRef.current
        const scrollLeft = container.scrollLeft
        const itemWidth = container.offsetWidth / itemsPerView
        const newIndex = Math.round(scrollLeft / itemWidth)

        if (newIndex !== currentIndex && newIndex >= 0 && newIndex <= maxIndex) {
            setCurrentIndex(newIndex)
        }
    }

    // 🎯 SCROLL SUAVE AL CAMBIAR ÍNDICE
    useEffect(() => {
        if (!scrollContainerRef.current || isScrolling) return

        const container = scrollContainerRef.current
        const itemWidth = container.offsetWidth / itemsPerView
        const targetScroll = currentIndex * itemWidth

        setIsScrolling(true)
        container.scrollTo({
            left: targetScroll,
            behavior: "smooth",
        })

        setTimeout(() => setIsScrolling(false), 300)
    }, [currentIndex, itemsPerView])

    if (categories.length === 0) {
        return null
    }

    return (
        <div className="relative w-full">
            {/* 🎮 CONTROLES DE NAVEGACIÓN - Solo mostrar en desktop si hay más items */}
            {categories.length > itemsPerView && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={prevSlide}
                        disabled={currentIndex === 0}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg border border-gray-200 hidden md:flex"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextSlide}
                        disabled={currentIndex >= maxIndex}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg border border-gray-200 hidden md:flex"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </>
            )}

            {/* 📱 CONTENEDOR PRINCIPAL CON SCROLL HORIZONTAL */}
            <div
                ref={scrollContainerRef}
                onScroll={handleTouchScroll}
                className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 snap-x snap-mandatory md:overflow-hidden"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {categories.map((category, index) => (
                    <div
                        key={category.name}
                        className="flex-shrink-0 snap-start w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                        style={{
                            minWidth: itemsPerView === 1 ? "100%" : `${100 / itemsPerView}%`,
                        }}
                    >
                        <Link href={`/productos?category=${encodeURIComponent(category.name)}`}>
                            <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group cursor-pointer transform hover:scale-105">
                                <CardContent className="p-0">
                                    {/* 🎨 HEADER CON GRADIENTE */}
                                    <div className={`bg-gradient-to-br ${category.color} p-6 text-center relative overflow-hidden`}>
                                        {/* Patrón decorativo */}
                                        <div className="absolute inset-0 opacity-10">
                                            <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 -translate-y-10"></div>
                                            <div className="absolute bottom-0 right-0 w-16 h-16 bg-white rounded-full translate-x-8 translate-y-8"></div>
                                        </div>

                                        <div className="relative z-10">
                                            <div className="text-3xl md:text-4xl mb-3">{category.icon}</div>
                                            <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-tight">{category.name}</h3>
                                            <Badge className="bg-white/20 text-white border-white/30 text-xs md:text-sm px-2 py-1">
                                                {category.count} productos
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* 📝 CONTENIDO */}
                                    <div className="p-4 md:p-6 bg-white">
                                        <p className="text-gray-600 text-sm md:text-base mb-4 leading-relaxed">{category.description}</p>

                                        {/* 🏷️ SUBCATEGORÍAS */}
                                        <div className="mb-4">
                                            <div className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Subcategorías:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {category.subcategories.slice(0, 3).map((sub) => (
                                                    <span key={sub} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                        {sub}
                                                    </span>
                                                ))}
                                                {category.subcategories.length > 3 && (
                                                    <span className="text-xs text-gray-400">+{category.subcategories.length - 3} más</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* 🔗 BOTÓN DE ACCIÓN */}
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-500">Ver productos</div>
                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#9d6a4e] group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                ))}
            </div>

            {/* 📍 INDICADORES DE POSICIÓN - Solo en móvil */}
            {categories.length > itemsPerView && (
                <div className="flex justify-center mt-6 gap-2 md:hidden">
                    {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-[#9d6a4e] w-6" : "bg-gray-300 hover:bg-gray-400"
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* 📱 INDICADOR DE SCROLL EN MÓVIL */}
            <div className="md:hidden mt-4 text-center">
                <p className="text-xs text-gray-500">{itemsPerView === 1 ? "Desliza para ver más categorías" : ""}</p>
            </div>
        </div>
    )
}

// 🎨 CSS ADICIONAL PARA OCULTAR SCROLLBAR
const styles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`

// Inyectar estilos
if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)
}

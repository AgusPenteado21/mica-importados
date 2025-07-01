"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react"
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
    const carouselRef = useRef<HTMLDivElement>(null)

    // Configuración responsive
    const getItemsPerView = () => {
        if (typeof window === "undefined") return 4
        if (window.innerWidth < 640) return 1
        if (window.innerWidth < 768) return 2
        if (window.innerWidth < 1024) return 3
        return 4
    }

    const [itemsPerView, setItemsPerView] = useState(getItemsPerView())

    useEffect(() => {
        const handleResize = () => {
            setItemsPerView(getItemsPerView())
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const maxIndex = Math.max(0, categories.length - itemsPerView)

    const goToNext = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
    }

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(Math.min(index, maxIndex))
    }

    return (
        <div ref={carouselRef} className="relative">
            {/* Navigation Buttons - Solo mostrar si hay más elementos que los visibles */}
            {categories.length > itemsPerView && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border-[#ebcfc4] hover:bg-[#f5f0ed] shadow-lg"
                        onClick={goToPrev}
                    >
                        <ChevronLeft className="w-4 h-4 text-[#9d6a4e]" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border-[#ebcfc4] hover:bg-[#f5f0ed] shadow-lg"
                        onClick={goToNext}
                    >
                        <ChevronRight className="w-4 h-4 text-[#9d6a4e]" />
                    </Button>
                </>
            )}

            {/* Carousel Container */}
            <div className="overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                    }}
                >
                    {categories.map((category, index) => (
                        <div key={index} className="flex-shrink-0 px-3" style={{ width: `${100 / itemsPerView}%` }}>
                            <Link href="/productos">
                                <Card className="hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group transform hover:scale-105 cursor-pointer h-full">
                                    <CardContent className="p-6">
                                        <div
                                            className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                                        >
                                            <span className="text-2xl">{category.icon}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-[#9d6a4e] mb-2 text-center">{category.name}</h3>
                                        <p className="text-sm text-[#b38872] mb-3 text-center">{category.description}</p>
                                        <div className="text-center mb-3">
                                            <Badge className="bg-[#f5f0ed] text-[#9d6a4e] border-0 text-xs">
                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                {category.count} productos
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 text-center leading-relaxed">
                                            {category.subcategories.slice(0, 3).join(", ")}
                                            {category.subcategories.length > 3 && "..."}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots Indicator - Solo mostrar si hay más elementos que los visibles */}
            {categories.length > itemsPerView && (
                <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                        <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-[#9d6a4e] w-6" : "bg-[#ebcfc4] hover:bg-[#d4b5a8]"
                                }`}
                            onClick={() => goToSlide(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

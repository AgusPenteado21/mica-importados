import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Función para formatear precios
export function formatPrice(price: number): string {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "USD",
    }).format(price)
}

// Función para calcular descuento
export function calculateDiscount(originalPrice: number, salePrice: number): number {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

// Función para generar slug de URL
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-")
}

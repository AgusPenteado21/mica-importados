"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Minus, ShoppingCart, MessageCircle, Trash2 } from "lucide-react"
import { useCart } from "./cart-provider"

interface CartDrawerProps {
    isOpen: boolean
    onClose: () => void
    whatsappNumber: string
    onCheckoutSuccess?: () => void
}

export function CartDrawer({ isOpen, onClose, whatsappNumber, onCheckoutSuccess }: CartDrawerProps) {
    const { state, dispatch } = useCart()

    const handleUpdateQuantity = (id: string, quantity: number) => {
        dispatch({
            type: "UPDATE_QUANTITY",
            payload: { id, quantity },
        })
    }

    const handleRemoveItem = (id: string) => {
        dispatch({
            type: "REMOVE_ITEM",
            payload: { id },
        })
    }

    const handleWhatsAppCheckout = () => {
        if (state.items.length === 0) return

        const itemsList = state.items
            .map((item) => `• ${item.name} (x${item.quantity}) - ARS $${(item.price * item.quantity).toLocaleString()}`)
            .join("\n")

        const message = encodeURIComponent(
            `Hola! Me gustaría realizar el siguiente pedido:\n\n${itemsList}\n\n*Total: ARS $${state.total.toLocaleString()}*\n\n¿Podrían confirmar disponibilidad y método de pago?`,
        )

        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
        window.open(whatsappUrl, "_blank")

        // Opcional: limpiar carrito después del checkout
        if (onCheckoutSuccess) {
            onCheckoutSuccess()
        }
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#ebcfc4]">
                    <div className="flex items-center space-x-2">
                        <ShoppingCart className="w-5 h-5 text-[#9d6a4e]" />
                        <h2 className="text-lg font-bold text-[#9d6a4e]">Carrito de Compras</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex flex-col h-full">
                    {/* Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {state.items.length === 0 ? (
                            <div className="text-center py-12">
                                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">Tu carrito está vacío</h3>
                                <p className="text-gray-500 mb-4">Agrega algunos productos para comenzar</p>
                                <Button onClick={onClose} className="bg-[#ebcfc4] hover:bg-[#d4b5a8] text-[#9d6a4e]">
                                    Continuar Comprando
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {state.items.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-[#f5f0ed] rounded-lg">
                                        <img
                                            src={item.image || "/placeholder.svg"}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-[#9d6a4e] text-sm line-clamp-2">{item.name}</h4>
                                            <p className="text-lg font-bold text-[#9d6a4e]">ARS ${item.price.toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 p-0 border-[#ebcfc4]"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <Badge variant="secondary" className="bg-white text-[#9d6a4e] px-3 py-1">
                                                    {item.quantity}
                                                </Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 p-0 border-[#ebcfc4]"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {state.items.length > 0 && (
                        <div className="border-t border-[#ebcfc4] p-4 space-y-4">
                            {/* Total */}
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-[#9d6a4e]">Total:</span>
                                <span className="text-2xl font-bold text-[#9d6a4e]">ARS ${state.total.toLocaleString()}</span>
                            </div>

                            {/* Checkout Button */}
                            <Button
                                onClick={handleWhatsAppCheckout}
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg font-semibold"
                            >
                                <MessageCircle className="w-5 h-5 mr-2" />
                                Finalizar Pedido por WhatsApp
                            </Button>

                            {/* Continue Shopping */}
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="w-full border-[#ebcfc4] text-[#9d6a4e] hover:bg-[#f5f0ed] bg-transparent"
                            >
                                Continuar Comprando
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

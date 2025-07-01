"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

// 🎯 TIPOS DE DATOS
export interface CartItem {
    id: string // Cambiado de number a string
    name: string
    price: number
    image: string
    quantity: number
}

interface CartState {
    items: CartItem[]
    total: number
}

type CartAction =
    | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
    | { type: "REMOVE_ITEM"; payload: { id: string } } // Cambiado de number a string
    | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } } // Cambiado de number a string
    | { type: "CLEAR_CART" }

// 🎯 ESTADO INICIAL
const initialState: CartState = {
    items: [],
    total: 0,
}

// 🎯 REDUCER
const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case "ADD_ITEM": {
            const existingItem = state.items.find((item) => item.id === action.payload.id)

            let newItems: CartItem[]
            if (existingItem) {
                newItems = state.items.map((item) =>
                    item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
                )
            } else {
                newItems = [...state.items, { ...action.payload, quantity: 1 }]
            }

            const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

            return {
                items: newItems,
                total: newTotal,
            }
        }

        case "REMOVE_ITEM": {
            const newItems = state.items.filter((item) => item.id !== action.payload.id)
            const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

            return {
                items: newItems,
                total: newTotal,
            }
        }

        case "UPDATE_QUANTITY": {
            const newItems = state.items.map((item) =>
                item.id === action.payload.id ? { ...item, quantity: Math.max(0, action.payload.quantity) } : item,
            )

            const filteredItems = newItems.filter((item) => item.quantity > 0)
            const newTotal = filteredItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

            return {
                items: filteredItems,
                total: newTotal,
            }
        }

        case "CLEAR_CART": {
            return initialState
        }

        default:
            return state
    }
}

// 🎯 CONTEXT
const CartContext = createContext<{
    state: CartState
    dispatch: React.Dispatch<CartAction>
} | null>(null)

// 🎯 PROVIDER
export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState)

    return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

// 🎯 HOOK
export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}

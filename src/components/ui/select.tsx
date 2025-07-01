"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { ChevronDown } from "lucide-react"

interface SelectProps {
    value: string
    onValueChange: (value: string) => void
    children: React.ReactNode
    disabled?: boolean
}

interface SelectTriggerProps {
    children: React.ReactNode
    className?: string
    disabled?: boolean
}

interface SelectContentProps {
    children: React.ReactNode
    className?: string
}

interface SelectItemProps {
    value: string
    children: React.ReactNode
    className?: string
}

interface SelectValueProps {
    placeholder?: string
    className?: string
}

const SelectContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    disabled?: boolean
} | null>(null)

const Select = ({ value, onValueChange, children, disabled = false }: SelectProps) => {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, disabled }}>
            <div className="relative">{children}</div>
        </SelectContext.Provider>
    )
}

const SelectTrigger = ({ children, className, disabled }: SelectTriggerProps) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectTrigger must be used within Select")

    const { isOpen, setIsOpen, disabled: contextDisabled } = context
    const isDisabled = disabled || contextDisabled

    return (
        <button
            type="button"
            onClick={() => !isDisabled && setIsOpen(!isOpen)}
            disabled={isDisabled}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
}

const SelectValue = ({ placeholder, className }: SelectValueProps) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectValue must be used within Select")

    const { value } = context

    return <span className={cn("block truncate", className)}>{value || placeholder}</span>
}

const SelectContent = ({ children, className }: SelectContentProps) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectContent must be used within Select")

    const { isOpen, setIsOpen, disabled } = context

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element
            if (!target.closest("[data-select-content]")) {
                setIsOpen(false)
            }
        }

        if (isOpen && !disabled) {
            document.addEventListener("mousedown", handleClickOutside)
            return () => document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen, setIsOpen, disabled])

    if (!isOpen || disabled) return null

    return (
        <div
            data-select-content
            className={cn(
                "absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md",
                className,
            )}
        >
            {children}
        </div>
    )
}

const SelectItem = ({ value, children, className }: SelectItemProps) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectItem must be used within Select")

    const { onValueChange, setIsOpen, disabled } = context

    return (
        <button
            type="button"
            onClick={() => {
                if (!disabled) {
                    onValueChange(value)
                    setIsOpen(false)
                }
            }}
            disabled={disabled}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                className,
            )}
        >
            {children}
        </button>
    )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }

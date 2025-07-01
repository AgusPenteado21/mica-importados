// Utilidades para manejar la autenticación del panel
export const checkAdminAuth = (): boolean => {
    if (typeof window === "undefined") return false

    const isAuthenticated = localStorage.getItem("admin_authenticated")
    const authTime = localStorage.getItem("admin_auth_time")

    if (!isAuthenticated || !authTime) return false

    // Verificar si la sesión ha expirado (24 horas)
    const now = Date.now()
    const authTimestamp = Number.parseInt(authTime)
    const twentyFourHours = 24 * 60 * 60 * 1000

    if (now - authTimestamp > twentyFourHours) {
        // Limpiar sesión expirada
        localStorage.removeItem("admin_authenticated")
        localStorage.removeItem("admin_auth_time")
        return false
    }

    return true
}

export const clearAdminAuth = (): void => {
    if (typeof window === "undefined") return

    localStorage.removeItem("admin_authenticated")
    localStorage.removeItem("admin_auth_time")
}

export const setAdminAuth = (): void => {
    if (typeof window === "undefined") return

    localStorage.setItem("admin_authenticated", "true")
    localStorage.setItem("admin_auth_time", Date.now().toString())

    // También establecer cookie para el middleware
    document.cookie = "admin_authenticated=true; path=/; max-age=86400" // 24 horas
}

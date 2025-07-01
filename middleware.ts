import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    // Proteger la ruta /panel
    if (request.nextUrl.pathname.startsWith("/panel")) {
        // Verificar si hay autenticación en las cookies o headers
        const authCookie = request.cookies.get("admin_authenticated")

        // Si no hay cookie de autenticación, redirigir al home
        if (!authCookie || authCookie.value !== "true") {
            return NextResponse.redirect(new URL("/", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/panel/:path*"],
}

// 🔥 SCRIPT PARA INICIALIZAR DATOS EN FIRESTORE
import { writeBatch, doc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "../src/lib/firebase.js"
import { COLLECTIONS } from "../src/lib/firestore-helpers.js"

/**
 * 🎯 Inicializa categorías en Firestore
 */
export const initCategories = async () => {
    const batch = writeBatch(db)

    const categories = [
        {
            name: "Joyas",
            slug: "joyas",
            icon: "💎",
            description: "Elegancia en cada detalle",
            isActive: true,
            createdAt: serverTimestamp(),
        },
        {
            name: "Perfumería",
            slug: "perfumeria",
            icon: "🌸",
            description: "Fragancias exclusivas importadas",
            isActive: true,
            createdAt: serverTimestamp(),
        },
        {
            name: "Blanquería",
            slug: "blanqueria",
            icon: "🛏️",
            description: "Ropa de cama y textiles premium",
            isActive: true,
            createdAt: serverTimestamp(),
        },
        {
            name: "Carteras y Bolsos",
            slug: "carteras-bolsos",
            icon: "👜",
            description: "Accesorios de lujo y funcionalidad",
            isActive: true,
            createdAt: serverTimestamp(),
        },
        {
            name: "Juguetes y Peluches",
            slug: "juguetes-peluches",
            icon: "🧸",
            description: "Diversión y entretenimiento",
            isActive: true,
            createdAt: serverTimestamp(),
        },
        {
            name: "Electrodomésticos",
            slug: "electrodomesticos",
            icon: "⚡",
            description: "Tecnología para el hogar",
            isActive: true,
            createdAt: serverTimestamp(),
        },
        {
            name: "Zapatillas",
            slug: "zapatillas",
            icon: "👟",
            description: "Calzado deportivo y casual",
            isActive: true,
            createdAt: serverTimestamp(),
        },
        {
            name: "Ropa",
            slug: "ropa",
            icon: "👕",
            description: "Moda importada de calidad",
            isActive: true,
            createdAt: serverTimestamp(),
        },
        {
            name: "Ollas y Accesorios de Cocina",
            slug: "ollas-cocina",
            icon: "🧑‍🍳",
            description: "Utensilios de cocina premium",
            isActive: true,
            createdAt: serverTimestamp(),
        },
    ]

    categories.forEach((category) => {
        const docRef = doc(collection(db, COLLECTIONS.CATEGORIES))
        batch.set(docRef, category)
    })

    await batch.commit()
    console.log("✅ Categorías inicializadas en Firestore")
}

/**
 * 🎯 Inicializa productos de ejemplo con talles dinámicos
 */
export const initSampleProducts = async () => {
    const batch = writeBatch(db)

    const sampleProducts = [
        // 🎯 ZAPATILLAS CON TALLES ESPECÍFICOS
        {
            name: "Nike Air Max 270 Hombre",
            description: "Zapatillas deportivas Nike Air Max 270 para hombre con tecnología Air Max",
            price: 22999,
            category: "Zapatillas",
            subcategory: "Hombre",
            badge: "Deportivo",
            sizes: ["40", "42", "44"], // Solo estos talles disponibles
            images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
            mainImage: "/placeholder.svg?height=400&width=400",
            inStock: true,
            stockCount: 3,
            whatsappMessage: "Hola! Me interesan las Nike Air Max 270 para hombre. ¿Qué talles tienes disponibles?",
            features: ["Tecnología Air Max", "Suela de goma", "Transpirable", "Cómodo para uso diario"],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        },
        {
            name: "Adidas Ultraboost 22 Hombre",
            description: "Zapatillas running Adidas Ultraboost 22 con tecnología Boost",
            price: 25999,
            category: "Zapatillas",
            subcategory: "Hombre",
            badge: "Running",
            sizes: ["41", "42", "43"], // Solo estos talles disponibles
            images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
            mainImage: "/placeholder.svg?height=400&width=400",
            inStock: true,
            stockCount: 2,
            whatsappMessage: "Hola! Me interesan las Adidas Ultraboost para hombre. ¿Tienes talle 42?",
            features: ["Tecnología Boost", "Upper Primeknit", "Ideal para running", "Retorno de energía"],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        },
        {
            name: "Nike Air Force 1 Mujer",
            description: "Zapatillas clásicas Nike Air Force 1 para mujer",
            price: 19999,
            category: "Zapatillas",
            subcategory: "Mujer",
            badge: "Clásico",
            sizes: ["37", "38", "39"], // Solo estos talles disponibles
            images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
            mainImage: "/placeholder.svg?height=400&width=400",
            inStock: true,
            stockCount: 4,
            whatsappMessage: "Hola! Me interesan las Nike Air Force 1 para mujer. ¿Qué colores tienes?",
            features: ["Diseño icónico", "Cuero premium", "Suela de goma", "Versatil para cualquier ocasión"],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        },

        // 🎯 ROPA CON TALLES ESPECÍFICOS
        {
            name: "Vestido Elegante Importado",
            description: "Vestido elegante importado para ocasiones especiales",
            price: 12999,
            category: "Ropa",
            subcategory: "Mujer",
            badge: "Elegante",
            sizes: ["S", "M", "L"], // Solo estos talles disponibles
            images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
            mainImage: "/placeholder.svg?height=400&width=400",
            inStock: true,
            stockCount: 4,
            whatsappMessage: "Hola! Me interesa el Vestido Elegante. ¿Qué tallas tienes disponibles?",
            features: ["Tela premium", "Corte elegante", "Forro interior", "Cierre invisible"],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        },
        {
            name: "Camisa Formal Ralph Lauren",
            description: "Camisa formal Ralph Lauren importada para hombre",
            price: 9999,
            category: "Ropa",
            subcategory: "Hombre",
            badge: "Formal",
            sizes: ["M", "L", "XL"], // Solo estos talles disponibles
            images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
            mainImage: "/placeholder.svg?height=400&width=400",
            inStock: true,
            stockCount: 3,
            whatsappMessage: "Hola! Me interesa la Camisa Ralph Lauren. ¿Tienes talla L?",
            features: ["Algodón 100%", "Corte clásico", "Botones de calidad", "Fácil cuidado"],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        },

        // 🎯 PRODUCTOS SIN TALLES
        {
            name: "Perfume Chanel No. 5 - 100ml",
            description: "El icónico perfume Chanel No. 5 en presentación de 100ml importado desde Francia",
            price: 28999,
            category: "Perfumería",
            subcategory: "Perfumes Dama",
            badge: "Icónico",
            sizes: null, // Sin talles
            images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
            mainImage: "/placeholder.svg?height=400&width=400",
            inStock: true,
            stockCount: 5,
            whatsappMessage: "Hola! Me interesa el Perfume Chanel No. 5. ¿Es importado directamente?",
            features: [
                "Fragancia icónica",
                "Importado de Francia",
                "100ml",
                "Larga duración",
                "Notas florales",
                "Presentación premium",
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        },
        {
            name: "Anillo de Oro 18k con Diamante",
            description: "Anillo de oro 18k con diamante natural certificado",
            price: 25999,
            category: "Joyas",
            subcategory: "Anillos",
            badge: "Lujo",
            sizes: null, // Sin talles
            images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
            mainImage: "/placeholder.svg?height=400&width=400",
            inStock: true,
            stockCount: 2,
            whatsappMessage: "Hola! Me interesa el Anillo de Oro 18k con Diamante. ¿Qué tallas tienes disponibles?",
            features: [
                "Oro 18k de ley",
                "Diamante natural certificado",
                "Diseño elegante",
                "Incluye certificado",
                "Estuche de regalo",
                "Garantía de autenticidad",
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        },
    ]

    sampleProducts.forEach((product) => {
        const docRef = doc(collection(db, COLLECTIONS.PRODUCTS))
        batch.set(docRef, product)
    })

    await batch.commit()
    console.log("✅ Productos de ejemplo inicializados en Firestore")
}

/**
 * 🎯 Ejecuta la inicialización completa
 */
export const initFirestoreData = async () => {
    try {
        console.log("🔥 Inicializando datos en Firestore...")

        await initCategories()
        await initSampleProducts()

        console.log("🎉 ¡Datos inicializados correctamente en Firestore!")
    } catch (error) {
        console.error("❌ Error inicializando datos:", error)
        throw error
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    initFirestoreData()
}

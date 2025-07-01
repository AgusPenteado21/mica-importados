// 🔥 CONFIGURACIÓN DE FIREBASE
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
    apiKey: "AIzaSyDSyzuaNmnMEkdgx3mwNicCgWiGCi2T-zs",
    authDomain: "mica-importados.firebaseapp.com",
    projectId: "mica-importados",
    storageBucket: "mica-importados.firebasestorage.app",
    messagingSenderId: "832367535392",
    appId: "1:832367535392:web:9c3cf07b11eb2fba94a345",
    measurementId: "G-270F14K3NS",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore Database
export const db = getFirestore(app)

// Initialize Firebase Storage (para imágenes)
export const storage = getStorage(app)

// Initialize Analytics (opcional)
let analytics
if (typeof window !== "undefined") {
    analytics = getAnalytics(app)
}

export { analytics }
export default app

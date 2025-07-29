import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js" // Import getAuth

const firebaseConfig = {
  apiKey: "AIzaSyCi2NKH7Dzf6sLZdvuCQW18hxbsF4cVYB0",
  authDomain: "ttmindx.firebaseapp.com",
  projectId: "ttmindx",
  storageBucket: "ttmindx.firebasestorage.app",
  messagingSenderId: "499689288083",
  appId: "1:499689288083:web:394be22db426aa48b93866",
  measurementId: "G-Y0NCNLB337",
}

export const app = initializeApp(firebaseConfig) // Export app
export const db = getFirestore(app)
export const auth = getAuth(app) // Export auth

console.log("Firebase initialized successfully!")

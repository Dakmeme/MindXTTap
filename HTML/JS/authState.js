
import { auth } from "./firebase.js"
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"

let currentUser = null

const initAuth = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user
        ? {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
          }
        : null

      console.log("Auth state changed:", currentUser ? "Logged in" : "Logged out")
      resolve(currentUser)
    })
  })
}

const getCurrentUser = () => currentUser

const isLoggedIn = () => !!currentUser

const logout = async () => {
  try {
    await signOut(auth)
    currentUser = null
    console.log("Logged out successfully")
    return true
  } catch (error) {
    console.error("Logout error:", error)
    return false
  }
}

export { initAuth, getCurrentUser, isLoggedIn, logout }
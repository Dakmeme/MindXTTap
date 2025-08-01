import { auth, onAuthStateChanged, signOut } from "./firebase.js";

let currentUser = "";
let readyPromise;

const initAuth = () => {
  if (!readyPromise) {
    readyPromise = new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        currentUser = user ? user.uid : "";
        console.log("Auth state changed:", currentUser ? "Logged in" : "Logged out", currentUser);
        resolve(currentUser);
      });
    });
  }
  return readyPromise;
};

const getCurrentUser = () => currentUser;

const isLoggedIn = () => !!currentUser;

const logout = async () => {
  try {
    await signOut(auth);
    currentUser = "";
    console.log("Logged out successfully");
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
};

export { initAuth, getCurrentUser, isLoggedIn, logout };

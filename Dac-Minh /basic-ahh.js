import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"
const firebaseConfig = {
  apiKey: "AIzaSyCi2NKH7Dzf6sLZdvuCQW18hxbsF4cVYB0",
  authDomain: "ttmindx.firebaseapp.com",
  projectId: "ttmindx",
  storageBucket: "ttmindx.firebasestorage.app",
  messagingSenderId: "499689288083",
  appId: "1:499689288083:web:394be22db426aa48b93866",
  measurementId: "G-Y0NCNLB337",
}
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

console.log("Firebase đã được khởi tạo thành công!")

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"

export const getUserInfo = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return null;
  }
};


getUserInfo("user_7n1pcr3ef")
  .then(user => {
    console.log(user);

    if (!user) {
      console.log("Sai userID r ba");
      return;
    }

    const userAvatarPath = user.avatar;
    const bgValue = `url("${userAvatarPath}")`;

    const usernameEl = document.getElementById('username');
    const emailEl = document.getElementById('useremail');

    if (usernameEl) usernameEl.innerText = user.username || "HOANG MINH THIEU KIAAA";
    if (emailEl) emailEl.innerText = user.email || "HOANG MINH THIEU KIAAA";

    const coverImg = document.querySelectorAll('.cover-img'); 
    coverImg.forEach(el => {
      el.style.backgroundImage = bgValue;
    });
  })
  .catch(err => {
    console.error('Failed to get user info:', err);
  });

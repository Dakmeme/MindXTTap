  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyCi2NKH7Dzf6sLZdvuCQW18hxbsF4cVYB0",
    authDomain: "ttmindx.firebaseapp.com",
    projectId: "ttmindx",
    storageBucket: "ttmindx.firebasestorage.app",
    messagingSenderId: "499689288083",
    appId: "1:499689288083:web:394be22db426aa48b93866",
    measurementId: "G-Y0NCNLB337"

};

const app = initializeApp(firebaseConfig);


import {
    getFirestore,
    // addDoc,
    collection,
    getDocs,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const db = getFirestore(app);
  
function getRandomId(length = 20) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function addRandomUsers(numUsers = 10) {
  for (let i = 0; i < numUsers; i++) {
    let userId, userDoc;
    do {
      userId = getRandomId();
      userDoc = await db.collection('users').doc(userId).get();
    } while (userDoc.exists);

    // Create the user document with fields (including userId as a field)
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      userId: userId, // store userId as a field
      name: `User_${i}`,
      email: `user${i}@example.com`,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
      // Add more fields as needed
    });

    // Add a subcollection "profiles" with document "mainProfile"
    await userRef.collection('profiles').doc('mainProfile').set({
      age: Math.floor(Math.random() * 50) + 18,
      bio: 'Random bio'
      // Add more profile fields as needed
    });

    console.log(`Created user with custom ID: ${userId}`);
  }
  console.log('Done!');
}

// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'

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
  addDoc,
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'

const db = getFirestore(app)

const post = document.getElementById('post')

form.addEventListener('submit', async function (event) {
  event.preventDefault()
  console.log('Form submitted')

  const contentValue = document.getElementById('content').value

  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      content: contentValue,
      date: new Date().toISOString(),
    })
    console.log('Document written with ID: ', docRef.id)
  } catch (e) {
    console.error('Error adding document: ', e)
  }
})
const posts = document.getElementById('posts')
posts.innerHTML = ''
const querySnapshot = await getDocs(collection(db, 'posts'))
querySnapshot.forEach((doc) => {
  console.log(doc.data())
  const tr = document.createElement('tr')

  tr.innerHTML = `
    <td scope="col">${doc.id}</td>
    <td scope="col">${doc.data().content}</td>
    <td scope="col">${doc.data().date}</td>
    <td scope="col">Action</td>
    `

  posts.appendChild(tr)
})

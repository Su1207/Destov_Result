// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQ4kuIJVnulAjDY9XpfyBvWdKN70do23Q",
  authDomain: "test-5c719.firebaseapp.com",
  databaseURL:
    "https://test-5c719-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "test-5c719",
  storageBucket: "test-5c719.appspot.com",
  messagingSenderId: "733444874122",
  appId: "1:733444874122:web:9876f24aae8a8bc4473273",
  measurementId: "G-4VLQJJC5SC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };

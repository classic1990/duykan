// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// =================================================================================
// Firebase Project Configuration
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBsNc3ICL86f2WE-kNghRqAiNgBR4FeiLU",
  authDomain: "classic-e8ab7.firebaseapp.com",
  projectId: "classic-e8ab7",
  storageBucket: "classic-e8ab7.firebasestorage.app",
  messagingSenderId: "596308927760",
  appId: "1:596308927760:web:a12be9b2dffb5bc72cb195",
  measurementId: "G-PC2891EP7Z"
};
// =================================================================================

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the necessary Firebase services
export const auth = getAuth(app);
// export const db = getFirestore(app); // Example for Firestore
// export const storage = getStorage(app); // Example for Storage

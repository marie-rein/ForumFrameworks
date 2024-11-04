// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getMessaging } from "firebase/messaging"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export default function(){
  const firebaseConfig = {
    apiKey: "AIzaSyC0ap4-Jm4DBpZr-sc-iDbhPsFlql3WzQM",
    authDomain: "frameworks-55702.firebaseapp.com",
    projectId: "frameworks-55702",
    storageBucket: "frameworks-55702.firebasestorage.app",
    messagingSenderId: "552282138903",
    appId: "1:552282138903:web:d57b8c34a2fa5a2d632f52"
  };
  
  // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);      
        const db = getFirestore(app);  
        // const messaging = getMessaging(app);
     
        return {auth, db}
}

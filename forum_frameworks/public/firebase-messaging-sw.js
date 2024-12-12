importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js')


//Configuration de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC0ap4-Jm4DBpZr-sc-iDbhPsFlql3WzQM",
  authDomain: "frameworks-55702.firebaseapp.com",
  projectId: "frameworks-55702",
  storageBucket: "frameworks-55702.firebasestorage.app",
  messagingSenderId: "552282138903",
  appId: "1:552282138903:web:d57b8c34a2fa5a2d632f52"
};
const app = firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging(app);

//Configuration de la notification
messaging.onBackgroundMessage((payload) => {
  if (payload.data && payload.data.message && user.email !== payload.data.userEmail) {
      console.log("Notification reçue de : ", payload.data.userEmail);
      const titre = payload.data.message;
      const options = {
          body: payload.data.message
      };
      self.registration.showNotification(titre, options);
  } else {
      console.log("Notification ignorée pour l'expéditeur");
  }
});


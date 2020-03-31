import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'


const firebaseConfig = {
     apiKey: "AIzaSyBSSVgoecFdXnq5IDjBWAJEFeabCUeBO7Q",
     authDomain: "slack-react-49f65.firebaseapp.com",
     databaseURL: "https://slack-react-49f65.firebaseio.com",
     projectId: "slack-react-49f65",
     storageBucket: "slack-react-49f65.appspot.com",
     messagingSenderId: "522143780317",
     appId: "1:522143780317:web:d2b206955af1c0809b3a34",
     measurementId: "G-QWRS3B064E"
   };
   



   
   firebase.initializeApp(firebaseConfig);

   export default firebase ;

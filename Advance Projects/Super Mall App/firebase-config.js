// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAAuRhwZqg2twn29EvCWaZLXNYUPjm-zU",
  authDomain: "super-mall-f3b80.firebaseapp.com",
  projectId: "super-mall-f3b80",
  storageBucket: "super-mall-f3b80.appspot.com",  // ✅ fixed
  messagingSenderId: "985562859223",
  appId: "1:985562859223:web:feedf2c0dbee8d4cf79292"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // ✅ added

//submit
const submit = document.getElementById('submit');
submit.addEventListener("click", function (event) {
  event.preventDefault();

  // ✅ now fetch email/password inside event
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      alert("Account created successfully for " + user.email);
      console.log(user);
      window.location.href = "dashboard.html"
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage);
      console.error(errorMessage);
    });
});

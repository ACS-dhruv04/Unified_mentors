// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA072h3xPIOYAFdbp3Trkq42DRAR0pM-2Q",
  authDomain: "gym-system-970d0.firebaseapp.com",
  projectId: "gym-system-970d0",
  storageBucket: "gym-system-970d0.firebasestorage.app",
  messagingSenderId: "439878158739",
  appId: "1:439878158739:web:731cd192c73dbd124f4066"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Handle signup
const submit = document.getElementById('submit');
submit.addEventListener("click", async (event) => {
  event.preventDefault();

  // Get form values
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const name = document.getElementById('name')?.value.trim() || "New User"; 
  const age = document.getElementById('age')?.value.trim() || "N/A";
  const role = document.getElementById('role')?.value || "member"; // default role
  const plan = document.getElementById('plan')?.value || "Basic Plan";

  if (!email || !password) {
    alert("Email and password are required!");
    return;
  }

  try {
    // Create account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save extra info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: name,
      age: age,
      role: role,
      plan: plan,
      createdAt: new Date()
    });

    alert("Account created successfully for " + user.email);
    window.location.href = "login.html";

  } catch (error) {
    alert("Error: " + error.message);
    console.error(error.message);
  }
});

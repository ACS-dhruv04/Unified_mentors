// login.js
import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const roleSelect = document.getElementById("role");
const heading = document.getElementById("login-heading");
const loginBtn = document.getElementById("loginBtn");

// ✅ Change heading dynamically
if (roleSelect && heading) {
  roleSelect.addEventListener("change", () => {
    heading.textContent = roleSelect.value === "admin" ? "Admin Login" : "Member Login";
  });
}

if (loginBtn) {
  loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const selectedRole = roleSelect ? roleSelect.value : "member";

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      // ✅ Firebase Authentication login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Get user role from Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const role = userData.role;

        if (role !== selectedRole) {
          alert(`Role mismatch! You tried to log in as ${selectedRole}, but your account role is ${role}.`);
          return;
        }

        // ✅ Redirect based on role
        if (role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "member.html";
        }

      } else {
        alert("No role assigned in database. Please contact admin.");
      }

    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });
}

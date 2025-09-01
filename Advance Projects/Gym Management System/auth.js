// auth.js
import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Protect page: check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Not logged in → send to login
    window.location.href = "login.html";
  } else {
    console.log("User logged in:", user.email);
  }
});

// Logout button handler
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "member.html"; // Redirect after logout
    });
  });
}

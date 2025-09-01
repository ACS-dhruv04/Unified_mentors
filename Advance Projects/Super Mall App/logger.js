export function logAction(action, details = {}) {
  const log = {
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  console.log("LOG:", log);

  // (Optional) Save log to Firestore
  // import { db } from "./firebase-config.js";
  // addDoc(collection(db, "logs"), log);
}

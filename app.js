// Importation des modules Firebase nécessaires
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Configuration de votre projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCkwwwboM3lGW_284ZN5RZWJmmSL7JwkJU",
  authDomain: "mah-hotel.firebaseapp.com",
  projectId: "mah-hotel",
  storageBucket: "mah-hotel.appspot.com",
  messagingSenderId: "389877777937",
  appId: "1:389877777937:web:1c631c128857be29ab53b0"
};

// Initialisation des services Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// ==========================
// GESTION DE L'INSCRIPTION
// ==========================
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const pseudo = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const file = document.getElementById("signupPhoto").files[0];

  const signupErrorMsg = document.getElementById("signupErrorMsg");
  const signupSuccessMsg = document.getElementById("signupSuccessMsg");
  signupErrorMsg.style.display = 'none';
  signupSuccessMsg.style.display = 'none';

  try {
    // Création de l'utilisateur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    let photoURL = "";
    if (file) {
      // Référence du fichier dans Firebase Storage
      const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, file);
      photoURL = await getDownloadURL(storageRef);
    }

    // Mise à jour du profil Firebase Auth (nom + photo)
    await updateProfile(user, {
      displayName: pseudo,
      photoURL: photoURL
    });

    // Sauvegarde du profil dans Firestore
    await setDoc(doc(db, "utilisateurs", user.uid), {
      uid: user.uid,
      pseudo: pseudo,
      email: email,
      photoURL: photoURL,
      methode: "email",
      date_inscription: new Date().toISOString()
    });

    signupSuccessMsg.textContent = "Inscription réussie ! Redirection...";
    signupSuccessMsg.style.display = 'block';
    setTimeout(() => window.location.href = "dashboard.html", 1500);
  } catch (error) {
    signupErrorMsg.textContent = error.message;
    signupErrorMsg.style.display = 'block';
  }
});

// ==========================
// CONNEXION AVEC GOOGLE
// ==========================
document.getElementById("googleLogin").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Vérifie si l'utilisateur a déjà un document dans Firestore
    const userDocRef = doc(db, "utilisateurs", user.uid);
    const docSnap = await getDoc(userDocRef);

    // Si pas encore enregistré, on crée le profil
    if (!docSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        pseudo: user.displayName || "",
        email: user.email,
        photoURL: user.photoURL || "",
        methode: "google",
        date_inscription: new Date().toISOString()
      });
    }

    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Erreur Google: " + error.message);
  }
});

// ==========================
// CONNEXION Email/Password
// ==========================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const loginErrorMsg = document.getElementById("loginErrorMsg");
  const loginSuccessMsg = document.getElementById("loginSuccessMsg");

  loginErrorMsg.style.display = 'none';
  loginSuccessMsg.style.display = 'none';

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginSuccessMsg.textContent = "Connexion réussie, redirection...";
    loginSuccessMsg.style.display = 'block';
    setTimeout(() => window.location.href = "dashboard.html", 1500);
  } catch (error) {
    loginErrorMsg.textContent = error.message;
    loginErrorMsg.style.display = 'block';
  }
});

// ==========================
// MOT DE PASSE OUBLIÉ
// ==========================
document.getElementById("forgotPassword").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = prompt("Entrez votre adresse email:");
  if (email) {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Email envoyé à " + email);
    } catch (error) {
      alert("Erreur : " + error.message);
    }
  }
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Configuration Firebase (remplace les infos ci-dessous par les tiennes si besoin)
const firebaseConfig = {
  apiKey: "AIzaSyCkwwwboM3lGW_284ZN5RZWJmmSL7JwkJU",
  authDomain: "mah-hotel.firebaseapp.com",
  projectId: "mah-hotel",
  storageBucket: "mah-hotel.appspot.com",
  messagingSenderId: "389877777937",
  appId: "1:389877777937:web:1c631c128857be29ab53b0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Éléments DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const loginBtn = document.getElementById('loginBtn');
const loginText = document.getElementById('loginText');
const loginSpinner = document.getElementById('loginSpinner');
const errorBox = document.getElementById('errorMsg');
const successBox = document.getElementById('successMsg');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// Afficher/Masquer le mot de passe
togglePassword.addEventListener('click', function () {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  this.classList.toggle('fa-eye');
  this.classList.toggle('fa-eye-slash');
});

// Connexion
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginText.classList.add('d-none');
  loginSpinner.classList.remove('d-none');
  loginBtn.disabled = true;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    successBox.textContent = "Connexion réussie ! Redirection en cours...";
    successBox.style.display = "block";
    errorBox.style.display = "none";
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
  } catch (error) {
    let errorMessage = "Erreur de connexion.";
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = "Adresse email invalide.";
        break;
      case 'auth/user-disabled':
        errorMessage = "Compte désactivé.";
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = "Email ou mot de passe incorrect.";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Trop de tentatives. Réessayez plus tard.";
        break;
    }
    errorBox.textContent = errorMessage;
    errorBox.style.display = "block";
    successBox.style.display = "none";
  } finally {
    loginText.classList.remove('d-none');
    loginSpinner.classList.add('d-none');
    loginBtn.disabled = false;
  }
});

// Réinitialisation du mot de passe
forgotPasswordLink.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = prompt("Entrez votre adresse email pour réinitialiser votre mot de passe :");
  if (email) {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Un email de réinitialisation a été envoyé.");
    } catch (error) {
      alert("Erreur : " + error.message);
    }
  }
});

import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const googleLoginBtn = document.getElementById('googleLoginBtn');
const provider = new GoogleAuthProvider();

googleLoginBtn.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Message de succès
    successBox.textContent = `Bienvenue ${user.displayName} !`;
    successBox.style.display = "block";
    errorBox.style.display = "none";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);
  } catch (error) {
    console.error("Erreur Google:", error.message);
    let msg = "Erreur lors de la connexion avec Google.";
    if (error.code === "auth/popup-closed-by-user") {
      msg = "Vous avez fermé la fenêtre de connexion.";
    }
    errorBox.textContent = msg;
    errorBox.style.display = "block";
    successBox.style.display = "none";
  }
});

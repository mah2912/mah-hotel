import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Configuration Firebase
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
const provider = new GoogleAuthProvider();

// Références DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorBox = document.getElementById('errorMsg');
const successBox = document.getElementById('successMsg');
const togglePassword = document.getElementById('togglePassword');
const loginText = document.getElementById('loginText');
const loginSpinner = document.getElementById('loginSpinner');
const forgotPasswordLink = document.getElementById('forgotPassword');
const googleLogin = document.getElementById('googleLogin');

// Afficher/Masquer le mot de passe
togglePassword.addEventListener('click', () => {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  togglePassword.classList.toggle('fa-eye');
  togglePassword.classList.toggle('fa-eye-slash');
});

// Connexion Email/Password
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.style.display = 'none';
  successBox.style.display = 'none';
  loginText.classList.add('d-none');
  loginSpinner.classList.remove('d-none');

  try {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    await signInWithEmailAndPassword(auth, email, password);
    successBox.textContent = "Connexion réussie, redirection...";
    successBox.style.display = 'block';
    setTimeout(() => window.location.href = 'dashboard.html', 1500);
  } catch (error) {
    let msg = "Erreur : ";
    switch (error.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
        msg = "Email ou mot de passe incorrect.";
        break;
      case "auth/too-many-requests":
        msg = "Trop de tentatives. Réessayez plus tard.";
        break;
      default:
        msg = error.message;
    }
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  } finally {
    loginText.classList.remove('d-none');
    loginSpinner.classList.add('d-none');
  }
});

// Mot de passe oublié
forgotPasswordLink.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = prompt("Entrez votre adresse email pour réinitialiser votre mot de passe:");
  if (email) {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Email de réinitialisation envoyé à " + email);
    } catch (error) {
      alert("Erreur : " + error.message);
    }
  }
});

// Connexion avec Google
googleLogin.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert("Erreur Google : " + error.message);
  }
});

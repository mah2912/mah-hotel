import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  getFirestore, 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCkwwwboM3lGW_284ZN5RZWJmmSL7JwkJU",
  authDomain: "mah-hotel.firebaseapp.com",
  projectId: "mah-hotel",
  storageBucket: "mah-hotel.appspot.com",
  messagingSenderId: "389877777937",
  appId: "1:389877777937:web:1c631c128857be29ab53b0"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- Elements login ---
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginErrorMsg = document.getElementById('loginErrorMsg');
const loginSuccessMsg = document.getElementById('loginSuccessMsg');
const toggleLoginPassword = document.getElementById('toggleLoginPassword');
const loginText = document.getElementById('loginText');
const loginSpinner = document.getElementById('loginSpinner');
const forgotPasswordLink = document.getElementById('forgotPassword');
const googleLogin = document.getElementById('googleLogin');

// --- Elements signup ---
const signupForm = document.getElementById('signupForm');
const signupName = document.getElementById('signupName');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupErrorMsg = document.getElementById('signupErrorMsg');
const signupSuccessMsg = document.getElementById('signupSuccessMsg');
const toggleSignupPassword = document.getElementById('toggleSignupPassword');

// Toggle password visibility (login)
toggleLoginPassword.addEventListener('click', () => {
  const type = loginPassword.type === 'password' ? 'text' : 'password';
  loginPassword.type = type;
  toggleLoginPassword.classList.toggle('fa-eye');
  toggleLoginPassword.classList.toggle('fa-eye-slash');
});

// Toggle password visibility (signup)
toggleSignupPassword.addEventListener('click', () => {
  const type = signupPassword.type === 'password' ? 'text' : 'password';
  signupPassword.type = type;
  toggleSignupPassword.classList.toggle('fa-eye');
  toggleSignupPassword.classList.toggle('fa-eye-slash');
});

// --- Login form submit ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginErrorMsg.style.display = 'none';
  loginSuccessMsg.style.display = 'none';
  loginText.classList.add('d-none');
  loginSpinner.classList.remove('d-none');

  try {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    await signInWithEmailAndPassword(auth, email, password);
    loginSuccessMsg.textContent = "Connexion réussie, redirection...";
    loginSuccessMsg.style.display = 'block';
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
    loginErrorMsg.textContent = msg;
    loginErrorMsg.style.display = 'block';
  } finally {
    loginText.classList.remove('d-none');
    loginSpinner.classList.add('d-none');
  }
});

// --- Forgot password ---
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

// --- Google Login ---
googleLogin.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert("Erreur Google : " + error.message);
  }
});

// --- Signup form submit ---
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupErrorMsg.style.display = 'none';
  signupSuccessMsg.style.display = 'none';

  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;

  if (name.length < 3) {
    signupErrorMsg.textContent = "Le nom doit contenir au moins 3 caractères.";
    signupErrorMsg.style.display = 'block';
    return;
  }

  try {
    // Création utilisateur Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Enregistrement du profil dans Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      createdAt: new Date()
    });

    signupSuccessMsg.textContent = "Inscription réussie ! Vous pouvez maintenant vous connecter.";
    signupSuccessMsg.style.display = 'block';
    signupForm.reset();

    // Passe à l'onglet connexion automatiquement
    const loginTabTrigger = document.querySelector('#login-tab');
    const tab = new bootstrap.Tab(loginTabTrigger);
    tab.show();

  } catch (error) {
    signupErrorMsg.textContent = error.message;
    signupErrorMsg.style.display = 'block';
  }
});

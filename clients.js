import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Configuration Firebase
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
const db = getFirestore(app);
const clientsCollection = collection(db, "clients");

// Chargement des clients
function loadClients() {
  onSnapshot(clientsCollection, (querySnapshot) => {
    const clientsTable = document.getElementById("clientsTable");
    clientsTable.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const client = docSnap.data();
      clientsTable.innerHTML += `
        <tr>
          <td>${client.nom || ''}</td>
          <td>${client.prenom || ''}</td>
          <td>${client.email || ''}</td>
          <td>${client.telephone || ''}</td>
          <td>${client.cin || ''}</td>
          <td>${client.sexe || ''}</td>
          <td>${client.date_ajout || ''}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editClient('${docSnap.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteClient('${docSnap.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
  });
}

// Ajout d'un client
document.getElementById("addClientForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const clientData = {
    nom: document.getElementById("nom").value.trim(),
    prenom: document.getElementById("prenom").value.trim(),
    email: document.getElementById("email").value.trim(),
    telephone: document.getElementById("telephone").value.trim(),
    cin: document.getElementById("cin").value.trim(),
    sexe: document.getElementById("sexe").value,
    date_ajout: new Date().toLocaleDateString('fr-FR')
  };

  try {
    await addDoc(clientsCollection, clientData);
    e.target.reset();
    alert("Client ajouté !");
  } catch (error) {
    console.error("Erreur d'ajout:", error);
    alert("Erreur: " + error.message);
  }
});

// Supprimer un client
window.deleteClient = async (id) => {
  if (confirm("Supprimer ce client ?")) {
    try {
      await deleteDoc(doc(db, "clients", id));
      alert("Client supprimé");
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  }
};

// Modifier un client (nom)
window.editClient = async (id) => {
  const nouveauNom = prompt("Nouveau nom :");
  if (nouveauNom) {
    try {
      await updateDoc(doc(db, "clients", id), { nom: nouveauNom });
      alert("Nom mis à jour");
    } catch (error) {
      console.error("Erreur modification:", error);
    }
  }
};

// Démarrage
loadClients();

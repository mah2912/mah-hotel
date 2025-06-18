// Initialisation Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCkwwwboM3lGW_284ZN5RZWJmmSL7JwkJU",
  authDomain: "mah-hotel.firebaseapp.com",
  projectId: "mah-hotel",
  storageBucket: "mah-hotel.appspot.com",
  messagingSenderId: "389877777937",
  appId: "1:389877777937:web:1c631c128857be29ab53b0"
};

// Initialisation de Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Références
const clientsCollection = db.collection("clients");
const addClientForm = document.getElementById("addClientForm");
const clientsTable = document.getElementById("clientsTable");

// Chargement initial des clients
loadClients();

// Écouteur pour l'ajout de client
addClientForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const clientData = {
    nom: document.getElementById("nom").value.trim(),
    prenom: document.getElementById("prenom").value.trim(),
    email: document.getElementById("email").value.trim(),
    telephone: formatPhone(document.getElementById("telephone").value.trim()),
    cin: formatCIN(document.getElementById("cin").value.trim()),
    sexe: document.getElementById("sexe").value,
    date_ajout: new Date().toLocaleDateString('fr-FR')
  };

  if (!validateClient(clientData)) return;

  try {
    await clientsCollection.add(clientData);
    addClientForm.reset();
    showAlert("Client ajouté avec succès !", "success");
  } catch (error) {
    showAlert(`Erreur: ${error.message}`, "danger");
    console.error("Erreur Firestore:", error);
  }
});

// Fonction pour charger les clients
function loadClients() {
  clientsCollection.onSnapshot((snapshot) => {
    clientsTable.innerHTML = "";
    snapshot.forEach((doc) => {
      const client = doc.data();
      const row = `
        <tr>
          <td>${client.nom}</td>
          <td>${client.prenom}</td>
          <td>${client.email}</td>
          <td>${client.telephone}</td>
          <td>${client.cin}</td>
          <td>${client.sexe}</td>
          <td>${client.date_ajout}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editClient('${doc.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteClient('${doc.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
      clientsTable.innerHTML += row;
    });
    updateClientCount(snapshot.size);
  });
}

// Fonctions utilitaires
function validateClient(data) {
  if (!data.nom || !data.prenom || !data.email || !data.telephone || !data.cin || !data.sexe) {
    showAlert("Tous les champs sont obligatoires", "warning");
    return false;
  }
  return true;
}

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `+261 ${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}` : phone;
}

function formatCIN(cin) {
  const digits = cin.replace(/\D/g, '');
  return digits.length === 12 ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4") : cin;
}

function showAlert(message, type) {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

function updateClientCount(count) {
  document.getElementById("totalClients").textContent = count;
}

// Fonctions globales pour les boutons
window.deleteClient = async (id) => {
  if (confirm("Voulez-vous vraiment supprimer ce client ?")) {
    try {
      await clientsCollection.doc(id).delete();
      showAlert("Client supprimé avec succès", "success");
    } catch (error) {
      showAlert("Erreur lors de la suppression", "danger");
    }
  }
};

window.editClient = async (id) => {
  const doc = await clientsCollection.doc(id).get();
  if (!doc.exists) return;

  const client = doc.data();
  const newNom = prompt("Nouveau nom:", client.nom);
  const newPrenom = prompt("Nouveau prénom:", client.prenom);

  if (newNom && newPrenom) {
    try {
      await clientsCollection.doc(id).update({
        nom: newNom,
        prenom: newPrenom
      });
      showAlert("Client modifié avec succès", "success");
    } catch (error) {
      showAlert("Erreur lors de la modification", "danger");
    }
  }
};
// Configuration Firebase CORRECTE (remplacez les valeurs fictives)
const firebaseConfig = {
  apiKey: "AIzaSyCkwwwboM3lGW_284ZN5RZWJmmSL7JwkJU",
  authDomain: "mah-hotel.firebaseapp.com",
  projectId: "mah-hotel",
  storageBucket: "mah-hotel.appspot.com",
  messagingSenderId: "389877777937",
  appId: "1:389877777937:web:1c631c128857be29ab53b0"
};

// Initialisation Firebase
if (typeof firebase === 'undefined') {
  console.error("Firebase non chargé ! Vérifiez les scripts");
} else {
  try {
    // Vérifie si Firebase est déjà initialisé
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // Référence à la collection clients
    const clientsCollection = db.collection("clients");

    // Chargement des clients
    function loadClients() {
      clientsCollection.onSnapshot((querySnapshot) => {
        const clientsTable = document.getElementById("clientsTable");
        clientsTable.innerHTML = "";
        
        querySnapshot.forEach((doc) => {
          const client = doc.data();
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
                <button class="btn btn-sm btn-warning" onclick="editClient('${doc.id}')">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteClient('${doc.id}')">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          `;
        });
      }, (error) => {
        console.error("Erreur Firestore:", error);
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
        await clientsCollection.add(clientData);
        e.target.reset();
        alert("Client ajouté avec succès !");
      } catch (error) {
        console.error("Erreur d'ajout:", error);
        alert("Erreur: " + error.message);
      }
    });

    // Charge les clients au démarrage
    loadClients();

  } catch (error) {
    console.error("Erreur d'initialisation Firebase:", error);
  }
}

// Fonctions globales pour les boutons
window.deleteClient = async (id) => {
  if (confirm("Supprimer ce client ?")) {
    try {
      await firebase.firestore().collection("clients").doc(id).delete();
      alert("Client supprimé");
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  }
};

window.editClient = async (id) => {
  const newNom = prompt("Nouveau nom:");
  if (newNom) {
    try {
      await firebase.firestore().collection("clients").doc(id).update({ nom: newNom });
      alert("Client modifié");
    } catch (error) {
      console.error("Erreur modification:", error);
    }
  }
};
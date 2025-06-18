// Configuration Firebase (remplace les infos ci-dessous par les tiennes si besoin)
const firebaseConfig = {
  apiKey: "AIzaSyCkwwwboM3lGW_284ZN5RZWJmmSL7JwkJU",
  authDomain: "mah-hotel.firebaseapp.com",
  projectId: "mah-hotel",
  storageBucket: "mah-hotel.appspot.com",
  messagingSenderId: "389877777937",
  appId: "1:389877777937:web:1c631c128857be29ab53b0"
};


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const clientsRef = db.collection("clients");

const clientsTableBody = document.getElementById("clientsTableBody");
const searchInput = document.getElementById("searchInput");

const clientModal = new bootstrap.Modal(document.getElementById('clientModal'));
const clientForm = document.getElementById("clientForm");
const clientModalLabel = document.getElementById("clientModalLabel");
const clientIdInput = document.getElementById("clientId");
const clientNameInput = document.getElementById("clientName");
const clientEmailInput = document.getElementById("clientEmail");
const clientPhoneInput = document.getElementById("clientPhone");
const btnAddClient = document.getElementById("btnAddClient");

let clientsData = []; // stocke tous les clients pour recherche

// Afficher la liste des clients en temps réel
clientsRef.orderBy("name").onSnapshot(snapshot => {
  clientsData = [];
  snapshot.forEach(doc => {
    clientsData.push({ id: doc.id, ...doc.data() });
  });
  renderClients(clientsData);
});

// Rendu tableau
function renderClients(clients) {
  clientsTableBody.innerHTML = "";
  if (clients.length === 0) {
    clientsTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Aucun client trouvé</td></tr>`;
    return;
  }
  clients.forEach((client, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(client.name)}</td>
      <td>${escapeHtml(client.email)}</td>
      <td>${escapeHtml(client.phone)}</td>
      <td>
        <button class="btn btn-sm btn-info me-2 btn-edit" data-id="${client.id}"><i class="fa fa-pen"></i></button>
        <button class="btn btn-sm btn-danger btn-delete" data-id="${client.id}"><i class="fa fa-trash"></i></button>
      </td>
    `;
    clientsTableBody.appendChild(tr);
  });

  // Ajouter événements boutons
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.currentTarget.getAttribute("data-id");
      openEditModal(id);
    });
  });
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.currentTarget.getAttribute("data-id");
      deleteClient(id);
    });
  });
}

// Échapper HTML (sécurité)
function escapeHtml(text) {
  if(!text) return "";
  return text.replace(/[&<>"']/g, function(m) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

// Bouton Ajouter - Ouvre modal vide
btnAddClient.addEventListener("click", () => {
  clientForm.reset();
  clientIdInput.value = "";
  clientModalLabel.textContent = "Ajouter un client";
  clientModal.show();
});

// Formulaire ajout/modif
clientForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = clientNameInput.value.trim();
  const email = clientEmailInput.value.trim();
  const phone = clientPhoneInput.value.trim();

  if (!name || !email || !phone) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  const phonePattern = /^\+261\s\d{2}\s\d{3}\s\d{3}$/;
  if (!phonePattern.test(phone)) {
    alert("Le format du téléphone est invalide. Exemple : +261 34 123 456");
    return;
  }

  const id = clientIdInput.value;

  if (id) {
    // Modification
    clientsRef.doc(id).update({ name, email, phone })
      .then(() => {
        alert("Client modifié avec succès.");
        clientModal.hide();
      })
      .catch(err => alert("Erreur lors de la modification : " + err));
  } else {
    // Ajout
    clientsRef.add({ name, email, phone })
      .then(() => {
        alert("Client ajouté avec succès.");
        clientModal.hide();
      })
      .catch(err => alert("Erreur lors de l'ajout : " + err));
  }
});

// Ouvrir modal modification avec données client
function openEditModal(id) {
  const client = clientsData.find(c => c.id === id);
  if (!client) return alert("Client non trouvé");

  clientIdInput.value = client.id;
  clientNameInput.value = client.name || "";
  clientEmailInput.value = client.email || "";
  clientPhoneInput.value = client.phone || "";
  clientModalLabel.textContent = "Modifier un client";

  clientModal.show();
}

// Supprimer client
function deleteClient(id) {
  if (confirm("Voulez-vous vraiment supprimer ce client ?")) {
    clientsRef.doc(id).delete()
      .then(() => alert("Client supprimé avec succès."))
      .catch(err => alert("Erreur lors de la suppression : " + err));
  }
}

// Recherche instantanée
searchInput.addEventListener("input", () => {
  const search = searchInput.value.toLowerCase();
  const filtered = clientsData.filter(c =>
    (c.name && c.name.toLowerCase().includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search)) ||
    (c.phone && c.phone.toLowerCase().includes(search))
  );
  renderClients(filtered);
});

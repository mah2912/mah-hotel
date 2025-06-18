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
document.getElementById("addClientBtn").addEventListener("click", async () => {
  const nom = document.getElementById("nom").value;
  const prenom = document.getElementById("prenom").value;
  const cin = document.getElementById("cin").value;

  try {
    await db.collection("clients").add({ nom, prenom, cin, dateAjout: new Date() });
    alert("Client ajouté !");
  } catch (e) {
    console.error("Erreur lors de l'ajout :", e);
  }
});
db.collection("clients").orderBy("dateAjout", "desc").onSnapshot((snapshot) => {
  const table = document.getElementById("tableClients");
  table.innerHTML = "";
  snapshot.forEach((doc) => {
    const client = doc.data();
    table.innerHTML += `
      <tr>
        <td>${client.nom}</td>
        <td>${client.prenom}</td>
        <td>${client.cin}</td>
      </tr>
    `;
  });
});
// Fichier : clients.js (Firebase v10+)


// Format CIN : --- --- --- ---
function formatCIN(value) {
return value.replace(/\D/g, "").slice(0, 12).replace(/(.{3})(.{3})(.{3})(.{3})/, "$1 $2 $3 $4");
}

// Format téléphone : +261 -- -- --- --
function formatPhone(value) {
return "+261 " + value.replace(/\D/g, "").slice(0, 9).replace(/(.{2})(.{2})(.{3})(.{2})/, "$1 $2 $3 $4");
}

// Ajouter client
document.getElementById("addClientForm").addEventListener("submit", async (e) => {
e.preventDefault();

const nom = document.getElementById("nom").value.trim();
const prenom = document.getElementById("prenom").value.trim();
const email = document.getElementById("email").value.trim();
const telephone = formatPhone(document.getElementById("telephone").value.trim());
const cin = formatCIN(document.getElementById("cin").value.trim());
const sexe = document.getElementById("sexe").value;
const date_ajout = new Date().toISOString().split("T")[0];

try {
await addDoc(clientsRef, { nom, prenom, email, telephone, cin, sexe, date_ajout });
e.target.reset();
alert("Client ajouté avec succès !");
} catch (error) {
alert("Erreur lors de l'ajout : " + error.message);
}
});

// Affichage dynamique
onSnapshot(query(clientsRef, orderBy("date_ajout", "desc")), (snapshot) => {
const tbody = document.getElementById("clientsTable");
tbody.innerHTML = "";
let count = 0;
let stats = { Homme: 0, Femme: 0, Autre: 0 };

snapshot.forEach((docSnap) => {
const data = docSnap.data();
const id = docSnap.id;
count++;
stats[data.sexe] = (stats[data.sexe] || 0) + 1;

php-template
Copier
Modifier
const row = `
  <tr>
    <td>${count}</td>
    <td>${data.nom}</td>
    <td>${data.prenom}</td>
    <td>${data.email}</td>
    <td>${data.telephone}</td>
    <td>${data.cin}</td>
    <td>${data.sexe}</td>
    <td>${data.date_ajout}</td>
    <td>
      <button class="btn btn-sm btn-warning me-1" onclick="editClient('${id}')"><i class="fa fa-edit"></i></button>
      <button class="btn btn-sm btn-danger" onclick="deleteClient('${id}')"><i class="fa fa-trash"></i></button>
    </td>
  </tr>
`;
tbody.insertAdjacentHTML("beforeend", row);
});

document.getElementById("totalClients").textContent = count;

// Mise à jour graphique
updateChart(stats.Homme, stats.Femme, stats.Autre);
});

// Supprimer
window.deleteClient = async (id) => {
if (confirm("Supprimer ce client ?")) {
await deleteDoc(doc(clientsRef, id));
}
};

// Modifier (formulaire en haut ou modal à créer)
window.editClient = async (id) => {
const docSnap = await getDocs(doc(clientsRef, id));
if (docSnap.exists()) {
const data = docSnap.data();
// Pré-remplir un formulaire de modification (à créer dans HTML)
alert("Fonction modifier à intégrer avec modal ou formulaire.");
}
};

// Recherche temps réel
document.getElementById("searchInput").addEventListener("input", (e) => {
const value = e.target.value.toLowerCase();
const rows = document.querySelectorAll("#clientsTable tr");
rows.forEach(row => {
const match = row.innerText.toLowerCase().includes(value);
row.style.display = match ? "" : "none";
});
});

// Filtre sexe
document.getElementById("filterSexe").addEventListener("change", (e) => {
const value = e.target.value;
const rows = document.querySelectorAll("#clientsTable tr");
rows.forEach(row => {
const sexe = row.children[6].innerText;
row.style.display = value === "Tous" || sexe === value ? "" : "none";
});
});

// Chart.js (doit être initialisé dans le HTML)
let chart;
function updateChart(homme, femme, autre) {
const ctx = document.getElementById("clientChart").getContext("2d");
if (chart) chart.destroy();
chart = new Chart(ctx, {
type: "doughnut",
data: {
labels: ["Homme", "Femme", "Autre"],
datasets: [{
data: [homme, femme, autre],
backgroundColor: ["#0d6efd", "#dc3545", "#ffc107"]
}]
},
options: {
responsive: true,
plugins: {
legend: { position: "bottom" }
}
}
});
}
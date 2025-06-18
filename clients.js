// Configuration Firebase (identique à avant)
const firebaseConfig = {
  apiKey: "AIzaSyCkwwwboM3lGW_284ZN5RZWJmmSL7JwkJU",
  authDomain: "mah-hotel.firebaseapp.com",
  projectId: "mah-hotel",
  storageBucket: "mah-hotel.appspot.com",
  messagingSenderId: "389877777937",
  appId: "1:389877777937:web:1c631c128857be29ab53b0"
};

// Initialisation
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.getFirestore(app);
const clientsCollection = collection(db, "clients");


// Éléments DOM
const addClientForm = document.getElementById("addClientForm");
const clientsTable = document.getElementById("clientsTable");
const searchInput = document.getElementById("searchInput");
const filterSexe = document.getElementById("filterSexe");
const totalClientsSpan = document.getElementById("totalClients");
const clientChartCtx = document.getElementById("clientChart").getContext('2d');

// Variables globales
let clientsData = [];
let clientChart;

// Initialisation
init();

// Fonctions principales
function init() {
  setupEventListeners();
  loadClients();
  initChart();
}

function setupEventListeners() {
  addClientForm.addEventListener("submit", handleAddClient);
  searchInput.addEventListener("input", filterClients);
  filterSexe.addEventListener("change", filterClients);
}

async function handleAddClient(e) {
  e.preventDefault();

  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const email = document.getElementById("email").value.trim();
  const telephone = formatPhone(document.getElementById("telephone").value.trim());
  const cin = formatCIN(document.getElementById("cin").value.trim());
  const sexe = document.getElementById("sexe").value;
  const date_ajout = new Date().toLocaleDateString('fr-FR');

  if (!validateForm(nom, prenom, email, telephone, cin, sexe)) return;

  try {
    await addDoc(clientsCollection, {
      nom, prenom, email, telephone, cin, sexe, date_ajout
    });
    addClientForm.reset();
    showAlert('Client ajouté avec succès!', 'success');
  } catch (error) {
    showAlert('Erreur lors de l\'ajout: ' + error.message, 'danger');
  }
}

function loadClients() {
  onSnapshot(clientsCollection, (snapshot) => {
    clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderClientsTable(clientsData);
    updateTotalClients(clientsData.length);
    updateChart(clientsData);
  });
}

function renderClientsTable(clients) {
  clientsTable.innerHTML = clients.map((client, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${client.nom}</td>
      <td>${client.prenom}</td>
      <td>${client.email}</td>
      <td>${client.telephone}</td>
      <td>${client.cin}</td>
      <td>${client.sexe}</td>
      <td>${client.date_ajout}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="showEditModal('${client.id}')">
          <i class="fa fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteClient('${client.id}')">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function filterClients() {
  const searchTerm = searchInput.value.toLowerCase();
  const sexeFilter = filterSexe.value;

  const filtered = clientsData.filter(client => {
    const matchesSearch = 
      client.nom.toLowerCase().includes(searchTerm) ||
      client.prenom.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.telephone.includes(searchTerm) ||
      client.cin.includes(searchTerm);

    const matchesSexe = sexeFilter === 'Tous' || client.sexe === sexeFilter;

    return matchesSearch && matchesSexe;
  });

  renderClientsTable(filtered);
}

// Fonctions utilitaires
function validateForm(nom, prenom, email, telephone, cin, sexe) {
  if (!nom || !prenom || !email || !telephone || !cin || !sexe) {
    showAlert('Veuillez remplir tous les champs', 'warning');
    return false;
  }

  if (!/^.+@.+\..+$/.test(email)) {
    showAlert('Email invalide', 'warning');
    return false;
  }

  return true;
}

function formatCIN(cin) {
  const digits = cin.replace(/\D/g, '');
  return digits.length === 12 ? 
    digits.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4") : cin;
}

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+261 ${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

function updateTotalClients(count) {
  totalClientsSpan.textContent = count;
}

// Fonctions pour le graphique
function initChart() {
  clientChart = new Chart(clientChartCtx, {
    type: 'doughnut',
    data: {
      labels: ['Homme', 'Femme', 'Autre'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ['#0d6efd', '#dc3545', '#6c757d']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function updateChart(clients) {
  const counts = {
    Homme: clients.filter(c => c.sexe === 'Homme').length,
    Femme: clients.filter(c => c.sexe === 'Femme').length,
    Autre: clients.filter(c => c.sexe === 'Autre').length
  };

  clientChart.data.datasets[0].data = [counts.Homme, counts.Femme, counts.Autre];
  clientChart.update();
}

// Fonctions globales
window.deleteClient = async (id) => {
  if (confirm('Voulez-vous vraiment supprimer ce client ?')) {
    try {
      await deleteDoc(doc(db, "clients", id));
      showAlert('Client supprimé avec succès', 'success');
    } catch (error) {
      showAlert('Erreur lors de la suppression: ' + error.message, 'danger');
    }
  }
};

window.showEditModal = async (id) => {
  const client = clientsData.find(c => c.id === id);
  if (!client) return;

  // À compléter avec une modal Bootstrap
  const newNom = prompt('Nouveau nom:', client.nom);
  const newPrenom = prompt('Nouveau prénom:', client.prenom);
  
  if (newNom && newPrenom) {
    try {
      await updateDoc(doc(db, "clients", id), {
        nom: newNom,
        prenom: newPrenom
      });
      showAlert('Client modifié avec succès', 'success');
    } catch (error) {
      showAlert('Erreur lors de la modification: ' + error.message, 'danger');
    }
  }
};

window.exportToPDF = () => {
  import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
    .then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.text('Liste des Clients - Mah Hotel', 10, 10);
      
      let y = 20;
      clientsData.forEach(client => {
        doc.text(
          `${client.nom} ${client.prenom} - ${client.email} - ${client.telephone}`,
          10, y
        );
        y += 10;
      });
      
      doc.save('clients-mah-hotel.pdf');
    });
};
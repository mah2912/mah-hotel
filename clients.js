// ===================== Données =====================
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let editingIndex = null;
const perPage = 10;
let currentPage = 1;

// ===================== Pré-remplir 25 clients =====================
if (clients.length === 0) {
  for (let i = 1; i <= 25; i++) {
    const tel = "3" + (Math.floor(Math.random() * 8) + 2) +
                ("0" + Math.floor(Math.random() * 90)).slice(-2) +
                Math.floor(100 + Math.random() * 899) +
                ("0" + Math.floor(Math.random() * 90)).slice(-2);
    const cin = ("" + Math.floor(100000000000 + Math.random() * 899999999999));
    clients.push({
      id: crypto.randomUUID(),
      prenom: "Client" + i,
      nom: "Test" + i,
      sexe: i % 3 === 0 ? "Autre" : i % 2 === 0 ? "Femme" : "Homme",
      telephone: formatPhone(tel),
      cin: formatCIN(cin)
    });
  }
  localStorage.setItem('clients', JSON.stringify(clients));
}

// ===================== DOM Elements =====================
const clientForm = document.getElementById('clientForm');
const prenomInput = document.getElementById('prenom');
const nomInput = document.getElementById('nom');
const sexeInput = document.getElementById('sexe');
const telephoneInput = document.getElementById('telephone');
const cinInput = document.getElementById('cin');
const searchInput = document.getElementById('searchClient');
const clientTable = document.getElementById('clientTable');
const totalClients = document.getElementById('totalClients');
const sexeChartCanvas = document.getElementById('sexeChart').getContext('2d');
const sexeFilter = document.getElementById('filtreSexe');
const pagination = document.getElementById('pagination');

// ===================== Utilitaires =====================
function showNotification(msg) {
  alert(msg); // Remplacez par une toast Bootstrap si vous voulez
}

function saveToStorage() {
  localStorage.setItem('clients', JSON.stringify(clients));
}

function formatCIN(cin) {
  return cin.replace(/[^0-9]/g, '').slice(0, 12).replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{3})/, '$1 $2 $3 $4');
}

function formatPhone(tel) {
  const digits = tel.replace(/[^0-9]/g, '').slice(0, 9);
  return '+261 ' + digits.replace(/(\\d{2})(\\d{2})(\\d{3})(\\d{2})/, '$1 $2 $3 $4');
}

// ===================== Rendu =====================
function renderClients() {
  let filtered = clients.filter(c => {
    const search = searchInput.value.toLowerCase();
    const sexeMatch = sexeFilter.value === '' || c.sexe === sexeFilter.value;
    return (
      (c.nom.toLowerCase().includes(search) ||
      c.prenom.toLowerCase().includes(search) ||
      c.cin.includes(search)) && sexeMatch
    );
  });

  const total = filtered.length;
  totalClients.textContent = total;

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageClients = filtered.slice(start, end);

  clientTable.innerHTML = pageClients.map(c => `
    <tr>
      <td>${c.prenom}</td>
      <td>${c.nom}</td>
      <td>${c.sexe}</td>
      <td>${c.telephone}</td>
      <td>${c.cin}</td>
      <td>
        <button class="btn btn-sm btn-primary me-2" onclick="editClient('${c.id}')">Éditer</button>
        <button class="btn btn-sm btn-danger" onclick="deleteClient('${c.id}')">Supprimer</button>
      </td>
    </tr>
  `).join('');

  renderPagination(total);
  renderChart();
}

function renderPagination(total) {
  const pages = Math.ceil(total / perPage);
  let html = '';
  for (let i = 1; i <= pages; i++) {
    html += `<button class="btn btn-sm btn-light me-1 ${i === currentPage ? 'fw-bold' : ''}" onclick="gotoPage(${i})">${i}</button>`;
  }
  pagination.innerHTML = html;
}

function gotoPage(p) {
  currentPage = p;
  renderClients();
}

// ===================== Chart =====================
let chart;
function renderChart() {
  const stats = { Homme: 0, Femme: 0, Autre: 0 };
  clients.forEach(c => stats[c.sexe]++);
  if (chart) chart.destroy();
  chart = new Chart(sexeChartCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Homme', 'Femme', 'Autre'],
      datasets: [{
        data: [stats.Homme, stats.Femme, stats.Autre],
        backgroundColor: ['#0d6efd', '#dc3545', '#6c757d']
      }]
    },
    options: {
      responsive: true
    }
  });
}

// ===================== Formulaire =====================
clientForm.onsubmit = e => {
  e.preventDefault();

  const data = {
    id: editingIndex || crypto.randomUUID(),
    prenom: prenomInput.value.trim(),
    nom: nomInput.value.trim(),
    sexe: sexeInput.value,
    telephone: formatPhone(telephoneInput.value),
    cin: formatCIN(cinInput.value)
  };

  if (editingIndex) {
    const i = clients.findIndex(c => c.id === editingIndex);
    clients[i] = data;
    showNotification('Client modifié avec succès');
  } else {
    clients.push(data);
    showNotification('Client ajouté avec succès');
  }

  saveToStorage();
  renderClients();
  clientForm.reset();
  editingIndex = null;
  bootstrap.Modal.getInstance(document.getElementById('clientModal')).hide();
};

function editClient(id) {
  const c = clients.find(c => c.id === id);
  if (!c) return;
  editingIndex = c.id;
  prenomInput.value = c.prenom;
  nomInput.value = c.nom;
  sexeInput.value = c.sexe;
  telephoneInput.value = c.telephone.replace('+261 ', '').replace(/\\s/g, '');
  cinInput.value = c.cin.replace(/\\s/g, '');
  new bootstrap.Modal(document.getElementById('clientModal')).show();
}

function deleteClient(id) {
  if (confirm('Supprimer ce client ?')) {
    clients = clients.filter(c => c.id !== id);
    saveToStorage();
    showNotification('Client supprimé avec succès');
    renderClients();
  }
}

// ===================== Filtres & Recherche =====================
searchInput.addEventListener('input', () => {
  currentPage = 1;
  renderClients();
});

sexeFilter.addEventListener('change', () => {
  currentPage = 1;
  renderClients();
});

// ===================== Export CSV =====================
document.getElementById('exportCSV').onclick = () => {
  const header = 'Prénom,Nom,Sexe,Téléphone,CIN\\n';
  const rows = clients.map(c =>
    [c.prenom, c.nom, c.sexe, c.telephone, c.cin].join(',')
  ).join('\\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clients.csv';
  link.click();
};

// ===================== Initialisation =====================
renderClients();

// === Sélecteurs ===
const formAdd = document.getElementById('clientForm');
const nomClient = document.getElementById('nomClient');
const prenomClient = document.getElementById('prenomClient');
const telClient = document.getElementById('telClient');
const genreClient = document.getElementById('genreClient');
const clientsTable = document.getElementById('clientsTable');
const searchInputs = document.querySelectorAll('.search-input');
const paginationContainer = document.getElementById('pagination');

const formEdit = document.getElementById('editClientForm');
const nomEdit = document.getElementById('editNomClient');
const prenomEdit = document.getElementById('editPrenomClient');
const telEdit = document.getElementById('editTelClient');
const genreEdit = document.getElementById('editGenreClient');
const modalEdit = new bootstrap.Modal(document.getElementById('editClientModal'));


const rowsPerPage = 10;
let currentSort = { column: null, order: 'asc' };

// === Fonctions Stockage ===
function getClients() {
  return JSON.parse(localStorage.getItem('clients')) || [];
}

function saveClients(clients) {
  localStorage.setItem('clients', JSON.stringify(clients));
}

// === Affichage ===
function renderTable(clientsToDisplay) {
  clientsTable.innerHTML = '';
  let start = (currentPage - 1) * rowsPerPage;
  let end = start + rowsPerPage;
  let pageClients = clientsToDisplay.slice(start, end);

  pageClients.forEach((client, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${client.id}</td>
      <td>${client.nom}</td>
      <td>${client.prenom}</td>
      <td>${client.genre}</td>
      <td>${client.tel}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1" onclick="openEditModal(${client.id})"><i class="fa fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteClient(${client.id})"><i class="fa fa-trash"></i></button>
      </td>
    `;
    clientsTable.appendChild(tr);
  });

  renderPagination(clientsToDisplay.length);
}

// === Pagination ===
function renderPagination(totalItems) {
  const pageCount = Math.ceil(totalItems / rowsPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for(let i=1; i<=pageCount; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.classList.add('btn', 'btn-sm', 'me-1');
    if(i === currentPage) btn.classList.add('btn-primary'); 
    else btn.classList.add('btn-outline-primary');
    btn.addEventListener('click', () => {
      currentPage = i;
      applyFiltersAndSort();
    });
    pagination.appendChild(btn);
  }
}

// === Recherche dynamique sur chaque colonne ===
function applyFiltersAndSort() {
  let filtered = clients;

  // Filtre par colonnes (si on a plusieurs inputs recherche)
  const nomFilter = document.getElementById('searchNom').value.toLowerCase();
  const prenomFilter = document.getElementById('searchPrenom').value.toLowerCase();
  const genreFilter = document.getElementById('searchGenre').value.toLowerCase();
  const telFilter = document.getElementById('searchTel').value.toLowerCase();

  filtered = filtered.filter(c =>
    c.nom.toLowerCase().includes(nomFilter) &&
    c.prenom.toLowerCase().includes(prenomFilter) &&
    c.genre.toLowerCase().includes(genreFilter) &&
    c.tel.toLowerCase().includes(telFilter)
  );

  // Tri
  if(currentSort.column) {
    filtered.sort((a, b) => {
      let valA = a[currentSort.column].toLowerCase();
      let valB = b[currentSort.column].toLowerCase();
      if(valA < valB) return currentSort.order === 'asc' ? -1 : 1;
      if(valA > valB) return currentSort.order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  renderTable(filtered);
}

// === Ajout client ===
formAdd.addEventListener('submit', e => {
  e.preventDefault();

  const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
  const newClient = {
    id: newId,
    nom: nomClient.value.trim(),
    prenom: prenomClient.value.trim(),
    genre: genreClient.value,
    tel: telClient.value.trim()
  };

  clients.push(newClient);
  saveClients(clients);
  formAdd.reset();
  bootstrap.Modal.getInstance(document.getElementById('clientModal')).hide();
  currentPage = 1;
  applyFiltersAndSort();
  showAlert('Client ajouté avec succès!', 'success');
});

// === Supprimer client ===
function deleteClient(id) {
  if(!confirm('Voulez-vous vraiment supprimer ce client ?')) return;
  clients = clients.filter(c => c.id !== id);
  saveClients(clients);
  applyFiltersAndSort();
  showAlert('Client supprimé.', 'warning');
}

// === Modifier client ===
function openEditModal(id) {
  const client = clients.find(c => c.id === id);
  if(!client) return;

  document.getElementById('editClientId').value = client.id;
  nomEdit.value = client.nom;
  prenomEdit.value = client.prenom;
  genreEdit.value = client.genre;
  telEdit.value = client.tel;

  modalEdit.show();
}

formEdit.addEventListener('submit', e => {
  e.preventDefault();

  const id = parseInt(document.getElementById('editClientId').value);
  const idx = clients.findIndex(c => c.id === id);
  if(idx === -1) return;

  clients[idx].nom = nomEdit.value.trim();
  clients[idx].prenom = prenomEdit.value.trim();
  clients[idx].genre = genreEdit.value;
  clients[idx].tel = telEdit.value.trim();

  saveClients(clients);
  modalEdit.hide();
  applyFiltersAndSort();
  showAlert('Client modifié avec succès!', 'info');
});

// === Tri colonne ===
document.querySelectorAll('th.sortable').forEach(th => {
  th.style.cursor = 'pointer';
  th.addEventListener('click', () => {
    const column = th.dataset.column;
    if(currentSort.column === column) {
      currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
      currentSort.column = column;
      currentSort.order = 'asc';
    }
    applyFiltersAndSort();
  });
});

// === Alert Bootstrap ===
function showAlert(message, type = 'info') {
  const alertPlaceholder = document.getElementById('alertPlaceholder');
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  alertPlaceholder.append(wrapper);
  setTimeout(() => {
    bootstrap.Alert.getOrCreateInstance(wrapper.querySelector('.alert')).close();
  }, 4000);
}

// === Initialisation ===
clients = getClients();
applyFiltersAndSort();
// Fonction pour compter par genre et afficher graphique
function updateGenreChart() {
  const counts = { M: 0, F: 0, Autre: 0 };
  clients.forEach(c => {
    if(counts[c.genre] !== undefined) counts[c.genre]++;
    else counts['Autre']++;
  });

  const ctx = document.getElementById('genreChart').getContext('2d');

  if(window.genreChart) window.genreChart.destroy();

  window.genreChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Masculin', 'Féminin', 'Autre'],
      datasets: [{
        data: [counts.M, counts.F, counts.Autre],
        backgroundColor: ['#0d6efd', '#d63384', '#6c757d']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Appelle cette fonction chaque fois que la liste clients change
// Par exemple, à la fin de ta fonction d'affichage des clients (renderClients) :
function renderClients() {
  // Ton code de rendu tableau ici...

  updateGenreChart();
}

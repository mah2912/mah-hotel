
// ===========================
// Fichier : chambres.js
// Projet : Mah Hotel
// Objectif : Gestion des chambres avec Firebase Firestore
// ===========================

// 🔄 Configuration des types de chambres avec prix et image par défaut
const types = {
  "Simple": { prix: 15000, image: "https://source.unsplash.com/400x300/?hotel+simple" },
  "Couple": { prix: 25000, image: "https://source.unsplash.com/400x300/?hotel+couple" },
  "Famille": { prix: 40000, image: "https://source.unsplash.com/400x300/?hotel+family" },
  "Bungalow": { prix: 50000, image: "https://source.unsplash.com/400x300/?hotel+bungalow" },
  "Villa": { prix: 85000, image: "https://source.unsplash.com/400x300/?hotel+villa" },
  "Penthouse": { prix: 100000, image: "https://source.unsplash.com/400x300/?hotel+penthouse" }
};

// 🔧 Sélections DOM
const tableBody = document.getElementById('chambreTableBody');
const form = document.getElementById('chambreForm');
const modal = new bootstrap.Modal(document.getElementById('chambreModal'));
const searchInput = document.getElementById('searchInput');
const totalChambresEl = document.getElementById('totalChambres');
const totalDisponiblesEl = document.getElementById('totalDisponibles');
const totalOccupeesEl = document.getElementById('totalOccupees');
const filterType = document.getElementById('filterType');
const filterStatut = document.getElementById('filterStatut');

let compteurID = 1;

// 📦 Fonction de chargement et affichage des chambres
function chargerChambres() {
  db.collection("chambres").orderBy("id").onSnapshot(snapshot => {
    tableBody.innerHTML = "";
    let total = 0, dispo = 0, occupe = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      total++;
      if (data.statut === "disponible") dispo++;
      else occupe++;

      const badge = data.statut === "disponible"
        ? '<span class="badge bg-success">Disponible</span>'
        : '<span class="badge bg-danger">Occupée</span>';

      tableBody.innerHTML += `
        <tr>
          <td>${data.id}</td>
          <td>${data.type}</td>
          <td>${data.prix.toLocaleString()} Ar</td>
          <td>${badge}</td>
          <td>
            <button class="btn btn-sm btn-info" onclick="voirImage('${data.image}')">
              <i class="fa fa-eye"></i> Voir
            </button>
          </td>
          <td>
            <button class="btn btn-sm btn-warning" onclick='editerChambre("${doc.id}")'>✏️</button>
            <button class="btn btn-sm btn-danger" onclick="supprimerChambre('${doc.id}')">🗑️</button>
          </td>
        </tr>
      `;
    });

    totalChambresEl.textContent = total;
    totalDisponiblesEl.textContent = dispo;
    totalOccupeesEl.textContent = occupe;
    compteurID = total + 1;
  });
}

// 📸 Affiche la photo dans une modale
function voirImage(url) {
  document.getElementById("imagePreview").src = url;
  const imageModal = new bootstrap.Modal(document.getElementById("imageModal"));
  imageModal.show();
}

// ✏️ Remplit le formulaire avec les infos de la chambre sélectionnée
function editerChambre(docId) {
  db.collection("chambres").doc(docId).get().then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      document.getElementById("chambreId").value = docId;
      document.getElementById("type").value = data.type;
      document.getElementById("statut").value = data.statut;
      document.getElementById("description").value = data.description || '';
      modal.show();
    }
  });
}

// 🗑️ Supprime une chambre
function supprimerChambre(id) {
  if (confirm("Supprimer cette chambre ?")) {
    db.collection("chambres").doc(id).delete();
  }
}

// ✅ Gère l'ajout ou la modification de chambre
form.addEventListener('submit', e => {
  e.preventDefault();

  const docId = document.getElementById("chambreId").value;
  const type = document.getElementById("type").value;
  const statut = document.getElementById("statut").value;
  const description = document.getElementById("description").value;

  const prix = types[type]?.prix || 0;
  const image = types[type]?.image || "";

  const chambre = { type, statut, description, prix, image };

  if (docId) {
    db.collection("chambres").doc(docId).update(chambre)
      .then(() => {
        alert("✅ Chambre mise à jour !");
        form.reset();
        modal.hide();
        chargerChambres();
      });
  } else {
    chambre.id = `CH-${String(compteurID).padStart(3, '0')}`;
    db.collection("chambres").add(chambre)
      .then(() => {
        alert("✅ Chambre ajoutée !");
        form.reset();
        modal.hide();
        chargerChambres();
      });
  }
  document.getElementById("chambreId").value = '';
});

// 🔎 Filtrage et recherche
function appliquerFiltreRecherche() {
  const search = searchInput.value.toLowerCase();
  const typeFiltre = filterType.value.toLowerCase();
  const statutFiltre = filterStatut.value.toLowerCase();

  Array.from(tableBody.rows).forEach(row => {
    const text = row.innerText.toLowerCase();
    const type = row.cells[1].innerText.toLowerCase();
    const statut = row.cells[3].innerText.toLowerCase();

    const matchRecherche = text.includes(search);
    const matchType = !typeFiltre || type === typeFiltre;
    const matchStatut = !statutFiltre || statut.includes(statutFiltre);

    row.style.display = matchRecherche && matchType && matchStatut ? "" : "none";
  });
}

// 🔁 Appliquer les filtres en temps réel
searchInput.addEventListener("input", appliquerFiltreRecherche);
filterType.addEventListener("change", appliquerFiltreRecherche);
filterStatut.addEventListener("change", appliquerFiltreRecherche);

// ▶️ Initialisation
chargerChambres();

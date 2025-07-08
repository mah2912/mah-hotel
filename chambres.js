// 🔄 Types de chambres avec prix et image
const types = {
  "Simple": { prix: 15000, image: "https://source.unsplash.com/400x300/?hotel+simple" },
  "Couple": { prix: 25000, image: "https://source.unsplash.com/400x300/?hotel+couple" },
  "Famille": { prix: 40000, image: "https://source.unsplash.com/400x300/?hotel+family" },
  "Bungalow": { prix: 50000, image: "https://source.unsplash.com/400x300/?hotel+bungalow" },
  "Villa": { prix: 85000, image: "https://source.unsplash.com/400x300/?hotel+villa" },
  "Penthouse": { prix: 100000, image: "https://source.unsplash.com/400x300/?hotel+penthouse" }
};

const tableBody = document.getElementById('chambreTableBody');
const form = document.getElementById('chambreForm');
const modal = new bootstrap.Modal(document.getElementById('chambreModal'));
const searchInput = document.getElementById('searchInput');

const totalChambresEl = document.getElementById('totalChambres');
const totalDisponiblesEl = document.getElementById('totalDisponibles');
const totalOccupeesEl = document.getElementById('totalOccupees');

let compteurID = 1;

// 📦 Fonction d’affichage des chambres
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
        ? `<span class="badge badge-disponible">Disponible</span>`
        : `<span class="badge badge-occupée">Occupée</span>`;

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
            <button class="btn btn-sm btn-warning" onclick='editerChambre("${doc.id}", ${JSON.stringify(data).replace(/"/g, '&quot;')})'>✏️</button>
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

// 📸 Voir image
function voirImage(url) {
  window.open(url, '_blank');
}

// ✏️ Pré-remplir formulaire
function editerChambre(docId, data) {
  document.getElementById("chambreId").value = docId;
  document.getElementById("type").value = data.type;
  document.getElementById("statut").value = data.statut;
  document.getElementById("description").value = data.description || '';
  modal.show();
}

// 🗑️ Supprimer
function supprimerChambre(id) {
  if (confirm("Supprimer cette chambre ?")) {
    db.collection("chambres").doc(id).delete();
  }
}

// ✅ Ajouter ou modifier
form.addEventListener('submit', e => {
  e.preventDefault();
  const docId = document.getElementById("chambreId").value;
  const type = document.getElementById("type").value;
  const statut = document.getElementById("statut").value;
  const description = document.getElementById("description").value;
  const prix = types[type].prix;
  const image = types[type].image;

  const chambre = {
    id: docId ? undefined : `CH-${String(compteurID).padStart(3, '0')}`,
    type, prix, statut, description, image
  };

  if (docId) {
    db.collection("chambres").doc(docId).update(chambre);
  } else {
    chambre.id = `CH-${String(compteurID).padStart(3, '0')}`;
    db.collection("chambres").add(chambre);
  }

  form.reset();
  document.getElementById("chambreId").value = '';
  modal.hide();
});

// 🔎 Recherche
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  Array.from(tableBody.rows).forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(q) ? "" : "none";
  });
});

// 🔁 Charger au démarrage
chargerChambres();

const reservations = [
  { client: "Jean Rakoto", chambre: "101", date: "2025-06-05", statut: "Confirmée" },
  { client: "Mira Soa", chambre: "204", date: "2025-06-04", statut: "En attente" },
  { client: "Hery", chambre: "301", date: "2025-06-03", statut: "Annulée" },
  { client: "Nina", chambre: "108", date: "2025-06-02", statut: "Confirmée" }
];

function afficherReservations() {
  const tbody = document.getElementById("reservationTable");
  tbody.innerHTML = "";
  reservations.forEach(r => {
    const statusClass = r.statut === "Confirmée" ? "success" : r.statut === "Annulée" ? "danger" : "warning";
    tbody.innerHTML += `
      <tr>
        <td>${r.client}</td>
        <td>${r.chambre}</td>
        <td>${r.date}</td>
        <td><span class="badge bg-${statusClass}">${r.statut}</span></td>
      </tr>`;
  });
}
afficherReservations();

// Filtrage simple
document.getElementById("searchInput").addEventListener("input", e => {
  const val = e.target.value.toLowerCase();
  document.querySelectorAll("#reservationTable tr").forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(val) ? "" : "none";
  });
});

// Chart.js doughnut
const ctx = document.getElementById('statsChart').getContext('2d');
new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Clients', 'Chambres', 'Réservations'],
    datasets: [{
      label: 'Statistiques',
      data: [42, 18, 27],
      backgroundColor: ['#0d6efd', '#198754', '#ffc107'],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});

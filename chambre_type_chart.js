
// 📊 Graphe des types de chambres avec Chart.js

let chartInstance;

function majGraphiqueTypes() {
  db.collection("chambres").onSnapshot(snapshot => {
    const stats = {
      "Simple": 0,
      "Couple": 0,
      "Famille": 0,
      "Bungalow": 0,
      "Villa": 0,
      "Penthouse": 0
    };

    snapshot.forEach(doc => {
      const type = doc.data().type;
      if (stats[type] !== undefined) stats[type]++;
    });

    const ctx = document.getElementById("typeChart").getContext("2d");
    const data = {
      labels: Object.keys(stats),
      datasets: [{
        label: "Nombre de chambres",
        data: Object.values(stats),
        backgroundColor: [
          "#007bff", "#28a745", "#ffc107", "#17a2b8", "#6f42c1", "#dc3545"
        ]
      }]
    };

    if (chartInstance) chartInstance.destroy(); // 🔄 évite les doublons
    chartInstance = new Chart(ctx, {
      type: "bar",
      data: data,
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  });
}

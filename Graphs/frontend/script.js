const ctx = document.getElementById("chart").getContext("2d");
let chart;
const selectContainer = document.getElementById("outlet_id");
const selectContainer2 = document.getElementById("compare_type");
const outletLabel = document.getElementById("outlet_label");
let tab = "fetch";
const backendUrl = "http://localhost:8080";
// function toggleSelectVisibility(show, element) {
//   //   const selectContainer = document.querySelector(".select-container");
//   if (show) {
//     element.style.display = "block";

//   } else {
//     element.style.display = "none"; // Hide the select element
//   }
// }
function toggleSelectVisibility(show, element) {
  if (show) {
    element.style.visibility = "visible"; // Make the element visible
    element.style.opacity = "1"; // Fully opaque
    element.style.pointerEvents = "auto"; // Enable interactions
  } else {
    element.style.visibility = "hidden"; // Hide the element
    element.style.opacity = "0"; // Fully transparent
    element.style.pointerEvents = "none"; // Disable interactions
  }
}
async function fetchData(groupBy, outlet_id) {
  toggleSelectVisibility(true, selectContainer);
  toggleSelectVisibility(true, outletLabel);
  tab = "fetch";
  try {
    const response = await fetch(
      `${backendUrl}/invoice/grouped?groupBy=${groupBy}&outlet_id=${outlet_id}`
    );
    const data = await response.json();

    const labels = data.map((item) => item.day || item._id);

    const totalData = data.reduce(
      (acc, item) => {
        const { totalAmount, avgAmount, count } = item;
        acc.avgAmount.push(avgAmount);
        acc.count.push(count);
        acc.totalAmount.push(totalAmount);
        return acc;
      },
      {
        avgAmount: [],
        totalAmount: [],
        count: [],
      }
    );
    // const totalAmounts = data.map((item) => item.totalAmount);
    // const avgAmount = data.map((item) => item.avgAmount);

    // Update the chart
    updateChart({ labels, data: totalData, groupBy });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function updateChart({ labels, data, groupBy }) {
  if (chart) {
    chart.destroy(); // Destroy the previous chart instance
  }
  console.log(data);
  chart = new Chart(ctx, {
    // type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          type: "line",
          label: `Average Amount (${groupBy})`,
          data: data.avgAmount,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
        },
        {
          type: "line",
          label: `Total Amount (${groupBy})`,
          data: data.totalAmount,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgb(182, 145, 25)",
          borderWidth: 2,
        },
        {
          type: "line",
          label: `Total Count (${groupBy})`,
          data: data.count,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgb(37, 214, 14)",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
function updateComparisonChart({ labels, data, groupBy }) {
  if (chart) {
    chart.destroy(); // Destroy the previous chart instance
  }

  const ctx = document.getElementById("chart").getContext("2d");

  // Create datasets for each outlet
  const datasets = Object.entries(data).flatMap(([outlet_id, outletData]) => [
    {
      type: "line",
      label: `${outlet_id} - Total Amount`,
      data: outletData.totalAmount,
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, ${Math.random()})`,
      borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, ${Math.random()})`,
      borderWidth: 2,
    },
    {
      type: "line",
      label: `${outlet_id} - Average Amount`,
      data: outletData.avgAmount,
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, ${Math.random()})`,
      borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, ${Math.random()})`,
      borderWidth: 2,
    },
    {
      type: "line",
      label: `${outlet_id} - Count`,
      data: outletData.count,
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, ${Math.random()})`,
      borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, ${Math.random()})`,
      borderWidth: 2,
    },
  ]);

  // Create the chart
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels, // Unified labels (all unique dates)
      datasets: datasets, // Datasets for all outlets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

async function CompareData(groupBy) {
  tab = "compare";
  toggleSelectVisibility(false, selectContainer);
  toggleSelectVisibility(false, outletLabel);
  try {
    const response = await fetch(
      `${backendUrl}/invoice/compare?groupBy=${groupBy}`
    );
    const data = await response.json();

    // Create a unified set of all unique dates (labels)
    const allLabels = Array.from(new Set(data.map((item) => item.date))).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    // Prepare data for each outlet
    const modifiedData = data.reduce((acc, item) => {
      const { count, totalAmount, avgAmount, outlet_id, date } = item;

      // Ensure each outlet has an entry in the accumulator
      if (!acc[outlet_id]) {
        acc[outlet_id] = {
          totalAmount: Array(allLabels.length).fill(null),
          avgAmount: Array(allLabels.length).fill(null),
          count: Array(allLabels.length).fill(null),
        };
      }

      // Find the index of the current date in the unified labels
      const dateIndex = allLabels.indexOf(date);

      // Populate the data for the current outlet and date
      acc[outlet_id].totalAmount[dateIndex] = totalAmount;
      acc[outlet_id].avgAmount[dateIndex] = avgAmount;
      acc[outlet_id].count[dateIndex] = count;

      return acc;
    }, {});

    // Update the chart
    updateComparisonChart({ labels: allLabels, data: modifiedData, groupBy });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function applyData() {
  const outlet_id = selectContainer.value;
  const date_type = selectContainer2.value;
  if (date_type != "weekly") {
    if (tab === "fetch") {
      fetchData(date_type, outlet_id);
    } else {
      CompareData(date_type);
    }
  }
}
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("active"); // Toggle the 'active' class
}

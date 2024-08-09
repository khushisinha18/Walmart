function updateValue(type) {
    var elements = document.getElementsByName("type");
    elements.forEach(function(element) {
        if (element.id === type) {
            element.value = "1";
        } else {
            element.value = "0";
        }
    });
}

// document.getElementById("inventory_form").addEventListener("submit", function(event) {
//     event.preventDefault();
//     getData();
// });

document.getElementById("predictionForm").addEventListener("submit", function(event) {
    event.preventDefault();
    sendData();
});

async function sendData() {
    const form = document.getElementById("predictionForm");
    const formData = new FormData(form);

    // Convert formData to JSON object
    const jsonObject = {};
    formData.forEach((value, key) => {
        jsonObject[key] = value;
    });

    // Parse numerical values
    jsonObject.Store = parseInt(jsonObject.Store);
    jsonObject.Dept = parseInt(jsonObject.Dept);
    jsonObject.Temperature = parseFloat(jsonObject.Temperature);
    jsonObject.MarkDown1 = parseFloat(jsonObject.MarkDown1);
    jsonObject.MarkDown2 = parseFloat(jsonObject.MarkDown2);
    jsonObject.MarkDown4 = parseFloat(jsonObject.MarkDown4);
    jsonObject.MarkDown5 = parseFloat(jsonObject.MarkDown5);
    jsonObject.Size = parseInt(jsonObject.Size);
    jsonObject.Type_A = document.getElementById('Type_A').checked ? 1 : 0;
    jsonObject.Type_B = document.getElementById('Type_B').checked ? 1 : 0;
    jsonObject.Type_C = document.getElementById('Type_C').checked ? 1 : 0;
    jsonObject.Month = parseInt(jsonObject.Month);
    jsonObject.Day = parseInt(jsonObject.Day);
    jsonObject.isHoliday = jsonObject.isHoliday === "flase" ? 0 : 1;

    // Print the data being sent to the server
    console.log("Data sent to server:", JSON.stringify(jsonObject));

    // Send JSON data to the server
    const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Specify content type as JSON
        },
        body: JSON.stringify(jsonObject), // Convert JSON object to string
        mode: 'cors'
    });

    const data = await response.json();
    document.getElementById("predictionResult").innerText = `${data.prediction} $`;
}

// async function getData() {
//     var storeNumber = document.getElementById("storeSelect").value;
//     var deptNumber = document.getElementById("deptSelect").value;

//     try {
//         const response = await fetch(`http://127.0.0.1:5000/get_data?store_number=${storeNumber}&dept_number=${deptNumber}`, {
//             method: 'GET',
//             mode: 'cors'
//         });

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         const data = await response.json();

//         var output = document.querySelector('.responsive-table'); // Select the table container

//         // Clear previous content
//         output.innerHTML = `
//             <li class="table-header">
//                 <div class="col col-1">Store</div>
//                 <div class="col col-2">Department</div>
//                 <div class="col col-3">Date</div>
//                 <div class="col col-4">Is Holiday</div>
//                 <div class="col col-5">Inventory</div>
//             </li>`;

//         // Loop through the data array and generate HTML for each row
//         data.forEach(function(row) {
//             var rowElement = document.createElement("li");
//             rowElement.classList.add("table-row");
//             rowElement.innerHTML = `
//                 <div class="col col-1" data-label="Store">${row.Store}</div>
//                 <div class="col col-2" data-label="Department">${row.Dept}</div>
//                 <div class="col col-3" data-label="Date">${row.Date}</div>
//                 <div class="col col-4" data-label="Is Holiday">${row.IsHoliday}</div>
//                 <div class="col col-5" data-label="Inventory">${row.Last_Known_Inventory}</div>`;
//             output.appendChild(rowElement);
//         });
//     } catch (error) {
//         console.error('Error fetching data:', error);
//     }
// }


// new plot .code


async function getDataAndPlotGraph() {
    var storeNumber = document.getElementById("storeSelect").value;
    var deptNumber = document.getElementById("deptSelect").value;

    try {
        const response = await fetch(`http://127.0.0.1:5000/get_data?store_number=${storeNumber}&dept_number=${deptNumber}`, {
            method: 'GET',
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Extract dates and inventory levels from data
        const dates = data.map(row => row.Date);
        const inventory = data.map(row => row.Last_Known_Inventory);

        // Call function to plot graph
        plotGraph(dates, inventory);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function plotGraph(xValues, yValues) {
    new Chart("myChart", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                fill: false,
                lineTension: 1,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "#6e985f",
                data: yValues,
                pointStyle: 'circle', // Change the point style to circle
                pointRadius: 3, // Adjust the point radius
                pointBackgroundColor: '#74b45c', // Set the color of the points
                pointBorderColor: '#92be82', // Set the border color of the points
                pointBorderWidth: 1 ,// Set the border width of the points
                fontWeight: 200 
              }]
        },
        options: {
            legend: { display: false },
            scales: {
                yAxes: [{ ticks: { min: Math.min(...yValues) - 1, max: Math.max(...yValues) + 1 } }],
            }
        }
    });
}

document.getElementById("inventory_form").addEventListener("submit", function(event) {
    event.preventDefault();
    getDataAndPlotGraph();
});

document.getElementById("email-form").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get email address
    const email = document.getElementById("email").value;

    // Get prediction data
    const predictionData = document.getElementById("predictionResult").innerText;

    // Get inventory data
    const inventoryRows = document.querySelectorAll(".table-row");
    const inventoryData = [];
    inventoryRows.forEach(row => {
        const store = row.querySelector("[data-label='Store']").innerText;
        const dept = row.querySelector("[data-label='Department']").innerText;
        const date = row.querySelector("[data-label='Date']").innerText;
        const isHoliday = row.querySelector("[data-label='Is Holiday']").innerText;
        const inventory = row.querySelector("[data-label='Inventory']").innerText;

        inventoryData.push({
            store,
            dept,
            date,
            isHoliday,
            inventory
        });
    });

    // Prepare data to send to Flask API
    const data = {
        email,
        predictionData,
        inventoryData
    };

    // Send data to Flask API
    fetch('http://127.0.0.1:5000/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Show success message
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to send email. Please try again later.');
    });
});

async function populateDropdowns() {
    populateStoreDropdown();
    populateDeptDropdown();
}

function populateStoreDropdown() {
    const storeSelect = document.getElementById("storeSelect");
    for (let i = 1; i <= 45; i++) {
        const option = document.createElement("option");
        option.text = `Store ${i}`;
        option.value = i;
        storeSelect.add(option);
    }
}

function populateDeptDropdown() {
    const deptSelect = document.getElementById("deptSelect");
    for (let i = 1; i <= 99; i++) {
        const option = document.createElement("option");
        option.text = `Dept ${i}`;
        option.value = i;
        deptSelect.add(option);
    }
}

// Initialize the page
populateDropdowns();

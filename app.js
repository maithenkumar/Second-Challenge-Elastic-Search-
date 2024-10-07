const v_nameCollection = 'ash-makkumar';
const v_phoneCollection = 'hash234';

// Show messages to the user
function showMessage(msg) {
    document.getElementById('message').innerText = msg;
}

// Function to create collection
async function createCollection(collectionName) {
    try {
        const response = await fetch(`http://localhost:9200/${collectionName}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            showMessage(`Collection '${collectionName}' created successfully!`);
        } else {
            showMessage(`Failed to create collection '${collectionName}'`);
        }
    } catch (error) {
        showMessage(`Error: ${error.message}`);
    }
}

// Function to get employee count
async function getEmpCount(collectionName) {
    try {
        const response = await fetch(`http://localhost:9200/${collectionName}/_count`);
        const data = await response.json();
        showMessage(`Employee count for '${collectionName}': ${data.count}`);
    } catch (error) {
        showMessage(`Error: ${error.message}`);
    }
}

// Function to index CSV data
async function uploadCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    if (!file) {
        showMessage('Please select a CSV file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        const csvData = e.target.result;
        const lines = csvData.split('\n').map(line => line.trim()).filter(line => line);
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            const rowData = lines[i].split(',');
            const body = headers.reduce((obj, header, index) => {
                obj[header] = rowData[index];
                return obj;
            }, {});

            try {
                await fetch(`http://localhost:9200/${v_nameCollection}/_doc`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            } catch (error) {
                showMessage(`Error: ${error.message}`);
            }
        }
        showMessage('CSV data indexed successfully!');
    };
    reader.readAsText(file);
}

// Function to delete employee by ID
async function delEmpById(collectionName, employeeId) {
    try {
        const response = await fetch(`http://localhost:9200/${collectionName}/_doc/${employeeId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            showMessage(`Employee with ID '${employeeId}' deleted.`);
        } else {
            showMessage(`Failed to delete employee with ID '${employeeId}'.`);
        }
    } catch (error) {
        showMessage(`Error: ${error.message}`);
    }
}

// Function to search by column
async function searchByColumn(collectionName, fieldName, searchValue) {
    const query = {
        query: {
            match: {
                [fieldName]: searchValue
            }
        }
    };

    try {
        const response = await fetch(`http://localhost:9200/${collectionName}/_search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        });
        const data = await response.json();
        displayResults(data.hits.hits);
    } catch (error) {
        showMessage(`Error: ${error.message}`);
    }
}

// Function to display search results
function displayResults(results) {
    const tableBody = document.querySelector('#resultsTable tbody');
    tableBody.innerHTML = ''; // Clear previous results
    results.forEach(result => {
        const row = document.createElement('tr');
        Object.values(result._source).forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });
}


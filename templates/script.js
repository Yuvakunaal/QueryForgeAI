// Global variables
let tables = [];
let isConnected = false;
let lastGeneratedSql = "";

// Global variables to store database settings
let dbSettings = {
  host: "localhost",
  user: "root",
  password: "",
  database: "",
};

// Initialize the application in offline mode
document.addEventListener("DOMContentLoaded", function () {
  updateConnectionStatus(false);
  disableFunctionality();
  checkConnection(); // Try initial connection with empty settings (will fail)
});

// Update connection status UI
function updateConnectionStatus(connected) {
  isConnected = connected;
  const statusIndicator = document.getElementById("statusIndicator");
  const statusText = document.getElementById("statusText");

  if (connected) {
    statusIndicator.classList.remove("offline");
    statusText.textContent = "Connected";
    enableFunctionality();
    loadTables();
  } else {
    statusIndicator.classList.add("offline");
    statusText.textContent = "Offline - Configure database settings";
    disableFunctionality();
  }
}

// Disable all functionality when offline
function disableFunctionality() {
  // Disable buttons and inputs
  const buttons = document.querySelectorAll(
    "button:not(.btn-icon):not(.modal-footer button):not(.modal-header button):not(.floating-action)"
  );
  const selects = document.querySelectorAll("select");
  const textareas = document.querySelectorAll("textarea");

  buttons.forEach((btn) => {
    if (!btn.classList.contains("btn-icon")) {
      btn.disabled = true;
      btn.classList.add("disabled");
    }
  });

  selects.forEach((select) => {
    select.disabled = true;
    select.classList.add("disabled");
  });

  textareas.forEach((textarea) => {
    textarea.disabled = true;
    textarea.classList.add("disabled");
  });

  // Clear all data containers
  document.getElementById("tables-list").innerHTML =
    '<div class="info"><i class="fas fa-database"></i> Connect to database to see tables</div>';
  document.getElementById("schema-details").innerHTML =
    '<div class="info"><i class="fas fa-info-circle"></i> Database connection required</div>';
}

// Enable functionality when connected
function enableFunctionality() {
  const buttons = document.querySelectorAll("button:not(.btn-icon)");
  const selects = document.querySelectorAll("select");
  const textareas = document.querySelectorAll("textarea");

  buttons.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("disabled");
  });

  selects.forEach((select) => {
    select.disabled = false;
    select.classList.remove("disabled");
  });

  textareas.forEach((textarea) => {
    textarea.disabled = false;
    textarea.classList.remove("disabled");
  });
}

// Check connection status with proper timeout handling
async function checkConnection() {
  try {
    const response = await fetch("/api/check-connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dbSettings),
    });

    if (response.ok) {
      updateConnectionStatus(true);
      return true;
    } else {
      // Handle non-OK responses (4xx, 5xx)
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server returned ${response.status}`);
    }
  } catch (error) {
    updateConnectionStatus(false);
    console.error("Connection check failed:", error.message);
    return false;
  }
}

// Settings modal functions
function openSettings() {
  const modal = document.getElementById("settingsModal");
  modal.style.display = "block";

  // Fill form with current settings
  document.getElementById("dbHost").value = dbSettings.host;
  document.getElementById("dbUser").value = dbSettings.user;
  document.getElementById("dbPassword").value = dbSettings.password;
  document.getElementById("dbName").value = dbSettings.database;
}

function closeSettings() {
  const modal = document.getElementById("settingsModal");
  modal.style.display = "none";
}

async function saveSettings() {
  // Update the global settings object
  dbSettings.host = document.getElementById("dbHost").value || "localhost";
  dbSettings.user = document.getElementById("dbUser").value || "root";
  dbSettings.password = document.getElementById("dbPassword").value || "";
  dbSettings.database = document.getElementById("dbName").value || "";

  if (!dbSettings.database) {
    showNotification("Please specify a database name", "error");
    return;
  }

  // Test the connection with new settings
  const isConnected = await checkConnection();

  if (isConnected) {
    // Close modal
    closeSettings();
    // Show success message
    showNotification("Database connection established!", "success");
    // Reload tables after successful connection
    loadTables();
  } else {
    showNotification("Connection failed. Please check your settings.", "error");
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("settingsModal");
  if (event.target === modal) {
    closeSettings();
  }
};

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  loadTables();
  document
    .getElementById("schema-select")
    .addEventListener("change", loadSchema);
});

// Load available tables
async function loadTables() {
  if (!isConnected) {
    const tablesList = document.getElementById("tables-list");
    tablesList.innerHTML =
      '<div class="info"><i class="fas fa-database"></i> Connect to database to see tables</div>';
    return;
  }

  try {
    const response = await fetch("/api/tables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dbSettings),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API returned ${response.status}`);
    }

    const data = await response.json();
    tables = data.tables;

    // Populate table select dropdowns
    const tableSelect = document.getElementById("table-select");
    const schemaSelect = document.getElementById("schema-select");
    const nlTableSelect = document.getElementById("nl-table-select");

    // Clear existing options
    tableSelect.innerHTML = '<option value="">Select a table</option>';
    schemaSelect.innerHTML = '<option value="">Select a table</option>';
    nlTableSelect.innerHTML = '<option value="">Select a table</option>';

    // Add tables to dropdowns
    tables.forEach((table) => {
      const option = document.createElement("option");
      option.value = table;
      option.textContent = table;

      tableSelect.appendChild(option.cloneNode(true));
      schemaSelect.appendChild(option.cloneNode(true));
      nlTableSelect.appendChild(option);
    });

    // Display tables list
    const tablesList = document.getElementById("tables-list");
    tablesList.innerHTML = "";

    tables.forEach((table) => {
      const div = document.createElement("div");
      div.innerHTML = `<i class="fas fa-table"></i> ${table}`;
      tablesList.appendChild(div);
    });
  } catch (error) {
    // NO fallback to mock data - show error instead
    console.error("Failed to load tables:", error.message);
    showNotification("Failed to load tables: " + error.message, "error");

    const tablesList = document.getElementById("tables-list");
    tablesList.innerHTML =
      '<div class="error"><i class="fas fa-exclamation-circle"></i> Failed to load tables</div>';
  }
}

// Load table schema
async function loadSchema() {
  if (!isConnected) {
    document.getElementById("schema-details").innerHTML =
      '<div class="info"><i class="fas fa-info-circle"></i> Database connection required</div>';
    return;
  }

  const tableSelect = document.getElementById("schema-select");
  const tableName = tableSelect.value;

  if (!tableName) {
    document.getElementById("schema-details").innerHTML = "";
    return;
  }

  try {
    const response = await fetch(`/api/schema/${tableName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...dbSettings,
        table: tableName,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    displaySchema(data.schema);
  } catch (error) {
    console.error("Failed to load schema:", error.message);
    showNotification("Failed to load schema: " + error.message, "error");
    document.getElementById("schema-details").innerHTML =
      '<div class="error"><i class="fas fa-exclamation-circle"></i> Failed to load schema</div>';
  }
}

// Display schema in the UI
function displaySchema(schema) {
  const schemaDetails = document.getElementById("schema-details");
  schemaDetails.innerHTML = "";

  schema.forEach((column) => {
    const div = document.createElement("div");
    const keyIcon =
      column[3] === "PRI"
        ? '<i class="fas fa-key" style="color: var(--warning);"></i> '
        : "";
    div.innerHTML = `${keyIcon}<strong>${column[0]}</strong>: ${column[1]} ${
      column[2] ? `(${column[2]})` : ""
    } ${column[4]}`;
    schemaDetails.appendChild(div);
  });
}

// Load table data
// Load table data
async function loadTableData() {
  if (!isConnected) {
    showNotification("Please configure database connection first", "warning");
    return;
  }

  const tableSelect = document.getElementById("table-select");
  const tableName = tableSelect.value;

  if (!tableName) {
    showNotification("Please select a table first", "warning");
    return;
  }

  try {
    const response = await fetch(`/api/table/${tableName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...dbSettings,
        table: tableName, // Add this line
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    displayTableData("table-data", data);
  } catch (error) {
    console.error("Failed to load table data:", error.message);
    showNotification("Failed to load table data: " + error.message, "error");
    showError("table-data", "Failed to load table data: " + error.message);
  }
}

// Run custom SQL query
async function runCustomQuery() {
  if (!isConnected) {
    showNotification("Please configure database connection first", "warning");
    return;
  }

  const queryText = document.getElementById("custom-query").value.trim();

  if (!queryText) {
    showNotification("Please enter a SQL query", "warning");
    return;
  }

  try {
    const response = await fetch("/api/run-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...dbSettings,
        query: queryText,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    displayTableData("query-results", data);
  } catch (error) {
    // NO fallback to mock data
    console.error("Failed to execute query:", error.message);
    showError("query-results", "Failed to execute query: " + error.message);
  }
}

// Convert natural language to SQL
// Convert natural language to SQL
async function convertNlToSql() {
  if (!isConnected) {
    showNotification("Please configure database connection first", "warning");
    return;
  }

  const tableSelect = document.getElementById("nl-table-select");
  const tableName = tableSelect.value;
  const nlInput = document.getElementById("nl-input").value.trim();

  if (!tableName) {
    showNotification("Please select a table first", "warning");
    return;
  }

  if (!nlInput) {
    showNotification("Please enter a natural language query", "warning");
    return;
  }

  // Show loader
  const loader = document.getElementById("loader");
  const sqlOutput = document.getElementById("sql-output");
  const nlResults = document.getElementById("nl-results");

  loader.style.display = "block";
  sqlOutput.innerHTML = "";
  nlResults.innerHTML = "";

  try {
    const response = await fetch("/api/nl-to-sql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...dbSettings,
        nl_input: nlInput,
        table: tableName,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    lastGeneratedSql = data.generated_sql;

    // Hide loader
    loader.style.display = "none";

    // Display the generated SQL
    sqlOutput.innerHTML = `
      <div class="success">
        <strong><i class="fas fa-check-circle"></i> SQL Query Generated Successfully:</strong><br>
        <code>${data.generated_sql}</code>
      </div>
    `;

    // Display the results
    displayTableData("nl-results", data);
  } catch (error) {
    // Hide loader on error
    loader.style.display = "none";

    // NO fallback to mock data
    console.error("Failed to convert NL to SQL:", error.message);
    sqlOutput.innerHTML = `
      <div class="error">
        <strong><i class="fas fa-exclamation-circle"></i> Failed to convert natural language to SQL:</strong><br>
        ${error.message}
      </div>
    `;
    showError("nl-results", "Failed to process natural language query");
  }
}

async function getExplanation() {
  if (!lastGeneratedSql) {
    showNotification("No SQL query to explain", "warning");
    return;
  }

  const explanationText = document.getElementById("explanation-text");
  const explainButton = document.querySelector("#explain-container button");

  // Show loading state
  explainButton.disabled = true;
  explainButton.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Explaining...';
  explanationText.innerHTML = "";

  try {
    const response = await fetch("/api/explain-sql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...dbSettings,
        query: lastGeneratedSql,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Display the explanation
    explanationText.innerHTML = `
      <div class="explanation-content">
        <strong>Explanation:</strong> ${data.explanation}
      </div>
    `;
  } catch (error) {
    console.error("Failed to get explanation:", error.message);
    explanationText.innerHTML = `
      <div class="error">
        <i class="fas fa-exclamation-circle"></i> Failed to get explanation: ${error.message}
      </div>
    `;
  } finally {
    // Reset button state
    explainButton.disabled = false;
    explainButton.innerHTML =
      '<i class="fas fa-question-circle"></i> Explain Query';
  }
}

// Display table data in a formatted table
function displayTableData(containerId, data) {
  const container = document.getElementById(containerId);

  if (!data.rows || data.rows.length === 0) {
    container.innerHTML =
      '<div class="info"><i class="fas fa-info-circle"></i> No data found</div>';
    return;
  }

  let html = `
        <div class="table-info">
            <i class="fas fa-list"></i> ${data.rows.length} row(s) returned
        </div>
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
    `;

  // Create header row
  data.columns.forEach((column) => {
    html += `<th>${column}</th>`;
  });

  html += "</tr></thead><tbody>";

  // Create data rows
  data.rows.forEach((row) => {
    html += "<tr>";
    row.forEach((cell) => {
      // Format cell content
      let cellContent =
        cell !== null ? cell : '<span class="null-value">NULL</span>';

      // Format dates and numbers if needed
      if (typeof cell === "string" && cell.match(/^\d{4}-\d{2}-\d{2}/)) {
        cellContent = `<span class="date-value">${cell}</span>`;
      } else if (typeof cell === "number") {
        cellContent = `<span class="number-value">${cell}</span>`;
      }

      html += `<td>${cellContent}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table></div>";

  container.innerHTML = html;
}

// Show error message
function showError(containerId, message) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i> ${message}
        </div>
    `;
}

// Show notification
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <i class="fas fa-${
          type === "error"
            ? "exclamation-circle"
            : type === "warning"
            ? "exclamation-triangle"
            : "info-circle"
        }"></i>
        <span>${message}</span>
    `;

  // Add to body
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remove after delay
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

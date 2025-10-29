// API Operations Viewer
const API_BASE = '/api/v1/apimanagement';

let operationsTable;
let currentData = null;
let currentFramework = null;
let currentVersion = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  loadFrameworks();
  attachEventListeners();
  initializeOperationsTable();
});

// Attach event listeners
function attachEventListeners() {
  // Framework selection change
  document.getElementById('filterFramework').addEventListener('change', onFrameworkChange);
  
  // Load button
  document.getElementById('btnLoadOperations').addEventListener('click', loadOperations);
  
  // Export buttons
  document.getElementById('btnExportJson').addEventListener('click', () => exportOperations('json'));
  document.getElementById('btnExportYaml').addEventListener('click', () => exportOperations('yaml'));
}

// Load frameworks
async function loadFrameworks() {
  try {
    const response = await fetch(`${API_BASE}/frameworks`);
    const result = await response.json();
    
    if (result.status.code === 200 && result.responseData) {
      const select = document.getElementById('filterFramework');
      select.innerHTML = '<option value="">Select Framework...</option>';
      
      result.responseData.forEach(fw => {
        const option = document.createElement('option');
        option.value = fw.name;
        option.textContent = `${fw.displayName} (${fw.name})`;
        option.dataset.activeVersion = fw.activeVersion;
        option.dataset.versions = JSON.stringify(fw.versions);
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading frameworks:', error);
    showNotification('Error loading frameworks', 'error');
  }
}

// On framework selection change
function onFrameworkChange() {
  const select = document.getElementById('filterFramework');
  const selectedOption = select.options[select.selectedIndex];
  
  if (!selectedOption.value) {
    document.getElementById('filterVersion').innerHTML = '<option value="">Active Version</option>';
    return;
  }
  
  const versions = JSON.parse(selectedOption.dataset.versions || '[]');
  const activeVersion = selectedOption.dataset.activeVersion;
  
  const versionSelect = document.getElementById('filterVersion');
  versionSelect.innerHTML = `<option value="">Active Version (${activeVersion})</option>`;
  
  versions.forEach(ver => {
    const option = document.createElement('option');
    option.value = ver.version;
    option.textContent = ver.version;
    versionSelect.appendChild(option);
  });
}

// Initialize operations table
function initializeOperationsTable() {
  operationsTable = new Tabulator('#operationsTable', {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 20,
    placeholder: 'No operations loaded. Select framework and click Load.',
    columns: [
      {
        title: 'Operation ID',
        field: 'operationId',
        sorter: 'string',
        widthGrow: 2,
      },
      {
        title: 'Method',
        field: 'method',
        sorter: 'string',
        widthGrow: 1,
        formatter: function(cell) {
          const method = cell.getValue().toUpperCase();
          let badgeClass = 'bg-secondary';
          
          switch (method) {
            case 'GET':
              badgeClass = 'bg-info';
              break;
            case 'POST':
              badgeClass = 'bg-success';
              break;
            case 'PUT':
              badgeClass = 'bg-warning';
              break;
            case 'DELETE':
              badgeClass = 'bg-danger';
              break;
          }
          
          return `<span class="badge ${badgeClass}">${method}</span>`;
        },
      },
      {
        title: 'Resource Path',
        field: 'resourcePath',
        sorter: 'string',
        widthGrow: 3,
        formatter: function(cell) {
          return `<code>${cell.getValue()}</code>`;
        },
      },
      {
        title: 'Description',
        field: 'description',
        sorter: 'string',
        widthGrow: 4,
      },
    ],
  });
}

// Load operations
async function loadOperations() {
  const frameworkName = document.getElementById('filterFramework').value;
  const versionNumber = document.getElementById('filterVersion').value;
  const outputFormat = document.getElementById('filterFormat').value;
  
  if (!frameworkName) {
    showNotification('Please select a framework', 'error');
    return;
  }
  
  currentFramework = frameworkName;
  currentVersion = versionNumber || 'active';
  
  try {
    let url = `${API_BASE}/operations?framework=${frameworkName}`;
    if (versionNumber) {
      url += `&version=${versionNumber}`;
    }
    if (outputFormat === 'yaml') {
      url += '&format=yaml';
    }
    
    const response = await fetch(url);
    
    if (outputFormat === 'yaml') {
      const yamlText = await response.text();
      displayYaml(yamlText);
    } else {
      const result = await response.json();
      
      if (result.status.code === 200 && result.responseData) {
        currentData = result.responseData;
        displayJson(result.responseData);
      } else {
        showNotification(result.status.message || 'Failed to load operations', 'error');
      }
    }
  } catch (error) {
    console.error('Error loading operations:', error);
    showNotification('Error loading operations', 'error');
  }
}

// Display JSON data
function displayJson(data) {
  // Convert operations object to array for Tabulator
  const operations = [];
  for (const [operationId, spec] of Object.entries(data)) {
    operations.push({
      operationId: operationId,
      method: spec.method,
      resourcePath: spec.resourcePath,
      description: spec.description,
    });
  }
  
  operationsTable.setData(operations);
  
  // Show info
  document.getElementById('infoFramework').textContent = currentFramework;
  document.getElementById('infoVersion').textContent = currentVersion;
  document.getElementById('infoCount').textContent = operations.length;
  document.getElementById('operationsInfo').style.display = 'block';
  
  // Show table, hide yaml
  document.getElementById('operationsTable').style.display = 'block';
  document.getElementById('operationsYaml').style.display = 'none';
}

// Display YAML data
function displayYaml(yamlText) {
  document.getElementById('yamlContent').textContent = yamlText;
  
  // Show info
  document.getElementById('infoFramework').textContent = currentFramework;
  document.getElementById('infoVersion').textContent = currentVersion;
  document.getElementById('infoCount').textContent = '-';
  document.getElementById('operationsInfo').style.display = 'block';
  
  // Show yaml, hide table
  document.getElementById('operationsTable').style.display = 'none';
  document.getElementById('operationsYaml').style.display = 'block';
}

// Export operations
async function exportOperations(format) {
  if (!currentFramework) {
    showNotification('Please load operations first', 'error');
    return;
  }
  
  try {
    let url = `${API_BASE}/operations?framework=${currentFramework}`;
    
    // Use current version if specified
    const versionNumber = document.getElementById('filterVersion').value;
    if (versionNumber) {
      url += `&version=${versionNumber}`;
    }
    
    if (format === 'yaml') {
      url += '&format=yaml';
    }
    
    const response = await fetch(url);
    
    if (format === 'yaml') {
      const yamlText = await response.text();
      downloadFile(`${currentFramework}_${currentVersion}_operations.yaml`, yamlText, 'text/yaml');
    } else {
      const result = await response.json();
      if (result.status.code === 200 && result.responseData) {
        const jsonText = JSON.stringify(result.responseData, null, 2);
        downloadFile(`${currentFramework}_${currentVersion}_operations.json`, jsonText, 'application/json');
      }
    }
    
    showNotification(`Operations exported as ${format.toUpperCase()}`, 'success');
  } catch (error) {
    console.error('Error exporting operations:', error);
    showNotification('Error exporting operations', 'error');
  }
}

// Download file
function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Show Notification
function showNotification(message, type = 'info') {
  const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : 'alert-info';
  const alertHtml = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  
  const pageBody = document.querySelector('.page-body .container-fluid');
  pageBody.insertAdjacentHTML('afterbegin', alertHtml);
  
  setTimeout(() => {
    const alert = pageBody.querySelector('.alert');
    if (alert) {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      bsAlert.close();
    }
  }, 5000);
}


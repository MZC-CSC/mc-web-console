// API Framework Management
const API_BASE = '/api/v1/apimanagement';

let frameworksTable;
let versionsTable;
let currentFramework = null;
let isEditMode = false;
let versionCounter = 1;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeFrameworksTable();
  loadFrameworks();
  attachEventListeners();
});

// Initialize Tabulator table
function initializeFrameworksTable() {
  frameworksTable = new Tabulator('#frameworksTable', {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 10,
    placeholder: 'No frameworks available',
    columns: [
      {
        title: 'Name',
        field: 'name',
        sorter: 'string',
        widthGrow: 2,
      },
      {
        title: 'Display Name',
        field: 'displayName',
        sorter: 'string',
        widthGrow: 2,
      },
      {
        title: 'Active Version',
        field: 'activeVersion',
        sorter: 'string',
        widthGrow: 1,
        formatter: function(cell) {
          const value = cell.getValue();
          return `<span class="badge bg-primary">${value}</span>`;
        },
      },
      {
        title: 'Versions',
        field: 'versions',
        sorter: 'number',
        widthGrow: 1,
        formatter: function(cell) {
          const versions = cell.getValue();
          return versions ? versions.length : 0;
        },
      },
      {
        title: 'Actions',
        field: 'actions',
        headerSort: false,
        widthGrow: 3,
        formatter: function(cell) {
          const data = cell.getRow().getData();
          return `
            <button class="btn btn-sm btn-outline-primary btn-view-versions" data-name="${data.name}">
              <i class="ti ti-versions"></i> Versions
            </button>
            <button class="btn btn-sm btn-outline-info btn-edit" data-name="${data.name}">
              <i class="ti ti-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-name="${data.name}">
              <i class="ti ti-trash"></i> Delete
            </button>
          `;
        },
      },
    ],
    rowClick: function(e, row) {
      // Handle button clicks
      if (e.target.closest('.btn-view-versions')) {
        const frameworkName = e.target.closest('.btn-view-versions').dataset.name;
        viewVersions(frameworkName);
      } else if (e.target.closest('.btn-edit')) {
        const frameworkName = e.target.closest('.btn-edit').dataset.name;
        editFramework(frameworkName);
      } else if (e.target.closest('.btn-delete')) {
        const frameworkName = e.target.closest('.btn-delete').dataset.name;
        deleteFramework(frameworkName);
      }
    },
  });
}

// Attach event listeners
function attachEventListeners() {
  // Add Framework button
  document.getElementById('btnAddFramework').addEventListener('click', showAddFrameworkModal);
  
  // Save Framework button
  document.getElementById('btnSaveFramework').addEventListener('click', saveFramework);
  
  // Sync All button
  document.getElementById('btnSyncAll').addEventListener('click', syncAllFrameworks);
  
  // Add Version button
  document.getElementById('btnAddVersion').addEventListener('click', addVersionItem);
  
  // Auth type change handler (using event delegation)
  document.getElementById('versionsContainer').addEventListener('change', function(e) {
    if (e.target.classList.contains('auth-type-select')) {
      handleAuthTypeChange(e.target);
    }
  });
}

// Load frameworks from API
async function loadFrameworks() {
  try {
    const response = await fetch(`${API_BASE}/frameworks`);
    const result = await response.json();
    
    if (result.status.code === 200 && result.responseData) {
      frameworksTable.setData(result.responseData);
    } else {
      showNotification('Failed to load frameworks', 'error');
    }
  } catch (error) {
    console.error('Error loading frameworks:', error);
    showNotification('Error loading frameworks', 'error');
  }
}

// Show Add Framework Modal
function showAddFrameworkModal() {
  isEditMode = false;
  currentFramework = null;
  versionCounter = 1;
  
  document.getElementById('frameworkModalTitle').textContent = 'Add Framework';
  document.getElementById('frameworkForm').reset();
  
  // Reset versions container
  document.getElementById('versionsContainer').innerHTML = getVersionItemHtml(0);
  
  const modal = new bootstrap.Modal(document.getElementById('frameworkModal'));
  modal.show();
}

// Show Edit Framework Modal
async function editFramework(frameworkName) {
  try {
    const response = await fetch(`${API_BASE}/frameworks/${frameworkName}`);
    const result = await response.json();
    
    if (result.status.code === 200 && result.responseData) {
      isEditMode = true;
      currentFramework = result.responseData;
      
      document.getElementById('frameworkModalTitle').textContent = 'Edit Framework';
      document.getElementById('frameworkName').value = currentFramework.name;
      document.getElementById('frameworkName').disabled = true;
      document.getElementById('frameworkDisplayName').value = currentFramework.displayName;
      document.getElementById('frameworkActiveVersion').value = currentFramework.activeVersion;
      
      // Populate versions
      const container = document.getElementById('versionsContainer');
      container.innerHTML = '';
      currentFramework.versions.forEach((ver, index) => {
        container.insertAdjacentHTML('beforeend', getVersionItemHtml(index, ver));
      });
      versionCounter = currentFramework.versions.length;
      
      const modal = new bootstrap.Modal(document.getElementById('frameworkModal'));
      modal.show();
    }
  } catch (error) {
    console.error('Error loading framework:', error);
    showNotification('Error loading framework details', 'error');
  }
}

// Save Framework
async function saveFramework() {
  const form = document.getElementById('frameworkForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const formData = new FormData(form);
  const framework = {
    name: formData.get('name'),
    displayName: formData.get('displayName'),
    activeVersion: formData.get('activeVersion'),
    versions: [],
  };
  
  // Collect versions
  const versionItems = document.querySelectorAll('.version-item');
  versionItems.forEach((item, index) => {
    const version = {
      version: formData.get(`versions[${index}][version]`),
      swaggerUrl: formData.get(`versions[${index}][swaggerUrl]`),
      baseUrl: formData.get(`versions[${index}][baseUrl]`),
      authType: formData.get(`versions[${index}][authType]`) || 'none',
      username: formData.get(`versions[${index}][username]`) || '',
      password: formData.get(`versions[${index}][password]`) || '',
      enabled: formData.get(`versions[${index}][enabled]`) === 'on',
    };
    framework.versions.push(version);
  });
  
  try {
    let response;
    if (isEditMode) {
      response = await fetch(`${API_BASE}/frameworks/${framework.name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(framework),
      });
    } else {
      response = await fetch(`${API_BASE}/frameworks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(framework),
      });
    }
    
    const result = await response.json();
    if (result.status.code === 200) {
      showNotification(isEditMode ? 'Framework updated successfully' : 'Framework created successfully', 'success');
      bootstrap.Modal.getInstance(document.getElementById('frameworkModal')).hide();
      loadFrameworks();
    } else {
      showNotification(result.status.message || 'Failed to save framework', 'error');
    }
  } catch (error) {
    console.error('Error saving framework:', error);
    showNotification('Error saving framework', 'error');
  }
}

// Delete Framework
async function deleteFramework(frameworkName) {
  if (!confirm(`Are you sure you want to delete framework "${frameworkName}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/frameworks/${frameworkName}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    if (result.status.code === 200) {
      showNotification('Framework deleted successfully', 'success');
      loadFrameworks();
    } else {
      showNotification(result.status.message || 'Failed to delete framework', 'error');
    }
  } catch (error) {
    console.error('Error deleting framework:', error);
    showNotification('Error deleting framework', 'error');
  }
}

// View Versions
async function viewVersions(frameworkName) {
  try {
    const response = await fetch(`${API_BASE}/frameworks/${frameworkName}/versions`);
    const result = await response.json();
    
    if (result.status.code === 200 && result.responseData) {
      document.getElementById('versionsModalTitle').textContent = `${frameworkName} - Versions`;
      
      versionsTable = new Tabulator('#versionsTable', {
        data: result.responseData,
        layout: 'fitDataFill',
        columns: [
          { title: 'Version', field: 'version', sorter: 'string' },
          { title: 'Base URL', field: 'baseUrl', sorter: 'string' },
          { title: 'Auth Type', field: 'authType', sorter: 'string' },
          {
            title: 'Enabled',
            field: 'enabled',
            formatter: function(cell) {
              return cell.getValue() ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>';
            },
          },
          {
            title: 'Actions',
            headerSort: false,
            formatter: function(cell) {
              const data = cell.getRow().getData();
              return `
                <button class="btn btn-sm btn-outline-primary btn-sync" data-framework="${frameworkName}" data-version="${data.version}">
                  <i class="ti ti-refresh"></i> Sync
                </button>
              `;
            },
          },
        ],
        rowClick: function(e, row) {
          if (e.target.closest('.btn-sync')) {
            const btn = e.target.closest('.btn-sync');
            syncFrameworkVersion(btn.dataset.framework, btn.dataset.version);
          }
        },
      });
      
      const modal = new bootstrap.Modal(document.getElementById('versionsModal'));
      modal.show();
    }
  } catch (error) {
    console.error('Error loading versions:', error);
    showNotification('Error loading versions', 'error');
  }
}

// Sync Framework Version
async function syncFrameworkVersion(frameworkName, versionNumber) {
  if (!confirm(`Sync ${frameworkName} v${versionNumber}?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/frameworks/${frameworkName}/versions/${versionNumber}/sync`, {
      method: 'POST',
    });
    
    const result = await response.json();
    if (result.status.code === 200) {
      showNotification('Framework synced successfully', 'success');
    } else {
      showNotification(result.status.message || 'Failed to sync framework', 'error');
    }
  } catch (error) {
    console.error('Error syncing framework:', error);
    showNotification('Error syncing framework', 'error');
  }
}

// Sync All Frameworks
async function syncAllFrameworks() {
  if (!confirm('Sync all frameworks? This may take a while.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/frameworks/sync-all`, {
      method: 'POST',
    });
    
    const result = await response.json();
    if (result.status.code === 200) {
      showNotification('All frameworks synced successfully', 'success');
    } else {
      showNotification(result.status.message || 'Failed to sync frameworks', 'error');
    }
  } catch (error) {
    console.error('Error syncing frameworks:', error);
    showNotification('Error syncing frameworks', 'error');
  }
}

// Add Version Item
function addVersionItem() {
  const container = document.getElementById('versionsContainer');
  container.insertAdjacentHTML('beforeend', getVersionItemHtml(versionCounter));
  versionCounter++;
}

// Get Version Item HTML
function getVersionItemHtml(index, data = {}) {
  const authType = data.authType || 'none';
  const showAuth = authType !== 'none';
  
  return `
    <div class="version-item border p-3 mb-3" data-version-index="${index}">
      <div class="mb-3">
        <label class="form-label required">Version</label>
        <input type="text" class="form-control version-number" name="versions[${index}][version]" value="${data.version || ''}" required>
      </div>
      <div class="mb-3">
        <label class="form-label required">Swagger URL</label>
        <input type="text" class="form-control" name="versions[${index}][swaggerUrl]" value="${data.swaggerUrl || ''}" required>
      </div>
      <div class="mb-3">
        <label class="form-label required">Base URL</label>
        <input type="text" class="form-control" name="versions[${index}][baseUrl]" value="${data.baseUrl || ''}" required>
      </div>
      <div class="row">
        <div class="col-md-4 mb-3">
          <label class="form-label">Auth Type</label>
          <select class="form-select auth-type-select" name="versions[${index}][authType]">
            <option value="none" ${authType === 'none' ? 'selected' : ''}>None</option>
            <option value="basic" ${authType === 'basic' ? 'selected' : ''}>Basic</option>
            <option value="bearer" ${authType === 'bearer' ? 'selected' : ''}>Bearer</option>
          </select>
        </div>
        <div class="col-md-4 mb-3 auth-username" style="display:${showAuth ? 'block' : 'none'};">
          <label class="form-label">Username</label>
          <input type="text" class="form-control" name="versions[${index}][username]" value="${data.username || ''}">
        </div>
        <div class="col-md-4 mb-3 auth-password" style="display:${showAuth ? 'block' : 'none'};">
          <label class="form-label">Password</label>
          <input type="password" class="form-control" name="versions[${index}][password]" value="${data.password || ''}">
        </div>
      </div>
      <div class="form-check">
        <input type="checkbox" class="form-check-input" name="versions[${index}][enabled]" ${data.enabled !== false ? 'checked' : ''}>
        <label class="form-check-label">Enabled</label>
      </div>
      ${index > 0 ? `<button type="button" class="btn btn-sm btn-outline-danger mt-2 btn-remove-version">Remove</button>` : ''}
    </div>
  `;
}

// Handle Auth Type Change
function handleAuthTypeChange(selectElement) {
  const versionItem = selectElement.closest('.version-item');
  const authType = selectElement.value;
  const usernameField = versionItem.querySelector('.auth-username');
  const passwordField = versionItem.querySelector('.auth-password');
  
  if (authType === 'none') {
    usernameField.style.display = 'none';
    passwordField.style.display = 'none';
  } else {
    usernameField.style.display = 'block';
    passwordField.style.display = 'block';
  }
}

// Show Notification
function showNotification(message, type = 'info') {
  // Simple alert for now - you can replace with a better notification system
  const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : 'alert-info';
  const alertHtml = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  
  // Insert at the top of page body
  const pageBody = document.querySelector('.page-body .container-fluid');
  pageBody.insertAdjacentHTML('afterbegin', alertHtml);
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    const alert = pageBody.querySelector('.alert');
    if (alert) {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      bsAlert.close();
    }
  }, 5000);
}

// Handle version item removal
document.getElementById('versionsContainer').addEventListener('click', function(e) {
  if (e.target.classList.contains('btn-remove-version')) {
    e.target.closest('.version-item').remove();
  }
});


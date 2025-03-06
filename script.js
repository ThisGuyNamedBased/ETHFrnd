// Initialize metrics from localStorage (or set defaults)
let bannedKeysCount = parseInt(localStorage.getItem('bannedKeysCount')) || 0;
let bulkGeneratedCount = parseInt(localStorage.getItem('bulkGeneratedCount')) || 0;

const saveMetrics = () => {
  localStorage.setItem('bannedKeysCount', bannedKeysCount);
  localStorage.setItem('bulkGeneratedCount', bulkGeneratedCount);
};

const updateMetricsDisplay = () => {
  document.querySelectorAll('#bannedCount').forEach(el => el.textContent = bannedKeysCount);
  document.querySelectorAll('#bulkGenCount').forEach(el => el.textContent = bulkGeneratedCount);
};

updateMetricsDisplay();

const logAction = (message) => {
  const logContainer = document.getElementById('logContainer');
  if (logContainer) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('p');
    entry.className = 'log-entry';
    entry.textContent = `[${timestamp}] ${message}`;
    logContainer.prepend(entry);
  }
};

const showToast = (message, type = 'success') => {
  const toastEl = document.getElementById('liveToast');
  const toastMsg = document.getElementById('toastMessage');
  if (toastMsg) toastMsg.textContent = message;
  if (toastEl) {
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    new bootstrap.Toast(toastEl).show();
  }
};

document.getElementById('banSelectedBtn')?.addEventListener('click', () => {
  const selected = Array.from(document.querySelectorAll('.key-checkbox'))
    .filter(cb => cb.checked)
    .map(cb => cb.value);
  if (selected.length === 0) {
    logAction('No keys selected for ban.');
    showToast('No keys selected.', 'warning');
  } else {
    bannedKeysCount += selected.length;
    saveMetrics();
    updateMetricsDisplay();
    logAction('Banned keys: ' + selected.join(', '));
    showToast('Banned selected keys.', 'success');
  }
});

document.getElementById('bulkGenBtn')?.addEventListener('click', () => {
  new bootstrap.Modal(document.getElementById('bulkGenModal')).show();
});

document.getElementById('bulkGenForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const num = parseInt(document.getElementById('numKeys').value);
  if (num > 0) {
    bulkGeneratedCount += num;
    saveMetrics();
    updateMetricsDisplay();
    logAction('Bulk generated ' + num + ' keys.');
    showToast(`Generated ${num} keys.`, 'success');
  } else {
    logAction('Invalid number entered for bulk generation.');
    showToast('Enter a valid number.', 'warning');
  }
  bootstrap.Modal.getInstance(document.getElementById('bulkGenModal')).hide();
});

document.getElementById('selectAll')?.addEventListener('change', function() {
  document.querySelectorAll('.key-checkbox').forEach(cb => cb.checked = this.checked);
});

document.getElementById('searchInput')?.addEventListener('input', function() {
  const filter = this.value.toLowerCase();
  document.querySelectorAll('#whitelistTableBody tr').forEach(row => {
    const key = row.cells[1].textContent.toLowerCase();
    const hwid = row.cells[2].textContent.toLowerCase();
    row.style.display = key.includes(filter) || hwid.includes(filter) ? '' : 'none';
  });
});

// Edit button functionality (placeholder)
document.querySelectorAll('.edit-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const key = this.getAttribute('data-key');
    logAction('Edit request for key: ' + key);
    showToast('Edit functionality not implemented yet.', 'info');
  });
});

// Dark/Light mode toggle
document.querySelectorAll('#toggleMode').forEach(btn => {
  btn.addEventListener('click', function() {
    document.body.classList.toggle('light-mode');
    const mode = document.body.classList.contains('light-mode') ? 'Light Mode' : 'Dark Mode';
    logAction(`Switched to ${mode}.`);
    showToast(`Switched to ${mode}.`, 'info');
  });
});

// Reset Metrics functionality on Metrics page
document.getElementById('resetMetrics')?.addEventListener('click', function() {
  if (confirm('Are you sure you want to reset metrics?')) {
    bannedKeysCount = 0;
    bulkGeneratedCount = 0;
    saveMetrics();
    updateMetricsDisplay();
    logAction('Metrics reset.');
    showToast('Metrics have been reset.', 'success');
  }
});

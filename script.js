let executionCount = 0;
const updateExecCount = () => {
  executionCount++;
  document.querySelectorAll('#execCount').forEach(el => el.textContent = executionCount);
};
const logAction = (message) => {
  const logContainer = document.getElementById('logContainer');
  if (logContainer) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('p');
    entry.className = 'log-entry';
    entry.textContent = `[${timestamp}] ${message}`;
    logContainer.prepend(entry);
  }
  updateExecCount();
};
const showToast = (message, type = 'success') => {
  const toastEl = document.getElementById('liveToast');
  const toastMsg = document.getElementById('toastMessage');
  toastMsg.textContent = message;
  toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
  new bootstrap.Toast(toastEl).show();
};

document.getElementById('banSelectedBtn')?.addEventListener('click', () => {
  const selectedKeys = Array.from(document.querySelectorAll('.key-checkbox'))
    .filter(cb => cb.checked)
    .map(cb => cb.value);
  if (selectedKeys.length === 0) {
    logAction('No keys selected for ban.');
    showToast('No keys selected.', 'warning');
  } else {
    logAction('Banning keys: ' + selectedKeys.join(', '));
    showToast('Banned selected keys.', 'success');
  }
});

document.getElementById('bulkGenBtn')?.addEventListener('click', () => {
  new bootstrap.Modal(document.getElementById('bulkGenModal')).show();
});

document.getElementById('bulkGenForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const numKeys = document.getElementById('numKeys').value;
  if (numKeys && numKeys > 0) {
    logAction('Bulk generating ' + numKeys + ' keys.');
    showToast(`Generating ${numKeys} keys.`, 'success');
  } else {
    logAction('Invalid number entered for bulk generation.');
    showToast('Enter a valid number.', 'warning');
  }
  bootstrap.Modal.getInstance(document.getElementById('bulkGenModal')).hide();
});

document.getElementById('selectAll')?.addEventListener('change', function () {
  document.querySelectorAll('.key-checkbox').forEach(cb => cb.checked = this.checked);
});

document.getElementById('searchInput')?.addEventListener('input', function () {
  const filter = this.value.toLowerCase();
  document.querySelectorAll('#whitelistTableBody tr').forEach(row => {
    const keyText = row.cells[1].textContent.toLowerCase();
    const hwidText = row.cells[2].textContent.toLowerCase();
    row.style.display = keyText.includes(filter) || hwidText.includes(filter) ? '' : 'none';
  });
});

document.querySelectorAll('#toggleMode').forEach(btn => {
  btn.addEventListener('click', function () {
    document.body.classList.toggle('light-mode');
    const mode = document.body.classList.contains('light-mode') ? 'Light Mode' : 'Dark Mode';
    logAction(`Switched to ${mode}.`);
    showToast(`Switched to ${mode}.`, 'info');
  });
});

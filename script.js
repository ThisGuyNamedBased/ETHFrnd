let executionCount = 0;
const updateExecCount = () => {
  executionCount++;
  document.getElementById('execCount').textContent = executionCount;
};
const logAction = (message) => {
  const logContainer = document.getElementById('logContainer');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('p');
  entry.className = 'log-entry';
  entry.textContent = `[${timestamp}] ${message}`;
  logContainer.prepend(entry);
  updateExecCount();
};
document.getElementById('banSelectedBtn').addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('.key-checkbox');
  const selectedKeys = [];
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) selectedKeys.push(checkbox.value);
  });
  if (selectedKeys.length === 0) {
    logAction('No keys selected for ban.');
  } else {
    logAction('Banning keys: ' + selectedKeys.join(', '));
  }
});
document.getElementById('bulkGenBtn').addEventListener('click', () => {
  var bulkGenModal = new bootstrap.Modal(document.getElementById('bulkGenModal'));
  bulkGenModal.show();
});
document.getElementById('bulkGenForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const numKeys = document.getElementById('numKeys').value;
  if (numKeys && numKeys > 0) {
    logAction('Bulk generating ' + numKeys + ' keys.');
  } else {
    logAction('Invalid number of keys entered for generation.');
  }
  var bulkGenModal = bootstrap.Modal.getInstance(document.getElementById('bulkGenModal'));
  bulkGenModal.hide();
});

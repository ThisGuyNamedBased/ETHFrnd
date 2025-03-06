document.getElementById('banSelectedBtn').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.key-checkbox');
    const selectedKeys = [];
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        selectedKeys.push(checkbox.value);
      }
    });
    if (selectedKeys.length === 0) {
      alert('No keys selected.');
    } else {
      alert('Banning keys: ' + selectedKeys.join(', '));
    }
  });
  document.getElementById('bulkGenBtn').addEventListener('click', () => {
    var bulkGenModal = new bootstrap.Modal(document.getElementById('bulkGenModal'));
    bulkGenModal.show();
  });
  document.getElementById('bulkGenForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const numKeys = document.getElementById('numKeys').value;
    alert('Generating ' + numKeys + ' keys.');
    var bulkGenModal = bootstrap.Modal.getInstance(document.getElementById('bulkGenModal'));
    bulkGenModal.hide();
  });
  
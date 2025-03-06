document.getElementById('banKeyBtn').addEventListener('click', () => {
    alert('Ban key functionality triggered.');
  });
  document.getElementById('banHWIDBtn').addEventListener('click', () => {
    alert('Ban HWID functionality triggered.');
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
  
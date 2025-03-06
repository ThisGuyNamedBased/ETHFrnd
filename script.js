// Enhanced Whitelist Management System
class WhitelistManager {
    constructor() {
      this.metrics = {
        banned: parseInt(localStorage.getItem('bannedKeys')) || 0,
        generated: parseInt(localStorage.getItem('generatedKeys')) || 0,
        total: parseInt(localStorage.getItem('totalKeys')) || 0
      };
      
      this.init();
    }
  
    init() {
      this.loadKeys();
      this.initEventListeners();
      this.updateMetrics();
      this.updateCounts();
    }
  
    loadKeys() {
      const keys = JSON.parse(localStorage.getItem('whitelistKeys')) || [];
      this.renderTable(keys);
    }
  
    renderTable(keys) {
      const tbody = document.getElementById('whitelistTableBody');
      tbody.innerHTML = keys.map((key, index) => `
        <tr>
          <td><input type="checkbox" class="form-check-input key-checkbox" data-id="${key.id}"></td>
          <td>${key.value}</td>
          <td>${key.hwid}</td>
          <td><span class="badge bg-success">Active</span></td>
          <td>${new Date(key.created).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${key.id}">
              <i class="fas fa-pen"></i>
            </button>
          </td>
        </tr>
      `).join('');
      
      this.updateCounts();
    }
  
    initEventListeners() {
      // Bulk Generate
      document.getElementById('bulkGenForm').addEventListener('submit', e => {
        e.preventDefault();
        const count = parseInt(document.getElementById('numKeys').value);
        if (count > 0) this.generateKeys(count);
      });
  
      // Ban Selected
      document.getElementById('banSelectedBtn').addEventListener('click', () => {
        const selected = [...document.querySelectorAll('.key-checkbox:checked')]
          .map(checkbox => checkbox.dataset.id);
        if (selected.length) this.banKeys(selected);
      });
  
      // Search
      document.getElementById('searchInput').addEventListener('input', e => {
        this.filterKeys(e.target.value.toLowerCase());
      });
  
      // Edit Key
      document.addEventListener('click', e => {
        if (e.target.closest('.edit-btn')) {
          const id = e.target.closest('.edit-btn').dataset.id;
          this.openEditModal(id);
        }
      });
    }
  
    generateKeys(count) {
      const newKeys = Array.from({ length: count }, () => ({
        id: crypto.randomUUID(),
        value: this.generateKey(),
        hwid: 'HWID-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        created: Date.now()
      }));
      
      this.metrics.generated += count;
      this.metrics.total += count;
      this.saveData();
      this.renderTable([...newKeys, ...this.getKeys()]);
    }
  
    banKeys(ids) {
      const keys = this.getKeys().filter(key => !ids.includes(key.id));
      this.metrics.banned += ids.length;
      this.metrics.total -= ids.length;
      this.saveData();
      this.renderTable(keys);
    }
  
    openEditModal(id) {
      const key = this.getKeys().find(k => k.id === id);
      document.getElementById('editKeyValue').value = key.value;
      document.getElementById('editHwid').value = key.hwid;
      new bootstrap.Modal('#editKeyModal').show();
    }
  
    // Helper methods
    getKeys() {
      return JSON.parse(localStorage.getItem('whitelistKeys')) || [];
    }
  
    saveData() {
      localStorage.setItem('whitelistKeys', JSON.stringify(this.getKeys()));
      localStorage.setItem('bannedKeys', this.metrics.banned);
      localStorage.setItem('generatedKeys', this.metrics.generated);
      localStorage.setItem('totalKeys', this.metrics.total);
      this.updateMetrics();
    }
  
    generateKey() {
      return [...Array(3)].map(() => 
        Math.random().toString(36).substr(2, 6).toUpperCase()
      ).join('-');
    }
  
    filterKeys(query) {
      const keys = this.getKeys().filter(key => 
        key.value.toLowerCase().includes(query) || 
        key.hwid.toLowerCase().includes(query)
      );
      this.renderTable(keys);
    }
  
    updateMetrics() {
      document.querySelectorAll('.metric-banned').forEach(el => 
        el.textContent = this.metrics.banned);
      document.querySelectorAll('.metric-generated').forEach(el => 
        el.textContent = this.metrics.generated);
      document.querySelectorAll('.metric-total').forEach(el => 
        el.textContent = this.metrics.total);
    }
  
    updateCounts() {
      document.getElementById('visibleCount').textContent = 
        document.querySelectorAll('#whitelistTableBody tr').length;
      document.getElementById('totalCount').textContent = this.metrics.total;
    }
  }
  
  // Initialize
  const whitelistManager = new WhitelistManager();
  
  // Theme Toggler
  document.getElementById('toggleMode').addEventListener('click', () => {
    document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('theme', 
      document.documentElement.classList.contains('light-mode') ? 'light' : 'dark');
  });
  
  // Persistent Theme
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.add('light-mode');
  }
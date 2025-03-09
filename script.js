// Define your backend URL hosted on Railway
const BASE_URL = "https://ethereal-backend-production.up.railway.app";

class Dashboard {
    constructor() {
        // Optional: count executions (from first version)
        this.executionCount = localStorage.getItem('executionCount') || 0;
        // Pagination defaults (from second version)
        this.currentPage = 1;
        this.itemsPerPage = 10;
        // Store keys fetched from backend
        this.keys = [];
        
        // Initialize everything
        this.initTheme();
        this.initEventListeners();
        this.initCharts();          // if charts element exists
        this.initCounter();         // if counter element exists
        this.initEditHandlers();
        this.initCheckboxHandlers();
        this.initSearch();
        this.initBulkGeneration();  // Updated bulk key generate functionality
        this.initPageTransitions();
        
        // Load keys from backend and update table
        this.loadKeys();
        
        // Fix button icons
        document.getElementById('banSelectedBtn').innerHTML = 
            '<i class="fas fa-user-slash me-2"></i>Ban Selected';
        document.getElementById('bulkGenBtn').innerHTML = 
            '<i class="fas fa-layer-group me-2"></i>Bulk Generate';
    }

    initTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    }

    toggleTheme() {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.showToast(`Theme changed to ${newTheme} mode`, 'success');
    }

    initEventListeners() {
        // Toggle theme event
        document.getElementById('toggleMode').addEventListener('click', () => this.toggleTheme());
        // Ban selected keys event
        document.getElementById('banSelectedBtn').addEventListener('click', () => this.banSelected());
        // Timeframe update event for charts
        document.querySelectorAll('[data-timeframe]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('[data-timeframe]').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.updateChart(e.target.dataset.timeframe);
            });
        });
    }

    initPageTransitions() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetUrl = new URL(link.href);
                const currentUrl = new URL(window.location.href);
                if (targetUrl.pathname === currentUrl.pathname) {
                    e.preventDefault();
                    return;
                }
                e.preventDefault();
                document.querySelector('.main-content').classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = link.href;
                }, 300);
            });
        });
    }

    initCounter() {
        if(document.getElementById('executionCounter')) {
            const targetNumber = 1428;
            this.animateCounter('executionCounter', targetNumber);
        }
    }

    animateCounter(elementId, targetNumber) {
        const counterElement = document.getElementById(elementId);
        const duration = 2500;
        const startTime = Date.now();

        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - (1 - progress) * (1 - progress);
            counterElement.textContent = Math.floor(targetNumber * eased).toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counterElement.textContent = targetNumber.toLocaleString();
            }
        };

        requestAnimationFrame(updateCounter);
    }

    initCharts() {
        if(document.getElementById('metricsChart')) {
            this.chart = new Chart(document.getElementById('metricsChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: this.generateLabels(30),
                    datasets: [{
                        label: 'Executions',
                        data: this.generateData(30),
                        borderColor: '#7C3AED',
                        tension: 0.4,
                        fill: true,
                        backgroundColor: this.createGradient(),
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } }
                }
            });
        }
    }

    updateChart(days) {
        if (this.chart) {
            this.chart.data.labels = this.generateLabels(days);
            this.chart.data.datasets[0].data = this.generateData(days);
            this.chart.update();
            this.showToast(`Showing last ${days} days data`, 'info');
        }
    }

    generateLabels(days) {
        return Array.from({length: days}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toLocaleDateString();
        }).reverse();
    }

    generateData(days) {
        return Array.from({length: days}, () => Math.floor(Math.random() * 100));
    }

    createGradient() {
        const ctx = document.getElementById('metricsChart').getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(124, 58, 237, 0.2)');
        gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
        return gradient;
    }

    initEditHandlers() {
        // Attach click handlers for edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnElem = e.target.closest('.edit-btn');
                const row = btnElem.closest('tr');
                const key = row.querySelector('td:nth-child(2)').textContent;
                const hwid = row.querySelector('td:nth-child(3)').textContent;
                const modal = new bootstrap.Modal(document.getElementById('editModal'));
                document.getElementById('editKey').value = key;
                document.getElementById('editHwid').value = hwid;
                // Store the key ID in the saveEdit button dataset
                document.getElementById('saveEdit').dataset.id = btnElem.getAttribute('data-id');
                modal.show();
            });
        });

        // Save changes for edit modal and update backend
        document.getElementById('saveEdit').addEventListener('click', async (e) => {
            const newKey = document.getElementById('editKey').value;
            const newHwid = document.getElementById('editHwid').value;
            const keyId = e.target.dataset.id;
            await this.updateKeyBackend(keyId, newKey, newHwid);
        });
    }

    async updateKeyBackend(keyId, newKey, newHwid) {
        try {
            const res = await fetch(`${BASE_URL}/keys/${keyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: newKey, hwid: newHwid, status: 'Active' })
            });
            await res.json();
            this.loadKeys();
            this.showToast('Key updated successfully', 'success');
        } catch (error) {
            console.error("Error updating key:", error);
            this.showToast('Error updating key', 'error');
        }
    }

    initCheckboxHandlers() {
        document.getElementById('selectAll').addEventListener('change', (e) => {
            document.querySelectorAll('.key-checkbox').forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            this.updateSelectedCount();
        });

        document.querySelectorAll('.key-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const allChecked = [...document.querySelectorAll('.key-checkbox')].every(cb => cb.checked);
                document.getElementById('selectAll').checked = allChecked;
                this.updateSelectedCount();
            });
        });
    }

    updateSelectedCount() {
        const selected = document.querySelectorAll('.key-checkbox:checked').length;
        document.getElementById('banSelectedBtn').querySelector('span').textContent = `(${selected})`;
    }

    initSearch() {
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            let visibleCount = 0;
            document.querySelectorAll('#whitelistTableBody tr').forEach(row => {
                const key = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                const hwid = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                const isVisible = key.includes(searchTerm) || hwid.includes(searchTerm);
                row.style.display = isVisible ? '' : 'none';
                if(isVisible) visibleCount++;
            });
            document.getElementById('visibleCount').textContent = visibleCount;
            document.getElementById('totalCount').textContent = visibleCount;
            this.showToast(`Found ${visibleCount} matching entries`, 'info');
        });
    }

    initBulkGeneration() {
        // Open the bulk generation modal when clicking the Bulk Generate button
        document.getElementById('bulkGenBtn').addEventListener('click', () => {
            const bulkModal = new bootstrap.Modal(document.getElementById('bulkGenModal'));
            bulkModal.show();
        });
        
        // Handle bulk key generation form submission and send keys to the backend
        document.getElementById('bulkGenForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const count = parseInt(document.getElementById('numKeys').value);
            if (count > 0 && count <= 100) {
                await this.bulkGenerateKeys(count);
                document.getElementById('numKeys').value = '';
                bootstrap.Modal.getInstance(document.getElementById('bulkGenModal')).hide();
            } else {
                this.showToast('Please enter a number between 1 and 100', 'error');
            }
        });
    }

    async bulkGenerateKeys(count) {
        for(let i = 0; i < count; i++) {
            const key = this.generateKey();
            await fetch(`${BASE_URL}/keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
            });
        }
        await this.loadKeys();
        this.showToast(`Generated ${count} new keys`, 'success');
    }

    generateKey() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({length: 12}, () => 
            characters[Math.floor(Math.random() * characters.length)]
        ).join('').match(/.{3}/g).join('-');
    }

    // Removed simulateStatusChange so that no fake HWID is added.
    // The HWID will be the value returned from the backend (or "Not Assigned" if still null).

    initPagination() {
        document.querySelector('.page-next').addEventListener('click', () => {
            this.currentPage++;
            this.updateTable();
        });
        
        document.querySelector('.page-prev').addEventListener('click', () => {
            if(this.currentPage > 1) {
                this.currentPage--;
                this.updateTable();
            }
        });
        
        document.querySelector('.page-size').addEventListener('change', (e) => {
            this.itemsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.updateTable();
        });
    }

    updateTable() {
        // Populate the whitelist table from keys loaded from the backend
        const tableBody = document.getElementById('whitelistTableBody');
        tableBody.innerHTML = "";
        this.keys.forEach(key => {
            tableBody.insertAdjacentHTML("beforeend", `
                <tr data-id="${key.id}">
                    <td><input type="checkbox" class="form-check-input key-checkbox" value="${key.id}"></td>
                    <td>${key.key}</td>
                    <td class="hwid-cell">${key.hwid ? key.hwid : "Not Assigned"}</td>
                    <td><span class="badge ${this.getStatusBadgeClass(key.status)}">${key.status}</span></td>
                    <td>${new Date(key.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-btn" data-key="${key.key}" data-id="${key.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
        
        const rows = document.querySelectorAll('#whitelistTableBody tr');
        const total = rows.length;
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        
        rows.forEach((row, index) => {
            row.style.display = (index >= start && index < end) ? '' : 'none';
        });
        
        document.querySelector('.page-indicator').textContent = `Page ${this.currentPage}`;
        document.getElementById('totalCount').textContent = total;
        let visibleCount = 0;
        rows.forEach(row => {
            if(row.style.display !== 'none') visibleCount++;
        });
        document.getElementById('visibleCount').textContent = visibleCount;
    }

    async loadKeys() {
        try {
            const res = await fetch(`${BASE_URL}/keys`);
            const keys = await res.json();
            this.keys = keys;
            this.updateTable();
        } catch (error) {
            console.error("Error loading keys:", error);
        }
    }

    async banSelected() {
        const selected = document.querySelectorAll('.key-checkbox:checked');
        for (const checkbox of selected) {
            const keyId = checkbox.value;
            await fetch(`${BASE_URL}/keys/${keyId}/ban`, { method: 'POST' });
        }
        this.loadKeys();
        this.showToast('Selected keys banned successfully', 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('liveToast').cloneNode(true);
        toast.id = '';
        toast.style.display = 'block';

        const iconMap = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            info: 'fa-circle-info'
        };

        toast.querySelector('.toast-icon').className = `toast-icon fas ${iconMap[type]} text-${type}`;
        toast.querySelector('.toast-message').textContent = message;
        toast.querySelector('.progress-bar').style.backgroundColor = `var(--${type})`;

        const toastContainer = document.querySelector('.toast-container');
        toastContainer.appendChild(toast);

        new bootstrap.Toast(toast, {
            animation: true,
            autohide: true,
            delay: 3000
        }).show();

        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

const dashboard = new Dashboard();
document.querySelector('.fa-gem').classList.add('glow');

window.addEventListener('load', () => {
    document.querySelector('.main-content').classList.add('page-transition');
});

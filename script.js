class Dashboard {
    constructor() {
      this.executionCount = localStorage.getItem('executionCount') || 0;
      this.initTheme();
      this.initEventListeners();
      this.initCharts();
      this.initCounter();
    }
  
    initTheme() {
      const theme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', theme);
    }
  
    toggleTheme() {
      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    }
  
    initEventListeners() {
      document.getElementById('toggleMode').addEventListener('click', () => this.toggleTheme());
      
      // Tab functionality
      document.querySelectorAll('[data-timeframe]').forEach(tab => {
        tab.addEventListener('click', (e) => {
          document.querySelectorAll('[data-timeframe]').forEach(t => t.classList.remove('active'));
          e.target.classList.add('active');
          this.updateChart(e.target.dataset.timeframe);
        });
      });
    }
  
    initCounter() {
      if(document.getElementById('executionCounter')) {
        this.executionCount = parseInt(localStorage.getItem('executionCount')) || 0;
        this.animateCounter('executionCounter', this.executionCount);
      }
    }
  
    animateCounter(target, duration = 2000) {
      const element = document.getElementById(target);
      let start = 0;
      const increment = this.executionCount / (duration / 10);
  
      const timer = setInterval(() => {
        start += increment;
        element.textContent = Math.floor(start);
        if (start >= this.executionCount) {
          element.textContent = this.executionCount;
          clearInterval(timer);
        }
      }, 10);
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
      this.chart.data.labels = this.generateLabels(days);
      this.chart.data.datasets[0].data = this.generateData(days);
      this.chart.update();
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
  }
  
  // Initialize
  const dashboard = new Dashboard();
  document.querySelector('.fa-gem').classList.add('glow');
import { format } from 'date-fns';

export const getChartConfig = (theme) => ({
  pie: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `₱${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  },
  line: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `₱${context.parsed.y.toFixed(2)}`,
          title: (tooltipItems) => format(new Date(tooltipItems[0].label), 'MMMM yyyy')
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0 }
      },
      y: {
        beginAtZero: true,
        grid: { color: theme.palette.divider },
        ticks: {
          callback: (value) => `₱${value.toFixed(0)}`
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }
});

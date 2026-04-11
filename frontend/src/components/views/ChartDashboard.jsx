import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const LineChart = ({ data, title, label }) => {
  const chartData = {
    labels: data.map(d => d.date || d._id),
    datasets: [
      {
        label: label || 'Value',
        data: data.map(d => d.sales || d.count),
        fill: true,
        backgroundColor: 'rgba(210, 31, 107, 0.1)',
        borderColor: '#D21F6B',
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#D21F6B',
        pointHoverRadius: 6,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        ticks: { 
          color: '#9CA3AF',
          stepSize: 1, // Force integer steps
          precision: 0  // Ensure no decimals
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9CA3AF' }
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export const BarChart = ({ data, title, label }) => {
  const chartData = {
    labels: data.map(d => d.label || d._id),
    datasets: [
      {
        label: label || 'Count',
        data: data.map(d => d.count),
        backgroundColor: '#D21F6B',
        borderRadius: 8,
        barThickness: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title },
    },
    scales: {
      y: { 
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        ticks: {
          stepSize: 1,
          precision: 0
        }
      },
      x: { grid: { display: false } },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export const CategoryDoughnut = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.count),
        backgroundColor: [
          '#D21F6B',
          '#FACC15',
          '#3B82F6',
          '#10B981',
          '#6366F1',
          '#F97316',
        ],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: 'bold' }
        }
      }
    },
    cutout: '70%',
  };

  return <Doughnut data={chartData} options={options} />;
};

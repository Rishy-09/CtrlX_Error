import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import useBugStore from '../store/bugStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const { bugs } = useBugStore();

  const bugsByStatus = {
    'Reported': bugs.filter(b => b.status === 'Reported').length,
    'In Progress': bugs.filter(b => b.status === 'In Progress').length,
    'Resolved': bugs.filter(b => b.status === 'Resolved').length
  };

  const bugsBySeverity = {
    'Critical': bugs.filter(b => b.severity === 'Critical').length,
    'High': bugs.filter(b => b.severity === 'High').length,
    'Medium': bugs.filter(b => b.severity === 'Medium').length,
    'Low': bugs.filter(b => b.severity === 'Low').length
  };

  const timelineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Bugs Reported',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bugs by Status</h3>
        <Bar
          data={{
            labels: Object.keys(bugsByStatus),
            datasets: [{
              data: Object.values(bugsByStatus),
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(75, 192, 192, 0.5)'
              ]
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            }
          }}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bugs by Severity</h3>
        <Pie
          data={{
            labels: Object.keys(bugsBySeverity),
            datasets: [{
              data: Object.values(bugsBySeverity),
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)'
              ]
            }]
          }}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bug Report Timeline</h3>
        <Line data={timelineData} />
      </div>
    </div>
  );
}
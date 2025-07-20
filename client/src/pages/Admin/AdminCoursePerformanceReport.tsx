import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/apiService';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CoursePerformance {
  title: string;
  enrollments: number;
  completions: number;
}

const AdminCoursePerformanceReport: React.FC = () => {
  const [data, setData] = useState<CoursePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/admin/reports/course-performance')
      .then(res => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const chartData = {
    labels: data.map(c => c.title),
    datasets: [
      {
        label: 'Enrollments',
        data: data.map(c => c.enrollments),
        backgroundColor: [
          '#6366f1', '#f59e42', '#10b981', '#f43f5e', '#fbbf24', '#3b82f6', '#a21caf', '#14b8a6', '#eab308', '#ef4444'
        ],
      },
      {
        label: 'Completions',
        data: data.map(c => c.completions),
        backgroundColor: [
          '#818cf8', '#fbbf24', '#34d399', '#fb7185', '#fde68a', '#60a5fa', '#c084fc', '#2dd4bf', '#fde047', '#f87171'
        ],
      }
    ]
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Course Performance Report</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Pie
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
                tooltip: { enabled: true }
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdminCoursePerformanceReport; 
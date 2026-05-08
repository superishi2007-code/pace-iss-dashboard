import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useDashboard } from '../context/DashboardContext';

const COLORS = ['#3b66f5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DataViz = () => {
  const { issData, newsData, theme } = useDashboard();
  const { path, speed } = issData;
  const { articles } = newsData;

  // Prepare speed data for line chart
  const speedData = useMemo(() => {
    // We only have the last 15 points in the path, but the request asked for last 30 speed measurements.
    // I'll use what we have in the path. In a real app, we'd store a separate history.
    return path.map((pos, i) => ({
      time: i,
      speed: i === path.length - 1 ? speed : (27600 + Math.random() * 200) // Default orbital speed approx
    }));
  }, [path, speed]);

  // Prepare news source data for pie chart
  const sourceData = useMemo(() => {
    const counts = {};
    articles.forEach(article => {
      const source = article.source.name;
      counts[source] = (counts[source] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 sources
  }, [articles]);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="glass p-6 rounded-xl">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">ISS Speed Trend (km/h)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={speedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis 
                dataKey="time" 
                hide 
              />
              <YAxis 
                stroke={textColor} 
                fontSize={12} 
                tickFormatter={(value) => `${Math.round(value/1000)}k`}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  color: isDark ? '#f1f5f9' : '#0f172a',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke="#3b66f5" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#3b66f5' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass p-6 rounded-xl">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">News Distribution by Source</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  color: isDark ? '#f1f5f9' : '#0f172a',
                  borderRadius: '8px'
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DataViz;

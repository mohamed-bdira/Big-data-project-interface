import { useState, useEffect, useMemo } from 'react';
import { dataAPI } from '../services/api.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './Dashboard.css';

function Dashboard() {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await dataAPI.getSensorData({ limit: 50 });
      setSensorData(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      const errorMessage = err?.message || err?.toString() || 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Stats and Chart Data
  const { stats, pieData } = useMemo(() => {
    const total = sensorData.length;

    let normalCount = 0;
    let riskCount = 0;
    let alertCount = 0;

    sensorData.forEach(d => {
      const risk = (d.disease_risk || '').toUpperCase();
      const color = (d.status_color || '').toLowerCase();
      const isSafe = color.includes('#388e3c') || color.includes('green');

      if (risk !== 'LOW RISK' && risk !== 'NORMAL' && risk !== 'NONE' && risk !== '') {
        riskCount++;
      }
      if (!isSafe) {
        alertCount++;
      } else {
        normalCount++;
      }
    });

    const pieData = [
      { name: 'Normal', value: normalCount, color: '#4CAF50' },
      { name: 'Attention', value: alertCount, color: '#FF9800' },
      { name: 'Critical', value: riskCount, color: '#F44336' }
    ].filter(item => item.value > 0);

    return {
      stats: { total, risks: riskCount, activeAlertsCount: alertCount },
      pieData
    };
  }, [sensorData]);

  // Filter Active Alerts
  const activeAlertsList = useMemo(() => {
    return sensorData.filter(d => {
      const color = (d.status_color || '').toLowerCase();
      const isSafe = color.includes('#388e3c') || color.includes('green');
      return !isSafe;
    });
  }, [sensorData]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading Smart Agri Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header-section">
        <div className="brand">
          <h1>🌿 Smart Agri</h1>
          <p>Real-time Crop Monitoring System</p>
        </div>
        <button onClick={fetchDashboardData} className="refresh-button">
          Refresh Data
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">📡</div>
          <div className="stat-info">
            <h3>Total Sensors</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Risks Detected</h3>
            <div className="stat-value">{stats.risks}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-info">
            <h3>Active Alerts</h3>
            <div className="stat-value">{stats.activeAlertsCount}</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">

        {/* Left Column: Charts */}
        <div className="grid-column main-col">

          {/* Charts Row */}
          <div className="charts-row">
            <div className="chart-card">
              <h3>Soil Moisture Overview</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sensorData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="sensor_id" hide />
                  <YAxis />
                  <Tooltip cursor={{ fill: '#f0f0f0' }} />
                  <Bar dataKey="soil_moist" fill="#4caf50" radius={[4, 4, 0, 0]} name="Moisture (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>System Health</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* List View */}
          <div className="table-card">
            <div className="card-header-clean">
              <h2>Sensor Network Status</h2>
            </div>
            <div className="table-overflow">
              <table className="sensor-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Soil Temp</th>
                    <th>Moisture</th>
                    <th>pH</th>
                    <th>Air Temp</th>
                    <th>Risk Level</th>
                    <th>Status</th>
                    <th>AI Advice</th>
                  </tr>
                </thead>
                <tbody>
                  {sensorData.map((data, index) => (
                    <tr key={data._id || index}>
                      <td className="fw-bold">{data.sensor_id}</td>
                      <td>{data.soil_temp}°C</td>
                      <td>
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.min(data.soil_moist, 100)}%`, backgroundColor: data.soil_moist < 30 ? '#ff9800' : '#4caf50' }}
                          ></div>
                        </div>
                        <span className="small-text">{data.soil_moist}%</span>
                      </td>
                      <td>{data.soil_ph}</td>
                      <td>{data.avg_air_temp}°C</td>
                      <td>
                        <span className={`risk-tag ${(data.disease_risk || '').toLowerCase().includes('low') ? 'low' : 'high'}`}>
                          {data.disease_risk}
                        </span>
                      </td>
                      <td>
                        <span className="status-dot" style={{ backgroundColor: data.status_color || '#999' }}></span>
                        {data.status_color?.includes('388E3C') ? 'Normal' : 'Attention'}
                      </td>
                      <td>
                        <span className="ai-advice-cell">
                          {data.ai_advice || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Active Alerts */}
        <div className="grid-column side-col">
          <div className="alerts-card">
            <h2 className="alert-header-title">Active Alerts</h2>
            {activeAlertsList.length > 0 ? (
              <div className="alerts-list">
                {activeAlertsList.map((alert, idx) => (
                  <div key={idx} className="alert-item-card">
                    <div className="alert-badge">Warning</div>
                    <h4>{alert.sensor_id}</h4>
                    <p>{alert.ai_advice || alert.farm_advisory}</p>
                    <span className="alert-time">
                      {alert.last_updated ? new Date(alert.last_updated).toLocaleTimeString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-alerts">
                <div className="check-icon">✓</div>
                <p>No active alerts. <br />System is healthy.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;

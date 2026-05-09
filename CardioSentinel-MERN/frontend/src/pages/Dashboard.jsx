import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import DashboardLayout from '../components/Layout/DashboardLayout';
import StatCard from '../components/UI/StatCard';
import RiskBadge from '../components/UI/RiskBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import analyticsService from '../services/analyticsService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [risk, setRisk] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r, t] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getRiskDistribution(),
          analyticsService.getAlertTrends(7),
        ]);
        setStats(s);
        setRisk(r);

        const byDate = {};
        t.forEach(({ _id, count }) => {
          if (!byDate[_id.date]) byDate[_id.date] = { date: _id.date, urgent: 0, watchlist: 0, stable: 0 };
          byDate[_id.date][_id.alertType] = (byDate[_id.date][_id.alertType] || 0) + count;
        });
        setTrends(Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)));
      } catch { /* graceful — show empty state */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <DashboardLayout title="Dashboard"><LoadingSpinner /></DashboardLayout>;

  const donutSeries = risk ? [risk.low || 0, risk.moderate || 0, risk.high || 0] : [0, 0, 0];
  const donutEmpty = donutSeries.every(v => v === 0);

  const donutOptions = {
    labels: ['Low', 'Moderate', 'High'],
    colors: ['#10b981', '#f59e0b', '#ef4444'],
    chart: { type: 'donut', fontFamily: 'Manrope, sans-serif' },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      formatter: (val, { seriesIndex, w }) => {
        const v = w.config.series[seriesIndex];
        return v > 0 ? `${val.toFixed(0)}%` : '';
      },
      style: { fontSize: '11px', fontWeight: 600 },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: { donut: { size: '62%', labels: { show: false } } },
    },
    stroke: { width: 2, colors: ['#fff'] },
    tooltip: { y: { formatter: v => `${v} patients` } },
  };

  const barCategories = trends.map(t => t.date.slice(5));
  const barOptions = {
    chart: { type: 'bar', fontFamily: 'Manrope, sans-serif', toolbar: { show: false }, stacked: false },
    colors: ['#ef4444', '#f59e0b', '#10b981'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: barCategories, labels: { style: { fontSize: '11px' } } },
    yaxis: { labels: { style: { fontSize: '11px' } }, allowDecimals: false },
    legend: { position: 'top', fontSize: '12px', fontWeight: 600 },
    grid: { strokeDashArray: 4, borderColor: '#f0f0f0' },
    tooltip: { shared: true, intersect: false },
  };
  const barSeries = [
    { name: 'Urgent',    data: trends.map(t => t.urgent) },
    { name: 'Watchlist', data: trends.map(t => t.watchlist) },
    { name: 'Stable',   data: trends.map(t => t.stable) },
  ];

  return (
    <DashboardLayout title="Dashboard">
      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Patients',  value: stats?.totalPatients,  sub: `${stats?.activePatients} active`,       accent: '#0f4c81', icon: '👥' },
          { label: 'High Risk',       value: stats?.highRiskPatients, sub: 'Require attention',                    accent: '#dc2626', icon: '⚠️' },
          { label: 'Pending Alerts',  value: stats?.pendingAlerts,  sub: `of ${stats?.totalAlerts} total`,         accent: '#f59e0b', icon: '🔔' },
          { label: 'Clinical Users',  value: stats?.totalUsers,     sub: 'Active staff',                           accent: '#0f766e', icon: '👨‍⚕️' },
        ].map(c => (
          <div className="col-6 col-xl-3" key={c.label}>
            <StatCard {...c} icon={<span style={{ fontSize: '1.25rem' }}>{c.icon}</span>} />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="row g-4 mb-4">
        {/* Risk distribution donut */}
        <div className="col-lg-4">
          <div className="content-card p-4 h-100">
            <h5 style={{ color: '#0f2840', marginBottom: '0.25rem' }}>Risk Distribution</h5>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '1rem' }}>Current patient risk levels</p>
            {donutEmpty ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No patient data yet</div>
            ) : (
              <ReactApexChart type="donut" series={donutSeries} options={donutOptions} height={210} />
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              {[['Low','#10b981'],['Moderate','#f59e0b'],['High','#ef4444']].map(([k, c]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#6b7280' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{k}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alert trends bar */}
        <div className="col-lg-8">
          <div className="content-card p-4 h-100">
            <h5 style={{ color: '#0f2840', marginBottom: '0.25rem' }}>Alert Trends</h5>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Last 7 days by alert type</p>
            {trends.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No alert data yet. Alerts appear after telemetry is recorded.</div>
            ) : (
              <ReactApexChart type="bar" series={barSeries} options={barOptions} height={210} />
            )}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="content-card p-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h5 style={{ margin: 0, color: '#0f2840' }}>Recent Alerts</h5>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.8rem' }}>Latest pending clinical alerts</p>
          </div>
          <Link to="/alerts" style={{ color: '#0f4c81', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>View all →</Link>
        </div>
        {!stats?.recentAlerts?.length ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div>No pending alerts — all clear!</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table data-table">
              <thead><tr><th>Patient</th><th>Alert Type</th><th>Risk Score</th><th>Status</th><th>Time</th><th></th></tr></thead>
              <tbody>
                {stats.recentAlerts.map(a => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600, color: '#0f2840' }}>{a.patientId?.name || '—'}<br /><span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.75rem' }}>{a.patientId?.patientId}</span></td>
                    <td><span className={`status-${a.alertType}`}>{a.alertType}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <RiskBadge level={a.riskScore >= 0.7 ? 'high' : a.riskScore >= 0.4 ? 'moderate' : 'low'} size="sm" />
                        <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.85rem' }}>{a.riskScore ? (a.riskScore * 100).toFixed(1) + '%' : '—'}</span>
                      </div>
                    </td>
                    <td><span className="status-watchlist">{a.status}</span></td>
                    <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td><Link to="/alerts" style={{ color: '#0f4c81', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>Review</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

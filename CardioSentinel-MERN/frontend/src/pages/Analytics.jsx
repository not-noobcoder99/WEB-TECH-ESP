import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import analyticsService from '../services/analyticsService';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const Analytics = () => {
  const [risk, setRisk] = useState(null);
  const [trends, setTrends] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [r, t] = await Promise.all([
          analyticsService.getRiskDistribution(),
          analyticsService.getAlertTrends(days),
        ]);
        setRisk(r);
        const byDate = {};
        t.forEach(({ _id, count }) => {
          if (!byDate[_id.date]) byDate[_id.date] = { date: _id.date, urgent: 0, watchlist: 0, stable: 0 };
          byDate[_id.date][_id.alertType] = (byDate[_id.date][_id.alertType] || 0) + count;
        });
        setTrends(Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)));
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [days]);

  const riskPie = risk ? [risk.low || 0, risk.moderate || 0, risk.high || 0] : [0, 0, 0];
  const riskLabels = ['Low Risk', 'Moderate Risk', 'High Risk'];
  const totalPatients = riskPie.reduce((s, v) => s + v, 0);

  const donutOptions = {
    labels: riskLabels,
    colors: COLORS,
    chart: { type: 'donut', fontFamily: 'Manrope, sans-serif' },
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '65%' } } },
    stroke: { width: 2, colors: ['#fff'] },
    tooltip: { y: { formatter: v => `${v} patients` } },
  };

  const trendCategories = trends.map(t => t.date.slice(5));
  const barSeries = [
    { name: 'Urgent',    data: trends.map(t => t.urgent) },
    { name: 'Watchlist', data: trends.map(t => t.watchlist) },
    { name: 'Stable',   data: trends.map(t => t.stable) },
  ];
  const barOptions = {
    chart: { type: 'bar', fontFamily: 'Manrope, sans-serif', toolbar: { show: false } },
    colors: ['#ef4444', '#f59e0b', '#10b981'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: trendCategories, labels: { style: { fontSize: '10px' } } },
    yaxis: { labels: { style: { fontSize: '11px' } }, allowDecimals: false },
    legend: { position: 'top', fontSize: '12px', fontWeight: 600 },
    grid: { strokeDashArray: 4, borderColor: '#f0f0f0' },
    tooltip: { shared: true, intersect: false },
  };

  const lineOptions = {
    chart: { type: 'line', fontFamily: 'Manrope, sans-serif', toolbar: { show: false } },
    colors: ['#ef4444', '#f59e0b', '#10b981'],
    stroke: { width: [2.5, 2.5, 2.5], curve: 'smooth' },
    markers: { size: 4 },
    dataLabels: { enabled: false },
    xaxis: { categories: trendCategories, labels: { style: { fontSize: '10px' } } },
    yaxis: { labels: { style: { fontSize: '11px' } }, allowDecimals: false },
    legend: { position: 'top', fontSize: '12px', fontWeight: 600 },
    grid: { strokeDashArray: 4, borderColor: '#f0f0f0' },
    tooltip: { shared: true, intersect: false },
  };

  if (loading) return <DashboardLayout title="Analytics"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Analytics">

      {/* Risk Summary Tiles */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Low Risk',       value: risk?.low || 0,      color: '#10b981', pct: totalPatients ? ((risk?.low || 0) / totalPatients * 100).toFixed(1) : 0 },
          { label: 'Moderate Risk',  value: risk?.moderate || 0, color: '#f59e0b', pct: totalPatients ? ((risk?.moderate || 0) / totalPatients * 100).toFixed(1) : 0 },
          { label: 'High Risk',      value: risk?.high || 0,     color: '#ef4444', pct: totalPatients ? ((risk?.high || 0) / totalPatients * 100).toFixed(1) : 0 },
          { label: 'Total Patients', value: totalPatients,        color: '#0f4c81', pct: '100' },
        ].map(s => (
          <div className="col-6 col-md-3" key={s.label}>
            <div style={{ padding: '1.5rem', background: 'white', borderRadius: '14px', border: `1px solid #d6e3ee`, borderTop: `4px solid ${s.color}`, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0.25rem 0' }}>{s.label}</div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{s.pct}% of total</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="row g-4 mb-4">
        {/* Donut */}
        <div className="col-lg-5">
          <div className="content-card p-4 h-100">
            <h5 style={{ color: '#0f2840', marginBottom: '0.25rem' }}>Risk Distribution</h5>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.75rem' }}>Current patient population by risk level</p>
            {totalPatients === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No patient data yet</div>
            ) : (
              <>
                <ReactApexChart type="donut" series={riskPie} options={donutOptions} height={230} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {riskLabels.map((label, i) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i] }} />
                        <span style={{ fontSize: '0.85rem', color: '#374151' }}>{label}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: 80, height: 6, background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${totalPatients ? riskPie[i] / totalPatients * 100 : 0}%`, background: COLORS[i], borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontWeight: 700, color: COLORS[i], fontSize: '0.85rem', minWidth: 24, textAlign: 'right' }}>{riskPie[i]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="col-lg-7">
          <div className="content-card p-4 h-100">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h5 style={{ color: '#0f2840', margin: 0 }}>Alert Trends</h5>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Alerts by type over time</p>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[7, 14, 30].map(d => (
                  <button key={d} onClick={() => setDays(d)} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid', borderColor: days === d ? '#0f4c81' : '#d6e3ee', background: days === d ? '#0f4c81' : 'white', color: days === d ? 'white' : '#6b7280', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            {trends.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No alert data for this period</div>
            ) : (
              <ReactApexChart type="bar" series={barSeries} options={barOptions} height={260} />
            )}
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="content-card p-4 mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h5 style={{ color: '#0f2840', margin: 0 }}>Alert Volume Trend</h5>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Daily alert counts by severity over the selected period</p>
          </div>
        </div>
        {trends.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No alert data for this period</div>
        ) : (
          <ReactApexChart type="line" series={barSeries} options={lineOptions} height={240} />
        )}
      </div>

      {/* Model Info Card */}
      <div className="content-card p-4">
        <h5 style={{ color: '#0f2840', marginBottom: '1.25rem' }}>AI Model Information</h5>
        <div className="row g-3">
          {[
            { label: 'Model Type',          value: 'LogisticRegression (C=1.0)',              color: '#0f4c81' },
            { label: 'Training Dataset',     value: 'UCI Heart Disease (303 samples)',          color: '#0f766e' },
            { label: 'Validation Accuracy',  value: '80.33%',                                  color: '#10b981' },
            { label: 'AUC-ROC Score',        value: '0.8690',                                  color: '#f59e0b' },
            { label: 'Input Features',       value: '13 clinical features',                    color: '#7c3aed' },
            { label: 'Risk Thresholds',      value: '<0.4 Low · 0.4–0.7 Moderate · ≥0.7 High', color: '#ef4444' },
          ].map(m => (
            <div className="col-md-4" key={m.label}>
              <div style={{ padding: '1rem 1.25rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb', borderLeft: `3px solid ${m.color}` }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>{m.label}</div>
                <div style={{ fontWeight: 700, color: m.color, fontSize: '0.9rem' }}>{m.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;

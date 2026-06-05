import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, ShoppingBag, Download, Calendar } from 'lucide-react';

/* ─── tiny helper: build SVG path from points array ─── */
const buildPath = (pts) =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

const buildArea = (pts, H, PAD) => {
  if (pts.length < 2) return '';
  const path = buildPath(pts);
  return `${path} L ${pts[pts.length - 1].x.toFixed(1)},${(H - PAD).toFixed(1)} L ${pts[0].x.toFixed(1)},${(H - PAD).toFixed(1)} Z`;
};

/* ─── Leads Over Time chart (standalone sub-component to keep hooks clean) ─── */
const LeadsOverTimeChart = ({ history }) => {
  const [hovered, setHovered] = useState(null);

  const raw = history && history.length > 0 ? history : [];

  // Backend returns { _id: "2026-06-04", count: N }
  // Build a full 30-day skeleton so chart always has shape even on sparse data
  const buildChartData = () => {
    const result = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const match = raw.find((h) => h._id === dateStr);
      result.push({ label, count: match ? match.count : 0 });
    }
    return result;
  };

  const chartData = buildChartData();

  const W = 400, H = 130, PAD = 16;
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  const pts = chartData.map((d, i) => ({
    x: PAD + i * ((W - 2 * PAD) / Math.max(chartData.length - 1, 1)),
    y: H - PAD - (d.count / maxCount) * (H - 2 * PAD),
    label: d.label,
    count: d.count,
  }));

  const pathD = buildPath(pts);
  const areaD = buildArea(pts, H, PAD);
  const hasData = chartData.some((d) => d.count > 0);

  const firstLabel = chartData[0]?.label || '';
  const midLabel = chartData[Math.floor(chartData.length / 2)]?.label || '';
  const lastLabel = chartData[chartData.length - 1]?.label || '';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            left: `${((hovered.x - PAD) / (W - 2 * PAD)) * 100}%`,
            top: '-32px',
            transform: 'translateX(-50%)',
            background: '#1E293B',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {hovered.count} leads · {hovered.label}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '-4px',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid #1E293B',
            }}
          />
        </div>
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="130"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Subtle grid lines */}
        {[0.25, 0.5, 0.75, 1].map((pct) => {
          const y = H - PAD - pct * (H - 2 * PAD);
          return (
            <line
              key={pct}
              x1={PAD}
              y1={y.toFixed(1)}
              x2={W - PAD}
              y2={y.toFixed(1)}
              stroke="#EEF2F7"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map((pct) => {
          const y = H - PAD - pct * (H - 2 * PAD);
          const val = Math.round(pct * maxCount);
          return (
            <text
              key={pct}
              x={PAD - 4}
              y={y + 3}
              fontSize="7"
              fill="#94A3B8"
              textAnchor="end"
            >
              {val}
            </text>
          );
        })}

        {/* Area fill */}
        {hasData && (
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.01" />
            </linearGradient>
          </defs>
        )}
        {hasData && areaD && <path d={areaD} fill="url(#areaGrad)" />}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {pts.map((p, i) => {
          const isHovered = hovered && hovered.label === p.label;
          return (
            <g key={i}>
              {/* Hover hit area */}
              <circle
                cx={p.x.toFixed(1)}
                cy={p.y.toFixed(1)}
                r="12"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(p)}
                onMouseLeave={() => setHovered(null)}
              />
              {/* Visible dot */}
              <circle
                cx={p.x.toFixed(1)}
                cy={p.y.toFixed(1)}
                r={isHovered ? '6' : '4'}
                fill={isHovered ? 'var(--primary)' : '#fff'}
                stroke="var(--primary)"
                strokeWidth="2.5"
                style={{ transition: 'r 0.1s, fill 0.1s', pointerEvents: 'none' }}
              />
              {/* Vertical hover line */}
              {isHovered && (
                <line
                  x1={p.x.toFixed(1)}
                  y1={p.y.toFixed(1)}
                  x2={p.x.toFixed(1)}
                  y2={(H - PAD).toFixed(1)}
                  stroke="var(--primary)"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                  opacity="0.4"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* X-axis labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.62rem',
          color: 'var(--text-light)',
          marginTop: '4px',
          padding: `0 ${PAD}px`,
        }}
      >
        <span>{firstLabel}</span>
        {chartData.length > 2 && <span>{midLabel}</span>}
        <span>{lastLabel}</span>
      </div>

      {!hasData && (
        <div
          style={{
            textAlign: 'center',
            marginTop: '0.5rem',
            fontSize: '0.7rem',
            color: 'var(--text-light)',
          }}
        >
          No history data yet — add leads to see the chart populate
        </div>
      )}
    </div>
  );
};

/* ─── Lead Funnel Bar (single stage) ─── */
const FunnelBar = ({ label, count, pct, color, bgColor, delay }) => (
  <div style={{ marginBottom: '0.85rem' }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px',
      }}
    >
      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: 800,
          color: 'var(--text-main)',
        }}
      >
        {count} <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>({pct}%)</span>
      </span>
    </div>
    <div
      style={{
        height: '10px',
        backgroundColor: bgColor,
        borderRadius: '99px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: color,
          borderRadius: '99px',
          transition: `width 0.7s ease ${delay}`,
        }}
      />
    </div>
  </div>
);

/* ─── Main ReportsView component ─── */
const ReportsView = ({ stats = {}, leads = [] }) => {
  const { total = 0, byStatus = {}, bySource = {}, conversionRate = 0, history = [] } =
    stats || {};

  const [hoveredSource, setHoveredSource] = useState(null);

  /* Financial metrics */
  const convertedCount = byStatus.Converted || 0;
  const dynamicRevenue = convertedCount * 1250;
  const dynamicAvgDealSize = convertedCount > 0 ? 1250 : 0;

  /* Funnel */
  const funnelNew = total;
  const funnelContacted =
    (byStatus.Contacted || 0) + (byStatus.Qualified || 0) + (byStatus.Converted || 0);
  const funnelQualified = (byStatus.Qualified || 0) + (byStatus.Converted || 0);
  const funnelConverted = byStatus.Converted || 0;
  const contactedPct = funnelNew > 0 ? Math.round((funnelContacted / funnelNew) * 100) : 0;
  const qualifiedPct = funnelNew > 0 ? Math.round((funnelQualified / funnelNew) * 100) : 0;
  const convertedPct = funnelNew > 0 ? Math.round((funnelConverted / funnelNew) * 100) : 0;

  /* Donut chart */
  const totalSourcesCount = Object.values(bySource).reduce((a, b) => a + b, 0);
  const pctOf = (key) =>
    totalSourcesCount > 0 ? Math.round(((bySource[key] || 0) / totalSourcesCount) * 100) : 0;
  const srcWebsite = pctOf('Website');
  const srcReferral = pctOf('Referral');
  const srcSocial = pctOf('Social Media');
  const srcCampaign = pctOf('Email Campaign');
  const srcOthers = pctOf('Others');

  const r = 40, circ = 2 * Math.PI * r;
  const slices = [
    { label: 'Website', pct: srcWebsite / 100, color: 'var(--primary)' },
    { label: 'Referral', pct: srcReferral / 100, color: 'var(--pink)' },
    { label: 'Social', pct: srcSocial / 100, color: 'var(--warning)' },
    { label: 'Campaign', pct: srcCampaign / 100, color: 'var(--accent)' },
    { label: 'Others', pct: srcOthers / 100, color: 'var(--danger)' },
  ];
  let acc = 0;
  const donutSlices = slices.map((s) => {
    const dashArr = `${(s.pct * circ).toFixed(2)} ${(circ - s.pct * circ).toFixed(2)}`;
    const dashOff = (-acc * circ).toFixed(2);
    acc += s.pct;
    return { ...s, dashArr, dashOff };
  });

  /* Sales reps */
  const repsRaw = [
    { name: 'Hanna V.', leads: 0, converted: 0, revenue: 0 },
    { name: 'Alen M.', leads: 0, converted: 0, revenue: 0 },
    { name: 'Jayesh P.', leads: 0, converted: 0, revenue: 0 },
    { name: 'Sarah C.', leads: 0, converted: 0, revenue: 0 },
  ];
  leads.forEach((lead, i) => {
    const ri = i % 4;
    repsRaw[ri].leads += 1;
    if (lead.status === 'Converted') {
      repsRaw[ri].converted += 1;
      repsRaw[ri].revenue += 1250;
    }
  });
  const repsData = repsRaw.map((rep) => ({
    ...rep,
    rate: rep.leads > 0 ? Math.round((rep.converted / rep.leads) * 100) : 0,
  }));

  /* Date range label */
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const dateRange = `${start.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })} – ${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`;

  return (
    <div>
      {/* ── Header ── */}
      <div className="greeting-row">
        <div className="greeting-text">
          <h2>Reports</h2>
          <p>Track performance and grow your business.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div
            className="btn btn-secondary"
            style={{ display: 'flex', gap: '0.4rem', fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
          >
            <Calendar size={14} />
            <span>{dateRange}</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => alert('Exporting dynamic report PDF...')}
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="reports-kpi-row">
        {[
          { icon: <Users size={14} />, cls: 'purple', title: 'Total Leads', val: total, trend: '↑ 18.6%' },
          { icon: <TrendingUp size={14} />, cls: 'success', title: 'Conversion Rate', val: `${conversionRate}%`, trend: '↑ 2.6%' },
          { icon: <DollarSign size={14} />, cls: 'warning', title: 'Revenue Generated', val: `$${dynamicRevenue.toLocaleString()}`, trend: '↑ 12.0%' },
          { icon: <ShoppingBag size={14} />, cls: 'pink', title: 'Avg. Deal Size', val: `$${dynamicAvgDealSize.toLocaleString()}`, trend: '↑ 8.3%' },
        ].map((kpi) => (
          <div className="kpi-card" key={kpi.title}>
            <div className="kpi-header">
              <div className={`kpi-icon-container ${kpi.cls}`}>{kpi.icon}</div>
              <span className="kpi-title">{kpi.title}</span>
            </div>
            <span className="kpi-value">{kpi.val}</span>
            <span className="kpi-trend up">
              {kpi.trend}{' '}
              <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>from last month</span>
            </span>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Lead Funnel */}
        <div className="card-panel">
          <h3 className="panel-title" style={{ marginBottom: '1.25rem' }}>Lead Funnel</h3>
          <FunnelBar label="New Leads"  count={funnelNew}       pct={100}          color="#6366F1" bgColor="#EEF2FF" delay="0s" />
          <FunnelBar label="Contacted"  count={funnelContacted} pct={contactedPct} color="#8B5CF6" bgColor="#EDE9FE" delay="0.1s" />
          <FunnelBar label="Qualified"  count={funnelQualified} pct={qualifiedPct} color="#A855F7" bgColor="#F3E8FF" delay="0.2s" />
          <FunnelBar label="Converted"  count={funnelConverted} pct={convertedPct} color="#D946EF" bgColor="#FDF4FF" delay="0.3s" />
        </div>

        {/* Leads Over Time */}
        <div className="card-panel">
          <div className="panel-header">
            <h3 className="panel-title">Leads Over Time</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Last 30 days
            </span>
          </div>
          <LeadsOverTimeChart history={history} />
        </div>

        {/* Leads by Source */}
        <div className="card-panel">
          <div className="panel-header">
            <h3 className="panel-title">Leads by Source</h3>
          </div>
          <div className="donut-widget" style={{ flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="donut-chart-container" style={{ width: '120px', height: '120px' }}>
              <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
                {donutSlices.map((s, i) => (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={r}
                    fill="transparent"
                    stroke={s.color}
                    strokeWidth={hoveredSource?.label === s.label ? '14' : '12'}
                    strokeDasharray={s.dashArr}
                    strokeDashoffset={s.dashOff}
                    transform="rotate(-90 50 50)"
                    style={{ cursor: 'pointer', transition: 'stroke-width 0.15s' }}
                    onMouseEnter={() => setHoveredSource(s)}
                    onMouseLeave={() => setHoveredSource(null)}
                  />
                ))}
              </svg>
              <div className="donut-center-text">
                <span className="donut-center-val" style={{ fontSize: '1rem' }}>
                  {hoveredSource ? `${Math.round(hoveredSource.pct * 100)}%` : total}
                </span>
                <span className="donut-center-lbl" style={{ fontSize: '0.55rem' }}>
                  {hoveredSource ? hoveredSource.label : 'Total'}
                </span>
              </div>
            </div>
            <div className="donut-legend" style={{ width: '100%' }}>
              {[
                { dot: 'purple',  label: 'Website',  val: `${srcWebsite}%` },
                { dot: 'pink',    label: 'Referral', val: `${srcReferral}%` },
                { dot: 'warning', label: 'Social',   val: `${srcSocial}%` },
                { dot: 'success', label: 'Campaign', val: `${srcCampaign}%` },
                { dot: 'danger',  label: 'Others',   val: `${srcOthers}%` },
              ].map((row) => (
                <div className="legend-item" key={row.label}>
                  <span className="legend-label-col">
                    <span className={`legend-dot ${row.dot}`} />
                    {row.label}
                  </span>
                  <span className="legend-value-col">{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Sales Reps ── */}
      <div className="leads-table-card">
        <div className="table-header-panel">
          <h3 className="table-title">Top Performing Sales Reps</h3>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sales Rep</th>
                <th>Total Leads</th>
                <th>Converted</th>
                <th>Conversion Rate</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {repsData.map((rep, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>{rep.name}</td>
                  <td>{rep.leads}</td>
                  <td>{rep.converted}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ minWidth: '28px', fontWeight: 700 }}>{rep.rate}%</span>
                      <div
                        style={{
                          flex: 1,
                          maxWidth: '80px',
                          height: '5px',
                          background: '#F1F5F9',
                          borderRadius: '99px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${rep.rate}%`,
                            background: 'var(--primary)',
                            borderRadius: '99px',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    ${rep.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;

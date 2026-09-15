import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const Icon = ({ name, className = 'h-4 w-4' }) => {
  const paths = {
    animal: <><path d="M5 10V7.5A2.5 2.5 0 0 1 7.5 5h3A2.5 2.5 0 0 1 13 7.5V10"/><path d="M4 10h10v5H4zM6 15v2m6-2v2M6 5 4 3m8 2 2-2"/></>,
    feed: <><path d="M4 15c5 0 8-3 8-8-5 0-8 3-8 8Z"/><path d="M5 14c2-2 4-4 7-6m1 1c2 1 3 3 3 6H9"/></>,
    expense: <><rect x="3" y="5" width="14" height="11" rx="2"/><path d="M3 8h14m-4 4h1"/></>,
    revenue: <><path d="M3 15 7 11l3 2 6-7"/><path d="M12 6h4v4"/></>,
    bell: <><path d="M5 14h10l-1.5-2V8a3.5 3.5 0 0 0-7 0v4L5 14Z"/><path d="M8 16a2 2 0 0 0 4 0"/></>,
    plus: <path d="M10 4v12M4 10h12"/>,
  };
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{paths[name]}</svg>;
};

const money = value => `Rs. ${Number(value || 0).toLocaleString()}`;

function MetricCard({ title, value, icon, hint, accent }) {
  return <div className={`farm-metric ${accent ? 'farm-metric-accent' : ''}`}><div><div className="farm-label">{title}</div><div className="farm-metric-value">{value}</div>{hint ? <div className="farm-metric-hint">{hint}</div> : null}</div>{icon ? <span className="farm-metric-icon"><Icon name={icon} /></span> : null}</div>;
}

function BarChart({ data = {} }) {
  const entries = Object.entries(data).slice(-6);
  const max = Math.max(1, ...entries.map(([, value]) => Math.abs(Number(value) || 0)));
  return <div className="farm-chart-bars">{entries.length ? entries.map(([label, value]) => <div className="farm-bar-column" key={label}><div className="farm-bar" style={{ height: `${Math.max(6, Math.abs(Number(value) || 0) / max * 100)}%` }} /><span>{label}</span></div>) : <div className="farm-chart-empty">No data yet.</div>}</div>;
}

function Donut({ male = 0, female = 0 }) {
  const total = Number(male) + Number(female);
  const maleShare = total ? Number(male) / total * 100 : 0;
  return <div className="farm-donut-row"><div className="farm-donut" style={{ background: `conic-gradient(#083c2f 0 ${maleShare}%, #efc644 ${maleShare}% 100%)` }}><span>{total}</span></div><div className="farm-legend"><span><i className="bg-[#083c2f]"/>Male</span><span><i className="bg-[#efc644]"/>Female</span></div></div>;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/dashboard').then(res => setData(res.data)).catch(err => setError(err.response?.data?.message || err.message)); }, []);
  const summary = data?.summary;
  const activities = useMemo(() => summary ? [
    { icon: 'animal', title: 'Animals Registered', detail: `${summary.totalAnimals || 0} animals in your farm`, meta: `${summary.availableAnimals || 0} available`, tone: 'green' },
    { icon: 'expense', title: 'Farm Expenses', detail: 'Feed, medicine and other costs', meta: money((summary.totalFeedExpenses || 0) + (summary.totalMedicineExpenses || 0) + (summary.totalOtherExpenses || 0)), tone: 'red' },
    { icon: 'feed', title: 'Feed Recorded', detail: 'Total feed expense', meta: money(summary.totalFeedExpenses), tone: 'green' },
    { icon: 'expense', title: 'Medicine Recorded', detail: 'Total medicine expense', meta: money(summary.totalMedicineExpenses), tone: 'blue' },
    { icon: 'revenue', title: 'Animals Sold', detail: `${summary.soldAnimals || 0} recorded sales`, meta: money(summary.totalSales), tone: 'yellow' },
  ] : [], [summary]);
  if (error) return <div className="farm-error">{error}</div>;
  if (!data) return <div className="farm-loading">Loading dashboard...</div>;
  return <div className="farm-dashboard">
    <div className="farm-mobile-title"><div><h1>Dashboard</h1><p>Maweshi Farm Management</p></div><div className="farm-mobile-tools"><button aria-label="Notifications"><Icon name="bell" /></button><img src="/logo.png" alt="Profile" /></div></div>
    <section className="farm-quick-actions"><div className="farm-label">Quick Actions</div><div className="farm-action-grid"><Link to="/farm/animals/new"><span><Icon name="plus" /></span>Add Animal</Link><Link to="/farm/feed"><span><Icon name="feed" /></span>Log Feed</Link><Link to="/farm/expenses"><span><Icon name="expense" /></span>Expenses</Link></div></section>
    <div className="farm-metrics-grid"><MetricCard title="Total Animals" value={summary.totalAnimals} icon="animal" hint={`Sold: ${summary.soldAnimals} · Available: ${summary.availableAnimals}`} /><MetricCard title="Total Investment" value={money(summary.totalInvestment)} icon="feed" /><MetricCard title="Total Sales" value={money(summary.totalSales)} icon="revenue" /><MetricCard title="Net Profit" value={money(summary.profitSummary?.netProfit)} icon="revenue" accent /></div>
    <div className="farm-profit-strip"><div><span>Net Profit</span><b>{money(summary.profitSummary?.netProfit)}</b></div><div><span>ROI</span><b>{Number(summary.profitSummary?.roi || 0).toFixed(2)}%</b></div></div>
    <div className="farm-main-grid"><section className="farm-panel farm-revenue-panel"><h2>Revenue vs Expenses</h2><div className="farm-placeholder-chart"><Icon name="revenue" className="h-6 w-6"/><span>Line Chart Visualization Area</span></div></section><section className="farm-panel farm-category-panel"><h2>Animal Category Distribution</h2><Donut male={summary.maleGoats} female={summary.femaleGoats} /></section><section className="farm-panel farm-activity-panel"><div className="farm-panel-heading"><h2>Recent Activity</h2><Link to="/farm/reports">View All</Link></div><div className="farm-activity-list">{activities.map(item => <div className="farm-activity" key={item.title}><span className={`farm-activity-icon ${item.tone}`}><Icon name={item.icon}/></span><div><b>{item.title}</b><small>{item.detail}</small></div><em>{item.meta}</em></div>)}</div></section></div>
    <section className="farm-mobile-analytics"><div className="farm-label">Analytics</div><div className="farm-panel"><h2>Monthly Purchases</h2><BarChart data={data.charts?.monthlyPurchases} /></div><div className="farm-panel"><h2>Male vs Female</h2><Donut male={summary.maleGoats} female={summary.femaleGoats} /></div></section>
  </div>;
}

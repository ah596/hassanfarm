const money = value => `Rs. ${Number(value || 0).toLocaleString()}`;
const groups = [
  ['Fertilizer', 'Fertilizer', ['Fertilizer'], 'green'],
  ['Pesticide Application', 'Pesticide', ['Pesticide Application'], 'teal'],
  ['Seed & Nursery', 'Seeding', ['Seed / Sowing'], 'amber'],
  ['Land Prep & Laser', 'Land Preparation', ['Land Preparation'], 'stone'],
  ['Spray / Protection', 'Spray', ['Spray / Pesticide'], 'mint'],
  ['Irrigation & Tube-well', 'Activities', ['Irrigation'], 'neutral'],
  ['Labour & Machinery', 'Activities', ['Labour', 'Machinery'], 'stone'],
  ['Other expenses', 'Activities', ['Other Expense'], 'neutral'],
  ['Harvesting', 'Harvesting', ['Harvesting'], 'amber'],
];
export function OperationIcon({ kind = 'leaf' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind === 'Pesticide' ? <><path d="M9 8h6v10H9zM10 5h4v3m-2-3V3m-5 7H5m14 0h-2M7 14H5m14 0h-2M7 18l-2 2m12-2 2 2"/><path d="M12 10v6"/></> : (kind === 'Activities' || kind === 'Seeding') ? <><path d="m7 5 3 3-3 3-3-3Zm10 2 3 3-3 3-3-3ZM9 14l3 3-3 3-3-3Zm9 3 2 2-2 2-2-2Z"/></> : kind === 'Land Preparation' ? <><path d="M4 13h12v5H4zm3-7h6l3 7M9 6v7m8-5h3v5h-4"/><circle cx="7" cy="18" r="3"/><circle cx="18" cy="18" r="2"/></> : kind === 'Spray' ? <><rect x="6" y="8" width="10" height="13" rx="2"/><path d="M9 8V4h4v4m3 4h3V5h2M9 13h4m-2-2v4"/></> : kind === 'clock' ? <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></> : kind === 'finance' ? <><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8m-8 5h3m3 0h2m-8 4h3m3 0h2"/></> : <><path d="M12 21v-9m0 4c-6 0-8-4-8-8 5 0 8 3 8 8Zm0-4c0-5 3-8 8-8 0 5-3 8-8 8Z"/></>}</svg>;
}
export default function CropOperationsOverview({ season, summary, activities, timeline, onTab }) {
  const investment = Number(summary.totalInvestment) || 0;
  const costs = summary.costsByType || {};
  const rows = groups.map(([label, tab, types, tone]) => ({ label, tab, types, tone, cost: types.reduce((sum, type) => sum + Number(costs[type] || 0), 0) })).filter((row, index) => index < 6 || row.cost > 0);
  if (Number(season.rentCost) > 0) rows.push({ label: 'Land rent', tab: 'Activities', types: [], tone: 'stone', cost: Number(season.rentCost) });
  const legend = rows.filter(row => row.cost > 0).slice(0, 3).map(row => ({ ...row, label: row.tab === 'Fertilizer' ? 'Fertilizer' : row.tab === 'Pesticide' ? 'Pesticide' : row.label === 'Seed & Nursery' ? 'Seed' : row.label }));
  const otherCost = investment - legend.reduce((sum, row) => sum + row.cost, 0);
  if (otherCost > 0) legend.push({ label: 'Other', cost: otherCost, tone: 'mint' });
  const compactMoney = value => `Rs. ${(Number(value || 0) / 1000).toFixed(1)}k/ac`;
  const current = new Date();
  const day = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const sowing = season.sowingDate ? new Date(`${season.sowingDate.slice(0,10)}T00:00:00`) : null;
  const age = sowing && Number.isFinite(sowing.getTime()) ? Math.max(0, Math.floor((today - sowing) / 86400000)) : null;
  const upcoming = activities.filter(item => item.date > day).sort((a,b) => a.date.localeCompare(b.date)).slice(0,2);
  const recent = timeline.filter(item => item.date <= day).slice(0,3);
  return <div className="crop-operations-overview">
    <section className="crop-ops-panel crop-financial">
      <div className="crop-ops-panel-heading"><h2><OperationIcon kind="finance"/>Financial & Field Status</h2><span className="crop-phase">{Number(summary.totalRevenue) > 0 ? 'Revenue Phase' : 'Investment Phase'}</span></div>
      <div className="crop-financial-grid">
        <div><span>Total Investment</span><b>{money(investment)}</b><small>Cost: {money(summary.costPerAcre)}/acre</small></div>
        <div><span>Crop Age</span><b className="crop-age">{age === null ? 'Not recorded' : `Day ${age}`}<em>{age === null ? '' : season.status}</em></b><small>{season.sowingDate ? `Sown ${season.sowingDate}` : 'Add a sowing date'}</small></div>
        <div><span>Total Land</span><b>{season.totalArea} {season.areaUnit}</b><small>{season.landOwnership === 'Own' ? 'Owned land' : season.landOwnership}</small></div>
        <div><span>Cost / Acre</span><b>{money(summary.costPerAcre)}</b><small>Based on recorded costs</small></div>
      </div>
    </section>
    <section className="crop-ops-panel crop-investment-panel">
      <div className="crop-ops-panel-heading"><div><h2>Investment by Operation</h2><p>Breakdown of {money(investment)} total spend</p></div><span className="crop-ops-active">{rows.filter(row => row.cost > 0).length} Active</span></div>
      <div className="crop-cost-bar" aria-label="Investment breakdown">{rows.filter(row => row.cost > 0).map(row => <i key={row.label} className={`tone-${row.tone}`} style={{ flex: row.cost }}/>)}</div>
      <div className="crop-cost-legend">{legend.map(row => <span key={row.label}><i className={`tone-${row.tone}`}/>{row.label} {investment ? Math.round(row.cost / investment * 100) : 0}%</span>)}</div>
      <div className="crop-operation-list">{rows.map(row => <button key={row.label} type="button" className={`crop-operation-row ${row.cost === 0 ? 'crop-operation-empty' : ''}`} onClick={() => onTab(row.tab)}>
        <span className={`crop-operation-icon tone-${row.tone}`}><OperationIcon kind={row.label === 'Irrigation & Tube-well' ? 'clock' : row.tab}/></span>
        <span className="crop-operation-name"><b>{row.label}</b><small>{row.tab === 'Pesticide' ? activities.filter(item => row.types.includes(item.type)).slice(-1)[0]?.title || 'No entries yet' : row.cost ? compactMoney(Number(summary.acres) ? row.cost / Number(summary.acres) : 0) : 'No entries yet'}</small></span>
        <span className="crop-operation-amount"><b>{money(row.cost)}</b><span className={`crop-operation-share tone-${row.tone}`}>{investment ? (row.cost / investment * 100).toFixed(1) : '0.0'}%</span></span>
        <svg className="crop-operation-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 4 4 4-4 4"/></svg>
      </button>)}</div>
    </section>
    <section className="crop-ops-panel">
      <div className="crop-ops-panel-heading"><h2><OperationIcon kind="clock"/>Upcoming Schedule & Log</h2><button type="button" onClick={() => onTab('Timeline')}>View All <span aria-hidden="true">&rsaquo;</span></button></div>
      {upcoming.length ? <div className="crop-upcoming">{upcoming.map(item => <button key={item.id} type="button" onClick={() => onTab('Timeline')}><b>{item.title}</b><span>{item.date}</span><small>{item.type}</small></button>)}</div> : <p className="crop-ops-empty">No upcoming activities recorded.</p>}
      <div className="crop-recent-log">{recent.length ? recent.map(item => <div key={`${item.type}-${item.id}`}><span>{item.title}</span><time>{item.date}</time></div>) : <p className="crop-ops-empty">Your activity log will appear here.</p>}</div>
    </section>

  </div>;
}

function MiniBarChart({ title, data = {} }) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, v]) => Number(v) || 0));

  return (
    <div className="min-w-0 rounded-2xl border border-[#a8d8a8] bg-white p-5 shadow-card">
      <div className="mb-4 text-sm font-semibold text-[#001e00]">{title}</div>
      <div className="flex h-36 items-end gap-1.5">
        {entries.length ? entries.map(([label, value]) => {
          const height = Math.max(6, ((Number(value) || 0) / max) * 100);
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="w-full rounded-t-lg bg-[#001e00]" style={{ height: `${height}%` }} />
              <div className="w-full truncate text-center text-[9px] text-[#3a8a3a]" title={label}>{label}</div>
            </div>
          );
        }) : <div className="text-sm text-[#6ab86a]">No data yet.</div>}
      </div>
    </div>
  );
}

export function ChartsGrid({ charts }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MiniBarChart title="Monthly Purchases" data={charts?.monthlyPurchases || {}} />
      <MiniBarChart title="Monthly Sales" data={charts?.monthlySales || {}} />
      <MiniBarChart title="Monthly Expenses" data={charts?.monthlyExpenses || {}} />
      <MiniBarChart title="Monthly Profit" data={charts?.monthlyProfit || {}} />
      <MiniBarChart title="Male vs Female" data={charts?.maleVsFemale || {}} />
      <MiniBarChart title="Sold vs Available" data={charts?.soldVsAvailable || {}} />
    </div>
  );
}

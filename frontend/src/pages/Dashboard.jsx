import { useEffect, useState } from 'react';
import api from '../lib/api';
import { ChartsGrid } from '../components/Charts';
import { Card, LoadingState, SectionHeader, StatCard } from '../components/ui';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || err.message));
  }, []);

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard"
        subtitle="Track purchases, expenses, sales, and live profitability."
      />

      {error ? <Card><div className="text-[#001e00]">{error}</div></Card> : null}
      {!data && !error ? <LoadingState /> : null}

      {summary ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            <StatCard title="Total Animals" value={summary.totalAnimals} hint={`Sold: ${summary.soldAnimals} · Available: ${summary.availableAnimals}`} />
            <StatCard title="Total Investment" value={`Rs. ${Number(summary.totalInvestment || 0).toLocaleString()}`} />
            <StatCard title="Total Sales" value={`Rs. ${Number(summary.totalSales || 0).toLocaleString()}`} />
            <StatCard title="Net Profit" value={`Rs. ${Number(summary.profitSummary?.netProfit || 0).toLocaleString()}`} />
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            <StatCard title="Male Goats" value={summary.maleGoats} />
            <StatCard title="Female Goats" value={summary.femaleGoats} />
            <StatCard title="Total Feed Expenses" value={`Rs. ${Number(summary.totalFeedExpenses || 0).toLocaleString()}`} />
            <StatCard title="Total Medicine Expenses" value={`Rs. ${Number(summary.totalMedicineExpenses || 0).toLocaleString()}`} />
          </div>

          <Card className="p-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wide text-[#3a8a3a]">Total Revenue</div>
                <div className="mt-2 break-words text-xl font-bold text-[#001e00] sm:text-2xl">Rs. {Number(summary.profitSummary?.totalRevenue || 0).toLocaleString()}</div>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wide text-[#3a8a3a]">Profit Margin</div>
                <div className="mt-2 break-words text-xl font-bold text-[#001e00] sm:text-2xl">{Number(summary.profitSummary?.profitMargin || 0).toFixed(2)}%</div>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wide text-[#3a8a3a]">ROI</div>
                <div className="mt-2 break-words text-xl font-bold text-[#001e00] sm:text-2xl">{Number(summary.profitSummary?.roi || 0).toFixed(2)}%</div>
              </div>
            </div>
          </Card>

          <ChartsGrid charts={data.charts} />
        </>
      ) : null}
    </div>
  );
}

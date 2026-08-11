import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Button, Card, SectionHeader, Table } from '../components/ui';

function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(','), ...rows.map(row => keys.map(key => JSON.stringify(row[key] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [profit, setProfit] = useState({ rows: [], summary: null });
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [tab, setTab] = useState('profit');

  useEffect(() => {
    api.get('/reports/profit').then(res => setProfit(res.data));
    api.get('/reports/sales').then(res => setSales(res.data.rows));
    api.get('/reports/expenses').then(res => setExpenses(res.data.rows));
    api.get('/reports/monthly-profit').then(res => setMonthly(res.data.rows));
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Reports"
        subtitle="Export farm performance and profitability tables."
        action={<div className="flex flex-wrap gap-2">
          <Button variant={tab === 'profit' ? 'primary' : 'secondary'} onClick={() => setTab('profit')}>Profit</Button>
          <Button variant={tab === 'sales' ? 'primary' : 'secondary'} onClick={() => setTab('sales')}>Sales</Button>
          <Button variant={tab === 'expenses' ? 'primary' : 'secondary'} onClick={() => setTab('expenses')}>Expenses</Button>
          <Button variant={tab === 'monthly' ? 'primary' : 'secondary'} onClick={() => setTab('monthly')}>Monthly</Button>
        </div>}
      />

      {tab === 'profit' ? (
        <Card>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button onClick={() => downloadCSV(profit.rows, 'animal-profit-report.csv')}>Export CSV</Button>
            <Button variant="secondary" onClick={() => window.print()}>Print Report</Button>
          </div>
          <Table
            columns={[
              { key: 'animalId', label: 'Animal ID' },
              { key: 'type', label: 'Type' },
              { key: 'gender', label: 'Gender' },
              { key: 'purchasePrice', label: 'Purchase Price' },
              { key: 'feed', label: 'Feed' },
              { key: 'medicine', label: 'Medicine' },
              { key: 'otherCost', label: 'Other Cost' },
              { key: 'totalCost', label: 'Total Cost' },
              { key: 'salePrice', label: 'Sale Price' },
              { key: 'profitLoss', label: 'Profit/Loss' },
              { key: 'status', label: 'Status' }
            ]}
            rows={profit.rows}
          />
        </Card>
      ) : null}

      {tab === 'sales' ? (
        <Card>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button onClick={() => downloadCSV(sales, 'sales-report.csv')}>Export CSV</Button>
            <Button variant="secondary" onClick={() => window.print()}>Print Report</Button>
          </div>
          <Table
            columns={[
              { key: 'animalId', label: 'Animal ID' },
              { key: 'saleDate', label: 'Sale Date' },
              { key: 'salePrice', label: 'Sale Price' },
              { key: 'buyerName', label: 'Buyer' },
              { key: 'profit', label: 'Profit' }
            ]}
            rows={sales}
          />
        </Card>
      ) : null}

      {tab === 'expenses' ? (
        <Card>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button onClick={() => downloadCSV(expenses, 'expense-report.csv')}>Export CSV</Button>
            <Button variant="secondary" onClick={() => window.print()}>Print Report</Button>
          </div>
          <Table
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'category', label: 'Category' },
              { key: 'animal', label: 'Animal' },
              { key: 'amount', label: 'Amount' },
              { key: 'description', label: 'Description' }
            ]}
            rows={expenses}
          />
        </Card>
      ) : null}

      {tab === 'monthly' ? (
        <Card>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button onClick={() => downloadCSV(monthly, 'monthly-profit-report.csv')}>Export CSV</Button>
            <Button variant="secondary" onClick={() => window.print()}>Print Report</Button>
          </div>
          <Table
            columns={[
              { key: 'month', label: 'Month' },
              { key: 'purchases', label: 'Purchases' },
              { key: 'expenses', label: 'Expenses' },
              { key: 'sales', label: 'Sales' },
              { key: 'profit', label: 'Profit' }
            ]}
            rows={monthly}
          />
        </Card>
      ) : null}
    </div>
  );
}

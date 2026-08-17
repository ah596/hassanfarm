export function Card({ children, className = '' }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

export function StatCard({ title, value, hint, compact = false }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-[#a8d8a8] bg-white shadow-card ${compact ? 'p-2 sm:p-5' : 'p-4 sm:p-5'}`}>
      <div className={`font-medium uppercase tracking-wide text-[#3a8a3a] ${compact ? 'text-[10px] sm:text-sm' : 'text-xs sm:text-sm'}`}>{title}</div>
      <div className={`break-words font-bold tracking-tight text-[#001e00] ${compact ? 'mt-1 text-lg sm:mt-2 sm:text-3xl' : 'mt-2 text-xl sm:text-3xl'}`}>{value}</div>
      {hint ? <div className={`text-[#3a8a3a] ${compact ? 'mt-1 text-[8px] leading-tight sm:mt-1.5 sm:text-xs' : 'mt-1.5 text-[11px] sm:text-xs'}`}>{hint}</div> : null}
    </div>
  );
}

export function Button({ children, className = '', variant = 'primary', ...props }) {
  const styles = {
    primary: 'bg-[#001e00] text-white hover:bg-[#0f3d0f]',
    secondary: 'bg-white text-[#001e00] border border-[#a8d8a8] hover:bg-[#d6f0d6]',
    danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-600 hover:text-white'
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1.5 text-sm font-medium text-[#001e00]">{label}</div> : null}
      <input
        className={`w-full rounded-xl border border-[#a8d8a8] bg-white px-4 py-2.5 text-sm text-[#001e00] outline-none transition placeholder:text-[#6ab86a] focus:border-[#001e00] focus:ring-1 focus:ring-[#001e00] ${className}`}
        {...props}
      />
      {error ? <div className="mt-1.5 text-xs text-red-600">{error}</div> : null}
    </label>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1.5 text-sm font-medium text-[#001e00]">{label}</div> : null}
      <select
        className={`w-full rounded-xl border border-[#a8d8a8] bg-white px-4 py-2.5 text-sm text-[#001e00] outline-none transition focus:border-[#001e00] focus:ring-1 focus:ring-[#001e00] ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <div className="mt-1.5 text-xs text-red-600">{error}</div> : null}
    </label>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1.5 text-sm font-medium text-[#001e00]">{label}</div> : null}
      <textarea
        className={`w-full rounded-xl border border-[#a8d8a8] bg-white px-4 py-2.5 text-sm text-[#001e00] outline-none transition placeholder:text-[#6ab86a] focus:border-[#001e00] focus:ring-1 focus:ring-[#001e00] ${className}`}
        {...props}
      />
      {error ? <div className="mt-1.5 text-xs text-red-600">{error}</div> : null}
    </label>
  );
}

export function Table({ columns, rows, emptyMessage = 'No records yet.' }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#a8d8a8] bg-white shadow-card">
      <div className="overflow-x-auto scrollbar">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#a8d8a8] bg-[#f0faf0]">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-[#3a8a3a]">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row, index) => (
              <tr key={row.id || index} className="border-t border-[#d6f0d6] transition-colors hover:bg-[#f0faf0]">
                {columns.map(col => (
                  <td key={col.key} className="px-5 py-3.5 text-[#001e00]">
                    {typeof col.render === 'function' ? col.render(row) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td className="px-5 py-12 text-center text-[#6ab86a]" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-[#001e00]">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[#3a8a3a]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="rounded-2xl border border-[#a8d8a8] bg-white p-10 text-center text-[#6ab86a] shadow-card">
      {label}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#a8d8a8] bg-white p-12 text-center">
      <div className="text-lg font-semibold text-[#001e00]">{title}</div>
      <p className="mt-2 text-sm text-[#3a8a3a]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

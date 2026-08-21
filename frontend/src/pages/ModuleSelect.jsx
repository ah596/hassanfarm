import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const modules = [
  {
    title: 'Farm',
    description: 'Manage animals, feed, medicines, sales, expenses and profit.',
    action: 'Open Farm Dashboard',
    path: '/farm',
    icon: '🐄',
    color: 'from-[#001e00] to-[#0f3d0f]',
  },
  {
    title: 'Crops',
    description: 'Plan and manage your crop operations from sowing to harvest.',
    action: 'View Crops Module',
    path: '/crops',
    icon: '🌾',
    color: 'from-[#1a3a00] to-[#2d5a00]',
  },
  {
    title: 'Dairy',
    description: 'Manage milk suppliers, daily collection, rates and payments.',
    action: 'Open Dairy Collection',
    path: '/dairy',
    icon: '🥛',
    color: 'from-[#003a2a] to-[#005a40]',
  },
];

export default function ModuleSelect() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const name = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f4f0]">
      {/* Header */}
      <header className="bg-[#001e00] px-6 py-4 shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="logo" className="h-10 w-10 object-contain" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d2b45a]">Maweshi Farm</div>
              <div className="text-base font-bold text-white">Management System</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-xl bg-white/10 px-3 py-1.5 text-xs text-[#a8d8a8] sm:block">{user?.email}</span>
            <button onClick={logout} className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#001e00] px-6 pb-16 pt-12 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d2b45a]">Welcome back, {name}</p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">What would you like to manage?</h1>
        <p className="mt-3 text-sm text-[#a8d8a8]">Select a module to continue with your daily operations.</p>
      </section>

      {/* Cards */}
      <div className="mx-auto -mt-8 max-w-6xl flex-1 px-2 pb-16 sm:px-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-5 md:grid-cols-3">
          {modules.map(mod => (
            <button
              key={mod.title}
              type="button"
              onClick={() => navigate(mod.path)}
              className="group relative overflow-hidden rounded-2xl bg-white text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#001e00]"
            >
              <div className="flex flex-col items-center p-4 sm:items-start sm:p-6">
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${mod.color} text-2xl shadow`}>
                  {mod.icon}
                </div>
                <h3 className="mt-3 text-base font-bold text-[#001e00] sm:text-xl">{mod.title}</h3>
                <p className="mt-2 hidden text-sm leading-6 text-[#3a8a3a] sm:block">{mod.description}</p>
                <div className="mt-4 hidden items-center gap-2 text-sm font-semibold text-[#001e00] transition group-hover:gap-3 sm:flex">
                  {mod.action} <span>→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#001e00] px-6 py-5 text-center">
        <div className="text-xs text-[#a8d8a8]">Maweshi Farm Management · All data is securely stored</div>
      </footer>
    </div>
  );
}

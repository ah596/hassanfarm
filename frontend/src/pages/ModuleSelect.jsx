import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const modules = [
  {
    title: 'Farm',
    description: 'Manage animals, feed, medicines, sales, expenses and profit.',
    action: 'Open Farm Dashboard',
    path: '/farm',
    icon: '🐄',
    available: true
  },
  {
    title: 'Crops',
    description: 'Plan and manage your crop operations in one place.',
    action: 'View Crops Module',
    path: '/crops',
    icon: '🌾',
    available: true
  },
  {
    title: 'Dairy',
    description: 'Manage milk suppliers, daily milk collection, rates, and payments.',
    action: 'Open Dairy Collection',
    path: '/dairy',
    icon: '🥛',
    available: true
  }
];

export default function ModuleSelect() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f4f7f4] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4 border-b border-[#a8d8a8] pb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Maweshi Farm logo" className="h-12 w-12 object-contain" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d2b45a]">Maweshi Farm</div>
              <h1 className="text-xl font-bold text-[#001e00]">Choose a module</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#3a8a3a] sm:block">{user?.email}</span>
            <button onClick={logout} className="rounded-xl border border-[#a8d8a8] px-4 py-2 text-sm font-medium text-[#001e00] transition hover:bg-[#d6f0d6]">Logout</button>
          </div>
        </header>

        <section className="py-12 text-center sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d2b45a]">Welcome back{user?.displayName ? `, ${user.displayName}` : ''}</p>
          <h2 className="mt-3 text-3xl font-bold text-[#001e00] sm:text-4xl">What would you like to manage?</h2>
          <p className="mx-auto mt-3 max-w-xl text-[#3a8a3a]">Select an area to continue with your daily operations.</p>
        </section>

        <div className="grid gap-6 pb-10 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(module => (
            <button
              key={module.title}
              type="button"
              onClick={() => navigate(module.path)}
              className="group rounded-3xl border border-[#a8d8a8] bg-white p-7 text-left shadow-card transition hover:-translate-y-1 hover:border-[#3a8a3a] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#001e00]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d6f0d6] text-3xl">{module.icon}</span>
                {!module.available && <span className="rounded-full bg-[#fff6d8] px-3 py-1 text-xs font-semibold text-[#806300]">Coming soon</span>}
              </div>
              <h3 className="mt-6 text-2xl font-bold text-[#001e00]">{module.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[#3a8a3a]">{module.description}</p>
              <span className="mt-6 inline-flex font-semibold text-[#001e00] group-hover:text-[#3a8a3a]">{module.action} <span className="ml-2">→</span></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

const navIconPaths = {
  dashboard: <><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/></>,
  animals: <><path d="M5 10V8a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2"/><path d="M4 10h12v5H4zM6 15v2m8-2v2M7 5 5 3m8 2 2-2"/></>,
  add: <><circle cx="10" cy="10" r="7"/><path d="M10 6v8M6 10h8"/></>,
  pregnancy: <><path d="M10 17c-4-2.5-7-5.5-7-9a4 4 0 0 1 7-2.5A4 4 0 0 1 17 8c0 3.5-3 6.5-7 9Z"/><circle cx="10" cy="10" r="2"/></>,
  expenses: <><rect x="3" y="5" width="14" height="11" rx="2"/><path d="M3 8h14m-4 4h2"/></>,
  feed: <><path d="M4 16c6 0 10-4 10-10-6 0-10 4-10 10Z"/><path d="M5 15 14 6"/></>,
  medicine: <><rect x="6" y="2" width="8" height="16" rx="2"/><path d="M8 2v3h4V2m-4 9h4m-2-2v4"/></>,
  sales: <><path d="M3 15 7 11l3 2 7-8"/><path d="M13 5h4v4"/></>,
  calculator: <><rect x="4" y="2" width="12" height="16" rx="2"/><path d="M7 5h6v3H7zm0 6h1m3 0h1m-5 3h1m3 0h1"/></>,
  reports: <><path d="M4 17V9m4 8V5m4 12v-7m4 7V3"/></>,
  settings: <><circle cx="10" cy="10" r="3"/><path d="M10 2v2m0 12v2m8-8h-2M4 10H2m13.7-5.7-1.4 1.4M5.7 14.3l-1.4 1.4m11.4 0-1.4-1.4M5.7 5.7 4.3 4.3"/></>,
  profile: <><circle cx="10" cy="7" r="3"/><path d="M4 17c.7-3.3 2.7-5 6-5s5.3 1.7 6 5"/></>,
};

function NavIcon({ name, className = '' }) {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{navIconPaths[name] || navIconPaths.dashboard}</svg>;
}

const navGroups = [
  {
    label: 'Farm',
    prefix: '/farm',
    items: [
      { to: '/farm', label: 'Dashboard', icon: 'dashboard' },
      { to: '/farm/animals', label: 'Animals', icon: 'animals' },
      { to: '/farm/animals/new', label: 'Add Animal', icon: 'add' },
      { to: '/farm/pregnancy', label: 'Pregnancy', icon: 'pregnancy' },
      { to: '/farm/expenses', label: 'Expenses', icon: 'expenses' },
      { to: '/farm/feed', label: 'Feed', icon: 'feed' },
      { to: '/farm/medicine', label: 'Medicine', icon: 'medicine' },
      { to: '/farm/sales', label: 'Sales', icon: 'sales' },
      { to: '/farm/profit-calculator', label: 'Profit Calculator', icon: 'calculator' },
      { to: '/farm/reports', label: 'Reports', icon: 'reports' },
      { to: '/farm/settings', label: 'Settings', icon: 'settings' },
    ]
  },
  {
    label: 'Crops',
    prefix: '/crops',
    items: [
      { to: '/crops', label: 'Crop Management' },
      { to: '/crops/reports', label: 'Crop Reports' },
    ]
  },
  {
    label: 'Dairy',
    prefix: '/dairy',
    items: [
      { to: '/dairy', label: 'Milk Suppliers' }
    ]
  }
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const activeGroup = navGroups.find(g => location.pathname.startsWith(g.prefix)) || navGroups[0];
  const otherGroup = navGroups.find(g => g.label !== activeGroup.label);
  const isHome = location.pathname === activeGroup.items[0].to && !location.search;
  const isFarmSection = activeGroup.label === 'Farm';
  const isFarmDashboard = location.pathname === '/farm' && !location.search;
  const handleBack = () => location.search ? navigate(location.pathname, { replace: true }) : navigate(-1);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const closeOnOutsideClick = event => {
      if (!headerRef.current?.contains(event.target)) closeMobileMenu();
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') closeMobileMenu();
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('touchstart', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('touchstart', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileMenuOpen]);

  return (
    <div className={`min-h-screen bg-[#f4f7f4] text-[#001e00] ${isFarmSection ? 'farm-app-shell' : ''} ${isFarmDashboard ? 'farm-dashboard-shell' : ''}`}>
      <div className="mx-auto flex min-h-screen max-w-[1600px]">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col bg-[#001e00] lg:flex">
          <div className="sticky top-0 flex h-screen flex-col p-6">
            {/* Logo */}
            <Link to="/" className="mb-8 flex items-center gap-3">
              <img src="/logo.png" alt="Goat Farm logo" className="h-10 w-10 border-0 object-contain" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d2b45a]">Maweshi Farm</div>
                <div className="text-base font-bold text-white">Management</div>
              </div>
            </Link>

            {/* Nav */}
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Active group label */}
              <div className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d2b45a]/60">{activeGroup.label}</div>
              {activeGroup.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/farm' || item.to === '/crops' || item.to === '/dairy'}
                  className={({ isActive }) =>
                    `block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${isActive
                      ? 'bg-[#d2b45a] text-[#001e00]'
                      : 'text-[#a8d8a8] hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <span className="farm-nav-item"><NavIcon name={item.icon} />{item.label}</span>
                </NavLink>
              ))}
              {/* Switch to other module */}
              <div className="mt-4">
                <button
                  onClick={() => navigate(otherGroup.items[0].to)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-medium text-[#a8d8a8] transition hover:bg-white/10 hover:text-white"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d2b45a]/60">{otherGroup.label}</span>
                  <span className="text-xs">Switch →</span>
                </button>
                {activeGroup.label !== 'Dairy' ? (
                  <button
                    onClick={() => navigate('/dairy')}
                    className="mt-2 flex w-full items-center justify-between rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-medium text-[#a8d8a8] transition hover:bg-white/10 hover:text-white"
                  >
                    <span>Dairy</span><span className="text-xs">Switch</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/crops')}
                    className="mt-2 flex w-full items-center justify-between rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-medium text-[#a8d8a8] transition hover:bg-white/10 hover:text-white"
                  >
                    <span>Crops</span><span className="text-xs">Switch</span>
                  </button>
                )}
              </div>
            </nav>

            {/* User panel */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-[#d2b45a]">Signed in as</div>
              <div className="mt-1 truncate text-sm font-semibold text-white">{user?.displayName || user?.email || 'User'}</div>
              <button
                onClick={logout}
                className="mt-3 w-full rounded-xl border border-white/20 py-2 text-xs font-medium text-[#a8d8a8] transition hover:bg-white/10 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header ref={headerRef} className={`sticky top-0 z-20 border-b border-[#a8d8a8] bg-white px-3 py-3 sm:px-5 sm:py-4 ${isFarmDashboard ? 'farm-layout-header' : ''}`}>
            <div className="flex items-center justify-between gap-3">
              {/* Mobile logo */}
              <Link to="/" className="flex items-center gap-2.5 lg:hidden">
                <img src="/logo.png" alt="Goat Farm logo" className="h-9 w-9 border-0 object-contain" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d2b45a]">Maweshi Farm</div>
                  <div className="text-base font-bold text-[#001e00]">Management</div>
                </div>
              </Link>
              {/* Desktop title */}
              <Link to="/" className="hidden lg:block">
                <div className="text-lg font-bold text-[#001e00]">{isFarmDashboard ? 'Dashboard' : isFarmSection ? activeGroup.items.find(item => item.to === location.pathname)?.label || 'Farm Management' : `${activeGroup.label} Operations`}</div>
              </Link>

              <div className="flex items-center gap-3">
                {isFarmSection ? <div className="farm-desktop-actions"><button aria-label="Notifications"><NavIcon name="medicine" /></button><button aria-label="Settings"><NavIcon name="settings" /></button><Link to="/farm/animals/new"><NavIcon name="add" /> Add Animal</Link></div> : null}
                <div className={`hidden rounded-xl border border-[#a8d8a8] px-3 py-2 text-xs text-[#3a8a3a] md:block ${isFarmDashboard ? 'farm-hide-dashboard' : ''}`}>
                  {user?.email || 'No account'}
                </div>
                <Button variant="secondary" className={`hidden lg:inline-flex ${isFarmDashboard ? 'farm-hide-dashboard' : ''}`} onClick={logout}>Logout</Button>
                {!isHome ? <Button variant="secondary" onClick={handleBack}>← Back</Button> : null}
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#a8d8a8] text-lg text-[#001e00] transition hover:bg-[#d6f0d6] lg:hidden"
                  onClick={() => setMobileMenuOpen(o => !o)}
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? '×' : '☰'}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen ? (
              <div className="mt-3 rounded-2xl border border-[#a8d8a8] bg-white p-3 shadow-card lg:hidden">
                <nav className="grid gap-0.5">
                  <div className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d2b45a]">{activeGroup.label}</div>
                  {activeGroup.items.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/farm' || item.to === '/crops' || item.to === '/dairy'}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${isActive
                          ? 'bg-[#001e00] text-white'
                          : 'text-[#3a8a3a] hover:bg-[#d6f0d6] hover:text-[#001e00]'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <button
                    onClick={() => { navigate(otherGroup.items[0].to); closeMobileMenu(); }}
                    className="mt-2 flex w-full items-center justify-between rounded-xl border border-[#a8d8a8] px-3.5 py-2.5 text-sm font-medium text-[#3a8a3a] hover:bg-[#d6f0d6]"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{otherGroup.label}</span>
                    <span className="text-xs">Switch →</span>
                  </button>
                  {activeGroup.label !== 'Dairy' ? (
                    <button onClick={() => { navigate('/dairy'); closeMobileMenu(); }} className="flex w-full items-center justify-between rounded-xl border border-[#a8d8a8] px-3.5 py-2.5 text-sm font-medium text-[#3a8a3a] hover:bg-[#d6f0d6]">
                      <span>Dairy</span><span className="text-xs">Switch</span>
                    </button>
                  ) : (
                    <button onClick={() => { navigate('/crops'); closeMobileMenu(); }} className="flex w-full items-center justify-between rounded-xl border border-[#a8d8a8] px-3.5 py-2.5 text-sm font-medium text-[#3a8a3a] hover:bg-[#d6f0d6]">
                      <span>Crops</span><span className="text-xs">Switch</span>
                    </button>
                  )}
                </nav>
                <button
                  onClick={logout}
                  className="mt-3 w-full rounded-xl bg-[#001e00] py-2.5 text-sm font-medium text-white transition hover:bg-[#0f3d0f]"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </header>

          <div className={`flex-1 p-3 sm:p-5 md:p-7 ${isFarmDashboard ? 'farm-layout-content' : ''}`}>
            <Outlet />
          </div>

          {/* Footer */}
          <footer className={`bg-[#001e00] px-6 py-5 ${isFarmSection ? 'farm-layout-footer' : ''}`}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold text-white">© 2024 Maweshi Farm Management. Track animals, expenses &amp; profit in one place.</div>
              <div className="farm-footer-links"><span>Support</span><span>Privacy Policy</span><span>Terms</span></div>
            </div>
          </footer>
          {isFarmSection ? <nav className="farm-mobile-tabs" aria-label="Farm navigation">
            <NavLink to="/farm" end><NavIcon name="dashboard"/><span>Home</span></NavLink>
            <NavLink to="/farm/animals"><NavIcon name="animals"/><span>Animals</span></NavLink>
            <NavLink to="/farm/animals/new"><NavIcon name="add"/><span>Add</span></NavLink>
            <NavLink to="/farm/medicine"><NavIcon name="medicine"/><span>Health</span></NavLink>
            <NavLink to="/farm/expenses"><NavIcon name="expenses"/><span>Finances</span></NavLink>
          </nav> : null}
        </main>
      </div>
    </div>
  );
}

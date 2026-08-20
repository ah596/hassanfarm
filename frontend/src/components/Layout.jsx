import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

const navGroups = [
  {
    label: 'Farm',
    prefix: '/farm',
    items: [
      { to: '/farm', label: 'Dashboard' },
      { to: '/farm/animals', label: 'Animals' },
      { to: '/farm/animals/new', label: 'Add Animal' },
      { to: '/farm/pregnancy', label: 'Pregnancy' },
      { to: '/farm/expenses', label: 'Expenses' },
      { to: '/farm/feed', label: 'Feed' },
      { to: '/farm/medicine', label: 'Medicine' },
      { to: '/farm/sales', label: 'Sales' },
      { to: '/farm/profit-calculator', label: 'Profit Calculator' },
      { to: '/farm/reports', label: 'Reports' },
      { to: '/farm/settings', label: 'Settings' },
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
    <div className="min-h-screen bg-[#f4f7f4] text-[#001e00]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col bg-[#001e00] lg:flex">
          <div className="sticky top-0 flex h-screen flex-col p-6">
            {/* Logo */}
            <Link to="/farm" className="mb-8 flex items-center gap-3">
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
                  {item.label}
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
          <header ref={headerRef} className="sticky top-0 z-20 border-b border-[#a8d8a8] bg-white px-3 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              {/* Mobile logo */}
              <Link to="/farm" className="flex items-center gap-2.5 lg:hidden">
                <img src="/logo.png" alt="Goat Farm logo" className="h-9 w-9 border-0 object-contain" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d2b45a]">Maweshi Farm</div>
                  <div className="text-base font-bold text-[#001e00]">Management</div>
                </div>
              </Link>
              {/* Desktop title */}
              <Link to="/farm" className="hidden lg:block">
                <div className="text-lg font-bold text-[#001e00]">{activeGroup.label} Operations</div>
              </Link>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-xl border border-[#a8d8a8] px-3 py-2 text-xs text-[#3a8a3a] md:block">
                  {user?.email || 'No account'}
                </div>
                <Button variant="secondary" className="hidden lg:inline-flex" onClick={logout}>Logout</Button>
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

          <div className="flex-1 p-3 sm:p-5 md:p-7">
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="bg-[#001e00] px-6 py-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold text-white">Goat Farm Management</div>
              <div className="text-xs text-[#d2b45a]">Track animals, expenses &amp; profit in one place.</div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

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
      { to: '/crops', label: 'Crop Management', icon: 'feed' },
      { to: '/crops/reports', label: 'Crop Reports', icon: 'reports' },
    ]
  },
  {
    label: 'Dairy',
    prefix: '/dairy',
    items: [
      { to: '/dairy', label: 'Milk Suppliers', icon: 'animals' }
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
  const isHome = location.pathname === activeGroup.items[0].to && !location.search;
  const isFarmSection = activeGroup.label === 'Farm';
  const isCropOperations = /^\/crops\/[^/]+$/.test(location.pathname) && location.pathname !== '/crops/reports';
  const isFarmDashboard = location.pathname === '/farm' && !location.search;
  const handleBack = () => location.search ? navigate(location.pathname, { replace: true }) : navigate(-1);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const closeOnOutsideClick = event => {
      // The fixed bottom navigation is outside the header in the DOM.  Do not
      // close first when its Menu button is trying to toggle this drawer.
      if (!headerRef.current?.contains(event.target) && !event.target.closest?.('.farm-mobile-tabs')) closeMobileMenu();
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
    <div className={`min-h-screen bg-[#f4f7f4] text-[#001e00] app-navigation-shell ${isFarmSection ? 'farm-app-shell' : ''} ${isFarmDashboard ? 'farm-dashboard-shell' : ''}`}>
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
            <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            </nav>

            {/* User panel */}
            <div className="mt-4 shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-[#d2b45a]">Signed in as</div>
              <div className="mt-1 truncate text-sm font-semibold text-white">{user?.displayName || user?.email || 'User'}</div>
              <div className="module-switch-links mt-3 grid gap-2" aria-label="Modules">
                {navGroups.map(group => (
                  <NavLink key={group.prefix} to={group.prefix}
                    className={() => `flex items-center justify-between rounded-xl border border-white/20 px-3 py-2 text-xs font-medium transition hover:bg-white/10 ${activeGroup.label === group.label ? 'bg-[#d2b45a] text-[#001e00]' : 'text-[#a8d8a8]'}`}>
                    <span>{group.label}</span><span>{activeGroup.label === group.label ? 'Active' : 'Switch'}</span>
                  </NavLink>
                ))}
              </div>
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
          <header ref={headerRef} className={`sticky top-0 z-20 border-b border-[#a8d8a8] bg-white px-3 py-3 sm:px-5 sm:py-4 farm-layout-header`}>
            <div className="flex items-center justify-between gap-3">

              {/* Left: back arrow + breadcrumb + page title */}
              {isFarmDashboard ? <Link to="/" className="farm-dashboard-mobile-brand lg:hidden">
                <img src="/logo.png" alt="Maweshi Farm" />
                <span><small>Maweshi Farm</small><b>Management</b></span>
              </Link> : null}
              <div className={`flex min-w-0 items-center gap-2 ${isFarmDashboard ? 'hidden lg:flex' : ''}`}>
                {!isHome && (
                  <button
                    onClick={handleBack}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#a8d8a8] text-[#001e00] transition hover:bg-[#d6f0d6]"
                    aria-label="Go back"
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M12 4 6 10l6 6"/>
                    </svg>
                  </button>
                )}
                <div className="min-w-0">
                  {/* breadcrumb — desktop */}
                  <div className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6ab86a] lg:block">
                    {activeGroup.label} {location.pathname !== activeGroup.items[0]?.to ? `/ ${activeGroup.items.find(i => location.pathname.startsWith(i.to) && i.to !== activeGroup.items[0].to)?.label || ''}` : ''}
                  </div>
                  {/* page title */}
                  <div className="truncate text-sm font-bold text-[#001e00] sm:text-base lg:text-lg">
                    {isCropOperations ? 'Crops Operations' : isFarmDashboard
                      ? 'Dashboard'
                      : activeGroup.items.find(i => i.to !== activeGroup.items[0].to && location.pathname.startsWith(i.to))?.label
                        || activeGroup.items.find(i => i.to === location.pathname)?.label
                        || (isFarmSection ? 'Farm Management' : `${activeGroup.label} Operations`)}
                  </div>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex shrink-0 items-center gap-2">
                {/* notification bell */}
                <button
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border border-[#a8d8a8] text-[#3a8a3a] transition hover:bg-[#d6f0d6] ${isFarmDashboard ? 'hidden lg:flex' : ''}`}
                  aria-label="Notifications"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M10 2a6 6 0 0 1 6 6v3l1.5 2.5H2.5L4 11V8a6 6 0 0 1 6-6Z"/><path d="M8 16a2 2 0 0 0 4 0"/>
                  </svg>
                </button>
                {/* user avatar */}
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#001e00] text-[10px] font-bold text-white ${isFarmDashboard ? 'hidden lg:flex' : ''}`}>
                  {(user?.displayName || user?.email || 'U').slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen ? (
              <div className="farm-mobile-sidebar lg:hidden">
                <nav className="grid min-h-0 flex-1 content-start gap-0.5 overflow-y-auto">
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
                </nav>
                <div className="shrink-0 pt-3">
                  <div className="grid gap-2" aria-label="Modules">
                    {navGroups.map(group => (
                      <NavLink key={group.prefix} to={group.prefix} onClick={closeMobileMenu}
                        className={() => `flex items-center justify-between rounded-xl border border-white/20 px-3.5 py-2 text-sm font-medium ${activeGroup.label === group.label ? 'bg-[#d2b45a] text-[#001e00]' : 'text-[#c8ddcf] hover:bg-white/10'}`}>
                        <span>{group.label}</span><span className="text-xs">{activeGroup.label === group.label ? 'Active' : 'Switch'}</span>
                      </NavLink>
                    ))}
                  </div>
                <button
                  onClick={logout}
                  className="mt-3 w-full rounded-xl bg-[#001e00] py-2.5 text-sm font-medium text-white transition hover:bg-[#0f3d0f]"
                >
                  Logout
                </button>
                </div>
              </div>
            ) : null}
          </header>

          <div className={`flex-1 p-3 sm:p-5 md:p-7 ${isFarmDashboard ? 'farm-layout-content' : ''}`}>
            <Outlet />
          </div>

          {/* Footer */}
          <footer className={`bg-[#001e00] px-6 py-5 farm-layout-footer`}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold text-white">© 2024 Maweshi Farm Management. Track animals, expenses &amp; profit in one place.</div>
              <div className="farm-footer-links"><span>Support</span><span>Privacy Policy</span><span>Terms</span></div>
            </div>
          </footer>
          <nav className="farm-mobile-tabs" aria-label={`${activeGroup.label} navigation`} style={isFarmSection ? undefined : { gridTemplateColumns: `repeat(${activeGroup.items.length + 1}, 1fr)` }}>
            {isFarmSection ? <>
            <NavLink to="/farm" end onClick={closeMobileMenu}><NavIcon name="dashboard"/><span>Home</span></NavLink>
            <NavLink to="/farm/animals" onClick={closeMobileMenu}><NavIcon name="animals"/><span>Animals</span></NavLink>
            <NavLink to="/farm/animals/new" onClick={closeMobileMenu}><NavIcon name="add"/><span>Add</span></NavLink>
            <NavLink to="/farm/expenses" onClick={closeMobileMenu}><NavIcon name="expenses"/><span>Finance</span></NavLink>
            </> : activeGroup.items.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === activeGroup.prefix} onClick={closeMobileMenu}>
                <NavIcon name={item.icon}/><span>{item.label}</span>
              </NavLink>
            ))}
            <button type="button" onClick={() => setMobileMenuOpen(open => !open)} aria-label="Toggle navigation menu" aria-expanded={mobileMenuOpen}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d={mobileMenuOpen ? "M4 4l12 12M16 4 4 16" : "M3 6h14M3 10h14M3 14h14"}/></svg><span>Menu</span></button>
          </nav>
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/animals', label: 'Animals' },
  { to: '/animals/new', label: 'Add Animal' },
  { to: '/pregnancy', label: 'Pregnancy' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/feed', label: 'Feed' },
  { to: '/medicine', label: 'Medicine' },
  { to: '/sales', label: 'Sales' },
  { to: '/profit-calculator', label: 'Profit Calculator' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' }
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#f4f7f4] text-[#001e00]">
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
            <nav className="flex flex-1 flex-col gap-0.5">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${isActive || location.pathname === item.to
                      ? 'bg-[#d2b45a] text-[#001e00]'
                      : 'text-[#a8d8a8] hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
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
          <header className="sticky top-0 z-20 border-b border-[#a8d8a8] bg-white px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              {/* Mobile logo */}
              <Link to="/" className="flex items-center gap-2.5 lg:hidden">
                <img src="/logo.png" alt="Goat Farm logo" className="h-9 w-9 border-0 object-contain" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d2b45a]">Goat Farm</div>
                  <div className="text-base font-bold text-[#001e00]">Management</div>
                </div>
              </Link>
              {/* Desktop title */}
              <Link to="/" className="hidden lg:block">
                <div className="text-lg font-bold text-[#001e00]">Farm Operations</div>
              </Link>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-xl border border-[#a8d8a8] px-3 py-2 text-xs text-[#3a8a3a] md:block">
                  {user?.email || 'No account'}
                </div>
                <Button variant="secondary" className="hidden lg:inline-flex" onClick={logout}>Logout</Button>
                {location.pathname !== '/' ? <Button variant="secondary" className="lg:hidden" onClick={() => navigate(-1)}>← Back</Button> : null}
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
                  {navItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${isActive || location.pathname === item.to
                          ? 'bg-[#001e00] text-white'
                          : 'text-[#3a8a3a] hover:bg-[#d6f0d6] hover:text-[#001e00]'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
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

          <div className="flex-1 p-5 md:p-7">
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

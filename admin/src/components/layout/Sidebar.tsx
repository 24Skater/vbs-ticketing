import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  CreditCard,
  Users,
  Settings,
  Palette,
  LogOut,
} from 'lucide-react';
import { useAuthStore, hasRole } from '../../stores/auth';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['CHECKER'] },
  { name: 'Events', href: '/events', icon: Calendar, roles: ['STAFF'] },
  { name: 'Tickets', href: '/tickets', icon: Ticket, roles: ['CHECKER'] },
  { name: 'Payments', href: '/payments', icon: CreditCard, roles: ['STAFF'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN'] },
  { name: 'Branding', href: '/branding', icon: Palette, roles: ['ADMIN'] },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-4">
        <h1 className="text-xl font-bold text-primary">VBS Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          // Check if user has access
          if (!hasRole(user, ...(item.roles as any[]))) {
            return null;
          }

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t p-4">
        <div className="mb-2 px-3">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}


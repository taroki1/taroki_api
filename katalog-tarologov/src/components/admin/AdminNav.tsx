'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: '📊' },
  { href: '/admin/tarologi', label: 'Тарологи', icon: '🔮' },
  { href: '/admin/otzyvy', label: 'Отзывы', icon: '💬' },
  { href: '/admin/kody', label: 'Коды', icon: '🔑' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <Link
              href="/admin"
              className="text-primary font-semibold font-[family-name:var(--font-heading)] mr-4"
            >
              Админ-панель
            </Link>
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-text-light hover:bg-bg hover:text-text'
                    )}
                  >
                    <span className="hidden sm:inline">{item.icon} </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-text-muted hover:text-text transition-colors">
              На сайт
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm text-danger hover:underline cursor-pointer"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}

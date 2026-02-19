'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-lg font-[family-name:var(--font-heading)]">
            А
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-semibold font-[family-name:var(--font-heading)]">
              Академия Анастасии Лыковой
            </div>
            <div className="text-xs text-white/70">Каталог тарологов</div>
          </div>
          <div className="sm:hidden text-sm font-semibold font-[family-name:var(--font-heading)]">
            Каталог тарологов
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-accent transition-colors">
            Каталог
          </Link>
          <Link href="/otzyv" className="hover:text-accent transition-colors">
            Оставить отзыв
          </Link>
        </nav>

        {/* Mobile burger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Меню"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-3 text-sm animate-fade-in">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="py-2 hover:text-accent transition-colors"
          >
            Каталог
          </Link>
          <Link
            href="/otzyv"
            onClick={() => setMenuOpen(false)}
            className="py-2 hover:text-accent transition-colors"
          >
            Оставить отзыв
          </Link>
        </nav>
      )}
    </header>
  );
}

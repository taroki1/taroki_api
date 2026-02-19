import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary text-white/70 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="text-white font-semibold font-[family-name:var(--font-heading)]">
              Академия Анастасии Лыковой
            </div>
            <div className="text-sm mt-1">
              Каталог сертифицированных тарологов
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Каталог
            </Link>
            <Link
              href="/otzyv"
              className="hover:text-white transition-colors"
            >
              Оставить отзыв
            </Link>
          </nav>
        </div>
        <div className="border-t border-white/10 mt-6 pt-6 text-center text-xs">
          © {new Date().getFullYear()} Академия Анастасии Лыковой. Все права
          защищены.
        </div>
      </div>
    </footer>
  );
}

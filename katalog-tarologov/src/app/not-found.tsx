import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔮</div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-3">
            Страница не найдена
          </h1>
          <p className="text-text-muted mb-6">
            Карты говорят, что эта страница не существует
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-light transition-colors"
          >
            Вернуться в каталог
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

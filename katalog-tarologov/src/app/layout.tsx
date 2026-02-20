import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Каталог тарологов Академии Анастасии Лыковой',
  description:
    'Сертифицированные тарологи Академии Анастасии Лыковой. Все тарологи — выпускники курса Эксперт Таро VIP. Выберите специалиста и запишитесь на расклад.',
  openGraph: {
    title: 'Каталог тарологов Академии Анастасии Лыковой',
    description:
      'Найдите своего таролога среди сертифицированных выпускников Академии Анастасии Лыковой',
    type: 'website',
    locale: 'ru_RU',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}

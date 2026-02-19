'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Неверный email или пароль');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 font-[family-name:var(--font-heading)]">
            А
          </div>
          <h1 className="text-xl font-bold font-[family-name:var(--font-heading)]">
            Админ-панель
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Академия Анастасии Лыковой
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@academy-lykova.ru"
            required
          />
          <Input
            id="password"
            type="password"
            label="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            required
          />

          {error && <p className="text-danger text-sm">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

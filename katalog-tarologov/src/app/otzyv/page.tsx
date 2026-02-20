'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StarRating from '@/components/ui/StarRating';

type Step = 'code' | 'review' | 'success';

export default function ReviewPage() {
  const [step, setStep] = useState<Step>('code');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [tarologistName, setTarologistName] = useState('');
  const [tarologistId, setTarologistId] = useState('');
  const [codeId, setCodeId] = useState('');

  const [rating, setRating] = useState(0);
  const [clientName, setClientName] = useState('');
  const [text, setText] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleValidateCode = async () => {
    setCodeError('');
    if (code.length !== 6) {
      setCodeError('Код должен содержать 6 символов');
      return;
    }

    setCodeLoading(true);
    try {
      const res = await fetch('/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCodeError(data.error || 'Неверный код');
        return;
      }

      setTarologistName(data.tarologist_name);
      setTarologistId(data.tarologist_id);
      setCodeId(data.code_id);
      setStep('review');
    } catch {
      setCodeError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    setSubmitError('');

    if (rating === 0) {
      setSubmitError('Пожалуйста, поставьте оценку');
      return;
    }
    if (!clientName.trim()) {
      setSubmitError('Пожалуйста, укажите ваше имя');
      return;
    }
    if (text.trim().length < 50) {
      setSubmitError('Отзыв должен содержать минимум 50 символов');
      return;
    }
    if (text.trim().length > 1000) {
      setSubmitError('Отзыв не должен превышать 1000 символов');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tarologist_id: tarologistId,
          code_id: codeId,
          client_name: clientName.trim(),
          rating,
          text: text.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Произошла ошибка');
        return;
      }

      setStep('success');
    } catch {
      setSubmitError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {step === 'code' && (
            <Card className="p-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🔮</div>
                <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                  Оставить отзыв
                </h1>
                <p className="text-text-muted mt-2 text-sm">
                  Введите 6-значный код, который вы получили от таролога после расклада
                </p>
              </div>

              <div className="mb-4">
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="Введите код"
                  error={codeError}
                  className="text-center text-2xl tracking-[0.3em] font-mono"
                  maxLength={6}
                />
              </div>

              <Button
                onClick={handleValidateCode}
                disabled={code.length !== 6 || codeLoading}
                className="w-full"
              >
                {codeLoading ? 'Проверка...' : 'Продолжить'}
              </Button>
            </Card>
          )}

          {step === 'review' && (
            <Card className="p-6 animate-fade-in">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                  Отзыв о тарологе
                </h1>
                <p className="text-primary font-medium mt-1">{tarologistName}</p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-text mb-2">
                  Ваша оценка
                </label>
                <div className="flex justify-center">
                  <StarRating
                    rating={rating}
                    size="lg"
                    interactive
                    onChange={setRating}
                  />
                </div>
              </div>

              <div className="mb-5">
                <Input
                  id="name"
                  label="Ваше имя"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ваше имя или «Аноним»"
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="review-text"
                  className="block text-sm font-medium text-text mb-1.5"
                >
                  Текст отзыва
                </label>
                <textarea
                  id="review-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Расскажите о вашем опыте (от 50 до 1000 символов)"
                  rows={5}
                  maxLength={1000}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-white text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
                <div className="text-xs text-text-muted mt-1 text-right">
                  {text.length} / 1000
                </div>
              </div>

              {submitError && (
                <p className="text-danger text-sm mb-4">{submitError}</p>
              )}

              <Button
                onClick={handleSubmitReview}
                disabled={submitLoading}
                className="w-full"
              >
                {submitLoading ? 'Отправка...' : 'Отправить отзыв'}
              </Button>
            </Card>
          )}

          {step === 'success' && (
            <Card className="p-6 text-center animate-fade-in">
              <div className="text-5xl mb-4">✨</div>
              <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-3">
                Спасибо за отзыв!
              </h1>
              <p className="text-text-muted mb-6">
                Ваш отзыв будет опубликован после проверки модератором
              </p>
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-light transition-colors"
              >
                Вернуться в каталог
              </a>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

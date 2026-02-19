'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ReviewCode, Tarologist } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function AdminCodesPage() {
  const [tarologists, setTarologists] = useState<Tarologist[]>([]);
  const [selectedTarologist, setSelectedTarologist] = useState('');
  const [codeCount, setCodeCount] = useState(10);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const [codes, setCodes] = useState<(ReviewCode & { tarologist_name?: string })[]>([]);
  const [codesLoading, setCodesLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [tarologistsRes, codesRes] = await Promise.all([
        supabase
          .from('tarologists')
          .select('*')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('review_codes')
          .select('*, tarologist:tarologists(name)')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      setTarologists(tarologistsRes.data || []);
      setCodes(
        (codesRes.data || []).map((c: Record<string, unknown>) => ({
          ...c,
          tarologist_name: (c.tarologist as { name: string } | null)?.name || 'Неизвестен',
        })) as (ReviewCode & { tarologist_name?: string })[]
      );
      setCodesLoading(false);
    }

    fetchData();
  }, []);

  const handleGenerate = async () => {
    setGenerateError('');
    setGeneratedCodes([]);

    if (!selectedTarologist) {
      setGenerateError('Выберите таролога');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tarologist_id: selectedTarologist,
          count: codeCount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.error || 'Ошибка генерации кодов');
        return;
      }

      setGeneratedCodes(data.codes);

      // Refresh codes list
      const supabase = createClient();
      const { data: updatedCodes } = await supabase
        .from('review_codes')
        .select('*, tarologist:tarologists(name)')
        .order('created_at', { ascending: false })
        .limit(100);

      setCodes(
        (updatedCodes || []).map((c: Record<string, unknown>) => ({
          ...c,
          tarologist_name: (c.tarologist as { name: string } | null)?.name || 'Неизвестен',
        })) as (ReviewCode & { tarologist_name?: string })[]
      );
    } catch {
      setGenerateError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setGenerating(false);
    }
  };

  const copyCodes = () => {
    navigator.clipboard.writeText(generatedCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-6">
        Управление кодами подтверждения
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator */}
        <div className="lg:col-span-1">
          <Card className="p-5">
            <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
              Генерация кодов
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Таролог
                </label>
                <select
                  value={selectedTarologist}
                  onChange={(e) => setSelectedTarologist(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-white text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="">Выберите таролога</option>
                  {tarologists.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Количество кодов
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={codeCount}
                  onChange={(e) =>
                    setCodeCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {generateError && (
                <p className="text-danger text-sm">{generateError}</p>
              )}

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full"
              >
                {generating ? 'Генерация...' : 'Сгенерировать'}
              </Button>
            </div>

            {/* Generated codes */}
            {generatedCodes.length > 0 && (
              <div className="mt-5 pt-5 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-text">
                    Сгенерированные коды ({generatedCodes.length})
                  </h3>
                  <button
                    onClick={copyCodes}
                    className="text-sm text-primary hover:underline cursor-pointer"
                  >
                    {copied ? 'Скопировано!' : 'Копировать все'}
                  </button>
                </div>
                <div className="bg-bg rounded-lg p-3 font-mono text-sm space-y-1 max-h-60 overflow-y-auto">
                  {generatedCodes.map((code) => (
                    <div key={code} className="text-text">{code}</div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Codes table */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)]">
                Выданные коды
              </h2>
            </div>

            {codesLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-10 rounded" />
                ))}
              </div>
            ) : codes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg text-sm text-text-light border-b border-border">
                      <th className="text-left px-4 py-3 font-medium">Код</th>
                      <th className="text-left px-4 py-3 font-medium">Таролог</th>
                      <th className="text-left px-4 py-3 font-medium">Статус</th>
                      <th className="text-left px-4 py-3 font-medium">Создан</th>
                      <th className="text-left px-4 py-3 font-medium">Использован</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code) => (
                      <tr
                        key={code.id}
                        className="border-b border-border hover:bg-bg/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-sm font-medium">
                          {code.code}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {code.tarologist_name}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              code.status === 'issued'
                                ? 'accent'
                                : code.status === 'used'
                                ? 'success'
                                : 'danger'
                            }
                          >
                            {code.status === 'issued'
                              ? 'Выдан'
                              : code.status === 'used'
                              ? 'Использован'
                              : 'Истёк'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-muted">
                          {formatDate(code.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-muted">
                          {code.used_at ? formatDate(code.used_at) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="text-5xl mb-4">🔑</div>
                <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-2">
                  Кодов пока нет
                </h3>
                <p className="text-text-muted text-sm">
                  Сгенерируйте коды для тарологов
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

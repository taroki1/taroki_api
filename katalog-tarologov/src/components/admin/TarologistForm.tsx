'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { TarologistWithServices, SPECIALIZATIONS, WORK_FORMATS, Service } from '@/lib/types';
import { generateSlug } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface TarologistFormProps {
  tarologist?: TarologistWithServices;
}

interface ServiceRow {
  id?: string;
  name: string;
  format: string;
  duration_minutes: string;
  price: string;
}

export default function TarologistForm({ tarologist }: TarologistFormProps) {
  const router = useRouter();
  const isEdit = !!tarologist;

  const [name, setName] = useState(tarologist?.name || '');
  const [slug, setSlug] = useState(tarologist?.slug || '');
  const [about, setAbout] = useState(tarologist?.about || '');
  const [specializations, setSpecializations] = useState<string[]>(
    tarologist?.specializations || []
  );
  const [workFormats, setWorkFormats] = useState<string[]>(
    tarologist?.work_formats || []
  );
  const [city, setCity] = useState(tarologist?.city || '');
  const [contactTelegram, setContactTelegram] = useState(tarologist?.contact_telegram || '');
  const [contactWhatsapp, setContactWhatsapp] = useState(tarologist?.contact_whatsapp || '');
  const [contactInstagram, setContactInstagram] = useState(tarologist?.contact_instagram || '');
  const [contactEmail, setContactEmail] = useState(tarologist?.contact_email || '');
  const [contactOther, setContactOther] = useState(tarologist?.contact_other || '');
  const [isActive, setIsActive] = useState(tarologist?.is_active ?? true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(tarologist?.photo_url || null);

  const [serviceRows, setServiceRows] = useState<ServiceRow[]>(
    tarologist?.services?.map((s: Service) => ({
      id: s.id,
      name: s.name,
      format: s.format || '',
      duration_minutes: s.duration_minutes?.toString() || '',
      price: s.price.toString(),
    })) || [{ name: '', format: '', duration_minutes: '', price: '' }]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit || !tarologist?.slug) {
      setSlug(generateSlug(value));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Размер фото не должен превышать 2 МБ');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Допустимые форматы: JPEG, PNG, WebP');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const toggleSpec = (spec: string) => {
    setSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const toggleFormat = (format: string) => {
    setWorkFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const updateServiceRow = (index: number, field: keyof ServiceRow, value: string) => {
    setServiceRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addServiceRow = () => {
    setServiceRows((prev) => [
      ...prev,
      { name: '', format: '', duration_minutes: '', price: '' },
    ]);
  };

  const removeServiceRow = (index: number) => {
    setServiceRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Укажите имя таролога');
      return;
    }
    if (!slug.trim()) {
      setError('Укажите slug');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      let photoUrl = tarologist?.photo_url || null;

      // Upload photo
      if (photoFile) {
        const ext = photoFile.name.split('.').pop();
        const fileName = `${slug}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('tarologist-photos')
          .upload(fileName, photoFile, { upsert: true });

        if (uploadError) {
          setError('Ошибка загрузки фото: ' + uploadError.message);
          setLoading(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('tarologist-photos')
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }

      const tarologistData = {
        name: name.trim(),
        slug: slug.trim(),
        photo_url: photoUrl,
        about: about.trim() || null,
        specializations,
        work_formats: workFormats,
        city: city.trim() || null,
        contact_telegram: contactTelegram.trim() || null,
        contact_whatsapp: contactWhatsapp.trim() || null,
        contact_instagram: contactInstagram.trim() || null,
        contact_email: contactEmail.trim() || null,
        contact_other: contactOther.trim() || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      let tarologistId = tarologist?.id;

      if (isEdit && tarologistId) {
        const { error: updateError } = await supabase
          .from('tarologists')
          .update(tarologistData)
          .eq('id', tarologistId);

        if (updateError) {
          setError('Ошибка обновления: ' + updateError.message);
          setLoading(false);
          return;
        }

        // Delete old services
        await supabase.from('services').delete().eq('tarologist_id', tarologistId);
      } else {
        const { data: newTarologist, error: insertError } = await supabase
          .from('tarologists')
          .insert(tarologistData)
          .select('id')
          .single();

        if (insertError || !newTarologist) {
          setError('Ошибка создания: ' + (insertError?.message || 'Неизвестная ошибка'));
          setLoading(false);
          return;
        }

        tarologistId = newTarologist.id;
      }

      // Insert services
      const validServices = serviceRows.filter(
        (s) => s.name.trim() && s.price.trim()
      );

      if (validServices.length > 0) {
        const { error: servicesError } = await supabase.from('services').insert(
          validServices.map((s, i) => ({
            tarologist_id: tarologistId,
            name: s.name.trim(),
            format: s.format || null,
            duration_minutes: s.duration_minutes ? parseInt(s.duration_minutes) : null,
            price: parseInt(s.price),
            sort_order: i,
          }))
        );

        if (servicesError) {
          setError('Ошибка сохранения услуг: ' + servicesError.message);
          setLoading(false);
          return;
        }
      }

      router.push('/admin/tarologi');
      router.refresh();
    } catch {
      setError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
              Основная информация
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="name"
                  label="Имя *"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Имя таролога"
                  required
                />
                <Input
                  id="slug"
                  label="Slug (URL)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="imya-tarologa"
                />
              </div>

              <div>
                <label htmlFor="about" className="block text-sm font-medium text-text mb-1.5">
                  О себе (до 2000 символов)
                </label>
                <textarea
                  id="about"
                  value={about}
                  onChange={(e) => setAbout(e.target.value.slice(0, 2000))}
                  placeholder="Расскажите о тарологе..."
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-white text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
                <div className="text-xs text-text-muted mt-1 text-right">
                  {about.length} / 2000
                </div>
              </div>

              <Input
                id="city"
                label="Город"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Город (для очных консультаций)"
              />
            </div>
          </Card>

          {/* Specializations */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
              Специализации
            </h2>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpec(spec)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all cursor-pointer ${
                    specializations.includes(spec)
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-text-light hover:border-primary'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </Card>

          {/* Work formats */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
              Форматы работы
            </h2>
            <div className="flex flex-wrap gap-2">
              {WORK_FORMATS.map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => toggleFormat(format)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all cursor-pointer ${
                    workFormats.includes(format)
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-text-light hover:border-primary'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </Card>

          {/* Services */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
              Услуги и цены
            </h2>
            <div className="space-y-3">
              {serviceRows.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-end"
                >
                  <Input
                    id={`service-name-${i}`}
                    placeholder="Название услуги"
                    value={row.name}
                    onChange={(e) => updateServiceRow(i, 'name', e.target.value)}
                  />
                  <select
                    value={row.format}
                    onChange={(e) => updateServiceRow(i, 'format', e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-border bg-bg-white text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    <option value="">Формат</option>
                    {WORK_FORMATS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <Input
                    id={`service-duration-${i}`}
                    placeholder="Мин."
                    type="number"
                    value={row.duration_minutes}
                    onChange={(e) => updateServiceRow(i, 'duration_minutes', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    id={`service-price-${i}`}
                    placeholder="Цена ₽"
                    type="number"
                    value={row.price}
                    onChange={(e) => updateServiceRow(i, 'price', e.target.value)}
                    className="w-28"
                  />
                  <button
                    type="button"
                    onClick={() => removeServiceRow(i)}
                    className="p-2.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addServiceRow}>
                + Добавить услугу
              </Button>
            </div>
          </Card>

          {/* Contacts */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
              Контакты
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="telegram"
                label="Telegram"
                value={contactTelegram}
                onChange={(e) => setContactTelegram(e.target.value)}
                placeholder="@username или ссылка"
              />
              <Input
                id="whatsapp"
                label="WhatsApp"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                placeholder="+7..."
              />
              <Input
                id="instagram"
                label="Instagram"
                value={contactInstagram}
                onChange={(e) => setContactInstagram(e.target.value)}
                placeholder="@username или ссылка"
              />
              <Input
                id="email"
                label="Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="other" className="block text-sm font-medium text-text mb-1.5">
                Другое
              </label>
              <textarea
                id="other"
                value={contactOther}
                onChange={(e) => setContactOther(e.target.value)}
                placeholder="Дополнительные контакты..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-white text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
              Фото
            </h2>
            <div className="flex flex-col items-center gap-3">
              {photoPreview ? (
                <div className="w-32 h-32 rounded-full overflow-hidden bg-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-bg flex items-center justify-center text-text-muted text-sm">
                  Нет фото
                </div>
              )}
              <label className="cursor-pointer">
                <span className="text-sm text-primary hover:underline">
                  {photoPreview ? 'Изменить фото' : 'Загрузить фото'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-text-muted text-center">
                JPEG, PNG или WebP. Макс. 2 МБ
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
              Статус
            </h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm font-medium">Активен (виден в каталоге)</span>
            </label>
          </Card>

          <div className="space-y-3">
            {error && (
              <p className="text-danger text-sm bg-danger/10 p-3 rounded-lg">{error}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Сохранение...' : isEdit ? 'Сохранить изменения' : 'Создать таролога'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/admin/tarologi')}
            >
              Отмена
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

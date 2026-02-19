export interface Tarologist {
  id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  about: string | null;
  specializations: string[];
  work_formats: string[];
  city: string | null;
  contact_telegram: string | null;
  contact_whatsapp: string | null;
  contact_instagram: string | null;
  contact_email: string | null;
  contact_other: string | null;
  is_active: boolean;
  sort_order: number;
  avg_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  tarologist_id: string;
  name: string;
  format: string | null;
  duration_minutes: number | null;
  price: number;
  sort_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  tarologist_id: string;
  code_id: string | null;
  client_name: string;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  moderated_at: string | null;
  moderated_by: string | null;
  tarologist?: Tarologist;
}

export interface ReviewCode {
  id: string;
  tarologist_id: string;
  code: string;
  status: 'issued' | 'used' | 'expired';
  created_at: string;
  used_at: string | null;
  expires_at: string;
  tarologist?: Tarologist;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'manager';
  created_at: string;
}

export interface TarologistWithServices extends Tarologist {
  services: Service[];
}

export const SPECIALIZATIONS = [
  'Отношения',
  'Финансы',
  'Карьера',
  'Здоровье',
  'Предназначение',
  'Общие расклады',
  'Психологическое таро',
  'Бизнес-расклады',
] as const;

export const WORK_FORMATS = [
  'Видео-звонок',
  'Аудио-звонок',
  'В переписке',
  'Очно',
] as const;

export const WORK_FORMAT_ICONS: Record<string, string> = {
  'Видео-звонок': '📹',
  'Аудио-звонок': '📞',
  'В переписке': '💬',
  'Очно': '📍',
};

export const PRICE_RANGES = [
  { label: 'До 3 000₽', min: 0, max: 3000 },
  { label: '3 000 — 5 000₽', min: 3000, max: 5000 },
  { label: '5 000 — 10 000₽', min: 5000, max: 10000 },
  { label: 'От 10 000₽', min: 10000, max: Infinity },
] as const;

-- =============================================
-- Каталог тарологов Академии Анастасии Лыковой
-- Миграция базы данных (Supabase / PostgreSQL)
-- =============================================

-- Таблица тарологов
CREATE TABLE tarologists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  about TEXT,
  specializations TEXT[] DEFAULT '{}',
  work_formats TEXT[] DEFAULT '{}',
  city TEXT,
  contact_telegram TEXT,
  contact_whatsapp TEXT,
  contact_instagram TEXT,
  contact_email TEXT,
  contact_other TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  avg_rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица услуг и цен
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarologist_id UUID REFERENCES tarologists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format TEXT,
  duration_minutes INTEGER,
  price INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица кодов подтверждения (создаётся ДО reviews)
CREATE TABLE review_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarologist_id UUID REFERENCES tarologists(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'used', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days')
);

-- Таблица отзывов
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarologist_id UUID REFERENCES tarologists(id) ON DELETE CASCADE,
  code_id UUID REFERENCES review_codes(id),
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  moderated_at TIMESTAMPTZ,
  moderated_by UUID
);

-- Таблица администраторов
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'manager' CHECK (role IN ('admin', 'manager')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Индексы
CREATE INDEX idx_tarologists_slug ON tarologists(slug);
CREATE INDEX idx_tarologists_active ON tarologists(is_active);
CREATE INDEX idx_services_tarologist ON services(tarologist_id);
CREATE INDEX idx_reviews_tarologist ON reviews(tarologist_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_review_codes_code ON review_codes(code);
CREATE INDEX idx_review_codes_tarologist ON review_codes(tarologist_id);
CREATE INDEX idx_review_codes_status ON review_codes(status);

-- Функция пересчёта рейтинга
CREATE OR REPLACE FUNCTION update_tarologist_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tarologists SET
    avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE tarologist_id = COALESCE(NEW.tarologist_id, OLD.tarologist_id) AND status = 'approved'), 0),
    review_count = (SELECT COUNT(*) FROM reviews WHERE tarologist_id = COALESCE(NEW.tarologist_id, OLD.tarologist_id) AND status = 'approved'),
    updated_at = now()
  WHERE id = COALESCE(NEW.tarologist_id, OLD.tarologist_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_tarologist_rating();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE tarologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Публичный доступ: чтение активных тарологов
CREATE POLICY "Public can view active tarologists"
  ON tarologists FOR SELECT
  USING (is_active = true);

-- Авторизованные: полный доступ к тарологам
CREATE POLICY "Authenticated users manage tarologists"
  ON tarologists FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Публичный доступ: чтение услуг
CREATE POLICY "Public can view services"
  ON services FOR SELECT
  USING (true);

-- Авторизованные: полный доступ к услугам
CREATE POLICY "Authenticated users manage services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Публичный доступ: чтение одобренных отзывов
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

-- Публичный доступ: создание отзывов (с pending статусом)
CREATE POLICY "Anyone can submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (status = 'pending');

-- Авторизованные: полный доступ к отзывам
CREATE POLICY "Authenticated users manage reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Публичный доступ: чтение кодов (для валидации)
CREATE POLICY "Public can validate codes"
  ON review_codes FOR SELECT
  USING (true);

-- Авторизованные: полный доступ к кодам
CREATE POLICY "Authenticated users manage codes"
  ON review_codes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Публичный доступ: обновление кодов (для пометки использования)
CREATE POLICY "Anyone can mark codes as used"
  ON review_codes FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Авторизованные: доступ к admin_users
CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- Создание Storage bucket для фото
-- =============================================
-- Выполните в Supabase Dashboard > Storage:
-- 1. Создайте bucket 'tarologist-photos' (Public)
-- 2. Или выполните через SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tarologist-photos', 'tarologist-photos', true);

-- =============================================
-- Тестовые данные (5 тарологов)
-- =============================================

INSERT INTO tarologists (name, slug, about, specializations, work_formats, city, contact_telegram, contact_whatsapp, contact_instagram, contact_email, is_active, sort_order, avg_rating, review_count)
VALUES
(
  'Анна Светлова',
  'anna-svetlova',
  'Сертифицированный таролог Академии Анастасии Лыковой, выпускница курса «Эксперт Таро VIP». Специализируюсь на вопросах отношений и предназначения. Более 3 лет практики. Работаю с колодами Rider-Waite и Таро Тота. Мой подход — мягкий и поддерживающий, помогаю увидеть ситуацию с разных сторон и найти оптимальное решение.',
  ARRAY['Отношения', 'Предназначение', 'Общие расклады'],
  ARRAY['Видео-звонок', 'В переписке'],
  NULL,
  '@anna_svetlova_taro',
  '+79001234567',
  '@anna_svetlova_taro',
  'anna@example.com',
  true, 1, 4.8, 12
),
(
  'Мария Золотарёва',
  'maria-zolotareva',
  'Таролог-эксперт с глубоким пониманием финансовых и карьерных раскладов. Выпускница курса «Эксперт Таро VIP» Академии Анастасии Лыковой. Помогаю предпринимателям и тем, кто ищет своё дело. Провожу как краткие консультации, так и глубокие сессии с полным разбором ситуации.',
  ARRAY['Финансы', 'Карьера', 'Бизнес-расклады'],
  ARRAY['Видео-звонок', 'Аудио-звонок', 'В переписке'],
  'Москва',
  '@maria_gold_taro',
  '+79007654321',
  '@maria_gold_taro',
  NULL,
  true, 2, 4.9, 23
),
(
  'Елена Лунная',
  'elena-lunnaya',
  'Практикующий таролог и психолог. Соединяю в работе таро и психологический подход. Выпускница Академии Анастасии Лыковой. Особый фокус на здоровье и внутренние состояния. Работаю бережно и деликатно с любыми запросами.',
  ARRAY['Здоровье', 'Психологическое таро', 'Отношения'],
  ARRAY['Видео-звонок', 'Аудио-звонок'],
  'Санкт-Петербург',
  '@elena_moon_taro',
  NULL,
  '@elena_moon_taro',
  'elena@example.com',
  true, 3, 4.6, 8
),
(
  'Ирина Звёздная',
  'irina-zvezdnaya',
  'Таролог с особым фокусом на вопросах предназначения и духовного развития. Выпускница курса «Эксперт Таро VIP». Работаю как онлайн, так и очно в Москве. Использую авторские расклады, разработанные за годы практики.',
  ARRAY['Предназначение', 'Общие расклады', 'Карьера'],
  ARRAY['Видео-звонок', 'В переписке', 'Очно'],
  'Москва',
  '@irina_star_taro',
  '+79009876543',
  '@irina_star_taro',
  NULL,
  true, 4, 4.7, 15
),
(
  'Дарья Кристальная',
  'darya-kristalnaya',
  'Молодой, но опытный таролог. Специализируюсь на отношениях и финансовых вопросах. Выпускница Академии Анастасии Лыковой. Работаю преимущественно в переписке — это позволяет давать вдумчивые и подробные ответы с полным разбором карт.',
  ARRAY['Отношения', 'Финансы', 'Общие расклады'],
  ARRAY['В переписке', 'Аудио-звонок'],
  NULL,
  '@darya_crystal_taro',
  '+79005551234',
  NULL,
  'darya@example.com',
  true, 5, 4.5, 6
);

-- Тестовые услуги
INSERT INTO services (tarologist_id, name, format, duration_minutes, price, sort_order)
SELECT t.id, s.name, s.format, s.duration, s.price, s.sort_order
FROM tarologists t
CROSS JOIN (VALUES
  ('anna-svetlova', 'Экспресс-расклад', 'В переписке', 30, 2500, 0),
  ('anna-svetlova', 'Полный расклад по видео', 'Видео-звонок', 60, 5000, 1),
  ('anna-svetlova', 'Расклад на отношения', 'Видео-звонок', 90, 7000, 2),
  ('maria-zolotareva', 'Бизнес-консультация', 'Видео-звонок', 60, 8000, 0),
  ('maria-zolotareva', 'Карьерный расклад', 'Аудио-звонок', 45, 5000, 1),
  ('maria-zolotareva', 'Экспресс-ответ', 'В переписке', 20, 2000, 2),
  ('elena-lunnaya', 'Психологическое таро', 'Видео-звонок', 90, 7500, 0),
  ('elena-lunnaya', 'Расклад на здоровье', 'Аудио-звонок', 60, 5500, 1),
  ('irina-zvezdnaya', 'Расклад на предназначение', 'Видео-звонок', 90, 9000, 0),
  ('irina-zvezdnaya', 'Общий расклад', 'В переписке', 40, 3500, 1),
  ('irina-zvezdnaya', 'Очная консультация', 'Очно', 120, 12000, 2),
  ('darya-kristalnaya', 'Расклад в переписке', 'В переписке', 30, 2000, 0),
  ('darya-kristalnaya', 'Подробный расклад', 'В переписке', 60, 3500, 1),
  ('darya-kristalnaya', 'Аудио-консультация', 'Аудио-звонок', 45, 4000, 2)
) AS s(slug, name, format, duration, price, sort_order)
WHERE t.slug = s.slug;

-- Тестовые отзывы (одобренные)
INSERT INTO reviews (tarologist_id, client_name, rating, text, status, created_at)
SELECT t.id, r.client_name, r.rating, r.text, 'approved', r.created_at::timestamptz
FROM tarologists t
CROSS JOIN (VALUES
  ('anna-svetlova', 'Екатерина', 5, 'Анна — потрясающий таролог! Расклад был очень точным и помог разобраться в сложной ситуации с отношениями. Рекомендую всем, кто ищет ответы.', '2025-12-15'),
  ('anna-svetlova', 'Олег', 5, 'Обратился с вопросом о предназначении. Анна очень мягко и точно описала ситуацию. Многое из сказанного уже подтвердилось. Благодарю!', '2026-01-20'),
  ('anna-svetlova', 'Наталья', 4, 'Хороший расклад, Анна внимательная и отзывчивая. Немного не хватило конкретики по срокам, но в целом осталась довольна.', '2026-02-01'),
  ('maria-zolotareva', 'Алексей', 5, 'Мария помогла разобраться с финансовыми вопросами. Расклад был детальным и конкретным. Уже применяю рекомендации, результаты есть!', '2025-11-10'),
  ('maria-zolotareva', 'Ирина П.', 5, 'Лучший карьерный расклад, который я получала! Мария точно описала текущую ситуацию и дала чёткие рекомендации. Очень благодарна.', '2026-01-05'),
  ('maria-zolotareva', 'Дмитрий', 5, 'Профессиональный подход к бизнес-раскладу. Мария понимает тему финансов и карьеры на глубоком уровне. Буду обращаться ещё.', '2026-02-10'),
  ('elena-lunnaya', 'Анна К.', 5, 'Елена великолепно соединяет таро и психологию. Сеанс был терапевтичным и информативным одновременно. Рекомендую!', '2026-01-15'),
  ('elena-lunnaya', 'Светлана', 4, 'Интересный подход к раскладу. Елена уделяет много внимания эмоциональному состоянию. Полезная консультация, спасибо!', '2026-02-05'),
  ('irina-zvezdnaya', 'Марина', 5, 'Ирина проводила расклад на предназначение. Это было невероятно точно! Многие вещи совпали с моими ощущениями. Очень рекомендую.', '2025-12-20'),
  ('irina-zvezdnaya', 'Виктор', 5, 'Был на очной консультации у Ирины. Потрясающая атмосфера и глубокий расклад. Стоит каждого рубля.', '2026-01-25'),
  ('darya-kristalnaya', 'Юлия', 5, 'Дарья делает отличные расклады в переписке. Подробный, вдумчивый ответ с разбором каждой карты. Очень довольна!', '2026-01-30'),
  ('darya-kristalnaya', 'Аноним', 4, 'Хороший расклад по финансовому вопросу. Дарья ответила быстро и развёрнуто. Буду обращаться снова.', '2026-02-12')
) AS r(slug, client_name, rating, text, created_at)
WHERE t.slug = r.slug;

-- ВАЖНО: После добавления администратора, создайте пользователя через Supabase Dashboard:
-- 1. Перейдите в Authentication > Users
-- 2. Нажмите «Add user» > «Create new user»
-- 3. Укажите email и пароль
-- 4. Затем добавьте запись в таблицу admin_users:
-- INSERT INTO admin_users (email, role) VALUES ('ваш-email@example.com', 'admin');

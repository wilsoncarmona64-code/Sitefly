-- ===== SITEFLY FASE 3 - SQL SCHEMA =====
-- Ejecutar en Supabase SQL Editor

-- 1. Actualizar tabla businesses con nuevos campos
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#6366f1';

-- 2. Actualizar tabla products con categorías y stock
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT -1,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Crear tabla coupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    discount_percent INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    max_uses INTEGER DEFAULT NULL,
    used_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, code)
);

-- 4. Crear tabla page_views para analytics
CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    device_type TEXT DEFAULT 'desktop',
    user_agent TEXT
);

-- 5. Actualizar tabla orders con coupon
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- 6. Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_coupons_business ON coupons(business_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_page_views_business ON page_views(business_id);
CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(business_id, sort_order);

-- 7. RLS Policies para coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propios coupons"
ON coupons FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM businesses WHERE id = business_id));

CREATE POLICY "Usuarios pueden crear sus propios coupons"
ON coupons FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM businesses WHERE id = business_id));

CREATE POLICY "Usuarios pueden actualizar sus propios coupons"
ON coupons FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM businesses WHERE id = business_id));

CREATE POLICY "Usuarios pueden eliminar sus propios coupons"
ON coupons FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM businesses WHERE id = business_id));

-- 8. RLS Policies para page_views (solo insert público, select para dueño)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede registrar visitas"
ON page_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Dueños pueden ver visitas de su negocio"
ON page_views FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM businesses WHERE id = business_id));

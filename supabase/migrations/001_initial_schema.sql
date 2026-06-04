-- ─── Enable Extensions ────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users Table ──────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific role
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'public' CHECK (role IN ('public', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Hospitals Table ──────────────────────────────────────────────────────────
CREATE TABLE public.hospitals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  address         TEXT NOT NULL,
  city            TEXT NOT NULL,
  lga             TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT,
  specialties     TEXT[] NOT NULL DEFAULT '{}',
  ownership       TEXT NOT NULL CHECK (ownership IN ('public', 'private')),
  location        GEOGRAPHY(POINT, 4326) NOT NULL, -- PostGIS column
  latitude        NUMERIC(10, 7) NOT NULL,
  longitude       NUMERIC(10, 7) NOT NULL,
  description_md  TEXT,
  visiting_hours  TEXT,
  rating_avg      NUMERIC(3, 2) NOT NULL DEFAULT 0,
  review_count    INT NOT NULL DEFAULT 0,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PostGIS spatial index for fast radius queries
CREATE INDEX hospitals_location_gist_idx ON public.hospitals USING GIST (location);

-- Full-text search index
CREATE INDEX hospitals_name_search_idx ON public.hospitals USING GIN (to_tsvector('english', name));
CREATE INDEX hospitals_city_idx ON public.hospitals (city);
CREATE INDEX hospitals_lga_idx ON public.hospitals (lga);

-- ─── Reviews Table ────────────────────────────────────────────────────────────
CREATE TABLE public.reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id  UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating       INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text         TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (hospital_id, user_id) -- one review per user per hospital
);

CREATE INDEX reviews_hospital_id_idx ON public.reviews (hospital_id);
CREATE INDEX reviews_user_id_idx ON public.reviews (user_id);
CREATE INDEX reviews_status_idx ON public.reviews (status);

-- ─── Hospital Images Table ────────────────────────────────────────────────────
CREATE TABLE public.hospital_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id   UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  uploaded_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX hospital_images_hospital_id_idx ON public.hospital_images (hospital_id);

-- ─── Triggers ─────────────────────────────────────────────────────────────────

-- Auto-update updated_at on hospitals
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hospitals_updated_at
  BEFORE UPDATE ON public.hospitals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update hospital rating_avg and review_count when a review is approved
CREATE OR REPLACE FUNCTION update_hospital_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.hospitals
  SET
    rating_avg = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.hospital_id, OLD.hospital_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_update_hospital_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_hospital_rating();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'public');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
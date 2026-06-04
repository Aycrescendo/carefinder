-- ─── Enable Row Level Security ────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_images ENABLE ROW LEVEL SECURITY;

-- ─── Users Policies ───────────────────────────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "users_read_own"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "users_admin_read_all"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update user roles
CREATE POLICY "users_admin_update"
  ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── Hospitals Policies ───────────────────────────────────────────────────────

-- Anyone can read hospitals (public directory)
CREATE POLICY "hospitals_read_all"
  ON public.hospitals
  FOR SELECT
  USING (true);

-- Only admins can insert hospitals
CREATE POLICY "hospitals_admin_insert"
  ON public.hospitals
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update hospitals
CREATE POLICY "hospitals_admin_update"
  ON public.hospitals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete hospitals
CREATE POLICY "hospitals_admin_delete"
  ON public.hospitals
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── Reviews Policies ─────────────────────────────────────────────────────────

-- Anyone can read approved reviews
CREATE POLICY "reviews_read_approved"
  ON public.reviews
  FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

-- Admins can read all reviews including pending and hidden
CREATE POLICY "reviews_admin_read_all"
  ON public.reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Authenticated users can insert their own reviews
CREATE POLICY "reviews_user_insert"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "reviews_user_update_own"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can update any review (for moderation)
CREATE POLICY "reviews_admin_moderate"
  ON public.reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can delete their own reviews
CREATE POLICY "reviews_user_delete_own"
  ON public.reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Hospital Images Policies ─────────────────────────────────────────────────

-- Anyone can read hospital images
CREATE POLICY "hospital_images_read_all"
  ON public.hospital_images
  FOR SELECT
  USING (true);

-- Only admins can insert images
CREATE POLICY "hospital_images_admin_insert"
  ON public.hospital_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete images
CREATE POLICY "hospital_images_admin_delete"
  ON public.hospital_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
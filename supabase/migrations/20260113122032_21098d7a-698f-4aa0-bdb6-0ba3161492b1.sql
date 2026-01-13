-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage badges" ON public.badges;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage clubs" ON public.clubs;

-- Badges policies - allow admin and author to insert/update
CREATE POLICY "Admins and authors can insert badges" ON public.badges
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'author'::app_role)
  );

CREATE POLICY "Admins and authors can update badges" ON public.badges
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'author'::app_role)
  );

CREATE POLICY "Admins can delete badges" ON public.badges
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Categories policies - allow admin and author to insert/update
CREATE POLICY "Admins and authors can insert categories" ON public.categories
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'author'::app_role)
  );

CREATE POLICY "Admins and authors can update categories" ON public.categories
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'author'::app_role)
  );

CREATE POLICY "Admins can delete categories" ON public.categories
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Clubs policies - allow admin and author to insert/update
CREATE POLICY "Admins and authors can insert clubs" ON public.clubs
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'author'::app_role)
  );

CREATE POLICY "Admins and authors can update clubs" ON public.clubs
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'author'::app_role)
  );

CREATE POLICY "Admins can delete clubs" ON public.clubs
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));
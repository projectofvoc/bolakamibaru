-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert moments" ON public.best_moments;
DROP POLICY IF EXISTS "Authenticated users can update moments" ON public.best_moments;
DROP POLICY IF EXISTS "Authenticated users can delete moments" ON public.best_moments;

-- Create proper policies with authenticated check
CREATE POLICY "Authenticated users can insert moments" 
  ON public.best_moments FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update moments" 
  ON public.best_moments FOR UPDATE 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete moments" 
  ON public.best_moments FOR DELETE 
  TO authenticated
  USING (auth.uid() IS NOT NULL);
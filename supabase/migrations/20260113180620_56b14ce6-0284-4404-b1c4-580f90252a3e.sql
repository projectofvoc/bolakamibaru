-- Seed default leagues data
INSERT INTO public.leagues (name, name_en, country, is_international, is_active, sort_order) VALUES
('Liga 1 Indonesia', 'Liga 1 Indonesia', 'Indonesia', false, true, 1),
('Premier League', 'Premier League', 'Inggris', false, true, 2),
('La Liga', 'La Liga', 'Spanyol', false, true, 3),
('Serie A', 'Serie A', 'Italia', false, true, 4),
('Bundesliga', 'Bundesliga', 'Jerman', false, true, 5),
('Liga Champions', 'Champions League', 'Eropa', true, true, 6)
ON CONFLICT DO NOTHING;
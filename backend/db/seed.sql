-- Sample data so the app has something to show
INSERT INTO prices (crop, market, district, price_per_kg, date) VALUES
  ('Maize', 'Kimironko', 'Gasabo', 450, '2026-10-16'),
  ('Irish Potatoes', 'Musanze', 'Musanze', 350, '2026-10-16'),
  ('Beans', 'Nyabugogo', 'Nyarugenge', 900, '2026-10-17'),
  ('Cassava Flour', 'Rwamagana', 'Rwamagana', 500, '2026-10-17'),
  ('Rice', 'Kimironko', 'Gasabo', 1200, '2026-10-18'),
  ('Beans', 'Musanze', 'Musanze', 850, '2026-10-18'),
  ('Maize', 'Rubavu', 'Rubavu', 420, '2026-10-19'),
  ('Irish Potatoes', 'Nyabugogo', 'Nyarugenge', 400, '2026-10-20');

INSERT INTO price_history (price_id, date, price_per_kg) VALUES
  (1, '2026-10-07', 380), (1, '2026-10-14', 400),
  (2, '2026-10-07', 400), (2, '2026-10-14', 380),
  (3, '2026-10-07', 880), (3, '2026-10-14', 900),
  (4, '2026-10-07', 470), (4, '2026-10-14', 480),
  (5, '2026-10-07', 1250), (5, '2026-10-14', 1250),
  (6, '2026-10-07', 820), (6, '2026-10-14', 800),
  (7, '2026-10-07', 400), (7, '2026-10-14', 420),
  (8, '2026-10-07', 350), (8, '2026-10-14', 370);

-- Shop categories so stores and bazaars are searchable alongside services.
INSERT INTO categories (key,name_uz,name_en,name_ru) VALUES
('supermarket','Supermarketlar','Supermarkets','Супермаркеты'),
('bazaar','Bozorlar','Markets and bazaars','Базары и рынки'),
('clothing','Kiyim doʻkonlari','Clothing stores','Магазины одежды'),
('electronics','Maishiy texnika va elektronika','Electronics stores','Электроника и техника'),
('mobile','Aloqa salonlari','Mobile phone shops','Салоны связи'),
('hardware','Qurilish mollari','Hardware stores','Строительные магазины'),
('furniture','Mebel doʻkonlari','Furniture stores','Мебельные магазины'),
('cosmetics','Kosmetika va parfyumeriya','Cosmetics stores','Косметика и парфюмерия'),
('butcher','Goʻsht doʻkonlari','Butcher shops','Мясные магазины'),
('greengrocer','Meva-sabzavot doʻkonlari','Greengrocers','Овощи и фрукты'),
('stationery','Kanselyariya doʻkonlari','Stationery stores','Канцтовары')
ON CONFLICT (key) DO NOTHING;

-- Keeps every category translated in the three interface locales.
INSERT INTO category_translations(category_id,locale,name)
SELECT id,'uz',name_uz FROM categories
UNION ALL SELECT id,'en',name_en FROM categories
UNION ALL SELECT id,'ru',name_ru FROM categories
ON CONFLICT (category_id,locale) DO NOTHING;

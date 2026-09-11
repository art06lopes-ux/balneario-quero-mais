-- =====================================================================
-- Seed — conteúdo aprovado na prévia (fase 1).
-- Idempotente. Imagens iniciais apontam para public/seed/ do app
-- (caminho começando com "/"); o painel permite trocar cada uma.
-- =====================================================================

insert into public.site_settings (
  id, whatsapp_number, ticket_price,
  hero_kicker, hero_title, hero_subtitle, hero_image_path,
  about_title, about_text, about_image_path, about_image_secondary_path,
  cta_title, cta_text, cta_image_path,
  address, hours, location_notes, maps_query, logo_path, instagram_url
) values (
  1, '5592991901596', 20,
  'Km 19 · Estrada de Novo Airão · Amazonas',
  'Balneário Quero Mais',
  'Um dia inteiro de lazer dentro da floresta: igarapé de água escura, rede dentro d''água e peixe na brasa. Vem viver isso.',
  '/seed/igarape-sol.jpg',
  'Um pedaço da Amazônia feito para descansar',
  'O Balneário Quero Mais é um balneário natural às margens de um igarapé de água escura, típica da Amazônia, cercado por mata. O deck azul e branco acompanha a beira da água, com areia, mesas sob guarda-sóis e redes armadas dentro do próprio igarapé.

O bar e restaurante serve culinária regional — o peixe grelhado é o destaque da casa. Fica no Km 19 da estrada de Novo Airão e abre todos os dias, de segunda a segunda.',
  '/seed/peixe-grelhado.jpg', '/seed/deck-ponte.jpg',
  'Seu próximo dia de lazer começa aqui.',
  'Km 19 da estrada de Novo Airão. Aberto todos os dias.',
  '/seed/mesas-deck.jpg',
  'Km 19, estrada de Novo Airão — Amazonas',
  'Aberto todos os dias, de segunda a segunda',
  '',
  'Balneário Quero Mais Novo Airão Amazonas',
  '/seed/logo.jpg',
  'https://www.instagram.com/queromais_balneario'
)
on conflict (id) do nothing;

insert into public.features (title, description, image_path, sort_order)
select * from (values
  ('Igarapé de água escura', 'Banho em água natural, corrente e fresca, contornada pelo deck azul.', '/seed/igarape-sol.jpg', 1),
  ('Redário dentro d''água', 'Redes armadas sobre o igarapé para ficar de molho sem pressa.', '/seed/redario.jpg', 2),
  ('Mesas com guarda-sóis', 'Área de areia à beira da água, com sombra e mesas para a família.', '/seed/guarda-sois.jpg', 3),
  ('Bar & restaurante', 'Culinária regional com peixe grelhado como destaque da casa.', '/seed/peixe-grelhado.jpg', 4)
) as v(title, description, image_path, sort_order)
where not exists (select 1 from public.features);

insert into public.gallery_categories (name, slug, sort_order) values
  ('Igarapé', 'igarape', 1),
  ('Estrutura', 'estrutura', 2),
  ('Ambiente', 'ambiente', 3),
  ('Comidas', 'comidas', 4)
on conflict (slug) do nothing;

insert into public.gallery_photos (category_id, image_path, alt, sort_order)
select c.id, v.image_path, v.alt, v.sort_order
from (values
  ('igarape',   '/seed/igarape-sol.jpg',  'Igarapé em dia de sol', 1),
  ('igarape',   '/seed/redario.jpg',      'Redário dentro d''água', 2),
  ('igarape',   '/seed/deck-ponte.jpg',   'Deck sobre o igarapé', 3),
  ('estrutura', '/seed/mesas-sombra.jpg', 'Mesas à sombra', 1),
  ('estrutura', '/seed/guarda-sois.jpg',  'Guarda-sóis à beira da água', 2),
  ('estrutura', '/seed/mesas-deck.jpg',   'Mesas e deck de madeira', 3)
) as v(slug, image_path, alt, sort_order)
join public.gallery_categories c on c.slug = v.slug
where not exists (select 1 from public.gallery_photos);

insert into public.food_items (name, description, image_path, sort_order)
select * from (values
  ('Peixe grelhado', 'O prato da casa: peixe na brasa com acompanhamentos regionais.', '/seed/peixe-grelhado.jpg', 1)
) as v(name, description, image_path, sort_order)
where not exists (select 1 from public.food_items);

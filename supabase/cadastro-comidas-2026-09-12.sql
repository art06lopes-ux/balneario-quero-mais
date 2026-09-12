-- =====================================================================
-- Cadastro dos pratos (fotos enviadas em 12/09/2026)
--
-- As fotos estão em public/seed/comidas/ do site. Nomes e descrições
-- foram escritos a partir do que aparece nas fotos — o dono ajusta o que
-- quiser (e coloca preço) em /admin → Comidas. Idempotente.
-- =====================================================================

-- O prato da casa: troca a foto da prévia pela foto real da mesa completa.
update public.food_items
   set image_path = '/seed/comidas/peixe-na-brasa-completo.jpg',
       description = 'Peixe inteiro assado na brasa, servido com arroz, farofa, feijão, vinagrete e salada. O prato da casa.',
       sort_order = 1
 where name = 'Peixe grelhado'
   and image_path = '/seed/peixe-grelhado.jpg';

insert into public.food_items (name, description, image_path, sort_order, show_in_gallery)
select v.* from (values
  ('Peixe grelhado na travessa',
   'Peixe grelhado servido na travessa com tomate, cebola, limão e banana assada.',
   '/seed/comidas/peixe-grelhado-travessa.jpg', 2, true),
  ('Carne na chapa',
   'Carne na chapa com cebola, tomate, pimentão, queijo e banana frita. Acompanha arroz, farofa, feijão, macarrão, batata frita e salada.',
   '/seed/comidas/carne-na-chapa.jpg', 3, true),
  ('Caldeirada de peixe',
   'Caldeirada de peixe com legumes e cheiro-verde, servida com arroz, farofa, pirão e limão.',
   '/seed/comidas/caldeirada-de-peixe.jpg', 4, true),
  ('Caldo de galinha',
   'Caldo de galinha com ovo cozido, servido com arroz, macarrão e farofa.',
   '/seed/comidas/caldo-de-galinha.jpg', 5, true),
  ('Isca de peixe',
   'Tiras de peixe empanadas e fritas, com molho e limão. Boa para dividir.',
   '/seed/comidas/isca-de-peixe.jpg', 6, true)
) as v(name, description, image_path, sort_order, show_in_gallery)
where not exists (select 1 from public.food_items f where f.image_path = v.image_path);

-- Fotos extras dos pratos, só na aba "Comidas" da galeria.
insert into public.gallery_photos (category_id, image_path, alt, sort_order)
select c.id, v.image_path, v.alt, v.sort_order
from (values
  ('/seed/comidas/peixe-grelhado-arroz-farofa.jpg', 'Peixe grelhado com arroz, farofa e vinagrete', 1),
  ('/seed/comidas/peixe-grelhado-vinagrete.jpg',    'Peixe grelhado com vinagrete e limão', 2),
  ('/seed/comidas/carne-na-chapa-2.jpg',            'Carne na chapa com acompanhamentos', 3)
) as v(image_path, alt, sort_order)
join public.gallery_categories c on c.slug = 'comidas'
where not exists (select 1 from public.gallery_photos p where p.image_path = v.image_path);

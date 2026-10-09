-- Toda ficha nueva nace en borrador (qh-editorial): antes plants.publicada tenía default true y una fila nueva
-- (p. ej. de un lote de 10) salía en /diccionario sin pasar por «✅ Publicar». No cambia ninguna fila existente.
-- Deshacer: alter table public.plants alter column publicada set default true;
alter table public.plants alter column publicada set default false;

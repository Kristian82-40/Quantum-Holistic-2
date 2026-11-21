-- Conversión markdown → HTML de los posts copiados en blog_posts_markdown_backup_20261121 (21-nov-2026,
-- con el sí de Kristian). Copia de markdownAHtml (_kimiko/lib/blog.js) en SQL, con 3 casos más que esos
-- posts antiguos usan: lista numerada (<ol>), cita "> …" (<blockquote>) y separador "---" (<hr/>).
-- Comprobada contra la versión JS con un texto de prueba y con «Dieta Mediterránea» (mismo md5).
-- Funciones en pg_temp: solo existen durante la llamada, no quedan en la base.

create or replace function pg_temp.en_linea(s text) returns text language sql immutable as $f$
  select regexp_replace(regexp_replace(
    replace(replace(replace(replace(replace(s, '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;'), '''', '&#39;'),
    '\*\*(.+?)\*\*', '<strong>\1</strong>', 'g'),
    '\*(.+?)\*', '<em>\1</em>', 'g')
$f$;

create or replace function pg_temp.md_a_html(md text) returns text language plpgsql immutable as $f$
declare
  salida text[] := '{}'; lista text[] := null; tipo text := null; parrafo text[] := '{}';
  bruta text; l text; m text[]; t text; n int;
begin
  foreach bruta in array string_to_array(md, chr(10)) loop
    l := regexp_replace(bruta, '^\s+|\s+$', '', 'g');
    if l = '' then
      if array_length(parrafo, 1) > 0 then salida := salida || ('<p>' || pg_temp.en_linea(array_to_string(parrafo, ' ')) || '</p>'); parrafo := '{}'; end if;
      if lista is not null then salida := salida || ('<' || tipo || '>' || (select string_agg('<li>' || pg_temp.en_linea(x) || '</li>', '' order by o) from unnest(lista) with ordinality u(x, o)) || '</' || tipo || '>'); lista := null; tipo := null; end if;
    elsif l ~ '^#{1,4}\s+' then
      if array_length(parrafo, 1) > 0 then salida := salida || ('<p>' || pg_temp.en_linea(array_to_string(parrafo, ' ')) || '</p>'); parrafo := '{}'; end if;
      if lista is not null then salida := salida || ('<' || tipo || '>' || (select string_agg('<li>' || pg_temp.en_linea(x) || '</li>', '' order by o) from unnest(lista) with ordinality u(x, o)) || '</' || tipo || '>'); lista := null; tipo := null; end if;
      m := regexp_match(l, '^(#{1,4})\s+(.*)$'); n := greatest(2, length(m[1]));
      salida := salida || ('<h' || n || '>' || pg_temp.en_linea(m[2]) || '</h' || n || '>');
    elsif l ~ '^(-{3,}|\*{3,}|_{3,})$' then
      if array_length(parrafo, 1) > 0 then salida := salida || ('<p>' || pg_temp.en_linea(array_to_string(parrafo, ' ')) || '</p>'); parrafo := '{}'; end if;
      if lista is not null then salida := salida || ('<' || tipo || '>' || (select string_agg('<li>' || pg_temp.en_linea(x) || '</li>', '' order by o) from unnest(lista) with ordinality u(x, o)) || '</' || tipo || '>'); lista := null; tipo := null; end if;
      salida := salida || '<hr/>'::text;
    elsif l ~ '^>' then
      if array_length(parrafo, 1) > 0 then salida := salida || ('<p>' || pg_temp.en_linea(array_to_string(parrafo, ' ')) || '</p>'); parrafo := '{}'; end if;
      if lista is not null then salida := salida || ('<' || tipo || '>' || (select string_agg('<li>' || pg_temp.en_linea(x) || '</li>', '' order by o) from unnest(lista) with ordinality u(x, o)) || '</' || tipo || '>'); lista := null; tipo := null; end if;
      salida := salida || ('<blockquote><p>' || pg_temp.en_linea((regexp_match(l, '^>\s?(.*)$'))[1]) || '</p></blockquote>');
    elsif l ~ '^\d+[.)]\s+' or l ~ '^[-*•]\s+' then
      if array_length(parrafo, 1) > 0 then salida := salida || ('<p>' || pg_temp.en_linea(array_to_string(parrafo, ' ')) || '</p>'); parrafo := '{}'; end if;
      t := case when l ~ '^\d+[.)]\s+' then 'ol' else 'ul' end;
      if tipo is not null and tipo <> t then
        salida := salida || ('<' || tipo || '>' || (select string_agg('<li>' || pg_temp.en_linea(x) || '</li>', '' order by o) from unnest(lista) with ordinality u(x, o)) || '</' || tipo || '>'); lista := null;
      end if;
      tipo := t;
      lista := coalesce(lista, '{}') || (case when t = 'ol' then (regexp_match(l, '^\d+[.)]\s+(.*)$'))[1] else (regexp_match(l, '^[-*•]\s+(.*)$'))[1] end);
    else
      if lista is not null then salida := salida || ('<' || tipo || '>' || (select string_agg('<li>' || pg_temp.en_linea(x) || '</li>', '' order by o) from unnest(lista) with ordinality u(x, o)) || '</' || tipo || '>'); lista := null; tipo := null; end if;
      parrafo := parrafo || l;
    end if;
  end loop;
  if array_length(parrafo, 1) > 0 then salida := salida || ('<p>' || pg_temp.en_linea(array_to_string(parrafo, ' ')) || '</p>'); end if;
  if lista is not null then salida := salida || ('<' || tipo || '>' || (select string_agg('<li>' || pg_temp.en_linea(x) || '</li>', '' order by o) from unnest(lista) with ordinality u(x, o)) || '</' || tipo || '>'); end if;
  return array_to_string(salida, '');
end
$f$;

-- Cada lote: (1) estas dos funciones, (2) el update con la guarda md5 = copia, (3) las comprobaciones.
-- update public.blog_posts b set content = pg_temp.md_a_html(k.content), updated_at = now()
--   from public.blog_posts_markdown_backup_20261121 k
--   where k.id = b.id and md5(b.content) = md5(k.content) and b.id::text like any (array['<id8>%', …]);

-- Comprobaciones (ensayo antes de cada lote y verificación después):
--   quedan "##" o "**" o "*" sueltos, citas sin convertir ("&gt;" al empezar un bloque),
--   y mismas palabras (solo letras y números) en el markdown de la copia y en el HTML.
create or replace function pg_temp.norm_md(md text) returns text language sql immutable as $f$
  select btrim(regexp_replace(lower(replace(regexp_replace(regexp_replace(md,
    '(^|\n)\s*(#{1,4}|[-*•]|\d+[.)]|>)\s+', '\1', 'g'), '(^|\n)\s*(-{3,}|\*{3,}|_{3,})\s*(?=\n|$)', '\1', 'g'), '*', ' ')),
    '[^[:alnum:]]+', ' ', 'g'))
$f$;
create or replace function pg_temp.norm_html(h text) returns text language sql immutable as $f$
  select btrim(regexp_replace(lower(regexp_replace(regexp_replace(h, '<[^>]+>', ' ', 'g'), '&(amp|lt|gt|quot|#39);', ' ', 'g')),
    '[^[:alnum:]]+', ' ', 'g'))
$f$;

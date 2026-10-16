-- Esquema public de producción (solo esquema, sin datos). Volcado con: supabase db dump --linked --schema public
-- incluye migraciones hasta 20261016131910 (16-oct-2026). Lo usa kimiko/pruebas/permisos-local.sh (F0-03).



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case
      when new.raw_user_meta_data->>'role' = 'terapeuta' then 'terapeuta'
      else 'user'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_chat_usage"("p_user_id" "uuid", "p_date" "date") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'solo puedes contar tu propio uso' using errcode = '42501';
  end if;
  insert into public.chat_usage (user_id, date, count)
  values (p_user_id, p_date, 1)
  on conflict (user_id, date)
  do update set count = public.chat_usage.count + 1;
end;
$$;


ALTER FUNCTION "public"."increment_chat_usage"("p_user_id" "uuid", "p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_chat_usage_anon"("p_session_id" "text", "p_date" "date") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.chat_usage (session_id, date, count)
  values (p_session_id, p_date, 1)
  on conflict (session_id, date)
  do update set count = public.chat_usage.count + 1;
end;
$$;


ALTER FUNCTION "public"."increment_chat_usage_anon"("p_session_id" "text", "p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kimiko_auditoria"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  with
  dup as (select slug from public.blog_posts group by slug having count(*) > 1),
  cat as (select distinct category from public.blog_posts
          where category is null or category not in ('Herbología', 'Nutrición', 'Ayurveda', 'Bienestar Holístico', 'Sabiduría')),
  sin_img as (select slug from public.blog_posts where status = 'published' and coalesce(image_url, '') = ''),
  sin_meta as (select slug from public.blog_posts where status = 'published' and (excerpt is null or length(excerpt) not between 50 and 160)),
  plantas as (select slug from public.plants where publicada and not coalesce(ficha_verificada, false)),
  sin_rls as (select c.relname::text as tabla from pg_class c join pg_namespace n on n.oid = c.relnamespace
              where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity)
  select jsonb_build_object(
    'slugs_duplicados', jsonb_build_object('n', (select count(*) from dup), 'ejemplos', coalesce((select jsonb_agg(slug) from (select slug from dup limit 10) x), '[]')),
    'categorias_no_normalizadas', jsonb_build_object('n', (select count(*) from public.blog_posts p where p.category is null or p.category in (select category from cat)), 'ejemplos', coalesce((select jsonb_agg(category) from cat), '[]')),
    'publicados_sin_imagen', jsonb_build_object('n', (select count(*) from sin_img), 'ejemplos', coalesce((select jsonb_agg(slug) from (select slug from sin_img limit 10) x), '[]')),
    'publicados_sin_meta', jsonb_build_object('n', (select count(*) from sin_meta), 'ejemplos', coalesce((select jsonb_agg(slug) from (select slug from sin_meta limit 10) x), '[]')),
    'plantas_publicadas_sin_verificar', jsonb_build_object('n', (select count(*) from plantas), 'ejemplos', coalesce((select jsonb_agg(slug) from (select slug from plantas limit 10) x), '[]')),
    'tablas_sin_rls', jsonb_build_object('n', (select count(*) from sin_rls), 'ejemplos', coalesce((select jsonb_agg(tabla) from sin_rls), '[]'))
  );
$$;


ALTER FUNCTION "public"."kimiko_auditoria"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kimiko_avisar_orden"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if new.status in ('hecho', 'bloqueado', 'pr_abierto', 'para_claude', 'error_ejecucion')
     and new.status is distinct from old.status then
    perform net.http_post(
      url := 'https://vctetjugbvyllwjpxcxh.supabase.co/functions/v1/kimiko-diario',
      headers := jsonb_build_object('content-type', 'application/json',
        'x-kimiko-secreto', (select decrypted_secret from vault.decrypted_secrets where name = 'kimiko_cron_secreto')),
      body := jsonb_build_object('accion', 'avisar-orden', 'id', new.id),
      timeout_milliseconds := 10000);
  end if;
  return new;
end $$;


ALTER FUNCTION "public"."kimiko_avisar_orden"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kimiko_estado_crons"() RETURNS TABLE("jobname" "text", "active" boolean, "schedule" "text", "ultimo_estado" "text", "ultima_ejecucion" timestamp with time zone)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select j.jobname::text, j.active, j.schedule::text, d.status::text, d.start_time
  from cron.job j
  left join lateral (
    select r.status, r.start_time from cron.job_run_details r
    where r.jobid = j.jobid order by r.start_time desc limit 1
  ) d on true
  where j.jobname like 'kimiko-%';
$$;


ALTER FUNCTION "public"."kimiko_estado_crons"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kimiko_prueba_permisos"() RETURNS TABLE("rol" "text", "tabla" "text", "columna" "text", "esperado" boolean, "obtenido" boolean)
    LANGUAGE "sql" STABLE
    SET "search_path" TO ''
    AS $$
with esperado(rol, tabla, columna, puede_update) as (
  values
    -- profiles: el usuario solo cambia su dosha (y la fecha de cambio)
    ('authenticated', 'profiles', 'dosha',              true),
    ('authenticated', 'profiles', 'updated_at',         true),
    ('authenticated', 'profiles', 'id',                 false),
    ('authenticated', 'profiles', 'email',              false),
    ('authenticated', 'profiles', 'role',               false),
    ('authenticated', 'profiles', 'plan',               false),
    ('authenticated', 'profiles', 'plan_expires_at',    false),
    ('authenticated', 'profiles', 'stripe_customer_id', false),
    ('authenticated', 'profiles', 'verified',           false)
)
select e.rol, e.tabla, e.columna, e.puede_update as esperado,
       has_column_privilege(e.rol, format('public.%I', e.tabla), e.columna, 'UPDATE') as real
from esperado e
where has_column_privilege(e.rol, format('public.%I', e.tabla), e.columna, 'UPDATE') <> e.puede_update
union all
select 'anon', 'profiles', c.column_name, false, true
from information_schema.columns c
where c.table_schema = 'public' and c.table_name = 'profiles'
  and has_column_privilege('anon', 'public.profiles', c.column_name, 'UPDATE')
union all
select r.rol, 'profiles', '(' || lower(r.priv) || ')', false, true
from (values ('anon'), ('authenticated')) a(rol)
cross join lateral (values (a.rol, 'INSERT'), (a.rol, 'DELETE'), (a.rol, 'TRUNCATE')) r(rol, priv)
where has_table_privilege(r.rol, 'public.profiles', r.priv)
union all
select g.grantee, g.table_name, '(' || lower(g.privilege_type) || ')', false, true
from information_schema.role_table_grants g
where g.table_schema = 'public' and g.grantee in ('anon', 'authenticated')
  and g.privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
union all
select 'anon', 'profiles', c.column_name || ' (select)', false, true
from information_schema.columns c
where c.table_schema = 'public' and c.table_name = 'profiles'
  and c.column_name not in ('id', 'full_name', 'especialidades', 'bio', 'avatar_url', 'role', 'verified')
  and has_column_privilege('anon', 'public.profiles', c.column_name, 'SELECT')
union all
select 'public', c.relname, p.polname, false, true
from pg_policy p join pg_class c on c.oid = p.polrelid
where (c.relname = 'plants' and p.polcmd = 'r' and pg_get_expr(p.polqual, p.polrelid) not like '%publicada%ficha_verificada%')
   or (c.relname in ('plants', 'chat_usage') and p.polcmd <> 'r')
union all
select 'default', 'tablas nuevas', d.defaclacl::text, false, true
from pg_default_acl d join pg_namespace n on n.oid = d.defaclnamespace
where n.nspname = 'public' and d.defaclobjtype = 'r' and pg_get_userbyid(d.defaclrole) = 'postgres'
  and (d.defaclacl::text like '%anon=%' or d.defaclacl::text like '%authenticated=%')
$$;


ALTER FUNCTION "public"."kimiko_prueba_permisos"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kimiko_tareas_tocar"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.actualizado_at := now();
  if new.estado = 'verificada' and old.estado is distinct from 'verificada' then new.verificada_at := now(); end if;
  return new;
end $$;


ALTER FUNCTION "public"."kimiko_tareas_tocar"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."agent_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "text",
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "role" "text",
    "message" "text",
    "tokens_used" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."agent_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "excerpt" "text",
    "content" "text",
    "category" "text",
    "tags" "text"[],
    "published" boolean DEFAULT false,
    "author_id" "uuid",
    "image_url" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    CONSTRAINT "blog_posts_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_posts_categoria_backup_20261008" (
    "id" "uuid",
    "category" "text"
);


ALTER TABLE "public"."blog_posts_categoria_backup_20261008" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_posts_sauco_backup_20261014" (
    "id" "uuid",
    "content" "text",
    "image_url" "text",
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."blog_posts_sauco_backup_20261014" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_usage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."chat_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."citas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "texto" "text" NOT NULL,
    "autor" "text",
    "fuente" "text",
    "fecha_publicacion" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."citas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "log_date" "date" DEFAULT CURRENT_DATE,
    "meals_log" "jsonb" DEFAULT '[]'::"jsonb",
    "water_ml" integer DEFAULT 0,
    "weight_kg" numeric(5,2),
    "energy_level" integer,
    "mood" integer,
    "sleep_quality" integer,
    "stress_level" integer,
    "exercise_done" boolean DEFAULT false,
    "exercise_type" "text",
    "exercise_min" integer,
    "notes" "text",
    "plan_adherence" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "daily_logs_energy_level_check" CHECK ((("energy_level" >= 1) AND ("energy_level" <= 10))),
    CONSTRAINT "daily_logs_mood_check" CHECK ((("mood" >= 1) AND ("mood" <= 10))),
    CONSTRAINT "daily_logs_plan_adherence_check" CHECK ((("plan_adherence" >= 0) AND ("plan_adherence" <= 100))),
    CONSTRAINT "daily_logs_sleep_quality_check" CHECK ((("sleep_quality" >= 1) AND ("sleep_quality" <= 10))),
    CONSTRAINT "daily_logs_stress_level_check" CHECK ((("stress_level" >= 1) AND ("stress_level" <= 10)))
);


ALTER TABLE "public"."daily_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."health_connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "provider" "text" NOT NULL,
    "access_token" "text",
    "refresh_token" "text",
    "token_expires_at" timestamp with time zone,
    "scopes" "text",
    "connected_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_sync_at" timestamp with time zone,
    CONSTRAINT "health_connections_provider_check" CHECK (("provider" = ANY (ARRAY['strava'::"text", 'fitbit'::"text", 'withings'::"text", 'manual'::"text"])))
);


ALTER TABLE "public"."health_connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."health_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "age" integer,
    "gender" "text",
    "weight_kg" numeric,
    "height_cm" numeric,
    "activity_level" "text",
    "main_goal" "text",
    "dietary_restrictions" "text"[],
    "health_conditions" "text"[],
    "raw_answers" "jsonb",
    "energy_level" integer,
    "stress_level" integer,
    "digestive_health" integer,
    "sleep_quality" integer,
    "activity_score" integer,
    "season" "text",
    "goals" "text"[] DEFAULT '{}'::"text"[],
    "score" "jsonb",
    "top_protocol" "text",
    CONSTRAINT "health_profiles_activity_level_check" CHECK (("activity_level" = ANY (ARRAY['sedentario'::"text", 'ligero'::"text", 'moderado'::"text", 'activo'::"text", 'muy_activo'::"text"]))),
    CONSTRAINT "health_profiles_activity_score_check" CHECK ((("activity_score" >= 1) AND ("activity_score" <= 10))),
    CONSTRAINT "health_profiles_digestive_health_check" CHECK ((("digestive_health" >= 1) AND ("digestive_health" <= 10))),
    CONSTRAINT "health_profiles_energy_level_check" CHECK ((("energy_level" >= 1) AND ("energy_level" <= 10))),
    CONSTRAINT "health_profiles_main_goal_check" CHECK (("main_goal" = ANY (ARRAY['perder_peso'::"text", 'ganar_masa'::"text", 'energia'::"text", 'detox'::"text", 'equilibrio'::"text", 'rendimiento'::"text"]))),
    CONSTRAINT "health_profiles_season_check" CHECK (("season" = ANY (ARRAY['spring'::"text", 'summer'::"text", 'autumn'::"text", 'winter'::"text"]))),
    CONSTRAINT "health_profiles_sleep_quality_check" CHECK ((("sleep_quality" >= 1) AND ("sleep_quality" <= 10))),
    CONSTRAINT "health_profiles_stress_level_check" CHECK ((("stress_level" >= 1) AND ("stress_level" <= 10)))
);


ALTER TABLE "public"."health_profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."health_profiles"."energy_level" IS 'Energía subjetiva 1-10';



COMMENT ON COLUMN "public"."health_profiles"."stress_level" IS 'Estrés subjetivo 1-10';



COMMENT ON COLUMN "public"."health_profiles"."digestive_health" IS 'Salud digestiva 1-10';



COMMENT ON COLUMN "public"."health_profiles"."sleep_quality" IS 'Calidad de sueño 1-10';



COMMENT ON COLUMN "public"."health_profiles"."activity_score" IS 'Nivel actividad 1-10 (1 sedentario, 10 atleta élite)';



COMMENT ON COLUMN "public"."health_profiles"."season" IS 'Estación: spring|summer|autumn|winter';



COMMENT ON COLUMN "public"."health_profiles"."goals" IS 'Objetivos múltiples: detox, energy, immunity, cognitive, weight, sleep';



COMMENT ON COLUMN "public"."health_profiles"."score" IS 'Vector de scores holísticos computado (0-1 cada dimensión)';



COMMENT ON COLUMN "public"."health_profiles"."top_protocol" IS 'Protocolo principal recomendado (la dimensión con score más alto)';



CREATE TABLE IF NOT EXISTS "public"."health_summaries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "provider" "text" NOT NULL,
    "fecha" "date" NOT NULL,
    "pasos" integer,
    "distancia_m" numeric,
    "calorias" integer,
    "minutos_activos" integer,
    "sueno_min" integer,
    "fc_reposo" integer,
    "raw" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."health_summaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kimiko_config" (
    "clave" "text" NOT NULL,
    "valor" "text" NOT NULL,
    "caduca_en" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."kimiko_config" OWNER TO "postgres";


COMMENT ON TABLE "public"."kimiko_config" IS 'Solo accesible con service_role. Guarda el token de Instagram vigente tras cada renovación automática.';



CREATE TABLE IF NOT EXISTS "public"."plants" (
    "id" smallint NOT NULL,
    "slug" "text" NOT NULL,
    "nombre_es" "text" NOT NULL,
    "nombre_latino" "text" NOT NULL,
    "image_cientifica_url" "text",
    "image_mistica_url" "text",
    "ficha_cientifica" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "ficha_mistica" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "categoria" "text",
    "ficha_verificada" boolean DEFAULT false NOT NULL,
    "publicada" boolean DEFAULT false NOT NULL,
    "grok_id" smallint,
    CONSTRAINT "plants_categoria_check" CHECK (("categoria" = ANY (ARRAY['Maestras'::"text", 'Sagradas'::"text", 'Magicas'::"text"])))
);


ALTER TABLE "public"."plants" OWNER TO "postgres";


COMMENT ON COLUMN "public"."plants"."categoria" IS 'Maestras=plantas madres/adaptogénicas | Sagradas=ceremoniales/espirituales | Magicas=magia práctica/protección/amor';



COMMENT ON COLUMN "public"."plants"."ficha_verificada" IS 'Solo true tras verificar a mano que ficha_cientifica corresponde a nombre_latino. El frontend no renderiza la ficha clínica ni las contraindicaciones si es false.';



COMMENT ON COLUMN "public"."plants"."grok_id" IS 'Número de la foto de Grok (carpeta «fotos grok q-h.com»). No es el id de la planta.';



CREATE OR REPLACE VIEW "public"."kimiko_contenido" WITH ("security_invoker"='true') AS
 SELECT 'plant'::"text" AS "tipo",
    "p"."slug",
    "p"."nombre_es" AS "titulo",
    COALESCE("p"."nombre_latino", ''::"text") AS "subtitulo",
    "left"(COALESCE(("p"."ficha_cientifica")::"text", ''::"text"), 600) AS "resumen",
    COALESCE("p"."categoria", 'sin-categoria'::"text") AS "categoria",
    ('https://quantum-holistic.com/plantas/'::"text" || "p"."slug") AS "url",
    "p"."image_cientifica_url" AS "imagen",
    "p"."ficha_verificada" AS "imagen_apta",
    "p"."updated_at"
   FROM "public"."plants" "p"
  WHERE ("p"."publicada" = true)
UNION ALL
 SELECT 'post'::"text" AS "tipo",
    "b"."slug",
    "b"."title" AS "titulo",
    ''::"text" AS "subtitulo",
    "left"(COALESCE("b"."excerpt", "b"."content", ''::"text"), 600) AS "resumen",
    COALESCE("b"."category", 'sin-categoria'::"text") AS "categoria",
    ('https://quantum-holistic.com/blog/'::"text" || "b"."slug") AS "url",
    "b"."image_url" AS "imagen",
    true AS "imagen_apta",
    "b"."updated_at"
   FROM "public"."blog_posts" "b"
  WHERE ("b"."published" = true);


ALTER VIEW "public"."kimiko_contenido" OWNER TO "postgres";


COMMENT ON VIEW "public"."kimiko_contenido" IS 'Fuente unica de contenido propio para Kimiko. Nunca incluye las 9 plantas peligrosas (publicada=false). imagen_apta=false => no reutilizar la imagen, solo enlazar.';



CREATE TABLE IF NOT EXISTS "public"."kimiko_content" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "text" NOT NULL,
    "fecha" "date" NOT NULL,
    "slot" integer DEFAULT 1 NOT NULL,
    "estado" "text" NOT NULL,
    "pilar" "text",
    "titular" "text" NOT NULL,
    "copy" "text" NOT NULL,
    "hashtags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "texto_alternativo" "text",
    "prompt_imagen" "text",
    "texto_en_imagen" "text",
    "variacion" "jsonb",
    "imagen_ruta" "text",
    "coste_usd" numeric(8,4) DEFAULT 0 NOT NULL,
    "problemas" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "blog_post_id" "uuid",
    "reel_url" "text",
    "reel_enviado_at" timestamp with time zone,
    CONSTRAINT "kimiko_content_estado_check" CHECK (("estado" = ANY (ARRAY['listo'::"text", 'revision'::"text", 'publicado'::"text", 'descartado'::"text"])))
);


ALTER TABLE "public"."kimiko_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kimiko_drafts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chat_id" bigint,
    "source_note" "text",
    "lectura" "text",
    "concepto" "text",
    "copy" "text",
    "hashtags" "text",
    "texto_en_imagen" "text",
    "prompt_imagen" "text",
    "image_url" "text",
    "source_image_url" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "ig_media_id" "text",
    "permalink" "text",
    "tg_message_id" bigint,
    "tg_photo_message_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "update_id" bigint,
    "tg_file_id" "text",
    "raw_update" "jsonb",
    "imagen_ruta" "text",
    "rama" "text",
    "pr_numero" integer,
    "pr_url" "text",
    "avisado_at" timestamp with time zone
);


ALTER TABLE "public"."kimiko_drafts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kimiko_learnings" (
    "id" bigint NOT NULL,
    "texto" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."kimiko_learnings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."kimiko_learnings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."kimiko_learnings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."kimiko_learnings_id_seq" OWNED BY "public"."kimiko_learnings"."id";



CREATE TABLE IF NOT EXISTS "public"."kimiko_projects" (
    "id" "text" NOT NULL,
    "nombre" "text" NOT NULL,
    "sitio" "text" NOT NULL,
    "config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "activo" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."kimiko_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kimiko_runbook" (
    "id" "text" NOT NULL,
    "nombre" "text" NOT NULL,
    "cuando" "text" NOT NULL,
    "pasos" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "comprobacion" "text" NOT NULL,
    "si_falla" "text" NOT NULL,
    "activa" boolean DEFAULT true NOT NULL,
    "actualizado_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."kimiko_runbook" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kimiko_security_checks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "text" NOT NULL,
    "sitio" "text" NOT NULL,
    "ok" boolean NOT NULL,
    "hallazgos" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."kimiko_security_checks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kimiko_spend" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mes" "text" NOT NULL,
    "concepto" "text" NOT NULL,
    "usd" numeric(8,4) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ok" boolean DEFAULT true NOT NULL,
    "error" "text",
    "respuesta_bruta" "text"
);


ALTER TABLE "public"."kimiko_spend" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kimiko_tareas" (
    "id" "text" NOT NULL,
    "titulo" "text" NOT NULL,
    "descripcion" "text",
    "monton" "text",
    "responsable" "text" NOT NULL,
    "estado" "text" DEFAULT 'pendiente'::"text" NOT NULL,
    "etiquetas" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "canal" "text",
    "minutos" integer,
    "url" "text",
    "pasos" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "prueba" "text",
    "fecha_limite" "date",
    "orden" integer,
    "depende_de" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "evidencia" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "motivo" "text",
    "creado_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "actualizado_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "verificada_at" timestamp with time zone,
    CONSTRAINT "kimiko_tareas_bloqueo_con_motivo" CHECK ((("estado" <> 'bloqueado'::"text") OR (COALESCE("motivo", ''::"text") <> ''::"text"))),
    CONSTRAINT "kimiko_tareas_canal_check" CHECK (("canal" = ANY (ARRAY['movil'::"text", 'panel_web'::"text", 'mac'::"text", 'llamada'::"text"]))),
    CONSTRAINT "kimiko_tareas_estado_check" CHECK (("estado" = ANY (ARRAY['pendiente'::"text", 'en_curso'::"text", 'esperando_ok'::"text", 'esperando_prueba'::"text", 'verificada'::"text", 'bloqueado'::"text", 'descartado'::"text", 'propuesta'::"text"]))),
    CONSTRAINT "kimiko_tareas_etiquetas_check" CHECK (("etiquetas" <@ ARRAY['db'::"text", 'pago'::"text", 'dns'::"text", 'regla'::"text", 'envio'::"text", 'prod'::"text", 'cred'::"text", 'delicado'::"text"])),
    CONSTRAINT "kimiko_tareas_evidencia_check" CHECK (("jsonb_typeof"("evidencia") = 'array'::"text")),
    CONSTRAINT "kimiko_tareas_minutos_check" CHECK ((("minutos" >= 1) AND ("minutos" <= 30))),
    CONSTRAINT "kimiko_tareas_monton_check" CHECK (("monton" = ANY (ARRAY['A'::"text", 'B'::"text", 'C'::"text"]))),
    CONSTRAINT "kimiko_tareas_pasos_check" CHECK (("jsonb_typeof"("pasos") = 'array'::"text")),
    CONSTRAINT "kimiko_tareas_responsable_check" CHECK (("responsable" = ANY (ARRAY['code'::"text", 'kristian'::"text", 'kimiko'::"text"]))),
    CONSTRAINT "kimiko_tareas_url_check" CHECK ((("url" IS NULL) OR ("url" ~ '^https://'::"text")))
);


ALTER TABLE "public"."kimiko_tareas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kimiko_updates" (
    "update_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tipo" "text",
    "project_id" "text",
    "ok" boolean,
    "detalle" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "respuesta_bruta" "text"
);


ALTER TABLE "public"."kimiko_updates" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."kimiko_updates_ejecucion_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."kimiko_updates_ejecucion_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."kimiko_updates_ejecucion_seq" OWNED BY "public"."kimiko_updates"."update_id";



CREATE TABLE IF NOT EXISTS "public"."kimiko_vault" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "text" NOT NULL,
    "servicio" "text" NOT NULL,
    "etiqueta" "text" NOT NULL,
    "sobre" "jsonb",
    "rota_cada_dias" integer DEFAULT 90 NOT NULL,
    "creado_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "actualizado_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ultimos4" "text",
    "caduca_at" timestamp with time zone,
    "destino" "text",
    CONSTRAINT "kimiko_vault_sobre_o_metadatos" CHECK ((("sobre" IS NOT NULL) OR ("ultimos4" IS NOT NULL))),
    CONSTRAINT "kimiko_vault_ultimos4_corto" CHECK ((("ultimos4" IS NULL) OR ("char_length"("ultimos4") <= 4)))
);


ALTER TABLE "public"."kimiko_vault" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "source" "text" DEFAULT 'chat_paywall'::"text",
    "dosha" "text",
    "converted" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."monthly_protocols" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "protocol_type" "text",
    "content" "jsonb" NOT NULL,
    "pdf_url" "text",
    CONSTRAINT "monthly_protocols_protocol_type_check" CHECK (("protocol_type" = ANY (ARRAY['detox'::"text", 'inmune'::"text", 'regeneracion'::"text", 'rendimiento'::"text"])))
);


ALTER TABLE "public"."monthly_protocols" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nutrition_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "title" "text" NOT NULL,
    "description" "text",
    "plan_data" "jsonb" NOT NULL,
    "generated_by" "text" DEFAULT 'claude-api'::"text",
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."nutrition_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plants_imagen_backup_20261008" (
    "id" smallint,
    "slug" "text",
    "image_cientifica_url" "text"
);


ALTER TABLE "public"."plants_imagen_backup_20261008" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "price_eur" numeric(8,2),
    "price_btc" numeric(16,8),
    "stripe_product_id" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "products_type_check" CHECK (("type" = ANY (ARRAY['guide'::"text", 'course'::"text", 'plan'::"text", 'consultation'::"text", 'subscription'::"text"])))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "email" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "plan" "text" DEFAULT 'freemium'::"text",
    "plan_expires_at" timestamp with time zone,
    "stripe_customer_id" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "verified" boolean DEFAULT false NOT NULL,
    "bio" "text",
    "dosha" "text",
    "especialidades" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    CONSTRAINT "profiles_dosha_check" CHECK (("dosha" = ANY (ARRAY['Vata'::"text", 'Pitta'::"text", 'Kapha'::"text"]))),
    CONSTRAINT "profiles_plan_check" CHECK (("plan" = ANY (ARRAY['freemium'::"text", 'pro'::"text", 'plan_crypto'::"text"]))),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'terapeuta'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."purchases" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "amount_eur" numeric(8,2),
    "payment_method" "text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "transaction_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "purchases_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['stripe'::"text", 'btcpay'::"text", 'manual'::"text"]))),
    CONSTRAINT "purchases_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."purchases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recipes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "meal_type" "text",
    "ingredients" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "instructions" "text"[],
    "prep_time_min" integer,
    "cook_time_min" integer,
    "servings" integer DEFAULT 2,
    "nutrition" "jsonb",
    "km0_score" integer DEFAULT 50,
    "seasons" "text"[] DEFAULT '{}'::"text"[],
    "medicinal_plants" "text"[] DEFAULT '{}'::"text"[],
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "recipes_km0_score_check" CHECK ((("km0_score" >= 0) AND ("km0_score" <= 100))),
    CONSTRAINT "recipes_meal_type_check" CHECK (("meal_type" = ANY (ARRAY['breakfast'::"text", 'lunch'::"text", 'dinner'::"text", 'snack'::"text", 'infusion'::"text"])))
);


ALTER TABLE "public"."recipes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session_summaries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "text",
    "started_at" timestamp with time zone,
    "ended_at" timestamp with time zone DEFAULT "now"(),
    "summary" "text",
    "pendientes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."session_summaries" OWNER TO "postgres";


ALTER TABLE ONLY "public"."kimiko_learnings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."kimiko_learnings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."kimiko_updates" ALTER COLUMN "update_id" SET DEFAULT (- "nextval"('"public"."kimiko_updates_ejecucion_seq"'::"regclass"));



ALTER TABLE ONLY "public"."agent_logs"
    ADD CONSTRAINT "agent_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."chat_usage"
    ADD CONSTRAINT "chat_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_usage"
    ADD CONSTRAINT "chat_usage_session_id_date_key" UNIQUE ("session_id", "date");



ALTER TABLE ONLY "public"."chat_usage"
    ADD CONSTRAINT "chat_usage_user_id_date_key" UNIQUE ("user_id", "date");



ALTER TABLE ONLY "public"."citas"
    ADD CONSTRAINT "citas_fecha_publicacion_key" UNIQUE ("fecha_publicacion");



ALTER TABLE ONLY "public"."citas"
    ADD CONSTRAINT "citas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_logs"
    ADD CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_logs"
    ADD CONSTRAINT "daily_logs_user_id_log_date_key" UNIQUE ("user_id", "log_date");



ALTER TABLE ONLY "public"."health_connections"
    ADD CONSTRAINT "health_connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_connections"
    ADD CONSTRAINT "health_connections_user_id_provider_key" UNIQUE ("user_id", "provider");



ALTER TABLE ONLY "public"."health_profiles"
    ADD CONSTRAINT "health_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_profiles"
    ADD CONSTRAINT "health_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."health_summaries"
    ADD CONSTRAINT "health_summaries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_summaries"
    ADD CONSTRAINT "health_summaries_user_id_provider_fecha_key" UNIQUE ("user_id", "provider", "fecha");



ALTER TABLE ONLY "public"."kimiko_config"
    ADD CONSTRAINT "kimiko_config_pkey" PRIMARY KEY ("clave");



ALTER TABLE ONLY "public"."kimiko_content"
    ADD CONSTRAINT "kimiko_content_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kimiko_content"
    ADD CONSTRAINT "kimiko_content_project_id_fecha_slot_key" UNIQUE ("project_id", "fecha", "slot");



ALTER TABLE ONLY "public"."kimiko_drafts"
    ADD CONSTRAINT "kimiko_drafts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kimiko_learnings"
    ADD CONSTRAINT "kimiko_learnings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kimiko_projects"
    ADD CONSTRAINT "kimiko_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kimiko_runbook"
    ADD CONSTRAINT "kimiko_runbook_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kimiko_security_checks"
    ADD CONSTRAINT "kimiko_security_checks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kimiko_spend"
    ADD CONSTRAINT "kimiko_spend_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kimiko_tareas"
    ADD CONSTRAINT "kimiko_tareas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kimiko_updates"
    ADD CONSTRAINT "kimiko_updates_pkey" PRIMARY KEY ("update_id");



ALTER TABLE ONLY "public"."kimiko_vault"
    ADD CONSTRAINT "kimiko_vault_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kimiko_vault"
    ADD CONSTRAINT "kimiko_vault_project_id_servicio_etiqueta_key" UNIQUE ("project_id", "servicio", "etiqueta");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monthly_protocols"
    ADD CONSTRAINT "monthly_protocols_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nutrition_plans"
    ADD CONSTRAINT "nutrition_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plants"
    ADD CONSTRAINT "plants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plants"
    ADD CONSTRAINT "plants_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_stripe_customer_id_key" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."purchases"
    ADD CONSTRAINT "purchases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_summaries"
    ADD CONSTRAINT "session_summaries_pkey" PRIMARY KEY ("id");



CREATE INDEX "kimiko_drafts_status_idx" ON "public"."kimiko_drafts" USING "btree" ("status", "created_at" DESC);



CREATE UNIQUE INDEX "kimiko_drafts_update_id_uniq" ON "public"."kimiko_drafts" USING "btree" ("update_id") WHERE ("update_id" IS NOT NULL);



CREATE INDEX "kimiko_tareas_cola" ON "public"."kimiko_tareas" USING "btree" ("responsable", "estado", "fecha_limite", "orden");



CREATE INDEX "kimiko_updates_tipo_fecha" ON "public"."kimiko_updates" USING "btree" ("tipo", "created_at" DESC);



CREATE UNIQUE INDEX "plants_grok_id_key" ON "public"."plants" USING "btree" ("grok_id") WHERE ("grok_id" IS NOT NULL);



CREATE INDEX "plants_slug_idx" ON "public"."plants" USING "btree" ("slug");



CREATE OR REPLACE TRIGGER "kimiko_drafts_avisar" AFTER UPDATE OF "status" ON "public"."kimiko_drafts" FOR EACH ROW EXECUTE FUNCTION "public"."kimiko_avisar_orden"();



CREATE OR REPLACE TRIGGER "kimiko_tareas_tocar" BEFORE UPDATE ON "public"."kimiko_tareas" FOR EACH ROW EXECUTE FUNCTION "public"."kimiko_tareas_tocar"();



CREATE OR REPLACE TRIGGER "trg_health_profiles_updated_at" BEFORE UPDATE ON "public"."health_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."chat_usage"
    ADD CONSTRAINT "chat_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_logs"
    ADD CONSTRAINT "daily_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."health_connections"
    ADD CONSTRAINT "health_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."health_profiles"
    ADD CONSTRAINT "health_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."health_summaries"
    ADD CONSTRAINT "health_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kimiko_content"
    ADD CONSTRAINT "kimiko_content_blog_post_id_fkey" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."kimiko_content"
    ADD CONSTRAINT "kimiko_content_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."kimiko_projects"("id");



ALTER TABLE ONLY "public"."kimiko_security_checks"
    ADD CONSTRAINT "kimiko_security_checks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."kimiko_projects"("id");



ALTER TABLE ONLY "public"."kimiko_vault"
    ADD CONSTRAINT "kimiko_vault_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."kimiko_projects"("id");



ALTER TABLE ONLY "public"."monthly_protocols"
    ADD CONSTRAINT "monthly_protocols_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nutrition_plans"
    ADD CONSTRAINT "nutrition_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchases"
    ADD CONSTRAINT "purchases_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."purchases"
    ADD CONSTRAINT "purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Blog posts are public" ON "public"."blog_posts" FOR SELECT USING (("published" = true));



CREATE POLICY "Public read verified terapeutas" ON "public"."profiles" FOR SELECT TO "anon" USING ((("role" = 'terapeuta'::"text") AND ("verified" = true)));



CREATE POLICY "Users insert own health profile" ON "public"."health_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users see own health profile" ON "public"."health_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users see own nutrition plans" ON "public"."nutrition_plans" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users see own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users see own protocols" ON "public"."monthly_protocols" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users update own health profile" ON "public"."health_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."agent_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_posts_categoria_backup_20261008" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_posts_sauco_backup_20261014" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_usage" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "chat_usage leer anon" ON "public"."chat_usage" FOR SELECT TO "anon" USING (("user_id" IS NULL));



CREATE POLICY "chat_usage leer propio" ON "public"."chat_usage" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."citas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "citas_public_read" ON "public"."citas" FOR SELECT USING (true);



ALTER TABLE "public"."daily_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "hc_own" ON "public"."health_connections" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."health_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."health_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."health_summaries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "hs_own" ON "public"."health_summaries" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."kimiko_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kimiko_content" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kimiko_drafts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kimiko_learnings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kimiko_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kimiko_runbook" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kimiko_security_checks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kimiko_spend" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kimiko_tareas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kimiko_updates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kimiko_vault" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."monthly_protocols" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nutrition_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plants_imagen_backup_20261008" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "plants_public_read" ON "public"."plants" FOR SELECT TO "authenticated", "anon" USING (("publicada" AND "ficha_verificada"));



ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."purchases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recipes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service role only" ON "public"."leads" USING (false);



ALTER TABLE "public"."session_summaries" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."increment_chat_usage"("p_user_id" "uuid", "p_date" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."increment_chat_usage"("p_user_id" "uuid", "p_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_chat_usage"("p_user_id" "uuid", "p_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_chat_usage_anon"("p_session_id" "text", "p_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_chat_usage_anon"("p_session_id" "text", "p_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_chat_usage_anon"("p_session_id" "text", "p_date" "date") TO "service_role";



REVOKE ALL ON FUNCTION "public"."kimiko_auditoria"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."kimiko_auditoria"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."kimiko_avisar_orden"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."kimiko_avisar_orden"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."kimiko_estado_crons"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."kimiko_estado_crons"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."kimiko_prueba_permisos"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."kimiko_prueba_permisos"() TO "service_role";



GRANT ALL ON FUNCTION "public"."kimiko_tareas_tocar"() TO "anon";
GRANT ALL ON FUNCTION "public"."kimiko_tareas_tocar"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."kimiko_tareas_tocar"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."agent_logs" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."agent_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_logs" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."blog_posts" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."blog_posts_categoria_backup_20261008" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."blog_posts_categoria_backup_20261008" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts_categoria_backup_20261008" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."blog_posts_sauco_backup_20261014" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."blog_posts_sauco_backup_20261014" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts_sauco_backup_20261014" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."chat_usage" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."chat_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_usage" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."citas" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."citas" TO "authenticated";
GRANT ALL ON TABLE "public"."citas" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."daily_logs" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."daily_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_logs" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."health_connections" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."health_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."health_connections" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."health_profiles" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."health_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."health_profiles" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."health_summaries" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."health_summaries" TO "authenticated";
GRANT ALL ON TABLE "public"."health_summaries" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_config" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_config" TO "authenticated";
GRANT ALL ON TABLE "public"."kimiko_config" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."plants" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."plants" TO "authenticated";
GRANT ALL ON TABLE "public"."plants" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_contenido" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_contenido" TO "authenticated";
GRANT ALL ON TABLE "public"."kimiko_contenido" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_content" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_content" TO "authenticated";
GRANT ALL ON TABLE "public"."kimiko_content" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_drafts" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_drafts" TO "authenticated";
GRANT ALL ON TABLE "public"."kimiko_drafts" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_learnings" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_learnings" TO "authenticated";
GRANT ALL ON TABLE "public"."kimiko_learnings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."kimiko_learnings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."kimiko_learnings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."kimiko_learnings_id_seq" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_projects" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."kimiko_projects" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_runbook" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_runbook" TO "authenticated";
GRANT ALL ON TABLE "public"."kimiko_runbook" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_security_checks" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_security_checks" TO "authenticated";
GRANT ALL ON TABLE "public"."kimiko_security_checks" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_spend" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_spend" TO "authenticated";
GRANT ALL ON TABLE "public"."kimiko_spend" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_tareas" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_tareas" TO "authenticated";
GRANT ALL ON TABLE "public"."kimiko_tareas" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_updates" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_updates" TO "authenticated";
GRANT ALL ON TABLE "public"."kimiko_updates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."kimiko_updates_ejecucion_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."kimiko_updates_ejecucion_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."kimiko_updates_ejecucion_seq" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_vault" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."kimiko_vault" TO "authenticated";
GRANT ALL ON TABLE "public"."kimiko_vault" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."leads" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."monthly_protocols" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."monthly_protocols" TO "authenticated";
GRANT ALL ON TABLE "public"."monthly_protocols" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."nutrition_plans" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."nutrition_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."nutrition_plans" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."plants_imagen_backup_20261008" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."plants_imagen_backup_20261008" TO "authenticated";
GRANT ALL ON TABLE "public"."plants_imagen_backup_20261008" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."products" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT SELECT ON TABLE "public"."profiles" TO "authenticated";



GRANT SELECT("id") ON TABLE "public"."profiles" TO "anon";



GRANT UPDATE("updated_at") ON TABLE "public"."profiles" TO "authenticated";



GRANT SELECT("full_name") ON TABLE "public"."profiles" TO "anon";



GRANT SELECT("avatar_url") ON TABLE "public"."profiles" TO "anon";



GRANT SELECT("role") ON TABLE "public"."profiles" TO "anon";



GRANT SELECT("verified") ON TABLE "public"."profiles" TO "anon";



GRANT SELECT("bio") ON TABLE "public"."profiles" TO "anon";



GRANT UPDATE("dosha") ON TABLE "public"."profiles" TO "authenticated";



GRANT SELECT("especialidades") ON TABLE "public"."profiles" TO "anon";



GRANT SELECT,MAINTAIN ON TABLE "public"."purchases" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."purchases" TO "authenticated";
GRANT ALL ON TABLE "public"."purchases" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."recipes" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."recipes" TO "authenticated";
GRANT ALL ON TABLE "public"."recipes" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."session_summaries" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."session_summaries" TO "authenticated";
GRANT ALL ON TABLE "public"."session_summaries" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";








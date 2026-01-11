



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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."ai_model_type" AS ENUM (
    'hard',
    'lite'
);


ALTER TYPE "public"."ai_model_type" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'user',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NOT (NEW.raw_app_meta_data ? 'role') THEN
    NEW.raw_app_meta_data :=
      COALESCE(NEW.raw_app_meta_data, '{}'::JSONB) ||
      JSONB_BUILD_OBJECT('role', 'user');
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_created_limits"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_role user_role;
BEGIN
  v_role := CASE
    WHEN NEW.raw_app_meta_data->>'role' IN ('user', 'admin')
      THEN (NEW.raw_app_meta_data->>'role')::user_role
    ELSE 'user'
  END;

  PERFORM public.seed_user_limits(NEW.id, v_role);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_user_created_limits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."seed_user_limits"("_user_id" "uuid", "_role" "public"."user_role") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_hard_rpd INTEGER;
  v_lite_rpd INTEGER;
  v_max_concurrency INTEGER;
  v_unlimited BOOLEAN;
BEGIN
  IF _role = 'admin' THEN
    v_hard_rpd := NULL;
    v_lite_rpd := NULL;
    v_max_concurrency := NULL;
    v_unlimited := TRUE;
  ELSE
    v_hard_rpd := 1;
    v_lite_rpd := 4;
    v_max_concurrency := 2;
    v_unlimited := FALSE;
  END IF;

  INSERT INTO user_limits (user_id, role, hard_rpd, lite_rpd, max_concurrency, unlimited)
  VALUES (_user_id, _role, v_hard_rpd, v_lite_rpd, v_max_concurrency, v_unlimited)
  ON CONFLICT (user_id) DO UPDATE
  SET
    role = EXCLUDED.role,
    hard_rpd = EXCLUDED.hard_rpd,
    lite_rpd = EXCLUDED.lite_rpd,
    max_concurrency = EXCLUDED.max_concurrency,
    unlimited = EXCLUDED.unlimited;
END;
$$;


ALTER FUNCTION "public"."seed_user_limits"("_user_id" "uuid", "_role" "public"."user_role") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_models" (
    "id" "text" NOT NULL,
    "provider" "text" NOT NULL,
    "api_name" "text" NOT NULL,
    "type" "public"."ai_model_type" NOT NULL,
    "rpm" integer NOT NULL,
    "rpd" integer NOT NULL,
    "fallback_priority" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ai_models" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cv_analyzes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "resume_id" "uuid",
    "requested_model" "text" NOT NULL,
    "processed_model" "text",
    "status" "text" NOT NULL,
    "result" "jsonb",
    "error" "text",
    "error_code" "text",
    "expired_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "finished_at" timestamp with time zone
);


ALTER TABLE "public"."cv_analyzes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_limits" (
    "user_id" "uuid" NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "hard_rpd" integer,
    "lite_rpd" integer,
    "max_concurrency" integer,
    "unlimited" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_limits" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ai_models"
    ADD CONSTRAINT "ai_models_api_name_key" UNIQUE ("api_name");



ALTER TABLE ONLY "public"."ai_models"
    ADD CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cv_analyzes"
    ADD CONSTRAINT "cv_analyzes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_limits"
    ADD CONSTRAINT "user_limits_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "idx_cv_analyzes_user_created_at" ON "public"."cv_analyzes" USING "btree" ("user_id", "created_at");



CREATE INDEX "idx_cv_analyzes_user_id" ON "public"."cv_analyzes" USING "btree" ("user_id");



CREATE INDEX "idx_user_limits_user_id" ON "public"."user_limits" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."cv_analyzes"
    ADD CONSTRAINT "cv_analyzes_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_limits"
    ADD CONSTRAINT "user_limits_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."cv_analyzes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cv_analyzes_select_own" ON "public"."cv_analyzes" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."user_limits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_limits_select_own" ON "public"."user_limits" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_created_limits"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_created_limits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_created_limits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."seed_user_limits"("_user_id" "uuid", "_role" "public"."user_role") TO "anon";
GRANT ALL ON FUNCTION "public"."seed_user_limits"("_user_id" "uuid", "_role" "public"."user_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."seed_user_limits"("_user_id" "uuid", "_role" "public"."user_role") TO "service_role";


















GRANT ALL ON TABLE "public"."ai_models" TO "service_role";



GRANT ALL ON TABLE "public"."cv_analyzes" TO "anon";
GRANT ALL ON TABLE "public"."cv_analyzes" TO "authenticated";
GRANT ALL ON TABLE "public"."cv_analyzes" TO "service_role";



GRANT ALL ON TABLE "public"."user_limits" TO "anon";
GRANT ALL ON TABLE "public"."user_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."user_limits" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































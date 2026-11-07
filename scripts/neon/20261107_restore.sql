-- BRAVER TOGETHER: schema-only recovery, source snapshot 2026-11-01.
-- Never run against a live database; private-file, Auth and E2E verification are separate gates.
DO $recovery$
BEGIN
PERFORM set_config('search_path','public,pg_catalog',true);
IF (SELECT count(*) FROM "auth"."audit_log_entries") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.audit_log_entries'; END IF;
IF (SELECT count(*) FROM "auth"."custom_oauth_providers") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.custom_oauth_providers'; END IF;
IF (SELECT count(*) FROM "auth"."flow_state") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.flow_state'; END IF;
IF (SELECT count(*) FROM "auth"."identities") <> 12 THEN RAISE EXCEPTION 'Target count mismatch: auth.identities'; END IF;
IF (SELECT count(*) FROM "auth"."instances") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.instances'; END IF;
IF (SELECT count(*) FROM "auth"."mfa_amr_claims") <> 12 THEN RAISE EXCEPTION 'Target count mismatch: auth.mfa_amr_claims'; END IF;
IF (SELECT count(*) FROM "auth"."mfa_challenges") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.mfa_challenges'; END IF;
IF (SELECT count(*) FROM "auth"."mfa_factors") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.mfa_factors'; END IF;
IF (SELECT count(*) FROM "auth"."mfa_recovery_code_sets") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.mfa_recovery_code_sets'; END IF;
IF (SELECT count(*) FROM "auth"."mfa_recovery_codes") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.mfa_recovery_codes'; END IF;
IF (SELECT count(*) FROM "auth"."oauth_authorizations") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.oauth_authorizations'; END IF;
IF (SELECT count(*) FROM "auth"."oauth_client_states") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.oauth_client_states'; END IF;
IF (SELECT count(*) FROM "auth"."oauth_clients") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.oauth_clients'; END IF;
IF (SELECT count(*) FROM "auth"."oauth_consents") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.oauth_consents'; END IF;
IF (SELECT count(*) FROM "auth"."one_time_tokens") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.one_time_tokens'; END IF;
IF (SELECT count(*) FROM "auth"."refresh_tokens") <> 67 THEN RAISE EXCEPTION 'Target count mismatch: auth.refresh_tokens'; END IF;
IF (SELECT count(*) FROM "auth"."saml_providers") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.saml_providers'; END IF;
IF (SELECT count(*) FROM "auth"."saml_relay_states") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.saml_relay_states'; END IF;
IF (SELECT count(*) FROM "auth"."schema_migrations") <> 82 THEN RAISE EXCEPTION 'Target count mismatch: auth.schema_migrations'; END IF;
IF (SELECT count(*) FROM "auth"."scim_tokens") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.scim_tokens'; END IF;
IF (SELECT count(*) FROM "auth"."scim_users") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.scim_users'; END IF;
IF (SELECT count(*) FROM "auth"."sessions") <> 12 THEN RAISE EXCEPTION 'Target count mismatch: auth.sessions'; END IF;
IF (SELECT count(*) FROM "auth"."sso_domains") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.sso_domains'; END IF;
IF (SELECT count(*) FROM "auth"."sso_providers") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.sso_providers'; END IF;
IF (SELECT count(*) FROM "auth"."users") <> 12 THEN RAISE EXCEPTION 'Target count mismatch: auth.users'; END IF;
IF (SELECT count(*) FROM "auth"."webauthn_challenges") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.webauthn_challenges'; END IF;
IF (SELECT count(*) FROM "auth"."webauthn_credentials") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: auth.webauthn_credentials'; END IF;
IF (SELECT count(*) FROM "public"."advisor_application_events") <> 1 THEN RAISE EXCEPTION 'Target count mismatch: public.advisor_application_events'; END IF;
IF (SELECT count(*) FROM "public"."advisor_applications") <> 1 THEN RAISE EXCEPTION 'Target count mismatch: public.advisor_applications'; END IF;
IF (SELECT count(*) FROM "public"."advisor_onboarding_intents") <> 4 THEN RAISE EXCEPTION 'Target count mismatch: public.advisor_onboarding_intents'; END IF;
IF (SELECT count(*) FROM "public"."ai_usage_daily") <> 9 THEN RAISE EXCEPTION 'Target count mismatch: public.ai_usage_daily'; END IF;
IF (SELECT count(*) FROM "public"."chapter_interest_submissions") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: public.chapter_interest_submissions'; END IF;
IF (SELECT count(*) FROM "public"."competitions") <> 2 THEN RAISE EXCEPTION 'Target count mismatch: public.competitions'; END IF;
IF (SELECT count(*) FROM "public"."conversation_reads") <> 11 THEN RAISE EXCEPTION 'Target count mismatch: public.conversation_reads'; END IF;
IF (SELECT count(*) FROM "public"."conversations") <> 9 THEN RAISE EXCEPTION 'Target count mismatch: public.conversations'; END IF;
IF (SELECT count(*) FROM "public"."essay_submission_events") <> 1 THEN RAISE EXCEPTION 'Target count mismatch: public.essay_submission_events'; END IF;
IF (SELECT count(*) FROM "public"."essay_submissions") <> 1 THEN RAISE EXCEPTION 'Target count mismatch: public.essay_submissions'; END IF;
IF (SELECT count(*) FROM "public"."meeting_proposals") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: public.meeting_proposals'; END IF;
IF (SELECT count(*) FROM "public"."messages") <> 24 THEN RAISE EXCEPTION 'Target count mismatch: public.messages'; END IF;
IF (SELECT count(*) FROM "public"."news_posts") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: public.news_posts'; END IF;
IF (SELECT count(*) FROM "public"."profiles") <> 12 THEN RAISE EXCEPTION 'Target count mismatch: public.profiles'; END IF;
IF (SELECT count(*) FROM "public"."public_advisors") <> 7 THEN RAISE EXCEPTION 'Target count mismatch: public.public_advisors'; END IF;
IF (SELECT count(*) FROM "public"."reports") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: public.reports'; END IF;
IF (SELECT count(*) FROM "public"."resource_categories") <> 6 THEN RAISE EXCEPTION 'Target count mismatch: public.resource_categories'; END IF;
IF (SELECT count(*) FROM "public"."resource_videos") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: public.resource_videos'; END IF;
IF (SELECT count(*) FROM "public"."user_roles") <> 15 THEN RAISE EXCEPTION 'Target count mismatch: public.user_roles'; END IF;
IF (SELECT count(*) FROM "storage"."buckets") <> 2 THEN RAISE EXCEPTION 'Target count mismatch: storage.buckets'; END IF;
IF (SELECT count(*) FROM "storage"."buckets_analytics") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: storage.buckets_analytics'; END IF;
IF (SELECT count(*) FROM "storage"."buckets_vectors") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: storage.buckets_vectors'; END IF;
IF (SELECT count(*) FROM "storage"."migrations") <> 74 THEN RAISE EXCEPTION 'Target count mismatch: storage.migrations'; END IF;
IF (SELECT count(*) FROM "storage"."objects") <> 1 THEN RAISE EXCEPTION 'Target count mismatch: storage.objects'; END IF;
IF (SELECT count(*) FROM "storage"."s3_multipart_uploads") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: storage.s3_multipart_uploads'; END IF;
IF (SELECT count(*) FROM "storage"."s3_multipart_uploads_parts") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: storage.s3_multipart_uploads_parts'; END IF;
IF (SELECT count(*) FROM "storage"."vector_indexes") <> 0 THEN RAISE EXCEPTION 'Target count mismatch: storage.vector_indexes'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN EXECUTE 'CREATE ROLE anon NOLOGIN;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN EXECUTE 'CREATE ROLE authenticated NOLOGIN;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN EXECUTE 'CREATE ROLE service_role NOLOGIN;'; END IF;
EXECUTE 'CREATE SCHEMA IF NOT EXISTS private;';
IF NOT EXISTS(SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname='app_role') THEN EXECUTE 'CREATE TYPE public.app_role AS ENUM (''admin'',''advisor'',''teen'');'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='storage' AND t.typname='buckettype') THEN EXECUTE 'CREATE TYPE storage.buckettype AS ENUM (''STANDARD'',''ANALYTICS'',''VECTOR'');'; END IF;
IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_roles' AND column_name='role' AND udt_name<>'app_role') THEN EXECUTE 'ALTER TABLE public.user_roles ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;'; END IF;
IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='storage' AND table_name='buckets' AND column_name='type' AND udt_name<>'buckettype') THEN EXECUTE 'ALTER TABLE storage.buckets ALTER COLUMN type TYPE storage.buckettype USING type::text::storage.buckettype;'; END IF;
IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='storage' AND table_name='buckets_analytics' AND column_name='type' AND udt_name<>'buckettype') THEN EXECUTE 'ALTER TABLE storage.buckets_analytics ALTER COLUMN type TYPE storage.buckettype USING type::text::storage.buckettype;'; END IF;
IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='storage' AND table_name='buckets_vectors' AND column_name='type' AND udt_name<>'buckettype') THEN EXECUTE 'ALTER TABLE storage.buckets_vectors ALTER COLUMN type TYPE storage.buckettype USING type::text::storage.buckettype;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.audit_log_entries'::regclass AND conname='audit_log_entries_pkey') THEN EXECUTE 'ALTER TABLE "auth"."audit_log_entries" ADD CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_pkey') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.flow_state'::regclass AND conname='flow_state_pkey') THEN EXECUTE 'ALTER TABLE "auth"."flow_state" ADD CONSTRAINT "flow_state_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.identities'::regclass AND conname='identities_pkey') THEN EXECUTE 'ALTER TABLE "auth"."identities" ADD CONSTRAINT "identities_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.instances'::regclass AND conname='instances_pkey') THEN EXECUTE 'ALTER TABLE "auth"."instances" ADD CONSTRAINT "instances_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_amr_claims'::regclass AND conname='amr_id_pk') THEN EXECUTE 'ALTER TABLE "auth"."mfa_amr_claims" ADD CONSTRAINT "amr_id_pk" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_challenges'::regclass AND conname='mfa_challenges_pkey') THEN EXECUTE 'ALTER TABLE "auth"."mfa_challenges" ADD CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_factors'::regclass AND conname='mfa_factors_pkey') THEN EXECUTE 'ALTER TABLE "auth"."mfa_factors" ADD CONSTRAINT "mfa_factors_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_recovery_code_sets'::regclass AND conname='mfa_recovery_code_sets_pkey') THEN EXECUTE 'ALTER TABLE "auth"."mfa_recovery_code_sets" ADD CONSTRAINT "mfa_recovery_code_sets_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_recovery_codes'::regclass AND conname='mfa_recovery_codes_pkey') THEN EXECUTE 'ALTER TABLE "auth"."mfa_recovery_codes" ADD CONSTRAINT "mfa_recovery_codes_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_pkey') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_client_states'::regclass AND conname='oauth_client_states_pkey') THEN EXECUTE 'ALTER TABLE "auth"."oauth_client_states" ADD CONSTRAINT "oauth_client_states_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_clients'::regclass AND conname='oauth_clients_pkey') THEN EXECUTE 'ALTER TABLE "auth"."oauth_clients" ADD CONSTRAINT "oauth_clients_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_consents'::regclass AND conname='oauth_consents_pkey') THEN EXECUTE 'ALTER TABLE "auth"."oauth_consents" ADD CONSTRAINT "oauth_consents_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.one_time_tokens'::regclass AND conname='one_time_tokens_pkey') THEN EXECUTE 'ALTER TABLE "auth"."one_time_tokens" ADD CONSTRAINT "one_time_tokens_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.refresh_tokens'::regclass AND conname='refresh_tokens_pkey') THEN EXECUTE 'ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.saml_providers'::regclass AND conname='saml_providers_pkey') THEN EXECUTE 'ALTER TABLE "auth"."saml_providers" ADD CONSTRAINT "saml_providers_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.saml_relay_states'::regclass AND conname='saml_relay_states_pkey') THEN EXECUTE 'ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.schema_migrations'::regclass AND conname='schema_migrations_pkey') THEN EXECUTE 'ALTER TABLE "auth"."schema_migrations" ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY (version);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.scim_tokens'::regclass AND conname='scim_tokens_pkey') THEN EXECUTE 'ALTER TABLE "auth"."scim_tokens" ADD CONSTRAINT "scim_tokens_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.scim_users'::regclass AND conname='scim_users_pkey') THEN EXECUTE 'ALTER TABLE "auth"."scim_users" ADD CONSTRAINT "scim_users_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.sessions'::regclass AND conname='sessions_pkey') THEN EXECUTE 'ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.sso_domains'::regclass AND conname='sso_domains_pkey') THEN EXECUTE 'ALTER TABLE "auth"."sso_domains" ADD CONSTRAINT "sso_domains_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.sso_providers'::regclass AND conname='sso_providers_pkey') THEN EXECUTE 'ALTER TABLE "auth"."sso_providers" ADD CONSTRAINT "sso_providers_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.users'::regclass AND conname='users_pkey') THEN EXECUTE 'ALTER TABLE "auth"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.webauthn_challenges'::regclass AND conname='webauthn_challenges_pkey') THEN EXECUTE 'ALTER TABLE "auth"."webauthn_challenges" ADD CONSTRAINT "webauthn_challenges_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.webauthn_credentials'::regclass AND conname='webauthn_credentials_pkey') THEN EXECUTE 'ALTER TABLE "auth"."webauthn_credentials" ADD CONSTRAINT "webauthn_credentials_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.advisor_application_events'::regclass AND conname='advisor_application_events_pkey') THEN EXECUTE 'ALTER TABLE "public"."advisor_application_events" ADD CONSTRAINT "advisor_application_events_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.advisor_applications'::regclass AND conname='advisor_applications_pkey') THEN EXECUTE 'ALTER TABLE "public"."advisor_applications" ADD CONSTRAINT "advisor_applications_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.advisor_onboarding_intents'::regclass AND conname='advisor_onboarding_intents_pkey') THEN EXECUTE 'ALTER TABLE "public"."advisor_onboarding_intents" ADD CONSTRAINT "advisor_onboarding_intents_pkey" PRIMARY KEY (user_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.ai_usage_daily'::regclass AND conname='ai_usage_daily_pkey') THEN EXECUTE 'ALTER TABLE "public"."ai_usage_daily" ADD CONSTRAINT "ai_usage_daily_pkey" PRIMARY KEY (feature, actor_key, usage_date);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.chapter_interest_submissions'::regclass AND conname='chapter_interest_submissions_pkey') THEN EXECUTE 'ALTER TABLE "public"."chapter_interest_submissions" ADD CONSTRAINT "chapter_interest_submissions_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.competitions'::regclass AND conname='competitions_pkey') THEN EXECUTE 'ALTER TABLE "public"."competitions" ADD CONSTRAINT "competitions_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.conversation_reads'::regclass AND conname='conversation_reads_pkey') THEN EXECUTE 'ALTER TABLE "public"."conversation_reads" ADD CONSTRAINT "conversation_reads_pkey" PRIMARY KEY (conversation_id, user_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.conversations'::regclass AND conname='conversations_pkey') THEN EXECUTE 'ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submission_events'::regclass AND conname='essay_submission_events_pkey') THEN EXECUTE 'ALTER TABLE "public"."essay_submission_events" ADD CONSTRAINT "essay_submission_events_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submissions'::regclass AND conname='essay_submissions_pkey') THEN EXECUTE 'ALTER TABLE "public"."essay_submissions" ADD CONSTRAINT "essay_submissions_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.meeting_proposals'::regclass AND conname='meeting_proposals_pkey') THEN EXECUTE 'ALTER TABLE "public"."meeting_proposals" ADD CONSTRAINT "meeting_proposals_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.messages'::regclass AND conname='messages_pkey') THEN EXECUTE 'ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.news_posts'::regclass AND conname='news_posts_pkey') THEN EXECUTE 'ALTER TABLE "public"."news_posts" ADD CONSTRAINT "news_posts_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.profiles'::regclass AND conname='profiles_pkey') THEN EXECUTE 'ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.public_advisors'::regclass AND conname='public_advisors_pkey') THEN EXECUTE 'ALTER TABLE "public"."public_advisors" ADD CONSTRAINT "public_advisors_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.reports'::regclass AND conname='reports_pkey') THEN EXECUTE 'ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.resource_categories'::regclass AND conname='resource_categories_pkey') THEN EXECUTE 'ALTER TABLE "public"."resource_categories" ADD CONSTRAINT "resource_categories_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.resource_videos'::regclass AND conname='resource_videos_pkey') THEN EXECUTE 'ALTER TABLE "public"."resource_videos" ADD CONSTRAINT "resource_videos_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.user_roles'::regclass AND conname='user_roles_pkey') THEN EXECUTE 'ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.buckets'::regclass AND conname='buckets_pkey') THEN EXECUTE 'ALTER TABLE "storage"."buckets" ADD CONSTRAINT "buckets_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.buckets_analytics'::regclass AND conname='buckets_analytics_pkey') THEN EXECUTE 'ALTER TABLE "storage"."buckets_analytics" ADD CONSTRAINT "buckets_analytics_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.buckets_vectors'::regclass AND conname='buckets_vectors_pkey') THEN EXECUTE 'ALTER TABLE "storage"."buckets_vectors" ADD CONSTRAINT "buckets_vectors_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.migrations'::regclass AND conname='migrations_pkey') THEN EXECUTE 'ALTER TABLE "storage"."migrations" ADD CONSTRAINT "migrations_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.objects'::regclass AND conname='objects_pkey') THEN EXECUTE 'ALTER TABLE "storage"."objects" ADD CONSTRAINT "objects_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.s3_multipart_uploads'::regclass AND conname='s3_multipart_uploads_pkey') THEN EXECUTE 'ALTER TABLE "storage"."s3_multipart_uploads" ADD CONSTRAINT "s3_multipart_uploads_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.s3_multipart_uploads_parts'::regclass AND conname='s3_multipart_uploads_parts_pkey') THEN EXECUTE 'ALTER TABLE "storage"."s3_multipart_uploads_parts" ADD CONSTRAINT "s3_multipart_uploads_parts_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.vector_indexes'::regclass AND conname='vector_indexes_pkey') THEN EXECUTE 'ALTER TABLE "storage"."vector_indexes" ADD CONSTRAINT "vector_indexes_pkey" PRIMARY KEY (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_identifier_key') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_identifier_key" UNIQUE (identifier);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.identities'::regclass AND conname='identities_provider_id_provider_unique') THEN EXECUTE 'ALTER TABLE "auth"."identities" ADD CONSTRAINT "identities_provider_id_provider_unique" UNIQUE (provider_id, provider);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_amr_claims'::regclass AND conname='mfa_amr_claims_session_id_authentication_method_pkey') THEN EXECUTE 'ALTER TABLE "auth"."mfa_amr_claims" ADD CONSTRAINT "mfa_amr_claims_session_id_authentication_method_pkey" UNIQUE (session_id, authentication_method);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_factors'::regclass AND conname='mfa_factors_last_challenged_at_key') THEN EXECUTE 'ALTER TABLE "auth"."mfa_factors" ADD CONSTRAINT "mfa_factors_last_challenged_at_key" UNIQUE (last_challenged_at);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_recovery_code_sets'::regclass AND conname='mfa_recovery_code_sets_mfa_factor_id_key') THEN EXECUTE 'ALTER TABLE "auth"."mfa_recovery_code_sets" ADD CONSTRAINT "mfa_recovery_code_sets_mfa_factor_id_key" UNIQUE (mfa_factor_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_recovery_code_sets'::regclass AND conname='mfa_recovery_code_sets_user_id_key') THEN EXECUTE 'ALTER TABLE "auth"."mfa_recovery_code_sets" ADD CONSTRAINT "mfa_recovery_code_sets_user_id_key" UNIQUE (user_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_authorization_code_key') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_authorization_code_key" UNIQUE (authorization_code);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_authorization_id_key') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_authorization_id_key" UNIQUE (authorization_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_consents'::regclass AND conname='oauth_consents_user_client_unique') THEN EXECUTE 'ALTER TABLE "auth"."oauth_consents" ADD CONSTRAINT "oauth_consents_user_client_unique" UNIQUE (user_id, client_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.refresh_tokens'::regclass AND conname='refresh_tokens_token_unique') THEN EXECUTE 'ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_token_unique" UNIQUE (token);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.saml_providers'::regclass AND conname='saml_providers_entity_id_key') THEN EXECUTE 'ALTER TABLE "auth"."saml_providers" ADD CONSTRAINT "saml_providers_entity_id_key" UNIQUE (entity_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.users'::regclass AND conname='users_phone_key') THEN EXECUTE 'ALTER TABLE "auth"."users" ADD CONSTRAINT "users_phone_key" UNIQUE (phone);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.advisor_applications'::regclass AND conname='advisor_applications_user_id_key') THEN EXECUTE 'ALTER TABLE "public"."advisor_applications" ADD CONSTRAINT "advisor_applications_user_id_key" UNIQUE (user_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.competitions'::regclass AND conname='competitions_slug_key') THEN EXECUTE 'ALTER TABLE "public"."competitions" ADD CONSTRAINT "competitions_slug_key" UNIQUE (slug);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.conversations'::regclass AND conname='conversations_teen_id_advisor_id_key') THEN EXECUTE 'ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_teen_id_advisor_id_key" UNIQUE (teen_id, advisor_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submissions'::regclass AND conname='essay_submissions_one_per_user') THEN EXECUTE 'ALTER TABLE "public"."essay_submissions" ADD CONSTRAINT "essay_submissions_one_per_user" UNIQUE (competition_id, user_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submissions'::regclass AND conname='essay_submissions_submission_code_key') THEN EXECUTE 'ALTER TABLE "public"."essay_submissions" ADD CONSTRAINT "essay_submissions_submission_code_key" UNIQUE (submission_code);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.news_posts'::regclass AND conname='news_posts_external_id_key') THEN EXECUTE 'ALTER TABLE "public"."news_posts" ADD CONSTRAINT "news_posts_external_id_key" UNIQUE (external_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.news_posts'::regclass AND conname='news_posts_link_key') THEN EXECUTE 'ALTER TABLE "public"."news_posts" ADD CONSTRAINT "news_posts_link_key" UNIQUE (link);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.public_advisors'::regclass AND conname='public_advisors_linked_user_id_key') THEN EXECUTE 'ALTER TABLE "public"."public_advisors" ADD CONSTRAINT "public_advisors_linked_user_id_key" UNIQUE (linked_user_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.resource_videos'::regclass AND conname='resource_videos_youtube_video_id_key') THEN EXECUTE 'ALTER TABLE "public"."resource_videos" ADD CONSTRAINT "resource_videos_youtube_video_id_key" UNIQUE (youtube_video_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.user_roles'::regclass AND conname='user_roles_user_id_role_key') THEN EXECUTE 'ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE (user_id, role);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.migrations'::regclass AND conname='migrations_name_key') THEN EXECUTE 'ALTER TABLE "storage"."migrations" ADD CONSTRAINT "migrations_name_key" UNIQUE (name);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_authorization_url_https') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_authorization_url_https" CHECK (((authorization_url IS NULL) OR (authorization_url ~~ ''https://%''::text)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_authorization_url_length') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_authorization_url_length" CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_client_id_length') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_client_id_length" CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_discovery_url_length') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_discovery_url_length" CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_identifier_format') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_identifier_format" CHECK ((identifier ~ ''^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$''::text));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_issuer_length') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_issuer_length" CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_jwks_uri_https') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_jwks_uri_https" CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ ''https://%''::text)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_jwks_uri_length') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_jwks_uri_length" CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_name_length') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_name_length" CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_oauth2_requires_endpoints') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_oauth2_requires_endpoints" CHECK (((provider_type <> ''oauth2''::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_oidc_discovery_url_https') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_oidc_discovery_url_https" CHECK (((provider_type <> ''oidc''::text) OR (discovery_url IS NULL) OR (discovery_url ~~ ''https://%''::text)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_oidc_issuer_https') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_oidc_issuer_https" CHECK (((provider_type <> ''oidc''::text) OR (issuer IS NULL) OR (issuer ~~ ''https://%''::text)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_oidc_requires_issuer') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_oidc_requires_issuer" CHECK (((provider_type <> ''oidc''::text) OR (issuer IS NOT NULL)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_provider_type_check') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_provider_type_check" CHECK ((provider_type = ANY (ARRAY[''oauth2''::text, ''oidc''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_token_url_https') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_token_url_https" CHECK (((token_url IS NULL) OR (token_url ~~ ''https://%''::text)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_token_url_length') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_token_url_length" CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_userinfo_url_https') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_userinfo_url_https" CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ ''https://%''::text)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.custom_oauth_providers'::regclass AND conname='custom_oauth_providers_userinfo_url_length') THEN EXECUTE 'ALTER TABLE "auth"."custom_oauth_providers" ADD CONSTRAINT "custom_oauth_providers_userinfo_url_length" CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_recovery_code_sets'::regclass AND conname='mfa_recovery_code_sets_failed_verification_count_check') THEN EXECUTE 'ALTER TABLE "auth"."mfa_recovery_code_sets" ADD CONSTRAINT "mfa_recovery_code_sets_failed_verification_count_check" CHECK ((failed_verification_count >= 0));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_authorization_code_length') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_authorization_code_length" CHECK ((char_length(authorization_code) <= 255));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_code_challenge_length') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_code_challenge_length" CHECK ((char_length(code_challenge) <= 128));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_expires_at_future') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_expires_at_future" CHECK ((expires_at > created_at));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_nonce_length') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_nonce_length" CHECK ((char_length(nonce) <= 255));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_redirect_uri_length') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_redirect_uri_length" CHECK ((char_length(redirect_uri) <= 2048));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_resource_length') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_resource_length" CHECK ((char_length(resource) <= 2048));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_scope_length') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_scope_length" CHECK ((char_length(scope) <= 4096));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_state_length') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_state_length" CHECK ((char_length(state) <= 4096));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_clients'::regclass AND conname='oauth_clients_client_name_length') THEN EXECUTE 'ALTER TABLE "auth"."oauth_clients" ADD CONSTRAINT "oauth_clients_client_name_length" CHECK ((char_length(client_name) <= 1024));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_clients'::regclass AND conname='oauth_clients_client_uri_length') THEN EXECUTE 'ALTER TABLE "auth"."oauth_clients" ADD CONSTRAINT "oauth_clients_client_uri_length" CHECK ((char_length(client_uri) <= 2048));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_clients'::regclass AND conname='oauth_clients_logo_uri_length') THEN EXECUTE 'ALTER TABLE "auth"."oauth_clients" ADD CONSTRAINT "oauth_clients_logo_uri_length" CHECK ((char_length(logo_uri) <= 2048));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_clients'::regclass AND conname='oauth_clients_token_endpoint_auth_method_check') THEN EXECUTE 'ALTER TABLE "auth"."oauth_clients" ADD CONSTRAINT "oauth_clients_token_endpoint_auth_method_check" CHECK ((token_endpoint_auth_method = ANY (ARRAY[''client_secret_basic''::text, ''client_secret_post''::text, ''none''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_consents'::regclass AND conname='oauth_consents_revoked_after_granted') THEN EXECUTE 'ALTER TABLE "auth"."oauth_consents" ADD CONSTRAINT "oauth_consents_revoked_after_granted" CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_consents'::regclass AND conname='oauth_consents_scopes_length') THEN EXECUTE 'ALTER TABLE "auth"."oauth_consents" ADD CONSTRAINT "oauth_consents_scopes_length" CHECK ((char_length(scopes) <= 2048));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_consents'::regclass AND conname='oauth_consents_scopes_not_empty') THEN EXECUTE 'ALTER TABLE "auth"."oauth_consents" ADD CONSTRAINT "oauth_consents_scopes_not_empty" CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.one_time_tokens'::regclass AND conname='one_time_tokens_token_hash_check') THEN EXECUTE 'ALTER TABLE "auth"."one_time_tokens" ADD CONSTRAINT "one_time_tokens_token_hash_check" CHECK ((char_length(token_hash) > 0));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.saml_providers'::regclass AND conname='entity_id not empty') THEN EXECUTE 'ALTER TABLE "auth"."saml_providers" ADD CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.saml_providers'::regclass AND conname='metadata_url not empty') THEN EXECUTE 'ALTER TABLE "auth"."saml_providers" ADD CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.saml_providers'::regclass AND conname='metadata_xml not empty') THEN EXECUTE 'ALTER TABLE "auth"."saml_providers" ADD CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.saml_relay_states'::regclass AND conname='request_id not empty') THEN EXECUTE 'ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.scim_tokens'::regclass AND conname='scim_tokens_expires_at_future') THEN EXECUTE 'ALTER TABLE "auth"."scim_tokens" ADD CONSTRAINT "scim_tokens_expires_at_future" CHECK (((expires_at IS NULL) OR (expires_at > created_at)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.scim_tokens'::regclass AND conname='scim_tokens_revoked_after_created') THEN EXECUTE 'ALTER TABLE "auth"."scim_tokens" ADD CONSTRAINT "scim_tokens_revoked_after_created" CHECK (((revoked_at IS NULL) OR (revoked_at >= created_at)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.scim_tokens'::regclass AND conname='scim_tokens_token_hash_check') THEN EXECUTE 'ALTER TABLE "auth"."scim_tokens" ADD CONSTRAINT "scim_tokens_token_hash_check" CHECK ((token_hash ~ ''^[0-9a-f]{64}$''::text));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.sessions'::regclass AND conname='sessions_scopes_length') THEN EXECUTE 'ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_scopes_length" CHECK ((char_length(scopes) <= 4096));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.sso_domains'::regclass AND conname='domain not empty') THEN EXECUTE 'ALTER TABLE "auth"."sso_domains" ADD CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.sso_providers'::regclass AND conname='resource_id not empty') THEN EXECUTE 'ALTER TABLE "auth"."sso_providers" ADD CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.users'::regclass AND conname='users_email_change_confirm_status_check') THEN EXECUTE 'ALTER TABLE "auth"."users" ADD CONSTRAINT "users_email_change_confirm_status_check" CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.webauthn_challenges'::regclass AND conname='webauthn_challenges_challenge_type_check') THEN EXECUTE 'ALTER TABLE "auth"."webauthn_challenges" ADD CONSTRAINT "webauthn_challenges_challenge_type_check" CHECK ((challenge_type = ANY (ARRAY[''signup''::text, ''registration''::text, ''authentication''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.advisor_applications'::regclass AND conname='advisor_applications_cv_mime_check') THEN EXECUTE 'ALTER TABLE "public"."advisor_applications" ADD CONSTRAINT "advisor_applications_cv_mime_check" CHECK (((cv_mime_type IS NULL) OR (cv_mime_type = ANY (ARRAY[''application/pdf''::text, ''application/vnd.openxmlformats-officedocument.wordprocessingml.document''::text]))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.advisor_applications'::regclass AND conname='advisor_applications_status_check') THEN EXECUTE 'ALTER TABLE "public"."advisor_applications" ADD CONSTRAINT "advisor_applications_status_check" CHECK ((status = ANY (ARRAY[''draft''::text, ''pending''::text, ''more_info''::text, ''approved''::text, ''denied''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.chapter_interest_submissions'::regclass AND conname='chapter_interest_submissions_age_check') THEN EXECUTE 'ALTER TABLE "public"."chapter_interest_submissions" ADD CONSTRAINT "chapter_interest_submissions_age_check" CHECK (((age >= 10) AND (age <= 120)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.chapter_interest_submissions'::regclass AND conname='chapter_interest_submissions_email_check') THEN EXECUTE 'ALTER TABLE "public"."chapter_interest_submissions" ADD CONSTRAINT "chapter_interest_submissions_email_check" CHECK (((char_length(email) >= 5) AND (char_length(email) <= 254)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.chapter_interest_submissions'::regclass AND conname='chapter_interest_submissions_interested_people_check') THEN EXECUTE 'ALTER TABLE "public"."chapter_interest_submissions" ADD CONSTRAINT "chapter_interest_submissions_interested_people_check" CHECK (((interested_people >= 1) AND (interested_people <= 100000)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.chapter_interest_submissions'::regclass AND conname='chapter_interest_submissions_location_check') THEN EXECUTE 'ALTER TABLE "public"."chapter_interest_submissions" ADD CONSTRAINT "chapter_interest_submissions_location_check" CHECK (((char_length(location) >= 2) AND (char_length(location) <= 160)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.chapter_interest_submissions'::regclass AND conname='chapter_interest_submissions_name_check') THEN EXECUTE 'ALTER TABLE "public"."chapter_interest_submissions" ADD CONSTRAINT "chapter_interest_submissions_name_check" CHECK (((char_length(name) >= 2) AND (char_length(name) <= 100)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.chapter_interest_submissions'::regclass AND conname='chapter_interest_submissions_nationality_check') THEN EXECUTE 'ALTER TABLE "public"."chapter_interest_submissions" ADD CONSTRAINT "chapter_interest_submissions_nationality_check" CHECK (((char_length(nationality) >= 2) AND (char_length(nationality) <= 100)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.chapter_interest_submissions'::regclass AND conname='chapter_interest_submissions_status_check') THEN EXECUTE 'ALTER TABLE "public"."chapter_interest_submissions" ADD CONSTRAINT "chapter_interest_submissions_status_check" CHECK ((status = ANY (ARRAY[''new''::text, ''contacted''::text, ''closed''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.competitions'::regclass AND conname='competitions_age_check') THEN EXECUTE 'ALTER TABLE "public"."competitions" ADD CONSTRAINT "competitions_age_check" CHECK ((((maximum_age >= 0) AND (maximum_age <= 120)) AND ((minimum_age IS NULL) OR ((minimum_age >= 0) AND (minimum_age <= maximum_age)))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.competitions'::regclass AND conname='competitions_category_check') THEN EXECUTE 'ALTER TABLE "public"."competitions" ADD CONSTRAINT "competitions_category_check" CHECK ((category = ANY (ARRAY[''essay''::text, ''public-speaking''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.competitions'::regclass AND conname='competitions_status_check') THEN EXECUTE 'ALTER TABLE "public"."competitions" ADD CONSTRAINT "competitions_status_check" CHECK ((status = ANY (ARRAY[''draft''::text, ''open''::text, ''closed''::text, ''judging''::text, ''published''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.competitions'::regclass AND conname='competitions_window_check') THEN EXECUTE 'ALTER TABLE "public"."competitions" ADD CONSTRAINT "competitions_window_check" CHECK (((opens_at IS NULL) OR (closes_at IS NULL) OR (closes_at > opens_at)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.competitions'::regclass AND conname='competitions_words_check') THEN EXECUTE 'ALTER TABLE "public"."competitions" ADD CONSTRAINT "competitions_words_check" CHECK ((((minimum_words IS NULL) OR (minimum_words > 0)) AND ((maximum_words IS NULL) OR (maximum_words > 0)) AND ((minimum_words IS NULL) OR (maximum_words IS NULL) OR (maximum_words >= minimum_words))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submissions'::regclass AND conname='essay_submissions_age_check') THEN EXECUTE 'ALTER TABLE "public"."essay_submissions" ADD CONSTRAINT "essay_submissions_age_check" CHECK (((participant_age >= 0) AND (participant_age <= 120)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submissions'::regclass AND conname='essay_submissions_revision_check') THEN EXECUTE 'ALTER TABLE "public"."essay_submissions" ADD CONSTRAINT "essay_submissions_revision_check" CHECK ((revision_number >= 0));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submissions'::regclass AND conname='essay_submissions_status_check') THEN EXECUTE 'ALTER TABLE "public"."essay_submissions" ADD CONSTRAINT "essay_submissions_status_check" CHECK ((status = ANY (ARRAY[''draft''::text, ''submitted''::text, ''under_review''::text, ''shortlisted''::text, ''winner''::text, ''not_selected''::text, ''disqualified''::text, ''withdrawn''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submissions'::regclass AND conname='essay_submissions_word_count_check') THEN EXECUTE 'ALTER TABLE "public"."essay_submissions" ADD CONSTRAINT "essay_submissions_word_count_check" CHECK (((declared_word_count >= 0) AND (declared_word_count <= 50000)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.meeting_proposals'::regclass AND conname='meeting_proposals_duration_check') THEN EXECUTE 'ALTER TABLE "public"."meeting_proposals" ADD CONSTRAINT "meeting_proposals_duration_check" CHECK (((duration_minutes >= 15) AND (duration_minutes <= 120)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.meeting_proposals'::regclass AND conname='meeting_proposals_status_check') THEN EXECUTE 'ALTER TABLE "public"."meeting_proposals" ADD CONSTRAINT "meeting_proposals_status_check" CHECK ((status = ANY (ARRAY[''pending''::text, ''accepted''::text, ''declined''::text, ''cancelled''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.messages'::regclass AND conname='messages_body_check') THEN EXECUTE 'ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_body_check" CHECK (((char_length(body) >= 1) AND (char_length(body) <= 4000)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.messages'::regclass AND conname='messages_sender_identity_check') THEN EXECUTE 'ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_sender_identity_check" CHECK ((((sender_kind = ''human''::text) AND (sender_id IS NOT NULL)) OR ((sender_kind = ANY (ARRAY[''ai''::text, ''system''::text])) AND (sender_id IS NULL))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.messages'::regclass AND conname='messages_sender_kind_check') THEN EXECUTE 'ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_sender_kind_check" CHECK ((sender_kind = ANY (ARRAY[''human''::text, ''ai''::text, ''system''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.profiles'::regclass AND conname='profiles_availability_status_check') THEN EXECUTE 'ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_availability_status_check" CHECK ((availability_status = ANY (ARRAY[''available''::text, ''busy''::text, ''offline''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.profiles'::regclass AND conname='profiles_max_active_conversations_check') THEN EXECUTE 'ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_max_active_conversations_check" CHECK (((max_active_conversations >= 1) AND (max_active_conversations <= 50)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.profiles'::regclass AND conname='profiles_public_requires_advisor') THEN EXECUTE 'ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_public_requires_advisor" CHECK (((is_public = false) OR (is_advisor = true)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.public_advisors'::regclass AND conname='public_advisors_photo_url_check') THEN EXECUTE 'ALTER TABLE "public"."public_advisors" ADD CONSTRAINT "public_advisors_photo_url_check" CHECK (((photo_url IS NULL) OR (photo_url ~~ ''/advisors/%''::text)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.reports'::regclass AND conname='reports_reason_check') THEN EXECUTE 'ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_reason_check" CHECK (((char_length(reason) >= 1) AND (char_length(reason) <= 1000)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.reports'::regclass AND conname='reports_status_check') THEN EXECUTE 'ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_status_check" CHECK ((status = ANY (ARRAY[''open''::text, ''reviewing''::text, ''resolved''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.buckets'::regclass AND conname='buckets_lifecycle_configuration_pair_check') THEN EXECUTE 'ALTER TABLE "storage"."buckets" ADD CONSTRAINT "buckets_lifecycle_configuration_pair_check" CHECK (((lifecycle_configuration IS NULL) = (lifecycle_configuration_generation IS NULL)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.buckets'::regclass AND conname='buckets_lifecycle_configuration_shape_check') THEN EXECUTE 'ALTER TABLE "storage"."buckets" ADD CONSTRAINT "buckets_lifecycle_configuration_shape_check" CHECK (((lifecycle_configuration IS NULL) OR ((jsonb_typeof(lifecycle_configuration) = ''object''::text) AND (lifecycle_configuration ? ''rules''::text) AND
CASE
    WHEN (jsonb_typeof((lifecycle_configuration -> ''rules''::text)) = ''array''::text) THEN ((jsonb_array_length((lifecycle_configuration -> ''rules''::text)) >= 1) AND (jsonb_array_length((lifecycle_configuration -> ''rules''::text)) <= 1000))
    ELSE false
END)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.buckets'::regclass AND conname='buckets_lifecycle_configuration_standard_only_check') THEN EXECUTE 'ALTER TABLE "storage"."buckets" ADD CONSTRAINT "buckets_lifecycle_configuration_standard_only_check" CHECK (((type = ''STANDARD''::storage.buckettype) OR ((lifecycle_configuration IS NULL) AND (lifecycle_configuration_generation IS NULL))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.buckets'::regclass AND conname='buckets_versioning_dark_check') THEN EXECUTE 'ALTER TABLE "storage"."buckets" ADD CONSTRAINT "buckets_versioning_dark_check" CHECK ((versioning_status = ''DISABLED''::text));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.buckets'::regclass AND conname='buckets_versioning_standard_only_check') THEN EXECUTE 'ALTER TABLE "storage"."buckets" ADD CONSTRAINT "buckets_versioning_standard_only_check" CHECK (((type = ''STANDARD''::storage.buckettype) OR (versioning_status = ''DISABLED''::text)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.buckets'::regclass AND conname='buckets_versioning_status_check') THEN EXECUTE 'ALTER TABLE "storage"."buckets" ADD CONSTRAINT "buckets_versioning_status_check" CHECK ((versioning_status = ANY (ARRAY[''DISABLED''::text, ''ENABLED''::text, ''SUSPENDED''::text])));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.identities'::regclass AND conname='identities_user_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."identities" ADD CONSTRAINT "identities_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_amr_claims'::regclass AND conname='mfa_amr_claims_session_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."mfa_amr_claims" ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_challenges'::regclass AND conname='mfa_challenges_auth_factor_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."mfa_challenges" ADD CONSTRAINT "mfa_challenges_auth_factor_id_fkey" FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_factors'::regclass AND conname='mfa_factors_user_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."mfa_factors" ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_recovery_code_sets'::regclass AND conname='mfa_recovery_code_sets_mfa_factor_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."mfa_recovery_code_sets" ADD CONSTRAINT "mfa_recovery_code_sets_mfa_factor_id_fkey" FOREIGN KEY (mfa_factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_recovery_code_sets'::regclass AND conname='mfa_recovery_code_sets_user_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."mfa_recovery_code_sets" ADD CONSTRAINT "mfa_recovery_code_sets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.mfa_recovery_codes'::regclass AND conname='mfa_recovery_codes_mfa_recovery_code_set_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."mfa_recovery_codes" ADD CONSTRAINT "mfa_recovery_codes_mfa_recovery_code_set_id_fkey" FOREIGN KEY (mfa_recovery_code_set_id) REFERENCES auth.mfa_recovery_code_sets(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_client_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_client_id_fkey" FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_authorizations'::regclass AND conname='oauth_authorizations_user_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_consents'::regclass AND conname='oauth_consents_client_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."oauth_consents" ADD CONSTRAINT "oauth_consents_client_id_fkey" FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.oauth_consents'::regclass AND conname='oauth_consents_user_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."oauth_consents" ADD CONSTRAINT "oauth_consents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.one_time_tokens'::regclass AND conname='one_time_tokens_user_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."one_time_tokens" ADD CONSTRAINT "one_time_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.refresh_tokens'::regclass AND conname='refresh_tokens_session_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.saml_providers'::regclass AND conname='saml_providers_sso_provider_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."saml_providers" ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.saml_relay_states'::regclass AND conname='saml_relay_states_flow_state_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.saml_relay_states'::regclass AND conname='saml_relay_states_sso_provider_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.scim_tokens'::regclass AND conname='scim_tokens_sso_provider_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."scim_tokens" ADD CONSTRAINT "scim_tokens_sso_provider_id_fkey" FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.scim_users'::regclass AND conname='scim_users_sso_provider_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."scim_users" ADD CONSTRAINT "scim_users_sso_provider_id_fkey" FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.scim_users'::regclass AND conname='scim_users_user_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."scim_users" ADD CONSTRAINT "scim_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.sessions'::regclass AND conname='sessions_oauth_client_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_oauth_client_id_fkey" FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.sessions'::regclass AND conname='sessions_user_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.sso_domains'::regclass AND conname='sso_domains_sso_provider_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."sso_domains" ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.webauthn_challenges'::regclass AND conname='webauthn_challenges_user_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."webauthn_challenges" ADD CONSTRAINT "webauthn_challenges_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='auth.webauthn_credentials'::regclass AND conname='webauthn_credentials_user_id_fkey') THEN EXECUTE 'ALTER TABLE "auth"."webauthn_credentials" ADD CONSTRAINT "webauthn_credentials_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.advisor_application_events'::regclass AND conname='advisor_application_events_actor_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."advisor_application_events" ADD CONSTRAINT "advisor_application_events_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.advisor_application_events'::regclass AND conname='advisor_application_events_application_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."advisor_application_events" ADD CONSTRAINT "advisor_application_events_application_id_fkey" FOREIGN KEY (application_id) REFERENCES advisor_applications(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.advisor_applications'::regclass AND conname='advisor_applications_reviewed_by_fkey') THEN EXECUTE 'ALTER TABLE "public"."advisor_applications" ADD CONSTRAINT "advisor_applications_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.advisor_applications'::regclass AND conname='advisor_applications_user_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."advisor_applications" ADD CONSTRAINT "advisor_applications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.advisor_onboarding_intents'::regclass AND conname='advisor_onboarding_intents_user_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."advisor_onboarding_intents" ADD CONSTRAINT "advisor_onboarding_intents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.conversation_reads'::regclass AND conname='conversation_reads_conversation_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."conversation_reads" ADD CONSTRAINT "conversation_reads_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.conversation_reads'::regclass AND conname='conversation_reads_user_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."conversation_reads" ADD CONSTRAINT "conversation_reads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.conversations'::regclass AND conname='conversations_advisor_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_advisor_id_fkey" FOREIGN KEY (advisor_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.conversations'::regclass AND conname='conversations_teen_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_teen_id_fkey" FOREIGN KEY (teen_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submission_events'::regclass AND conname='essay_submission_events_actor_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."essay_submission_events" ADD CONSTRAINT "essay_submission_events_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submission_events'::regclass AND conname='essay_submission_events_submission_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."essay_submission_events" ADD CONSTRAINT "essay_submission_events_submission_id_fkey" FOREIGN KEY (submission_id) REFERENCES essay_submissions(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submissions'::regclass AND conname='essay_submissions_competition_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."essay_submissions" ADD CONSTRAINT "essay_submissions_competition_id_fkey" FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE RESTRICT;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submissions'::regclass AND conname='essay_submissions_reviewed_by_fkey') THEN EXECUTE 'ALTER TABLE "public"."essay_submissions" ADD CONSTRAINT "essay_submissions_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.essay_submissions'::regclass AND conname='essay_submissions_user_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."essay_submissions" ADD CONSTRAINT "essay_submissions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.meeting_proposals'::regclass AND conname='meeting_proposals_conversation_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."meeting_proposals" ADD CONSTRAINT "meeting_proposals_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.meeting_proposals'::regclass AND conname='meeting_proposals_proposer_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."meeting_proposals" ADD CONSTRAINT "meeting_proposals_proposer_id_fkey" FOREIGN KEY (proposer_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.meeting_proposals'::regclass AND conname='meeting_proposals_responded_by_fkey') THEN EXECUTE 'ALTER TABLE "public"."meeting_proposals" ADD CONSTRAINT "meeting_proposals_responded_by_fkey" FOREIGN KEY (responded_by) REFERENCES auth.users(id) ON DELETE SET NULL;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.messages'::regclass AND conname='messages_conversation_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.messages'::regclass AND conname='messages_sender_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.profiles'::regclass AND conname='profiles_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.public_advisors'::regclass AND conname='public_advisors_linked_user_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."public_advisors" ADD CONSTRAINT "public_advisors_linked_user_id_fkey" FOREIGN KEY (linked_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.reports'::regclass AND conname='reports_conversation_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.reports'::regclass AND conname='reports_reporter_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY (reporter_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.reports'::regclass AND conname='reports_reviewed_by_fkey') THEN EXECUTE 'ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.resource_videos'::regclass AND conname='resource_videos_category_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."resource_videos" ADD CONSTRAINT "resource_videos_category_id_fkey" FOREIGN KEY (category_id) REFERENCES resource_categories(id) ON DELETE SET NULL;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.user_roles'::regclass AND conname='user_roles_user_id_fkey') THEN EXECUTE 'ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.objects'::regclass AND conname='objects_bucketId_fkey') THEN EXECUTE 'ALTER TABLE "storage"."objects" ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.s3_multipart_uploads'::regclass AND conname='s3_multipart_uploads_bucket_id_fkey') THEN EXECUTE 'ALTER TABLE "storage"."s3_multipart_uploads" ADD CONSTRAINT "s3_multipart_uploads_bucket_id_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.s3_multipart_uploads_parts'::regclass AND conname='s3_multipart_uploads_parts_bucket_id_fkey') THEN EXECUTE 'ALTER TABLE "storage"."s3_multipart_uploads_parts" ADD CONSTRAINT "s3_multipart_uploads_parts_bucket_id_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.s3_multipart_uploads_parts'::regclass AND conname='s3_multipart_uploads_parts_upload_id_fkey') THEN EXECUTE 'ALTER TABLE "storage"."s3_multipart_uploads_parts" ADD CONSTRAINT "s3_multipart_uploads_parts_upload_id_fkey" FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='storage.vector_indexes'::regclass AND conname='vector_indexes_bucket_id_fkey') THEN EXECUTE 'ALTER TABLE "storage"."vector_indexes" ADD CONSTRAINT "vector_indexes_bucket_id_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);'; END IF;
EXECUTE 'CREATE OR REPLACE FUNCTION auth.uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select
  coalesce(
    nullif(current_setting(''request.jwt.claim.sub'', true), ''''),
    (nullif(current_setting(''request.jwt.claims'', true), '''')::jsonb ->> ''sub'')
  )::uuid
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION auth.role()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select
  coalesce(
    nullif(current_setting(''request.jwt.claim.role'', true), ''''),
    (nullif(current_setting(''request.jwt.claims'', true), '''')::jsonb ->> ''role'')
  )::text
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION auth.email()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select
  coalesce(
    nullif(current_setting(''request.jwt.claim.email'', true), ''''),
    (nullif(current_setting(''request.jwt.claims'', true), '''')::jsonb ->> ''email'')
  )::text
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION auth.jwt()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select
    coalesce(
        nullif(current_setting(''request.jwt.claim'', true), ''''),
        nullif(current_setting(''request.jwt.claims'', true), '''')
    )::jsonb
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION public.create_support_request(p_user_id uuid, p_subject text, p_topic text, p_body text, p_advisor_id uuid, p_allow_ai boolean)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''''
AS $function$
DECLARE
  thread uuid;
BEGIN
  INSERT INTO public.conversations(
    teen_id,
    advisor_id,
    subject,
    topic,
    status,
    ai_fallback_enabled,
    ai_handoff_required
  )
  VALUES(
    p_user_id,
    p_advisor_id,
    p_subject,
    p_topic,
    ''open'',
    p_advisor_id IS NULL AND p_allow_ai,
    false
  )
  RETURNING id INTO thread;

  INSERT INTO public.messages(
    conversation_id,
    sender_id,
    sender_kind,
    body
  )
  VALUES(
    thread,
    p_user_id,
    ''human'',
    p_body
  );

  RETURN thread;
END;
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION public.bump_conversation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''public''
AS $function$
BEGIN
  UPDATE public.conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION public.touch_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''public''
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION public.guard_conversation_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''public''
AS $function$
DECLARE
  jwt_role text := COALESCE(current_setting(''request.jwt.claims'', true)::jsonb->>''role'', '''');
BEGIN
  IF jwt_role <> ''service_role'' AND pg_trigger_depth() = 1 THEN
    IF NEW.teen_id IS DISTINCT FROM OLD.teen_id
      OR NEW.advisor_id IS DISTINCT FROM OLD.advisor_id
      OR NEW.created_at IS DISTINCT FROM OLD.created_at
      OR NEW.last_message_at IS DISTINCT FROM OLD.last_message_at THEN
      RAISE EXCEPTION ''Conversation participants and timestamps cannot be changed'';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''public''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''public''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>''display_name'', split_part(NEW.email, ''@'', 1), ''Member''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, ''teen'');
  RETURN NEW;
END;
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION public.guard_advisor_flag()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''public''
AS $function$
DECLARE
  request_role text := COALESCE(current_setting(''request.jwt.claims'', true)::jsonb->>''role'', '''');
BEGIN
  IF request_role <> ''service_role''
     AND current_user NOT IN (''service_role'', ''postgres'', ''supabase_admin'') THEN
    NEW.is_advisor := OLD.is_advisor;
  END IF;

  IF NEW.is_advisor = false THEN
    NEW.is_public := false;
  END IF;

  RETURN NEW;
END;
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION public.touch_content_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''public''
AS $function$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION public.consume_ai_allowance(p_feature text, p_actor_key text, p_limit integer)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO ''''
AS $function$
DECLARE used integer;
BEGIN
 IF p_feature NOT IN (''decoder'',''support'') OR p_limit < 1 OR p_limit > 20 THEN RAISE EXCEPTION ''Invalid allowance''; END IF;
 INSERT INTO public.ai_usage_daily(feature,actor_key,usage_date,request_count,updated_at)
 VALUES(p_feature,p_actor_key,(now() AT TIME ZONE ''UTC'')::date,1,now())
 ON CONFLICT(feature,actor_key,usage_date) DO UPDATE SET request_count=public.ai_usage_daily.request_count+1,updated_at=now()
 WHERE public.ai_usage_daily.request_count < p_limit
 RETURNING request_count INTO used;
 IF used IS NULL THEN RAISE EXCEPTION ''Daily AI limit reached''; END IF;
 RETURN p_limit-used;
END; $function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION private.touch_competition_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''public'', ''pg_temp''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION private.guard_ai_message_delivery()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''''
AS $function$
DECLARE c public.conversations%ROWTYPE;
BEGIN
 IF NEW.sender_kind = ''ai'' THEN
  SELECT * INTO c FROM public.conversations WHERE id=NEW.conversation_id FOR UPDATE;
  IF NOT FOUND OR c.status <> ''open'' OR c.advisor_id IS NOT NULL OR NOT c.ai_fallback_enabled THEN
   RAISE EXCEPTION ''A human advisor is handling this request or AI is unavailable.'';
  END IF;
 END IF;
 RETURN NEW;
END; $function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION private.current_account_role()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''''
AS $function$
DECLARE u uuid := auth.uid(); a boolean; p boolean; approved boolean; member boolean;
BEGIN
 IF u IS NULL THEN RETURN ''restricted''; END IF;
 IF EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role=''admin'') THEN RETURN ''administrator''; END IF;
 SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role=''advisor''),
 EXISTS(SELECT 1 FROM public.profiles WHERE id=u AND is_advisor),
 EXISTS(SELECT 1 FROM public.advisor_applications WHERE user_id=u AND status=''approved''),
 EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role=''teen'') INTO a,p,approved,member;
 IF a AND p AND approved THEN RETURN ''advisor''; END IF;
 IF a OR p OR approved OR NOT member THEN RETURN ''restricted''; END IF;
 RETURN ''member'';
END; $function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION private.is_message_advisor(u uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''''
AS $function$
 SELECT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=u AND p.is_advisor AND p.is_public AND p.accepting_messages)
 AND EXISTS(SELECT 1 FROM public.advisor_applications WHERE user_id=u AND status=''approved'')
 AND EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role=''advisor'')
 AND NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role=''admin'');
$function$
;';
EXECUTE 'CREATE OR REPLACE FUNCTION private.guard_essay_finalization()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''''
AS $function$
DECLARE c public.competitions%ROWTYPE;
BEGIN
 IF NEW.status=''submitted'' AND (NEW.revision_number IS DISTINCT FROM OLD.revision_number OR NEW.file_path IS DISTINCT FROM OLD.file_path) THEN
  SELECT * INTO c FROM public.competitions WHERE id=NEW.competition_id FOR SHARE;
  IF c.status<>''open'' OR NOT c.is_public OR c.category<>''essay'' OR (c.opens_at IS NOT NULL AND c.opens_at>now()) OR (c.closes_at IS NOT NULL AND c.closes_at<=now()) THEN RAISE EXCEPTION ''Competition submissions are closed''; END IF;
  IF NEW.participant_age>c.maximum_age OR (c.minimum_age IS NOT NULL AND NEW.participant_age<c.minimum_age) OR (c.maximum_words IS NOT NULL AND NEW.declared_word_count>c.maximum_words) OR (c.minimum_words IS NOT NULL AND NEW.declared_word_count<c.minimum_words) THEN RAISE EXCEPTION ''Entry does not meet competition rules''; END IF;
  IF OLD.status NOT IN (''draft'',''submitted'',''withdrawn'') THEN RAISE EXCEPTION ''This entry is under review''; END IF;
 END IF;
 RETURN NEW;
END; $function$
;';
EXECUTE 'ALTER TABLE public."advisor_application_events" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_application_events" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."advisor_application_events" ALTER COLUMN "application_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_application_events" ALTER COLUMN "action" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_application_events" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_application_events" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "user_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "email" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "full_name" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "experience" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "motivation" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "focus_areas" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "focus_areas" SET DEFAULT ARRAY[]::text[];';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "status" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "status" SET DEFAULT ''draft''::text;';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "submitted_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "submitted_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "updated_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_applications" ALTER COLUMN "updated_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."advisor_onboarding_intents" ALTER COLUMN "user_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_onboarding_intents" ALTER COLUMN "started_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_onboarding_intents" ALTER COLUMN "started_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."advisor_onboarding_intents" ALTER COLUMN "updated_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."advisor_onboarding_intents" ALTER COLUMN "updated_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."ai_usage_daily" ALTER COLUMN "feature" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."ai_usage_daily" ALTER COLUMN "actor_key" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."ai_usage_daily" ALTER COLUMN "usage_date" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."ai_usage_daily" ALTER COLUMN "usage_date" SET DEFAULT CURRENT_DATE;';
EXECUTE 'ALTER TABLE public."ai_usage_daily" ALTER COLUMN "request_count" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."ai_usage_daily" ALTER COLUMN "request_count" SET DEFAULT 0;';
EXECUTE 'ALTER TABLE public."ai_usage_daily" ALTER COLUMN "updated_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."ai_usage_daily" ALTER COLUMN "updated_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ALTER COLUMN "name" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ALTER COLUMN "email" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ALTER COLUMN "nationality" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ALTER COLUMN "location" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ALTER COLUMN "age" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ALTER COLUMN "interested_people" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ALTER COLUMN "status" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ALTER COLUMN "status" SET DEFAULT ''new''::text;';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "slug" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "title" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "summary" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "summary" SET DEFAULT ''''::text;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "status" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "status" SET DEFAULT ''draft''::text;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "maximum_age" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "maximum_age" SET DEFAULT 18;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "is_public" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "is_public" SET DEFAULT true;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "updated_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "updated_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "category" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "category" SET DEFAULT ''essay''::text;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "prompts" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "prompts" SET DEFAULT ''{}''::text[];';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "public_rules" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."competitions" ALTER COLUMN "public_rules" SET DEFAULT ''''::text;';
EXECUTE 'ALTER TABLE public."conversation_reads" ALTER COLUMN "conversation_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversation_reads" ALTER COLUMN "user_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversation_reads" ALTER COLUMN "last_read_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversation_reads" ALTER COLUMN "last_read_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "teen_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "status" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "status" SET DEFAULT ''open''::text;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "last_message_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "last_message_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "subject" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "subject" SET DEFAULT ''Digital law question''::text;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "topic" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "topic" SET DEFAULT ''general''::text;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "ai_fallback_enabled" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "ai_fallback_enabled" SET DEFAULT false;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "ai_handoff_required" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "ai_handoff_required" SET DEFAULT false;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "updated_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."conversations" ALTER COLUMN "updated_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."essay_submission_events" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submission_events" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."essay_submission_events" ALTER COLUMN "submission_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submission_events" ALTER COLUMN "action" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submission_events" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submission_events" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "submission_code" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "competition_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "user_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "participant_name" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "participant_age" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "country" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "essay_title" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "declared_word_count" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "status" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "status" SET DEFAULT ''draft''::text;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "revision_number" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "revision_number" SET DEFAULT 0;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "updated_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."essay_submissions" ALTER COLUMN "updated_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "conversation_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "proposer_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "proposed_start" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "duration_minutes" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "duration_minutes" SET DEFAULT 30;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "timezone" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "title" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "title" SET DEFAULT ''BraverTogether advisor meeting''::text;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "meeting_url" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "status" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "status" SET DEFAULT ''pending''::text;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "updated_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ALTER COLUMN "updated_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."messages" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."messages" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."messages" ALTER COLUMN "conversation_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."messages" ALTER COLUMN "body" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."messages" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."messages" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."messages" ALTER COLUMN "sender_kind" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."messages" ALTER COLUMN "sender_kind" SET DEFAULT ''human''::text;';
EXECUTE 'ALTER TABLE public."messages" ALTER COLUMN "metadata" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."messages" ALTER COLUMN "metadata" SET DEFAULT ''{}''::jsonb;';
EXECUTE 'ALTER TABLE public."news_posts" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."news_posts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."news_posts" ALTER COLUMN "external_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."news_posts" ALTER COLUMN "title" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."news_posts" ALTER COLUMN "link" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."news_posts" ALTER COLUMN "excerpt" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."news_posts" ALTER COLUMN "excerpt" SET DEFAULT ''''::text;';
EXECUTE 'ALTER TABLE public."news_posts" ALTER COLUMN "author" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."news_posts" ALTER COLUMN "author" SET DEFAULT ''BraverTogether''::text;';
EXECUTE 'ALTER TABLE public."news_posts" ALTER COLUMN "synced_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."news_posts" ALTER COLUMN "synced_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "display_name" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "display_name" SET DEFAULT ''''::text;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "focus_areas" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "focus_areas" SET DEFAULT ARRAY[]::text[];';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "accepting_messages" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "accepting_messages" SET DEFAULT true;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "is_advisor" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "is_advisor" SET DEFAULT false;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "is_public" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "is_public" SET DEFAULT false;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "updated_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "updated_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "availability_status" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "availability_status" SET DEFAULT ''offline''::text;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "max_active_conversations" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."profiles" ALTER COLUMN "max_active_conversations" SET DEFAULT 5;';
EXECUTE 'ALTER TABLE public."public_advisors" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."public_advisors" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."public_advisors" ALTER COLUMN "display_name" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."public_advisors" ALTER COLUMN "sort_order" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."public_advisors" ALTER COLUMN "sort_order" SET DEFAULT 0;';
EXECUTE 'ALTER TABLE public."public_advisors" ALTER COLUMN "is_public" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."public_advisors" ALTER COLUMN "is_public" SET DEFAULT false;';
EXECUTE 'ALTER TABLE public."public_advisors" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."public_advisors" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."public_advisors" ALTER COLUMN "updated_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."public_advisors" ALTER COLUMN "updated_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."reports" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."reports" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."reports" ALTER COLUMN "conversation_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."reports" ALTER COLUMN "reporter_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."reports" ALTER COLUMN "reason" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."reports" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."reports" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."reports" ALTER COLUMN "status" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."reports" ALTER COLUMN "status" SET DEFAULT ''open''::text;';
EXECUTE 'ALTER TABLE public."resource_categories" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_categories" ALTER COLUMN "label" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_categories" ALTER COLUMN "sort_order" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_categories" ALTER COLUMN "sort_order" SET DEFAULT 0;';
EXECUTE 'ALTER TABLE public."resource_categories" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_categories" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "youtube_video_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "title" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "description" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "description" SET DEFAULT ''''::text;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "is_published" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "is_published" SET DEFAULT false;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "comments_enabled" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "comments_enabled" SET DEFAULT true;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "sort_order" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "sort_order" SET DEFAULT 0;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "created_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "updated_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."resource_videos" ALTER COLUMN "updated_at" SET DEFAULT now();';
EXECUTE 'ALTER TABLE public."user_roles" ALTER COLUMN "id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."user_roles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();';
EXECUTE 'ALTER TABLE public."user_roles" ALTER COLUMN "user_id" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."user_roles" ALTER COLUMN "role" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."user_roles" ALTER COLUMN "created_at" SET NOT NULL;';
EXECUTE 'ALTER TABLE public."user_roles" ALTER COLUMN "created_at" SET DEFAULT now();';
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='advisor_application_events_actor_idx') THEN EXECUTE 'CREATE INDEX advisor_application_events_actor_idx ON public.advisor_application_events USING btree (actor_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='advisor_application_events_application_idx') THEN EXECUTE 'CREATE INDEX advisor_application_events_application_idx ON public.advisor_application_events USING btree (application_id, created_at DESC);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='advisor_application_events_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX advisor_application_events_pkey ON public.advisor_application_events USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='advisor_applications_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX advisor_applications_pkey ON public.advisor_applications USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='advisor_applications_reviewer_idx') THEN EXECUTE 'CREATE INDEX advisor_applications_reviewer_idx ON public.advisor_applications USING btree (reviewed_by);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='advisor_applications_status_submitted_idx') THEN EXECUTE 'CREATE INDEX advisor_applications_status_submitted_idx ON public.advisor_applications USING btree (status, submitted_at DESC);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='advisor_applications_user_id_key') THEN EXECUTE 'CREATE UNIQUE INDEX advisor_applications_user_id_key ON public.advisor_applications USING btree (user_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='advisor_onboarding_incomplete_idx') THEN EXECUTE 'CREATE INDEX advisor_onboarding_incomplete_idx ON public.advisor_onboarding_intents USING btree (user_id) WHERE (completed_at IS NULL);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='advisor_onboarding_intents_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX advisor_onboarding_intents_pkey ON public.advisor_onboarding_intents USING btree (user_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='ai_usage_daily_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX ai_usage_daily_pkey ON public.ai_usage_daily USING btree (feature, actor_key, usage_date);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='chapter_interest_submissions_created_at_idx') THEN EXECUTE 'CREATE INDEX chapter_interest_submissions_created_at_idx ON public.chapter_interest_submissions USING btree (created_at DESC);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='chapter_interest_submissions_email_idx') THEN EXECUTE 'CREATE INDEX chapter_interest_submissions_email_idx ON public.chapter_interest_submissions USING btree (lower(email));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='chapter_interest_submissions_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX chapter_interest_submissions_pkey ON public.chapter_interest_submissions USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='competitions_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX competitions_pkey ON public.competitions USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='competitions_public_status_idx') THEN EXECUTE 'CREATE INDEX competitions_public_status_idx ON public.competitions USING btree (is_public, status, closes_at);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='competitions_slug_key') THEN EXECUTE 'CREATE UNIQUE INDEX competitions_slug_key ON public.competitions USING btree (slug);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='conversation_reads_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX conversation_reads_pkey ON public.conversation_reads USING btree (conversation_id, user_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='conversation_reads_user_idx') THEN EXECUTE 'CREATE INDEX conversation_reads_user_idx ON public.conversation_reads USING btree (user_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='conversations_advisor_last_message_idx') THEN EXECUTE 'CREATE INDEX conversations_advisor_last_message_idx ON public.conversations USING btree (advisor_id, last_message_at DESC);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='conversations_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='conversations_queue_idx') THEN EXECUTE 'CREATE INDEX conversations_queue_idx ON public.conversations USING btree (status, advisor_id, created_at);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='conversations_teen_id_advisor_id_key') THEN EXECUTE 'CREATE UNIQUE INDEX conversations_teen_id_advisor_id_key ON public.conversations USING btree (teen_id, advisor_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='conversations_teen_last_message_idx') THEN EXECUTE 'CREATE INDEX conversations_teen_last_message_idx ON public.conversations USING btree (teen_id, last_message_at DESC);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='essay_submission_events_actor_idx') THEN EXECUTE 'CREATE INDEX essay_submission_events_actor_idx ON public.essay_submission_events USING btree (actor_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='essay_submission_events_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX essay_submission_events_pkey ON public.essay_submission_events USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='essay_submission_events_submission_idx') THEN EXECUTE 'CREATE INDEX essay_submission_events_submission_idx ON public.essay_submission_events USING btree (submission_id, created_at DESC);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='essay_submissions_competition_status_idx') THEN EXECUTE 'CREATE INDEX essay_submissions_competition_status_idx ON public.essay_submissions USING btree (competition_id, status, submitted_at DESC);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='essay_submissions_one_per_user') THEN EXECUTE 'CREATE UNIQUE INDEX essay_submissions_one_per_user ON public.essay_submissions USING btree (competition_id, user_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='essay_submissions_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX essay_submissions_pkey ON public.essay_submissions USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='essay_submissions_reviewer_idx') THEN EXECUTE 'CREATE INDEX essay_submissions_reviewer_idx ON public.essay_submissions USING btree (reviewed_by);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='essay_submissions_submission_code_key') THEN EXECUTE 'CREATE UNIQUE INDEX essay_submissions_submission_code_key ON public.essay_submissions USING btree (submission_code);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='essay_submissions_user_idx') THEN EXECUTE 'CREATE INDEX essay_submissions_user_idx ON public.essay_submissions USING btree (user_id, updated_at DESC);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='meeting_proposals_conversation_created_idx') THEN EXECUTE 'CREATE INDEX meeting_proposals_conversation_created_idx ON public.meeting_proposals USING btree (conversation_id, created_at DESC);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='meeting_proposals_participant_status_idx') THEN EXECUTE 'CREATE INDEX meeting_proposals_participant_status_idx ON public.meeting_proposals USING btree (proposer_id, status, proposed_start);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='meeting_proposals_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX meeting_proposals_pkey ON public.meeting_proposals USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='meeting_proposals_responder_idx') THEN EXECUTE 'CREATE INDEX meeting_proposals_responder_idx ON public.meeting_proposals USING btree (responded_by);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='messages_conversation_idx') THEN EXECUTE 'CREATE INDEX messages_conversation_idx ON public.messages USING btree (conversation_id, created_at);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='messages_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='messages_sender_idx') THEN EXECUTE 'CREATE INDEX messages_sender_idx ON public.messages USING btree (sender_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='news_posts_external_id_key') THEN EXECUTE 'CREATE UNIQUE INDEX news_posts_external_id_key ON public.news_posts USING btree (external_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='news_posts_link_key') THEN EXECUTE 'CREATE UNIQUE INDEX news_posts_link_key ON public.news_posts USING btree (link);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='news_posts_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX news_posts_pkey ON public.news_posts USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='news_posts_pub_date_idx') THEN EXECUTE 'CREATE INDEX news_posts_pub_date_idx ON public.news_posts USING btree (pub_date DESC);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='profiles_advisor_availability_idx') THEN EXECUTE 'CREATE INDEX profiles_advisor_availability_idx ON public.profiles USING btree (is_advisor, is_public, accepting_messages, availability_status);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='profiles_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='profiles_public_advisors_idx') THEN EXECUTE 'CREATE INDEX profiles_public_advisors_idx ON public.profiles USING btree (created_at) WHERE ((is_advisor = true) AND (is_public = true));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='public_advisors_linked_user_id_key') THEN EXECUTE 'CREATE UNIQUE INDEX public_advisors_linked_user_id_key ON public.public_advisors USING btree (linked_user_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='public_advisors_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX public_advisors_pkey ON public.public_advisors USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='public_advisors_public_order_idx') THEN EXECUTE 'CREATE INDEX public_advisors_public_order_idx ON public.public_advisors USING btree (is_public, sort_order);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='reports_conversation_idx') THEN EXECUTE 'CREATE INDEX reports_conversation_idx ON public.reports USING btree (conversation_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='reports_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='reports_reporter_idx') THEN EXECUTE 'CREATE INDEX reports_reporter_idx ON public.reports USING btree (reporter_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='reports_reviewed_by_idx') THEN EXECUTE 'CREATE INDEX reports_reviewed_by_idx ON public.reports USING btree (reviewed_by);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='reports_status_created_idx') THEN EXECUTE 'CREATE INDEX reports_status_created_idx ON public.reports USING btree (status, created_at DESC);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='resource_categories_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX resource_categories_pkey ON public.resource_categories USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='resource_videos_category_idx') THEN EXECUTE 'CREATE INDEX resource_videos_category_idx ON public.resource_videos USING btree (category_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='resource_videos_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX resource_videos_pkey ON public.resource_videos USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='resource_videos_public_idx') THEN EXECUTE 'CREATE INDEX resource_videos_public_idx ON public.resource_videos USING btree (is_published, sort_order, created_at);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='resource_videos_youtube_video_id_key') THEN EXECUTE 'CREATE UNIQUE INDEX resource_videos_youtube_video_id_key ON public.resource_videos USING btree (youtube_video_id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='user_roles_pkey') THEN EXECUTE 'CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='user_roles_user_id_role_key') THEN EXECUTE 'CREATE UNIQUE INDEX user_roles_user_id_role_key ON public.user_roles USING btree (user_id, role);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='auth.users'::regclass AND tgname='on_auth_user_created') THEN EXECUTE 'CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.profiles'::regclass AND tgname='profiles_touch') THEN EXECUTE 'CREATE TRIGGER profiles_touch BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION touch_updated_at();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.messages'::regclass AND tgname='messages_bump_conversation') THEN EXECUTE 'CREATE TRIGGER messages_bump_conversation AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION bump_conversation();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.profiles'::regclass AND tgname='profiles_guard_advisor_flag') THEN EXECUTE 'CREATE TRIGGER profiles_guard_advisor_flag BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION guard_advisor_flag();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.conversations'::regclass AND tgname='conversations_guard_update') THEN EXECUTE 'CREATE TRIGGER conversations_guard_update BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION guard_conversation_update();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.resource_videos'::regclass AND tgname='resource_videos_touch') THEN EXECUTE 'CREATE TRIGGER resource_videos_touch BEFORE UPDATE ON resource_videos FOR EACH ROW EXECUTE FUNCTION touch_content_updated_at();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.conversations'::regclass AND tgname='conversations_touch') THEN EXECUTE 'CREATE TRIGGER conversations_touch BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION touch_content_updated_at();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.advisor_applications'::regclass AND tgname='advisor_applications_touch') THEN EXECUTE 'CREATE TRIGGER advisor_applications_touch BEFORE UPDATE ON advisor_applications FOR EACH ROW EXECUTE FUNCTION touch_content_updated_at();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.meeting_proposals'::regclass AND tgname='meeting_proposals_touch') THEN EXECUTE 'CREATE TRIGGER meeting_proposals_touch BEFORE UPDATE ON meeting_proposals FOR EACH ROW EXECUTE FUNCTION touch_content_updated_at();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.competitions'::regclass AND tgname='competitions_touch') THEN EXECUTE 'CREATE TRIGGER competitions_touch BEFORE UPDATE ON competitions FOR EACH ROW EXECUTE FUNCTION private.touch_competition_updated_at();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.essay_submissions'::regclass AND tgname='essay_submissions_touch') THEN EXECUTE 'CREATE TRIGGER essay_submissions_touch BEFORE UPDATE ON essay_submissions FOR EACH ROW EXECUTE FUNCTION private.touch_competition_updated_at();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.advisor_onboarding_intents'::regclass AND tgname='advisor_onboarding_intents_touch') THEN EXECUTE 'CREATE TRIGGER advisor_onboarding_intents_touch BEFORE UPDATE ON advisor_onboarding_intents FOR EACH ROW EXECUTE FUNCTION touch_content_updated_at();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.messages'::regclass AND tgname='guard_ai_message_delivery') THEN EXECUTE 'CREATE TRIGGER guard_ai_message_delivery BEFORE INSERT ON messages FOR EACH ROW EXECUTE FUNCTION private.guard_ai_message_delivery();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.public_advisors'::regclass AND tgname='public_advisors_touch') THEN EXECUTE 'CREATE TRIGGER public_advisors_touch BEFORE UPDATE ON public_advisors FOR EACH ROW EXECUTE FUNCTION private.touch_competition_updated_at();'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.essay_submissions'::regclass AND tgname='guard_essay_finalization') THEN EXECUTE 'CREATE TRIGGER guard_essay_finalization BEFORE UPDATE ON essay_submissions FOR EACH ROW EXECUTE FUNCTION private.guard_essay_finalization();'; END IF;
EXECUTE 'ALTER TABLE public."advisor_application_events" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."advisor_applications" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."advisor_onboarding_intents" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."ai_usage_daily" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."chapter_interest_submissions" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."competitions" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."conversation_reads" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."conversations" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."essay_submission_events" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."essay_submissions" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."meeting_proposals" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."messages" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."news_posts" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."profiles" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."public_advisors" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."reports" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."resource_categories" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."resource_videos" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'ALTER TABLE public."user_roles" ENABLE ROW LEVEL SECURITY;';
EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC,anon,authenticated;';
EXECUTE 'GRANT USAGE ON SCHEMA public,auth TO anon,authenticated;';
EXECUTE 'GRANT USAGE ON SCHEMA private TO authenticated;';
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='advisor_application_events' AND policyname='clients cannot access advisor application events') THEN EXECUTE 'CREATE POLICY "clients cannot access advisor application events" ON "public"."advisor_application_events" AS PERMISSIVE FOR ALL TO "anon","authenticated" USING (false) WITH CHECK (false);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='advisor_applications' AND policyname='applicants read own application') THEN EXECUTE 'CREATE POLICY "applicants read own application" ON "public"."advisor_applications" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.has_role(( SELECT auth.uid() AS uid), ''admin''::app_role) AS has_role)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='advisor_onboarding_intents' AND policyname='applicants read own onboarding intent') THEN EXECUTE 'CREATE POLICY "applicants read own onboarding intent" ON "public"."advisor_onboarding_intents" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((( SELECT auth.uid() AS uid) = user_id));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ai_usage_daily' AND policyname='clients cannot access ai usage') THEN EXECUTE 'CREATE POLICY "clients cannot access ai usage" ON "public"."ai_usage_daily" AS PERMISSIVE FOR ALL TO "anon","authenticated" USING (false) WITH CHECK (false);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='competitions' AND policyname='public read announced competitions') THEN EXECUTE 'CREATE POLICY "public read announced competitions" ON "public"."competitions" AS PERMISSIVE FOR SELECT TO PUBLIC USING (((is_public = true) AND (status <> ''draft''::text)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversation_reads' AND policyname='users create own conversation read state') THEN EXECUTE 'CREATE POLICY "users create own conversation read state" ON "public"."conversation_reads" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM conversations c
  WHERE ((c.id = conversation_reads.conversation_id) AND ((c.teen_id = ( SELECT auth.uid() AS uid)) OR (c.advisor_id = ( SELECT auth.uid() AS uid))))))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversation_reads' AND policyname='users read own conversation read state') THEN EXECUTE 'CREATE POLICY "users read own conversation read state" ON "public"."conversation_reads" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((user_id = ( SELECT auth.uid() AS uid)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversation_reads' AND policyname='users update own conversation read state') THEN EXECUTE 'CREATE POLICY "users update own conversation read state" ON "public"."conversation_reads" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversations' AND policyname='participants or advisors read conversations') THEN EXECUTE 'CREATE POLICY "participants or advisors read conversations" ON "public"."conversations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((((teen_id = ( SELECT auth.uid() AS uid)) AND (( SELECT private.current_account_role() AS current_account_role) = ''member''::text)) OR ((advisor_id = ( SELECT auth.uid() AS uid)) AND (( SELECT private.current_account_role() AS current_account_role) = ''advisor''::text)) OR ((advisor_id IS NULL) AND (status = ''open''::text) AND (( SELECT private.current_account_role() AS current_account_role) = ''advisor''::text))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversations' AND policyname='teens create support requests') THEN EXECUTE 'CREATE POLICY "teens create support requests" ON "public"."conversations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((teen_id = ( SELECT auth.uid() AS uid)) AND (( SELECT private.current_account_role() AS current_account_role) = ''member''::text) AND ((advisor_id IS NULL) OR private.is_message_advisor(advisor_id))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='essay_submission_events' AND policyname='service only essay submission events') THEN EXECUTE 'CREATE POLICY "service only essay submission events" ON "public"."essay_submission_events" AS PERMISSIVE FOR ALL TO PUBLIC USING (false) WITH CHECK (false);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='essay_submissions' AND policyname='service only essay submissions') THEN EXECUTE 'CREATE POLICY "service only essay submissions" ON "public"."essay_submissions" AS PERMISSIVE FOR ALL TO PUBLIC USING (false) WITH CHECK (false);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meeting_proposals' AND policyname='participants read meeting proposals') THEN EXECUTE 'CREATE POLICY "participants read meeting proposals" ON "public"."meeting_proposals" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM conversations c
  WHERE ((c.id = meeting_proposals.conversation_id) AND ((c.teen_id = ( SELECT auth.uid() AS uid)) OR (c.advisor_id = ( SELECT auth.uid() AS uid)))))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='participants read messages') THEN EXECUTE 'CREATE POLICY "participants read messages" ON "public"."messages" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM conversations c
  WHERE ((c.id = messages.conversation_id) AND ((c.teen_id = ( SELECT auth.uid() AS uid)) OR (c.advisor_id = ( SELECT auth.uid() AS uid)))))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='participants send human messages') THEN EXECUTE 'CREATE POLICY "participants send human messages" ON "public"."messages" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((sender_kind = ''human''::text) AND (sender_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM conversations c
  WHERE ((c.id = messages.conversation_id) AND (c.status = ''open''::text) AND ((c.teen_id = ( SELECT auth.uid() AS uid)) OR (c.advisor_id = ( SELECT auth.uid() AS uid))))))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='news_posts' AND policyname='public read cached news') THEN EXECUTE 'CREATE POLICY "public read cached news" ON "public"."news_posts" AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='anon reads public advisor profiles') THEN EXECUTE 'CREATE POLICY "anon reads public advisor profiles" ON "public"."profiles" AS PERMISSIVE FOR SELECT TO "anon" USING (((is_advisor = true) AND (is_public = true)));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='authenticated reads profiles') THEN EXECUTE 'CREATE POLICY "authenticated reads profiles" ON "public"."profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((id = ( SELECT auth.uid() AS uid)) OR ((is_advisor = true) AND (is_public = true))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='users insert own profile') THEN EXECUTE 'CREATE POLICY "users insert own profile" ON "public"."profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((( SELECT auth.uid() AS uid) = id));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='users update own profile') THEN EXECUTE 'CREATE POLICY "users update own profile" ON "public"."profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((( SELECT auth.uid() AS uid) = id)) WITH CHECK ((( SELECT auth.uid() AS uid) = id));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='public_advisors' AND policyname='published advisor directory') THEN EXECUTE 'CREATE POLICY "published advisor directory" ON "public"."public_advisors" AS PERMISSIVE FOR SELECT TO "anon","authenticated" USING (is_public);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reports' AND policyname='admins read reports') THEN EXECUTE 'CREATE POLICY "admins read reports" ON "public"."reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM user_roles role_row
  WHERE ((role_row.user_id = ( SELECT auth.uid() AS uid)) AND (role_row.role = ''admin''::app_role)))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reports' AND policyname='participants file report') THEN EXECUTE 'CREATE POLICY "participants file report" ON "public"."reports" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((reporter_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM conversations conversation
  WHERE ((conversation.id = reports.conversation_id) AND ((conversation.teen_id = ( SELECT auth.uid() AS uid)) OR (conversation.advisor_id = ( SELECT auth.uid() AS uid))))))));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='resource_categories' AND policyname='public read resource categories') THEN EXECUTE 'CREATE POLICY "public read resource categories" ON "public"."resource_categories" AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='resource_videos' AND policyname='public read published videos') THEN EXECUTE 'CREATE POLICY "public read published videos" ON "public"."resource_videos" AS PERMISSIVE FOR SELECT TO PUBLIC USING ((is_published = true));'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='users read own roles') THEN EXECUTE 'CREATE POLICY "users read own roles" ON "public"."user_roles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((( SELECT auth.uid() AS uid) = user_id));'; END IF;
EXECUTE 'GRANT DELETE,INSERT,SELECT,UPDATE ON public."advisor_application_events" TO anon;';
EXECUTE 'GRANT DELETE,INSERT,SELECT,UPDATE ON public."ai_usage_daily" TO anon;';
EXECUTE 'GRANT SELECT ON public."competitions" TO anon;';
EXECUTE 'GRANT DELETE,INSERT,SELECT,UPDATE ON public."essay_submission_events" TO anon;';
EXECUTE 'GRANT DELETE,INSERT,SELECT,UPDATE ON public."essay_submissions" TO anon;';
EXECUTE 'GRANT SELECT ON public."news_posts" TO anon;';
EXECUTE 'GRANT SELECT ON public."profiles" TO anon;';
EXECUTE 'GRANT SELECT ON public."public_advisors" TO anon;';
EXECUTE 'GRANT SELECT ON public."resource_categories" TO anon;';
EXECUTE 'GRANT SELECT ON public."resource_videos" TO anon;';
EXECUTE 'GRANT DELETE,INSERT,SELECT,UPDATE ON public."advisor_application_events" TO authenticated;';
EXECUTE 'GRANT SELECT ON public."advisor_applications" TO authenticated;';
EXECUTE 'GRANT SELECT ON public."advisor_onboarding_intents" TO authenticated;';
EXECUTE 'GRANT DELETE,INSERT,SELECT,UPDATE ON public."ai_usage_daily" TO authenticated;';
EXECUTE 'GRANT SELECT ON public."competitions" TO authenticated;';
EXECUTE 'GRANT INSERT,SELECT,UPDATE ON public."conversation_reads" TO authenticated;';
EXECUTE 'GRANT INSERT,SELECT ON public."conversations" TO authenticated;';
EXECUTE 'GRANT DELETE,INSERT,SELECT,UPDATE ON public."essay_submission_events" TO authenticated;';
EXECUTE 'GRANT DELETE,INSERT,SELECT,UPDATE ON public."essay_submissions" TO authenticated;';
EXECUTE 'GRANT SELECT ON public."meeting_proposals" TO authenticated;';
EXECUTE 'GRANT INSERT,SELECT ON public."messages" TO authenticated;';
EXECUTE 'GRANT SELECT ON public."news_posts" TO authenticated;';
EXECUTE 'GRANT INSERT,SELECT,UPDATE ON public."profiles" TO authenticated;';
EXECUTE 'GRANT SELECT ON public."public_advisors" TO authenticated;';
EXECUTE 'GRANT INSERT,SELECT ON public."reports" TO authenticated;';
EXECUTE 'GRANT SELECT ON public."resource_categories" TO authenticated;';
EXECUTE 'GRANT SELECT ON public."resource_videos" TO authenticated;';
EXECUTE 'GRANT SELECT ON public."user_roles" TO authenticated;';
EXECUTE 'REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA auth,private,public FROM PUBLIC;';
EXECUTE 'GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated;';
EXECUTE 'GRANT EXECUTE ON FUNCTION auth.jwt() TO anon,authenticated;';
EXECUTE 'GRANT EXECUTE ON FUNCTION auth.role() TO authenticated;';
EXECUTE 'GRANT EXECUTE ON FUNCTION auth.email() TO authenticated;';
EXECUTE 'GRANT EXECUTE ON FUNCTION private.has_role(uuid,public.app_role) TO authenticated;';
EXECUTE 'GRANT EXECUTE ON FUNCTION private.current_account_role() TO authenticated;';
EXECUTE 'GRANT EXECUTE ON FUNCTION private.is_message_advisor(uuid) TO authenticated;';
END $recovery$;

# SHELL	:= sh
# PATH	:= node_modules/.bin:.:$(PATH)
SHELL := /bin/bash

# DEV commands

setup:
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local 2>/dev/null || exit 1; \
	fi; \
	pnpm install; \
	pnpx supabase start; \
	STATUS_JSON=$$(pnpx supabase status -o json 2>/dev/null | jq . 2>/dev/null); \
	if [ -z "$$STATUS_JSON" ] || [ "$$STATUS_JSON" = "{}" ]; then \
		sleep 3; \
		STATUS_JSON=$$(pnpx supabase status -o json 2>/dev/null | jq . 2>/dev/null); \
	fi; \
	SUPABASE_PUBLISHABLE_KEY=$$(echo "$$STATUS_JSON" | jq -r '.PUBLISHABLE_KEY // empty'); \
	SUPABASE_SERVICE_KEY=$$(echo "$$STATUS_JSON" | jq -r '.SECRET_KEY // empty'); \
	if [ -z "$$SUPABASE_PUBLISHABLE_KEY" ] || [ -z "$$SUPABASE_SERVICE_KEY" ]; then \
		echo "Error: Failed to get keys from Supabase!"; \
		exit 1; \
	fi; \
	if grep -q "^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=" .env.local 2>/dev/null; then \
		sed -i.bak "s|^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$$SUPABASE_PUBLISHABLE_KEY|" .env.local && rm -f .env.local.bak; \
	else \
		echo "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$$SUPABASE_PUBLISHABLE_KEY" >> .env.local; \
	fi; \
	if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" .env.local 2>/dev/null; then \
		sed -i.bak "s|^SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$$SUPABASE_SERVICE_KEY|" .env.local && rm -f .env.local.bak; \
	else \
		echo "SUPABASE_SERVICE_ROLE_KEY=$$SUPABASE_SERVICE_KEY" >> .env.local; \
	fi; \
	echo "✓ Environment keys updated"
	make db/seed-dev

install:
	pnpm install

dev:
	pnpm supabase start
	make storage/sync
	make db/migrate
	cmd.exe /c start http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null || open http://localhost:8080 2>/dev/null || echo "Can't open Next.js in your browser"
	pnpm dev

stop:
	pnpm supabase stop

status:
	pnpx supabase status

test:
	make tsc
	pnpm lint

tsc:
	pnpm tsc --noEmit

# DB commands

db/diff:
	pnpm supabase db diff

db/reset:
	pnpm supabase db reset
	make db/migrate
	make db/seed-dev

db/generate:
	pnpm drizzle-kit generate

db/migrate:
	@STATUS_JSON=$$(pnpx supabase status -o json 2>/dev/null | jq . 2>/dev/null); \
	if [ -z "$$STATUS_JSON" ] || [ "$$STATUS_JSON" = "{}" ]; then \
		echo "Error: Supabase is not running. Run 'make dev' or 'pnpm supabase start' first."; \
		exit 1; \
	fi; \
	DATABASE_URL=$$(echo "$$STATUS_JSON" | jq -r '.DB_URL // empty'); \
	if [ -z "$$DATABASE_URL" ]; then \
		echo "Error: Could not get DATABASE_URL from Supabase status!"; \
		exit 1; \
	fi; \
	export DATABASE_URL=$$DATABASE_URL; \
	pnpm drizzle-kit migrate

db/push:
	pnpm supabase db push

db/pull:
	pnpm drizzle-kit pull

db/update:
	pnpm make db/generate
	pnpm make db/migrate

studio:
	make studio/supabase
	make studio/drizzle

studio/supabase:
	cmd.exe /c start http://127.0.0.1:64323 2>/dev/null || xdg-open http://127.0.0.1:64323 2>/dev/null || open http://127.0.0.1:64323 2>/dev/null || echo "Can't open Supabase Studio in your browser"

studio/drizzle:
	pnpm drizzle-kit studio
	cmd.exe /c start https://local.drizzle.studio/ 2>/dev/null || xdg-open https://local.drizzle.studio/ 2>/dev/null || open https://local.drizzle.studio/ 2>/dev/null || echo "Can't open Drizzle Studio in your browser"

db/seed-dev:
	@if [ ! -f .env.local ]; then \
		echo "Error: .env.local does not exist!"; \
		exit 1; \
	fi; \
	set -a && source .env.local && set +a; \
	if [ -z "$$DEV_EMAIL" ] || [ -z "$$DEV_PASSWORD" ] || [ -z "$$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$$SUPABASE_SERVICE_ROLE_KEY" ]; then \
		echo "Error: Required env variables not set!"; \
		exit 1; \
	fi; \
	if [ -z "$$DEV_DISPLAY_NAME" ]; then \
		DEV_DISPLAY_NAME="$$DEV_EMAIL"; \
	fi; \
	RESPONSE=$$(curl -s -w "\n%{http_code}" -X POST "$$NEXT_PUBLIC_SUPABASE_URL/auth/v1/admin/users" \
		-H "apikey: $$SUPABASE_SERVICE_ROLE_KEY" \
		-H "Authorization: Bearer $$SUPABASE_SERVICE_ROLE_KEY" \
		-H "Content-Type: application/json" \
		-d '{"email":"'"$$DEV_EMAIL"'","password":"'"$$DEV_PASSWORD"'","email_confirm":true,"user_metadata":{"role":"dev","display_name":"'"$$DEV_DISPLAY_NAME"'"}}'); \
	HTTP_CODE=$$(echo "$$RESPONSE" | tail -n1); \
	if [ "$$HTTP_CODE" -eq 200 ] || [ "$$HTTP_CODE" -eq 201 ]; then \
		echo "✓  Dev user created: $$DEV_EMAIL $$DEV_PASSWORD"; \
	elif [ "$$HTTP_CODE" -eq 422 ]; then \
		echo "⚠  User $$DEV_EMAIL already exists"; \
	else \
		echo "✗  Error creating user $$DEV_EMAIL"; \
		exit 1; \
	fi

# Storage commands

storage/export:
	@if [ ! -f .env.local ]; then \
		echo "Error: .env.local does not exist!"; \
		exit 1; \
	fi; \
	set -a && source .env.local && set +a; \
	if [ -z "$$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$$SUPABASE_SERVICE_ROLE_KEY" ]; then \
		echo "Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env.local"; \
		exit 1; \
	fi; \
	STORAGE_DIR="supabase/storage"; \
	echo ""; \
	echo "=== Supabase Storage Export ==="; \
	echo ""; \
	BUCKETS=$$(curl -s "$$NEXT_PUBLIC_SUPABASE_URL/storage/v1/bucket" \
		-H "apikey: $$SUPABASE_SERVICE_ROLE_KEY" \
		-H "Authorization: Bearer $$SUPABASE_SERVICE_ROLE_KEY" | jq -r '.[].name' 2>/dev/null); \
	if [ -z "$$BUCKETS" ]; then \
		echo "No buckets found in storage."; \
		exit 0; \
	fi; \
	TOTAL_FILES=0; \
	CONFIG_BUCKETS=$$(sed -n 's/^\[storage\.buckets\.\([^]]*\)\]/\1/p' supabase/config.toml 2>/dev/null); \
	for BUCKET in $$BUCKETS; do \
		echo "--- Bucket: $$BUCKET ---"; \
		mkdir -p "$$STORAGE_DIR/$$BUCKET"; \
		OBJECTS=$$(curl -s "$$NEXT_PUBLIC_SUPABASE_URL/storage/v1/object/list/$$BUCKET" \
			-H "apikey: $$SUPABASE_SERVICE_ROLE_KEY" \
			-H "Authorization: Bearer $$SUPABASE_SERVICE_ROLE_KEY" \
			-H "Content-Type: application/json" \
			-d '{"prefix":"","limit":10000}' | jq -r '.[] | select(.name != null and .name != ".emptyFolderPlaceholder") | .name' 2>/dev/null); \
		if [ -z "$$OBJECTS" ]; then \
			echo "  (empty)"; \
		else \
			BUCKET_COUNT=0; \
			for OBJ in $$OBJECTS; do \
				ENCODED_OBJ=$$(printf '%s' "$$OBJ" | jq -sRr @uri); \
				HTTP_CODE=$$(curl -s -w "%{http_code}" "$$NEXT_PUBLIC_SUPABASE_URL/storage/v1/object/$$BUCKET/$$ENCODED_OBJ" \
					-H "apikey: $$SUPABASE_SERVICE_ROLE_KEY" \
					-H "Authorization: Bearer $$SUPABASE_SERVICE_ROLE_KEY" \
					-o "$$STORAGE_DIR/$$BUCKET/$$OBJ"); \
				if [ "$$HTTP_CODE" != "200" ]; then \
					echo "  ✗ $$OBJ (HTTP $$HTTP_CODE)"; \
					rm -f "$$STORAGE_DIR/$$BUCKET/$$OBJ"; \
				else \
					echo "  ✓ $$OBJ"; \
					BUCKET_COUNT=$$((BUCKET_COUNT + 1)); \
				fi; \
			done; \
			TOTAL_FILES=$$((TOTAL_FILES + BUCKET_COUNT)); \
			echo "  ($$BUCKET_COUNT files)"; \
		fi; \
		if ! echo "$$CONFIG_BUCKETS" | grep -qx "$$BUCKET"; then \
			echo "  ⚠  Bucket '$$BUCKET' is NOT defined in supabase/config.toml — add it manually!"; \
		fi; \
		echo ""; \
	done; \
	echo "=== Done: $$TOTAL_FILES files exported to $$STORAGE_DIR/ ==="; \
	echo "Now commit the files: git add $$STORAGE_DIR && git commit"

storage/sync:
	@if [ ! -f .env.local ]; then \
		echo "Error: .env.local does not exist!"; \
		exit 1; \
	fi; \
	set -a && source .env.local && set +a; \
	if [ -z "$$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$$SUPABASE_SERVICE_ROLE_KEY" ]; then \
		echo "Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env.local"; \
		exit 1; \
	fi; \
	if ! command -v jq >/dev/null 2>&1; then \
		echo "Error: Missing required tool: jq"; \
		exit 1; \
	fi; \
	SUPABASE_LOCAL_URL=$$(pnpm supabase status --output json 2>/dev/null | jq -r '.API_URL // empty'); \
	if [ -n "$$SUPABASE_LOCAL_URL" ] && [ "$$NEXT_PUBLIC_SUPABASE_URL" != "$$SUPABASE_LOCAL_URL" ]; then \
		echo "Error: NEXT_PUBLIC_SUPABASE_URL ($$NEXT_PUBLIC_SUPABASE_URL) does not match local Supabase ($$SUPABASE_LOCAL_URL)."; \
		echo "Refusing to sync to prevent accidental data loss on a remote instance."; \
		echo "If this is intentional, run: FORCE_STORAGE_SYNC=1 make storage/sync"; \
		if [ "$$FORCE_STORAGE_SYNC" != "1" ]; then exit 1; fi; \
	fi; \
	CONFIG_MAP=$$(awk ' \
		/^\[storage\.buckets\./ { \
			bucket=$$0; gsub(/^\[storage\.buckets\./, "", bucket); gsub(/\]$$/, "", bucket); public="true"; path=""; next; \
		} \
		bucket != "" && $$0 ~ /^public *=/ { \
			public=$$0; sub(/^public *= */, "", public); gsub(/ /, "", public); next; \
		} \
		bucket != "" && $$0 ~ /^objects_path *=/ { \
			path=$$0; sub(/^objects_path *= *"/, "", path); sub(/".*$$/, "", path); \
			print bucket "|" public "|" path; bucket=""; public="true"; path=""; \
		} \
	' supabase/config.toml); \
	if [ -z "$$CONFIG_MAP" ]; then \
		echo "No storage buckets with objects_path found in supabase/config.toml."; \
		exit 0; \
	fi; \
	echo ""; \
	echo "=== Supabase Storage Sync (Repo -> Local) ==="; \
	echo ""; \
	echo "$$CONFIG_MAP" | while IFS='|' read -r BUCKET IS_PUBLIC OBJECTS_PATH; do \
		LOCAL_DIR="supabase/$${OBJECTS_PATH#./}"; \
		echo "--- Bucket: $$BUCKET (source: $$LOCAL_DIR) ---"; \
		if [ ! -d "$$LOCAL_DIR" ]; then \
			echo "  Source directory missing, skipping."; \
			echo ""; \
			continue; \
		fi; \
		CREATE_BODY=$$(jq -n --arg id "$$BUCKET" --argjson public "$$IS_PUBLIC" '{id: $$id, name: $$id, public: $$public}'); \
		HTTP_CODE=$$(curl -s -o /tmp/supabase-bucket-create.json -w "%{http_code}" -X POST "$$NEXT_PUBLIC_SUPABASE_URL/storage/v1/bucket" \
			-H "apikey: $$SUPABASE_SERVICE_ROLE_KEY" \
			-H "Authorization: Bearer $$SUPABASE_SERVICE_ROLE_KEY" \
			-H "Content-Type: application/json" \
			-d "$$CREATE_BODY"); \
		if [ "$$HTTP_CODE" != "200" ] && [ "$$HTTP_CODE" != "201" ] && ! grep -q '"Duplicate"' /tmp/supabase-bucket-create.json; then \
			echo "  Error creating bucket '$$BUCKET' (HTTP $$HTTP_CODE)."; \
			cat /tmp/supabase-bucket-create.json; \
			exit 1; \
		fi; \
		LOCAL_LIST=$$(mktemp); \
		REMOTE_LIST=$$(mktemp); \
		DELETE_LIST=$$(mktemp); \
		trap 'rm -f "$$LOCAL_LIST" "$$REMOTE_LIST" "$$DELETE_LIST" /tmp/supabase-bucket-create.json /tmp/supabase-list.json' EXIT; \
		(cd "$$LOCAL_DIR" && find . -type f ! -name '.gitkeep' | sed 's|^\./||') | sort > "$$LOCAL_LIST"; \
		curl -s "$$NEXT_PUBLIC_SUPABASE_URL/storage/v1/object/list/$$BUCKET" \
			-H "apikey: $$SUPABASE_SERVICE_ROLE_KEY" \
			-H "Authorization: Bearer $$SUPABASE_SERVICE_ROLE_KEY" \
			-H "Content-Type: application/json" \
			-d '{"prefix":"","limit":10000}' > /tmp/supabase-list.json; \
		jq -r '.[] | select(.id != null and .name != null) | .name' /tmp/supabase-list.json | sort > "$$REMOTE_LIST"; \
		comm -13 "$$LOCAL_LIST" "$$REMOTE_LIST" > "$$DELETE_LIST"; \
		if [ -s "$$DELETE_LIST" ]; then \
			DELETE_JSON=$$(jq -Rsc 'split("\n") | map(select(length > 0))' "$$DELETE_LIST"); \
			curl -s -X DELETE "$$NEXT_PUBLIC_SUPABASE_URL/storage/v1/object/$$BUCKET" \
				-H "apikey: $$SUPABASE_SERVICE_ROLE_KEY" \
				-H "Authorization: Bearer $$SUPABASE_SERVICE_ROLE_KEY" \
				-H "Content-Type: application/json" \
				-d "$$DELETE_JSON" >/dev/null; \
			echo "  Deleted stale objects: $$(wc -l < "$$DELETE_LIST")"; \
		else \
			echo "  Deleted stale objects: 0"; \
		fi; \
		UPLOADED=0; \
		while IFS= read -r REL_PATH; do \
			[ -z "$$REL_PATH" ] && continue; \
			ENCODED_PATH=$$(printf '%s' "$$REL_PATH" | jq -sRr @uri); \
			MIME_TYPE=$$(file -b --mime-type "$$LOCAL_DIR/$$REL_PATH" 2>/dev/null || echo "application/octet-stream"); \
			HTTP_UPLOAD=$$(curl -s -o /tmp/supabase-upload.json -w "%{http_code}" -X POST "$$NEXT_PUBLIC_SUPABASE_URL/storage/v1/object/$$BUCKET/$$ENCODED_PATH" \
				-H "apikey: $$SUPABASE_SERVICE_ROLE_KEY" \
				-H "Authorization: Bearer $$SUPABASE_SERVICE_ROLE_KEY" \
				-H "x-upsert: true" \
				-H "Content-Type: $$MIME_TYPE" \
				--data-binary "@$$LOCAL_DIR/$$REL_PATH"); \
			if [ "$$HTTP_UPLOAD" != "200" ] && [ "$$HTTP_UPLOAD" != "201" ]; then \
				echo "  Upload failed for '$$REL_PATH' (HTTP $$HTTP_UPLOAD)"; \
				cat /tmp/supabase-upload.json; \
				exit 1; \
			fi; \
			UPLOADED=$$((UPLOADED + 1)); \
		done < "$$LOCAL_LIST"; \
		echo "  Uploaded/updated objects: $$UPLOADED"; \
		echo ""; \
	done; \
	echo "=== Storage sync completed ==="

# PROD commands

db/migrate/prod:
	DRIZZLE_DATABASE_URL=$DRIZZLE_DATABASE_URL tsx scripts/migrate.ts

-- `storage.objects` is a Supabase-managed table; creating policies is enough here
-- and avoids ownership issues during migrations.

DROP POLICY IF EXISTS "Authenticated users can read public buckets" ON storage.buckets;--> statement-breakpoint
CREATE POLICY "Authenticated users can read public buckets"
ON storage.buckets
FOR SELECT
TO authenticated
USING (public = true);--> statement-breakpoint

DROP POLICY IF EXISTS "Authenticated users can read files from public buckets" ON storage.objects;--> statement-breakpoint
CREATE POLICY "Authenticated users can read files from public buckets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE storage.buckets.id = storage.objects.bucket_id
      AND storage.buckets.public = true
  )
);--> statement-breakpoint

DROP POLICY IF EXISTS "Authenticated users can upload to public buckets" ON storage.objects;--> statement-breakpoint
CREATE POLICY "Authenticated users can upload to public buckets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE storage.buckets.id = storage.objects.bucket_id
      AND storage.buckets.public = true
  )
);--> statement-breakpoint

DROP POLICY IF EXISTS "Authenticated users can update files in public buckets" ON storage.objects;--> statement-breakpoint
CREATE POLICY "Authenticated users can update files in public buckets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE storage.buckets.id = storage.objects.bucket_id
      AND storage.buckets.public = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE storage.buckets.id = storage.objects.bucket_id
      AND storage.buckets.public = true
  )
);--> statement-breakpoint

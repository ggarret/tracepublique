ALTER TABLE "candidates"
  ADD COLUMN "party_short_name" TEXT,
  ADD COLUMN "party_logo_url" TEXT,
  ADD COLUMN "party_logo_source" TEXT;

ALTER TABLE "proposals"
  ADD COLUMN "date_kind" TEXT,
  ADD COLUMN "date_label" TEXT,
  ADD COLUMN "attribution" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "evaluation" JSONB NOT NULL DEFAULT '{}';

CREATE TABLE "track_records" (
  "id" TEXT NOT NULL,
  "candidate_id" TEXT NOT NULL,
  "theme_id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "relationship" TEXT NOT NULL,
  "conclusion" TEXT NOT NULL,
  "related_proposal_ids" JSONB NOT NULL DEFAULT '[]',
  "sources" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "track_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "track_records_candidate_id_date_idx" ON "track_records"("candidate_id", "date");
CREATE INDEX "track_records_theme_id_idx" ON "track_records"("theme_id");
CREATE INDEX "track_records_relationship_idx" ON "track_records"("relationship");

ALTER TABLE "track_records" ADD CONSTRAINT "track_records_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "track_records" ADD CONSTRAINT "track_records_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

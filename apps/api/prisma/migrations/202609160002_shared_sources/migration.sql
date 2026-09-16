CREATE TABLE "proposal_sources" (
  "proposal_id" TEXT NOT NULL,
  "source_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "proposal_sources_pkey" PRIMARY KEY ("proposal_id", "source_id")
);

INSERT INTO "proposal_sources" ("proposal_id", "source_id")
SELECT "proposal_id", "id"
FROM "sources"
WHERE "proposal_id" IS NOT NULL;

CREATE INDEX "proposal_sources_source_id_idx" ON "proposal_sources"("source_id");

ALTER TABLE "proposal_sources"
  ADD CONSTRAINT "proposal_sources_proposal_id_fkey"
  FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "proposal_sources"
  ADD CONSTRAINT "proposal_sources_source_id_fkey"
  FOREIGN KEY ("source_id") REFERENCES "sources"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sources" DROP CONSTRAINT "sources_proposal_id_fkey";
DROP INDEX "sources_proposal_id_idx";
ALTER TABLE "sources" DROP COLUMN "proposal_id";

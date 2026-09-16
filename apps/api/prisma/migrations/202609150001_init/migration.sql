CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "political_position" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "portrait_url" TEXT,
    "portrait_source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "themes" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "source_kind" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "checked_at" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "scores" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT,
    "program_id" TEXT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "accessed_at" TIMESTAMP(3) NOT NULL,
    "excerpt" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_analyses" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT,
    "prompt_version" TEXT NOT NULL DEFAULT 'legacy',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "input" JSONB NOT NULL DEFAULT '{}',
    "output" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "review_decisions" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "reviewer_id" TEXT,
    "decision" TEXT NOT NULL,
    "rationale" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "review_decisions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "result" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "correlation_id" TEXT,
    "reason" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sources_url_key" ON "sources"("url");
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");
CREATE UNIQUE INDEX "ai_analyses_proposal_id_provider_prompt_version_key" ON "ai_analyses"("proposal_id", "provider", "prompt_version");
CREATE INDEX "candidates_name_idx" ON "candidates"("name");
CREATE INDEX "programs_candidate_id_idx" ON "programs"("candidate_id");
CREATE INDEX "programs_status_idx" ON "programs"("status");
CREATE INDEX "proposals_candidate_id_idx" ON "proposals"("candidate_id");
CREATE INDEX "proposals_theme_id_idx" ON "proposals"("theme_id");
CREATE INDEX "proposals_status_idx" ON "proposals"("status");
CREATE INDEX "proposals_published_at_idx" ON "proposals"("published_at");
CREATE INDEX "sources_proposal_id_idx" ON "sources"("proposal_id");
CREATE INDEX "sources_program_id_idx" ON "sources"("program_id");
CREATE INDEX "ai_analyses_provider_idx" ON "ai_analyses"("provider");
CREATE INDEX "ai_analyses_status_idx" ON "ai_analyses"("status");
CREATE INDEX "review_decisions_proposal_id_created_at_idx" ON "review_decisions"("proposal_id", "created_at");
CREATE INDEX "review_decisions_reviewer_id_idx" ON "review_decisions"("reviewer_id");
CREATE INDEX "audit_events_entity_type_entity_id_idx" ON "audit_events"("entity_type", "entity_id");
CREATE INDEX "audit_events_actor_id_created_at_idx" ON "audit_events"("actor_id", "created_at");
CREATE INDEX "audit_events_created_at_idx" ON "audit_events"("created_at");

ALTER TABLE "programs" ADD CONSTRAINT "programs_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sources" ADD CONSTRAINT "sources_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "review_decisions" ADD CONSTRAINT "review_decisions_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "review_decisions" ADD CONSTRAINT "review_decisions_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

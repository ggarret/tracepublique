import { Module } from "@nestjs/common";

import { CandidatesModule } from "./candidates/candidates.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProposalsModule } from "./proposals/proposals.module";

@Module({
  imports: [PrismaModule, HealthModule, CandidatesModule, ProposalsModule],
})
export class AppModule {}

import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProposalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const proposals = await this.prisma.proposal.findMany({
      orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
      include: {
        candidate: true,
        theme: true,
        sourceLinks: { include: { source: true } },
        analyses: { orderBy: { createdAt: "desc" } },
      },
    });

    return proposals.map(({ sourceLinks, ...proposal }) => ({
      ...proposal,
      sources: sourceLinks.map(({ source }) => source),
    }));
  }
}

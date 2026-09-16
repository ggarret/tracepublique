import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CandidatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.candidate.findMany({
      orderBy: { name: "asc" },
      include: { programs: true },
    });
  }
}

import { Controller, Get } from "@nestjs/common";

import { ProposalsService } from "./proposals.service";

@Controller("proposals")
export class ProposalsController {
  constructor(private readonly proposals: ProposalsService) {}

  @Get()
  findAll() {
    return this.proposals.findAll();
  }
}

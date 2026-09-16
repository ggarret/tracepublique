import { Controller, Get } from "@nestjs/common";

import { CandidatesService } from "./candidates.service";

@Controller("candidates")
export class CandidatesController {
  constructor(private readonly candidates: CandidatesService) {}

  @Get()
  findAll() {
    return this.candidates.findAll();
  }
}

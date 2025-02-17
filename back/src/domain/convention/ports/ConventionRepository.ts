import {
  ConventionDto,
  ConventionDtoWithoutExternalId,
  ConventionExternalId,
  ConventionId,
} from "shared";

export interface ConventionRepository {
  save: (
    conventionDto: ConventionDtoWithoutExternalId,
  ) => Promise<ConventionExternalId | undefined>;
  getById: (id: ConventionId) => Promise<ConventionDto | undefined>;
  update: (conventionDto: ConventionDto) => Promise<ConventionId | undefined>;
}

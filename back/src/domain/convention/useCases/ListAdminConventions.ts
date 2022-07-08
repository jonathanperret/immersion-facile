import {
  ConventionAdminReadDto,
  ListConventionsRequestDto as ListConventionsForAdminRequestDto,
} from "shared/src/convention/convention.dto";
import { UseCase } from "../../core/UseCase";
import { listConventionsRequestSchema } from "shared/src/convention/convention.schema";
import { ConventionQueries } from "../ports/ConventionQueries";

export class ListAdminConventions extends UseCase<
  ListConventionsForAdminRequestDto,
  ConventionAdminReadDto[]
> {
  constructor(private readonly conventionQueries: ConventionQueries) {
    super();
  }

  inputSchema = listConventionsRequestSchema;

  public async _execute({
    status,
    agencyId,
  }: ListConventionsForAdminRequestDto) {
    const entities = await this.conventionQueries.getLatestConventionAdminDtos({
      status,
      agencyId,
    });
    return entities;
  }
}

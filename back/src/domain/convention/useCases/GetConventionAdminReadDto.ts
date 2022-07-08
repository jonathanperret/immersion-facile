import { NotFoundError } from "../../../adapters/primary/helpers/httpErrors";
import { UseCase } from "../../core/UseCase";
import {
  ConventionAdminReadDto,
  WithConventionId,
} from "shared/src/convention/convention.dto";
import { withConventionIdSchema } from "shared/src/convention/convention.schema";
import { ConventionQueries } from "../ports/ConventionQueries";

export class GetConventionAdminReadDto extends UseCase<
  WithConventionId,
  ConventionAdminReadDto
> {
  constructor(readonly conventionQueries: ConventionQueries) {
    super();
  }

  inputSchema = withConventionIdSchema;

  public async _execute({
    id,
  }: WithConventionId): Promise<ConventionAdminReadDto> {
    const convention =
      await this.conventionQueries.getConventionAdminReadDtoById(id);
    if (!convention || convention.status === "CANCELLED")
      throw new NotFoundError(id);
    return convention;
  }
}

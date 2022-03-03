import {
  FormEstablishmentId,
  FormEstablishmentDto,
} from "../../shared/FormEstablishmentDto";
import { FormEstablishmentRepository } from "../../domain/immersionOffer/ports/FormEstablishmentRepository";
import { createLogger } from "../../utils/logger";
import { ConflictError } from "../primary/helpers/httpErrors";

const logger = createLogger(__filename);

export class InMemoryFormEstablishmentRepository
  implements FormEstablishmentRepository
{
  private formEstablishments: FormEstablishmentDto[] = [];

  public async create(dto: FormEstablishmentDto): Promise<void> {
    if (await this.getById(dto.id)) {
      const message = `Immersion DTO with id ${dto.id} is already in the list`;
      logger.info({ dto: dto }, message);
      throw new ConflictError(message);
    }
    logger.debug({ immersionOffer: dto }, "Creating a new Immersion Offer");
    this.formEstablishments.push(dto);
  }
  public async edit(dto: FormEstablishmentDto): Promise<void> {
    if (!(await this.getById(dto.id))) {
      const message = `Cannot update form establishlment DTO with id ${dto.id}, since it is not in list.`;
      logger.info({ dto: dto }, message);
      throw new ConflictError(message);
    }
    this.formEstablishments = this.formEstablishments.map((repoDto) =>
      repoDto.id === dto.id ? dto : repoDto,
    );
  }

  public async getAll() {
    return this.formEstablishments;
  }

  public async getById(
    id: FormEstablishmentId,
  ): Promise<FormEstablishmentDto | undefined> {
    return this.formEstablishments.find(
      (immersionOffer) => immersionOffer.id === id,
    );
  }
}

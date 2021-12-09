import { NotFoundError } from "../../../adapters/primary/helpers/sendHttpResponse";
import {
  ImmersionOfferId,
  immersionOfferIdSchema,
  SearchImmersionResultDto,
} from "../../../shared/SearchImmersionDto";
import { ApiConsumer } from "../../../shared/tokens/ApiConsumer";
import { UseCase } from "../../core/UseCase";
import { ImmersionOfferRepository } from "../ports/ImmersionOfferRepository";

export class GetImmersionOfferById extends UseCase<
  ImmersionOfferId,
  SearchImmersionResultDto,
  ApiConsumer
> {
  constructor(
    private readonly immersionOfferRepository: ImmersionOfferRepository,
  ) {
    super();
  }

  inputSchema = immersionOfferIdSchema;

  public async _execute(
    id: ImmersionOfferId,
    apiConsumer: ApiConsumer,
  ): Promise<SearchImmersionResultDto> {
    const withContactDetails = !!apiConsumer;
    const immersionOffer =
      await this.immersionOfferRepository.getImmersionFromUuid(id);
    if (!immersionOffer) throw new NotFoundError(id);
    return immersionOffer.toSearchImmersionResultDto(withContactDetails);
  }
}

import { EstablishmentAggregate } from "../../../domain/immersionOffer/entities/EstablishmentAggregate";
import { EstablishmentRepository } from "../../../domain/immersionOffer/ports/ImmersionOfferRepository";

export class InMemoryEstablishmentRepository
  implements EstablishmentRepository
{
  private _establishments: EstablishmentAggregate[] = [];

  public async addEstablishment(
    establishment: EstablishmentAggregate,
  ): Promise<void> {
    this._establishments.push(establishment);
  }

  // for test purpose only
  get establishments() {
    return this._establishments;
  }
}

import { PoolClient } from "pg";
import { EstablishmentAggregate } from "../../../domain/immersionOffer/entities/EstablishmentAggregate";
import { EstablishmentRepository } from "../../../domain/immersionOffer/ports/ImmersionOfferRepository";

export class PgEstablishmentRepository implements EstablishmentRepository {
  constructor(private client: PoolClient) {}

  public async addEstablishment(
    establishment: EstablishmentAggregate,
  ): Promise<void> {
    throw Error("Not impemented ");
  }
}

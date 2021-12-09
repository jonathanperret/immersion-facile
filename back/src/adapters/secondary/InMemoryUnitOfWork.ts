import { InMemoryOutboxRepository } from "./core/InMemoryOutboxRepository";
import { InMemoryImmersionOfferRepository } from "./immersionOffer/InMemoryImmersonOfferRepository";
import { InMemoryFormEstablishmentRepository } from "./InMemoryFormEstablishmentRepository";

export type InMemoryUnitOfWork = ReturnType<typeof createInMemoryUow>;

export const createInMemoryUow = () => ({
  outboxRepo: new InMemoryOutboxRepository(),
  formEstablishmentRepo: new InMemoryFormEstablishmentRepository(),
  immersionOfferRepo: new InMemoryImmersionOfferRepository(),
});

export const makeCreateInMemoryUow =
  (uow: Partial<InMemoryUnitOfWork> = {}) =>
  (): InMemoryUnitOfWork => ({ ...createInMemoryUow(), ...uow });

import { GenerateEditFormEstablishmentUrl } from "../../auth/jwt";
import { CreateNewEvent } from "../../core/eventBus/EventBus";
import { Clock } from "../../core/ports/Clock";
import { UnitOfWork, UnitOfWorkPerformer } from "../../core/ports/UnitOfWork";
import { TransactionalUseCase } from "../../core/UseCase";
import { EmailGateway } from "../../immersionApplication/ports/EmailGateway";
import { FormEstablishmentDto } from "../../../shared/FormEstablishmentDto";
import { z } from "zod";

export class RetrieveFormEstablishmentFromAggregates extends TransactionalUseCase<
  string,
  FormEstablishmentDto
> {
  inputSchema = z.string();

  constructor(
    uowPerformer: UnitOfWorkPerformer,
    private emailGateway: EmailGateway,
    private clock: Clock,
    private generateEditFormEstablishmentUrl: GenerateEditFormEstablishmentUrl,
    private createNewEvent: CreateNewEvent,
  ) {
    super(uowPerformer);
  }

  protected async _execute(siret: string, uow: UnitOfWork) {
    const establishment = await uow.immersionOfferRepo.getEstablishmentBySiret(
      siret,
    );
    const contact = await uow.immersionOfferRepo.getContactByEstablishmentSiret(
      siret,
    );
    if (!contact) throw new Error("No contact ");

    const offers = await uow.immersionOfferRepo.getOffersByEstablishmentSiret(
      siret,
    );
    const retrievedForm: FormEstablishmentDto = {
      id: "???", // Retrieve from form => TODO siret should be primary key
      siret,
      businessName: establishment.name,
      businessNameCustomized: "???", // add column in establishment 'customized_name'
      businessAddress: establishment.address,
      isEngagedEnterprise: undefined, // ??? add column in establishment 'is_engaged'
      naf: { code: establishment.naf, nomenclature: "???" }, // in entity, rename NafDto in NafInfoDto, add nafInfo: NafInfoDto in establishment entity ; rename in naf in naf_code, add column in establishment 'naf_nomenclature'
      professions: offers.map((offer) => ({
        // immersion_offers : remove rome and add rome_code_appelation instead (from form)
        description: "???", // Libelle de l'appelation (infered from public_rome_appelation)
        romeCodeMetier: offer.rome, // Also nfered from public_rome_appelation
        romeCodeAppellation: "???",
      })),
      businessContacts: [
        {
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          job: contact.job,
          phone: contact.phone,
        },
      ],
      preferredContactMethods: [contact.contactMethod],
    };
    return retrievedForm;
  }
}

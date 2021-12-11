import {
  FormEstablishmentDto,
  formEstablishmentSchema,
} from "../../../shared/FormEstablishmentDto";
import { createLogger } from "../../../utils/logger";
import { SequenceRunner } from "../../core/ports/SequenceRunner";
import { UuidGenerator } from "../../core/ports/UuidGenerator";
import { UseCase } from "../../core/UseCase";
import { RomeGateway } from "../../rome/ports/RomeGateway";
import { SirenGateway } from "../../sirene/ports/SirenGateway";
import { inferExtraEstabishmentInfosFromSirenResponse } from "../domainService/inferExtraEstabishmentInfosFromSirenResponse";
import { EstablishmentAggregate } from "../entities/EstablishmentAggregate";
import {
  ContactV2,
  ImmersionOfferEntityV2,
} from "../entities/ImmersionOfferEntity";
import { GetPosition } from "../ports/GetPosition";
import { EstablishmentRepository } from "../ports/ImmersionOfferRepository";

const logger = createLogger(__filename);

export class TransformFormEstablishmentIntoEstablishmentAggregate extends UseCase<
  FormEstablishmentDto,
  void
> {
  constructor(
    private establishmentRepository: EstablishmentRepository,
    private getPosition: GetPosition,
    private sirenGateway: SirenGateway,
    private romeGateway: RomeGateway,
    private sequenceRunner: SequenceRunner,
    private uuidGenerator: UuidGenerator,
  ) {
    super();
  }

  inputSchema = formEstablishmentSchema;

  public async _execute(
    formEstablishment: FormEstablishmentDto,
  ): Promise<void> {
    const position = await this.getPosition(formEstablishment.businessAddress);
    const sirenResponse = await this.sirenGateway.get(formEstablishment.siret);
    if (!sirenResponse) {
      logger.error(
        `Could not get siret ${formEstablishment.siret} from siren gateway`,
      );
      return;
    }

    const { naf, numberEmployeesRange } =
      inferExtraEstabishmentInfosFromSirenResponse(sirenResponse);

    if (!naf || !numberEmployeesRange || !position) {
      logger.error(
        `Some field from siren gateway are missing for establishment with siret ${formEstablishment.siret}`,
      );
      return;
    }

    const contact: ContactV2 = {
      id: this.uuidGenerator.new(),
      firstName: formEstablishment.businessContacts[0].firstName,
      lastName: formEstablishment.businessContacts[0].lastName,
      email: formEstablishment.businessContacts[0].email,
      phone: formEstablishment.businessContacts[0].phone,
      job: formEstablishment.businessContacts[0].job,
    };

    const immersionOffers: ImmersionOfferEntityV2[] = (
      await this.sequenceRunner.run(
        formEstablishment.professions,
        async ({
          romeCodeMetier,
          romeCodeAppellation,
        }): Promise<ImmersionOfferEntityV2 | undefined> => {
          if (romeCodeMetier) {
            return {
              id: this.uuidGenerator.new(),
              rome: romeCodeMetier,
            };
          } else if (romeCodeAppellation) {
            const correspondingRome =
              await this.romeGateway.appellationToCodeMetier(
                romeCodeAppellation,
              );

            return correspondingRome
              ? {
                  id: this.uuidGenerator.new(),
                  rome: correspondingRome,
                }
              : undefined;
          }
        },
      )
    ).filter((offer): offer is ImmersionOfferEntityV2 => !!offer);

    const establishment: EstablishmentAggregate = {
      siret: formEstablishment.siret,
      name: formEstablishment.businessName,
      address: formEstablishment.businessAddress,
      score: 10, // 10/10 if voluntaryToImmersion=true
      voluntaryToImmersion: true,
      dataSource: "form",
      immersionOffers: immersionOffers,
      contacts: [contact],
      naf,
      position,
      numberEmployeesRange,

      // contactMode: formEstablishment.preferredContactMethods[0],
    };

    await this.establishmentRepository
      .addEstablishment(establishment)
      .catch((err) => {
        logger.error(
          { error: err, siret: formEstablishment.siret },
          "Error when adding establishment aggregate ",
        );
      });
  }
}

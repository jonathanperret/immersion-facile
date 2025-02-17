import { addDays } from "date-fns";
import { z } from "zod";
import { createLogger } from "../../../utils/logger";
import { TimeGateway } from "../../core/ports/TimeGateway";
import { UseCase } from "../../core/UseCase";
import { SireneGateway } from "../../sirene/ports/SireneGateway";
import { SireneEstablishmentVO } from "../../sirene/valueObjects/SireneEstablishmentVO";
import { AddressGateway } from "../ports/AddressGateway";
import { EstablishmentAggregateRepository } from "../ports/EstablishmentAggregateRepository";

const SIRENE_NB_DAYS_BEFORE_REFRESH = 7;

const logger = createLogger(__filename);

export class UpdateEstablishmentsFromSireneApiScript extends UseCase<void> {
  constructor(
    private readonly establishmentAggregateRepository: EstablishmentAggregateRepository,
    private readonly sireneGateway: SireneGateway,
    private readonly addressAPI: AddressGateway,
    private readonly timeGateway: TimeGateway,
  ) {
    super();
  }

  inputSchema = z.void();

  public async _execute() {
    const since = addDays(
      this.timeGateway.now(),
      -SIRENE_NB_DAYS_BEFORE_REFRESH,
    );
    const establishmentSiretsToUpdate =
      await this.establishmentAggregateRepository.getActiveEstablishmentSiretsFromLaBonneBoiteNotUpdatedSince(
        since,
      );

    logger.info(
      `Found ${
        establishmentSiretsToUpdate.length
      } establishment to update with siret ${establishmentSiretsToUpdate.join(
        ", ",
      )}`,
    );

    // TODO parallelize this using Promise.all once we know it works :)
    for (const siret of establishmentSiretsToUpdate) {
      try {
        logger.info(`Updating establishment with siret ${siret}...`);
        await this.updateEstablishmentWithSiret(siret);
        logger.info(`Successfuly updated establishment with siret ${siret} !`);
      } catch (error) {
        logger.warn(
          "Accountered an error when updating establishment with siret :",
          siret,
          error,
        );
      }
    }
  }

  private async updateEstablishmentWithSiret(siret: string) {
    const includeClosedEstablishments = false;
    const sireneAnswer = await this.sireneGateway.get(
      siret,
      includeClosedEstablishments,
    );

    if (!sireneAnswer || sireneAnswer.etablissements.length === 0) {
      await this.establishmentAggregateRepository.updateEstablishment({
        siret,
        updatedAt: this.timeGateway.now(),
        isActive: false,
      });
      return;
    }

    const sireneEstablishmentProps = sireneAnswer.etablissements[0];
    const sireneEstablishment = new SireneEstablishmentVO(
      sireneEstablishmentProps,
    );
    const nafDto = sireneEstablishment.nafAndNomenclature;
    const numberEmployeesRange = sireneEstablishment.numberEmployeesRange;
    const formatedAddress = sireneEstablishment.formatedAddress;

    const positionAndAddress = (
      await this.addressAPI.lookupStreetAddress(formatedAddress)
    ).at(0);

    if (!positionAndAddress) {
      logger.warn(
        { siret, formatedAddress },
        "Unable to retrieve position from API Address",
      );
    }

    await this.establishmentAggregateRepository.updateEstablishment({
      siret,
      updatedAt: this.timeGateway.now(),
      nafDto,
      numberEmployeesRange,
      address: positionAndAddress?.address,
      position: positionAndAddress?.position,
    });
  }
}

import { SirenGateway, SirenResponse } from "../../sirene/ports/SirenGateway";
import { ExtraEstablishmentInfos } from "../domainService/inferExtraEstabishmentInfosFromSirenResponse";
import { logAxiosError } from "./../../../utils/axiosUtils";
import { createLogger } from "./../../../utils/logger";
import type {
  EstablishmentFieldsToRetrieve,
  MandatoryEstablishmentFields,
  Position,
} from "./EstablishmentEntity";
import {
  EstablishmentEntity,
  OptionalEstablishmentFields,
  TefenCode,
} from "./EstablishmentEntity";

const logger = createLogger(__filename);

export type GetPosition = (address: string) => Promise<Position | undefined>;

export type GetExtraEstablishmentInfos = (
  siret: string,
) => Promise<ExtraEstablishmentInfos>;

export type UncompleteEstablishmentProps = MandatoryEstablishmentFields &
  Partial<EstablishmentFieldsToRetrieve> &
  Partial<OptionalEstablishmentFields>;

export class UncompleteEstablishmentEntity {
  constructor(private props: UncompleteEstablishmentProps) {}

  getRomeCodesArray() {
    return this.props.romes;
  }

  getPosition() {
    return this.props.position;
  }

  public getSiret() {
    return this.props.siret;
  }

  public getNaf() {
    return this.props.naf;
  }
  public getName() {
    return this.props.name;
  }

  public getDataSource() {
    return this.props.dataSource;
  }
  public getScore() {
    return this.props.score;
  }

  public async updateExtraEstablishmentInfos(
    sirenGateway: SirenGateway,
  ): Promise<SirenResponse | undefined> {
    logger.debug({ props: this.props }, "updateExtraEstablishmentInfos");

    try {
      const extraEstablishmentInfo = await sirenGateway.get(this.props.siret);
      if (!extraEstablishmentInfo) return;

      this.props.naf =
        extraEstablishmentInfo.etablissements[0].uniteLegale.activitePrincipaleUniteLegale?.replace(
          ".",
          "",
        );

      const trancheEffectifsUniteLegale =
        extraEstablishmentInfo.etablissements[0].uniteLegale
          .trancheEffectifsUniteLegale;

      if (!trancheEffectifsUniteLegale || trancheEffectifsUniteLegale == "NN") {
        this.props.numberEmployeesRange = -1;
      } else if (trancheEffectifsUniteLegale) {
        this.props.numberEmployeesRange = <TefenCode>(
          +trancheEffectifsUniteLegale
        );
      }

      return extraEstablishmentInfo;
    } catch (error: any) {
      logAxiosError(logger, error);
      return;
    }
  }

  public async searchForMissingFields(
    getPosition: GetPosition,
    sirenGateway: SirenGateway,
  ): Promise<EstablishmentEntity | undefined> {
    logger.debug({ props: this.props }, "searchForMissingFields");

    if (!this.props.position) {
      try {
        this.props.position = await getPosition(this.props.address);
      } catch (error: any) {
        logAxiosError(logger, error);
      }
    }

    if (!this.props.naf || !this.props.numberEmployeesRange) {
      await this.updateExtraEstablishmentInfos(sirenGateway);
    }

    if (
      !this.props.position ||
      !this.props.naf ||
      !this.props.numberEmployeesRange
    ) {
      logger.warn(
        { props: this.props },
        "Missing information could not be retrieved.",
      );
      return;
    }

    const establishmentToReturn = new EstablishmentEntity({
      id: this.props.id,
      address: this.props.address,
      score: this.props.score,
      romes: this.props.romes,
      voluntaryToImmersion: this.props.voluntaryToImmersion,
      siret: this.props.siret,
      dataSource: this.props.dataSource,
      name: this.props.name,
      numberEmployeesRange: this.props.numberEmployeesRange,
      position: this.props.position,
      naf: this.props.naf,
    });

    if (this.props.contactMode) {
      establishmentToReturn.setContactMode(this.props.contactMode);
    }
    if (this.props.contactInEstablishment) {
      establishmentToReturn.setContactInEstablishment(
        this.props.contactInEstablishment,
      );
    }
    return establishmentToReturn;
  }
}

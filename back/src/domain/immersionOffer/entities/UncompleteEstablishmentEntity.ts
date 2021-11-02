import {
  EstablishmentEntity,
  TefenCode,
  OptionalEstablishmentFields,
} from "./EstablishmentEntity";
import type {
  MandatoryEstablishmentFields,
  EstablishmentFieldsToRetrieve,
  Position,
} from "./EstablishmentEntity";
import { SireneRepository } from "../../sirene/ports/SireneRepository";
import { Establishment } from "../../../../../front/src/core-logic/ports/EstablishmentInfoFromSiretApi";

export type GetPosition = (address: string) => Promise<Position>;

export type ExtraEstablishmentInfos = {
  naf: string;
  numberEmployeesRange: TefenCode;
};
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

  public async updatePosition(getPosition: GetPosition): Promise<Position> {
    const position = await getPosition(this.props.address);
    this.props.position = position;
    return position;
  }

  public async updateExtraEstablishmentInfos(
    sirenRepositiory: SireneRepository,
  ) {
    const extraEstablishmentInfo: Establishment = await sirenRepositiory.get(
      this.props.siret,
    );
    if (extraEstablishmentInfo) {
      this.props.naf =
        extraEstablishmentInfo.uniteLegale.activitePrincipaleUniteLegale!;
      this.props.numberEmployeesRange = <TefenCode>(
        +extraEstablishmentInfo.uniteLegale.trancheEffectifsUniteLegale
      );
      return extraEstablishmentInfo;
    }
  }

  public async searchForMissingFields(
    getPosition: GetPosition,
    sirenRepositiory: SireneRepository,
  ): Promise<EstablishmentEntity> {
    let position: Position;
    if (!this.props.position) {
      position = await this.updatePosition(getPosition);
    } else {
      position = this.props.position;
    }

    let naf: string;
    let numberEmployeesRange: TefenCode;
    if (!this.props.naf || !this.props.numberEmployeesRange) {
      const otherProperties = await this.updateExtraEstablishmentInfos(
        sirenRepositiory,
      );
      numberEmployeesRange = otherProperties.numberEmployeesRange;
      naf = otherProperties.naf;
    } else {
      naf = this.props.naf;
      numberEmployeesRange = this.props.numberEmployeesRange;
    }

    const establishmentToReturn = new EstablishmentEntity({
      id: this.props.id,
      address: this.props.address,
      score: this.props.score,
      romes: this.props.romes,
      voluntary_to_immersion: this.props.voluntary_to_immersion,
      siret: this.props.siret,
      dataSource: this.props.dataSource,
      name: this.props.name,
      numberEmployeesRange: numberEmployeesRange,
      position: position,
      naf: naf,
    });
    if (this.props.contact_mode) {
      establishmentToReturn.setContact_mode(this.props.contact_mode);
    }
    if (this.props.contact_in_establishment) {
      establishmentToReturn.setContact_in_establishment(
        this.props.contact_in_establishment,
      );
    }
    return establishmentToReturn;
  }
}

import { v4 as uuidV4 } from "uuid";
import {
  ContactMethod,
  ImmersionContactInEstablishmentId,
} from "../../../shared/FormEstablishmentDto";
import { Flavor } from "../../../shared/typeFlavors";
import { ImmersionOfferEntity } from "./ImmersionOfferEntity";

export type EstablishmentId = Flavor<string, "EstablishmentId">;

export type Position = {
  lat: number;
  lon: number;
};

export type DataSource =
  | "api_labonneboite"
  | "api_laplateformedelinclusion"
  | "form"
  | "api_sirene";

export type MandatoryEstablishmentFields = {
  id: EstablishmentId;
  siret: string;
  name: string;
  address: string;
  score: number;
  romes: string[];
  voluntaryToImmersion: boolean;
  dataSource: DataSource;
};

// Code Tefen : Tranche Effectif Entreprise
export type TefenCode =
  | 0
  | 1
  | 2
  | 3
  | 11
  | 12
  | 21
  | 22
  | 31
  | 32
  | 41
  | 42
  | 51
  | 52
  | 53
  | -1;

export type EstablishmentFieldsToRetrieve = {
  numberEmployeesRange: TefenCode;
  position: Position;
  naf: string;
};

export type ImmersionEstablishmentContact = {
  id: ImmersionContactInEstablishmentId;
  lastName: string;
  firstName: string;
  email: string;
  role: string;
  siretEstablishment: string;
  phone: string;
};

export type OptionalEstablishmentFields = {
  contactMode: ContactMethod;
  contactInEstablishment: ImmersionEstablishmentContact;
};

export type EstablishmentProps = MandatoryEstablishmentFields &
  EstablishmentFieldsToRetrieve &
  Partial<OptionalEstablishmentFields>;

export class EstablishmentEntity {
  toArrayOfProps(): any[] {
    return [
      this.props.siret,
      this.props.name,
      this.props.address,
      this.props.numberEmployeesRange,
      this.props.naf,
      this.props.contactMode,
      this.props.dataSource,
      this.props.position,
      this.props.contactInEstablishment,
    ];
  }
  constructor(private props: EstablishmentProps) {}

  public getProps() {
    return this.props;
  }

  public getRomeCodesArray() {
    return this.props.romes;
  }

  public getContact() {
    return this.props.contactInEstablishment;
  }
  public getName() {
    return this.props.name;
  }

  public getScore() {
    return this.props.score;
  }

  public getDataSource() {
    return this.props.dataSource;
  }

  public getAddress(): string {
    return this.props.address;
  }

  public getPosition() {
    return this.props.position;
  }

  public getSiret() {
    return this.props.siret;
  }

  public getNaf() {
    return this.props.naf;
  }

  public getContactMode() {
    return this.props.contactMode;
  }

  public setContactMode(contactMode: ContactMethod) {
    this.props.contactMode = contactMode;
  }

  public setContactInEstablishment(
    immersionEstablishmentContact: ImmersionEstablishmentContact,
  ) {
    this.props.contactInEstablishment = immersionEstablishmentContact;
  }

  extractNafDivision(): number {
    if (this.props.naf) {
      return parseInt(this.props.naf.substring(0, 2));
    }
    return -1;
  }

  public extractImmersions(): ImmersionOfferEntity[] {
    const romeArray = this.getRomeCodesArray();

    return romeArray.map(
      (rome) =>
        new ImmersionOfferEntity({
          id: uuidV4(),
          rome,
          name: this.props.name,
          voluntaryToImmersion: this.props.voluntaryToImmersion,
          dataSource: this.getDataSource(),
          establishment: new EstablishmentEntity({ ...this.props }),
          score: this.getScore(),
          position: this.getPosition(),
        }),
    );
  }
}

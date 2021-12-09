import { ImmersionOfferId } from "../../../shared/SearchImmersionDto";
import { SearchImmersionResultDto } from "./../../../shared/SearchImmersionDto";
import {
  DataSource,
  EstablishmentEntity,
  Position,
} from "./EstablishmentEntity";

export type ImmersionOfferProps = {
  id: ImmersionOfferId;
  rome: string;
  name: string;
  voluntaryToImmersion: boolean;
  dataSource: DataSource;
  establishment: EstablishmentEntity;
  score: number;
  position: Position;
  distance_m?: number;
};

export class ImmersionOfferEntity {
  constructor(private props: ImmersionOfferProps) {}

  public getProps() {
    return this.props;
  }

  public getId(): ImmersionOfferId {
    return this.props.id;
  }

  public getName() {
    return this.props.name;
  }

  public getRome() {
    return this.props.rome;
  }

  public toSearchImmersionResultDto(
    withContactDetails?: boolean,
  ): SearchImmersionResultDto {
    const contactInEstablishment = this.props.establishment.getContact();
    return {
      id: this.props.id,
      rome: this.props.rome,
      romeLabel: "xxxx",
      naf: this.props.establishment.getNaf(),
      nafLabel: "xxxx",
      siret: this.props.establishment.getSiret(),
      name: this.props.name,
      voluntaryToImmersion: this.props.voluntaryToImmersion,
      location: this.props.position,
      address: this.props.establishment.getAddress(),
      city: "xxxx",
      contactId: this.props.establishment.getContact()?.id,
      contactMode: this.props.establishment.getContactMode(),
      distance_m: this.props.distance_m,
      ...(withContactDetails &&
        contactInEstablishment && {
          contactDetails: {
            id: contactInEstablishment.id,
            firstName: contactInEstablishment.firstName,
            lastName: contactInEstablishment.lastName,
            email: contactInEstablishment.email,
            phone: contactInEstablishment.phone,
            role: contactInEstablishment.role,
          },
        }),
    };
  }

  public toArrayOfProps() {
    return [
      this.props.id,
      this.props.rome,
      this.props.establishment.extractNafDivision(),
      this.props.establishment.getSiret(),
      this.props.establishment.getNaf(),
      this.props.name,
      this.props.voluntaryToImmersion,
      this.props.dataSource,
      this.props.establishment.getContact() || null,
      this.props.score,
      this.props.position,
    ];
  }
}

import {
  EstablishmentEntity,
  Position,
} from "../domain/immersionOffer/entities/EstablishmentEntity";
import {
  ImmersionOfferEntity,
  ImmersionOfferProps,
} from "../domain/immersionOffer/entities/ImmersionOfferEntity";
import { Builder } from "./Builder";
import { EstablishmentEntityBuilder } from "./EstablishmentEntityBuilder";

const validImmersionOfferProps: ImmersionOfferProps = {
  id: "13df03a5-a2a5-430a-b558-ed3e2f03512d",
  rome: "M1907",
  name: "Company inside repository",
  voluntaryToImmersion: false,
  data_source: "api_labonneboite",
  score: 4.5,
  position: { lat: 35, lon: 50 },
  establishment: new EstablishmentEntityBuilder().build(),
};

export class ImmersionOfferEntityBuilder
  implements Builder<ImmersionOfferEntity>
{
  public constructor(
    private props: ImmersionOfferProps = validImmersionOfferProps,
  ) {}

  public withId(id: string): ImmersionOfferEntityBuilder {
    return new ImmersionOfferEntityBuilder({ ...this.props, id });
  }

  public withRome(rome: string): ImmersionOfferEntityBuilder {
    return new ImmersionOfferEntityBuilder({ ...this.props, rome });
  }

  public withEstablishment(
    establishment: EstablishmentEntity,
  ): ImmersionOfferEntityBuilder {
    return new ImmersionOfferEntityBuilder({
      ...this.props,
      establishment,
    });
  }

  public withPosition(position: Position) {
    return new ImmersionOfferEntityBuilder({ ...this.props, position });
  }

  public build() {
    return new ImmersionOfferEntity(this.props);
  }
}

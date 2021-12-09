import {
  EstablishmentEntity,
  EstablishmentProps,
} from "../domain/immersionOffer/entities/EstablishmentEntity";
import { ContactMethod } from "../shared/FormEstablishmentDto";
import { ImmersionEstablishmentContact } from "./../domain/immersionOffer/entities/EstablishmentEntity";
import { Builder } from "./Builder";
import { ImmersionEstablishmentContactBuilder } from "./ImmersionEstablishmentContactBuilder";

const siret = "78000403200019";
const validEstablishment: EstablishmentProps = {
  numberEmployeesRange: 11,
  position: { lat: 43, lon: 2 },
  naf: "8539A",
  id: "11111111-3270-11ec-8d3d-00000c130003",
  siret,
  name: "Ma boulangerie",
  address: "30 avenue des champs Elysées, 75017 Paris",
  score: 10,
  romes: ["M1907", "D1102"],
  voluntaryToImmersion: true,
  dataSource: "form",
  contactMode: "EMAIL",
  contactInEstablishment: new ImmersionEstablishmentContactBuilder()
    .withSiret(siret)
    .build(),
};

export class EstablishmentEntityBuilder
  implements Builder<EstablishmentEntity>
{
  constructor(
    private entity: EstablishmentEntity = new EstablishmentEntity(
      validEstablishment,
    ),
  ) {}

  withSiret(siret: string) {
    return new EstablishmentEntityBuilder(
      new EstablishmentEntity({ ...this.entity.getProps(), siret }),
    ).withContact(
      new ImmersionEstablishmentContactBuilder(this.entity.getContact())
        .withSiret(siret)
        .build(),
    );
  }
  withName(name: string) {
    return new EstablishmentEntityBuilder(
      new EstablishmentEntity({ ...this.entity.getProps(), name }),
    );
  }
  withRomes(romes: string[]) {
    return new EstablishmentEntityBuilder(
      new EstablishmentEntity({ ...this.entity.getProps(), romes }),
    );
  }
  withNaf(naf: string) {
    return new EstablishmentEntityBuilder(
      new EstablishmentEntity({ ...this.entity.getProps(), naf }),
    );
  }

  withContactMode(contactMode: ContactMethod) {
    return new EstablishmentEntityBuilder(
      new EstablishmentEntity({ ...this.entity.getProps(), contactMode }),
    );
  }

  withAddress(address: string) {
    return new EstablishmentEntityBuilder(
      new EstablishmentEntity({ ...this.entity.getProps(), address }),
    );
  }
  withPosition(position: { lon: number; lat: number }) {
    return new EstablishmentEntityBuilder(
      new EstablishmentEntity({ ...this.entity.getProps(), position }),
    );
  }
  withContact(contactInEstablishment: ImmersionEstablishmentContact) {
    return new EstablishmentEntityBuilder(
      new EstablishmentEntity({
        ...this.entity.getProps(),
        contactInEstablishment,
      }),
    );
  }

  clearContact() {
    return new EstablishmentEntityBuilder(
      new EstablishmentEntity({
        ...this.entity.getProps(),
        contactInEstablishment: undefined,
      }),
    );
  }

  build() {
    return this.entity;
  }
}

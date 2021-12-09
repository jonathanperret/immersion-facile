import { ImmersionEstablishmentContact } from "../domain/immersionOffer/entities/EstablishmentEntity";
import { Builder } from "./Builder";

const validImmersionEstablishmentContact: ImmersionEstablishmentContact = {
  id: "3ca6e619-d654-4d0d-8fa6-2febefbe953d",
  lastName: "Prost",
  firstName: "Alain",
  email: "alain.prost@email.fr",
  role: "le big boss",
  siretEstablishment: "78000403200029",
  phone: "0612345678",
};

export class ImmersionEstablishmentContactBuilder
  implements Builder<ImmersionEstablishmentContact>
{
  public constructor(
    private immersionEstablishmentContact: ImmersionEstablishmentContact = validImmersionEstablishmentContact,
  ) {}

  public withSiret(siretEstablishment: string) {
    return new ImmersionEstablishmentContactBuilder({
      ...this.immersionEstablishmentContact,
      siretEstablishment,
    });
  }

  public withEmail(email: string) {
    return new ImmersionEstablishmentContactBuilder({
      ...this.immersionEstablishmentContact,
      email,
    });
  }
  public withId(id: string) {
    return new ImmersionEstablishmentContactBuilder({
      ...this.immersionEstablishmentContact,
      id,
    });
  }
  public build() {
    return { ...this.immersionEstablishmentContact };
  }
}

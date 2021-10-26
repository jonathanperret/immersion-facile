import {
  FormEstablishmentDto,
  FormEstablishmentId,
  BusinessContactDto,
} from "../../../shared/FormEstablishmentDto";
import { EstablishmentEntity } from "../entities/EstablishmentEntity";
import {
  ImmersionOfferEntity,
  ImmersionEstablishmentContact,
} from "../entities/ImmersionOfferEntity";
import { FormEstablishmentRepository } from "../ports/FormEstablishmentRepository";
import { SearchImmersionResponseDto } from "../../../shared/SearchImmersionDto";
import { v4 as uuidV4 } from "uuid";
import { UseCase } from "../../core/UseCase";
import {
  UncompleteEstablishmentEntity,
  GetPosition,
  GetExtraEstablishmentInfos,
} from "../entities/UncompleteEstablishmentEntity";
import { ImmersionOfferRepository } from "../ports/ImmersionOfferRepository";

export class TransformFormEstablishmentIntoSearchData {
  constructor(
    private readonly formEstablishmentRepository: FormEstablishmentRepository,
    private immersionOfferRepository: ImmersionOfferRepository,
    private getPosition: GetPosition,
    private getExtraEstablishmentInfos: GetExtraEstablishmentInfos,
  ) {}

  public async _execute(
    id: FormEstablishmentId,
  ): Promise<ImmersionOfferEntity[]> {
    const immersionOfferDto = await this.formEstablishmentRepository.getById(
      id,
    );

    if (immersionOfferDto) {
      //Insert contact
      const establishmentContact =
        this.convertBusinessContactDtoToImmersionEstablishmentContact(
          immersionOfferDto.businessContacts[0],
          immersionOfferDto.siret,
        );
      this.immersionOfferRepository.insertEstablishmentContact(
        establishmentContact,
      );
      //Insert establishment
      const uncompleteEstablishmentEntity: UncompleteEstablishmentEntity =
        new UncompleteEstablishmentEntity({
          id: uuidV4(),
          siret: immersionOfferDto.siret,
          name: immersionOfferDto.businessName,
          address: immersionOfferDto.businessAddress,
          score: 10,
          voluntary_to_immersion: true,
          romes: immersionOfferDto.professions
            .map((x) => x.romeCodeMetier)
            .filter((x) => x != undefined),

          dataSource: "form",
          contact_in_establishment: establishmentContact,
          contact_mode: immersionOfferDto.preferredContactMethods[0],
        });
      const establishmentEntity =
        await uncompleteEstablishmentEntity.searchForMissingFields(
          this.getPosition,
          this.getExtraEstablishmentInfos,
        );

      //Insert establishment
      await this.immersionOfferRepository.insertEstablishments([
        establishmentEntity,
      ]);
      //Insert immersion
      this.immersionOfferRepository.insertImmersions(
        establishmentEntity.extractImmersions(),
      );

      return [];
    } else {
      return [];
    }
  }
  private convertBusinessContactDtoToImmersionEstablishmentContact(
    businessContactDto: BusinessContactDto,
    siret_institution: string,
  ): ImmersionEstablishmentContact {
    return {
      id: uuidV4(),
      name: businessContactDto.lastName,
      firstname: businessContactDto.firstName,
      email: businessContactDto.email,
      role: businessContactDto.job,
      siret_institution: siret_institution,
    };
  }
}

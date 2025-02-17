import { PoolClient } from "pg";
import { FormEstablishmentDto, SiretDto } from "shared";
import { FormEstablishmentRepository } from "../../../domain/immersionOffer/ports/FormEstablishmentRepository";
import { createLogger } from "../../../utils/logger";
import { notifyObjectDiscord } from "../../../utils/notifyDiscord";
import { ConflictError } from "../../primary/helpers/httpErrors";
import { optional } from "./pgUtils";

const logger = createLogger(__filename);
export class PgFormEstablishmentRepository
  implements FormEstablishmentRepository
{
  constructor(private client: PoolClient) {}

  public async getAll(): Promise<FormEstablishmentDto[]> {
    const pgResult = await this.client.query(
      "SELECT * FROM form_establishments",
    );
    return pgResult.rows.map((formEstablishment) =>
      this.pgToEntity(formEstablishment),
    );
  }

  public async getBySiret(
    siret: SiretDto,
  ): Promise<FormEstablishmentDto | undefined> {
    const pgResult = await this.client.query(
      `SELECT * FROM form_establishments
      WHERE siret = $1`,
      [siret],
    );

    const formEstablishment = pgResult.rows[0];
    if (!formEstablishment) return;

    return this.pgToEntity(formEstablishment);
  }

  public async create(
    formEstablishmentDto: FormEstablishmentDto,
  ): Promise<void> {
    // prettier-ignore
    const {  siret, source, businessName, businessNameCustomized, businessAddress, isEngagedEnterprise, naf, appellations: professions, businessContact,  website, additionalInformation, fitForDisabledWorkers } =
      formEstablishmentDto

    const query = `INSERT INTO form_establishments(
        siret, source, business_name, business_name_customized, business_address, website, additional_information, is_engaged_enterprise, naf, professions, business_contact, fit_for_disabled_workers
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;

    // prettier-ignore
    try {
      await this.client.query(query, [siret, source, businessName, businessNameCustomized, businessAddress, website, additionalInformation, isEngagedEnterprise, naf, JSON.stringify(professions), JSON.stringify(businessContact), fitForDisabledWorkers]);
    } catch (error: any) {
      logger.error({error}, "Cannot save form establishment ")
      notifyObjectDiscord({
        _message: `Cannot create form establishment with siret ${formEstablishmentDto.siret}`,
        ...error
      });
      throw new ConflictError(`Cannot create form establishment with siret ${formEstablishmentDto.siret}.`)
    }
  }
  public async update(
    formEstablishmentDto: FormEstablishmentDto,
  ): Promise<void> {
    const query = `UPDATE form_establishments SET 
                    source=$2,
                    business_name=$3,
                    business_name_customized=$4,
                    business_address=$5,
                    is_engaged_enterprise=$6,
                    naf=$7,
                    professions=$8,
                    business_contact=$9,
                    fit_for_disabled_workers=$10
                    WHERE siret=$1`;

    await this.client.query(query, [
      formEstablishmentDto.siret,
      formEstablishmentDto.source,
      formEstablishmentDto.businessName,
      formEstablishmentDto.businessNameCustomized,
      formEstablishmentDto.businessAddress,
      formEstablishmentDto.isEngagedEnterprise,
      formEstablishmentDto.naf,
      JSON.stringify(formEstablishmentDto.appellations),
      JSON.stringify(formEstablishmentDto.businessContact),
      formEstablishmentDto.fitForDisabledWorkers,
    ]);
  }

  pgToEntity(params: Record<any, any>): FormEstablishmentDto {
    return {
      siret: params.siret,
      source: params.source,
      businessName: params.business_name,
      businessNameCustomized: params.business_name_customized,
      website: params.website,
      additionalInformation: params.additional_information,
      businessAddress: params.business_address,
      isEngagedEnterprise: params.is_engaged_enterprise,
      naf: params.naf,
      appellations: params.professions,
      businessContact: params.business_contact,
      isSearchable: params.is_searchable,
      fitForDisabledWorkers: optional(params.fit_for_disabled_workers),
    };
  }
}

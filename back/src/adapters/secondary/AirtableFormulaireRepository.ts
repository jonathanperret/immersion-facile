import Airtable, { Table, FieldSet, Record } from "airtable";
import moment from "moment";
import {
  err,
  fromPromise,
  ok,
  ResultAsync,
} from "ts-option-result";
import {
  FormulaireRepository,
  PersistenceError,
} from "../../domain/formulaires/ports/FormulaireRepository";
import { FormulaireEntity } from "../../domain/formulaires/entities/FormulaireEntity";

export class AirtableFormulaireRepository implements FormulaireRepository {
  private readonly table: Table<FieldSet>;

  constructor(table: Table<FieldSet>) {
    this.table = table;
  }

  public static create(apiKey: string, baseId: string, tableName: string) {
    return new AirtableFormulaireRepository(
      new Airtable({ apiKey }).base(baseId)(tableName)
    );
  }

  public save(entity: FormulaireEntity): ResultAsync<void, PersistenceError> {
    return fromPromise(
      this._create(entity),
      (err) => new PersistenceError((err as any).message)
    );
  }

  private async _create(entity: FormulaireEntity) {
    await this.table.create([
      {
        fields: {
          email: entity.email,
          dateStart: moment(entity.dateStart).format("YYYY-MM-DD"),
          dateEnd: moment(entity.dateEnd).format("YYYY-MM-DD"),
        },
      },
    ]);
  }

  public getAllFormulaires(): ResultAsync<
    FormulaireEntity[],
    PersistenceError
  > {
    return fromPromise(
      this._fetchAllPages(),
      (err) => new PersistenceError((err as any).message)
    ).flatMap((records) => {
      const entities: FormulaireEntity[] = [];
      records.forEach((record) => {
        if (!(typeof record.fields.email === "string")) {
          return err(
            new PersistenceError(
              `Missing or invalid field 'email' in Airtable record: ${record}`
            )
          );
        }
        if (!(typeof record.fields.dateStart === "string")) {
          return err(
            new PersistenceError(
              `Missing or invalid field 'dateStart' in Airtable record: ${record}`
            )
          );
        }
        if (!(typeof record.fields.dateEnd === "string")) {
          return err(
            new PersistenceError(
              `Missing or invalid field 'dateStart' in Airtable record: ${record}`
            )
          );
        }
        entities.push(
          FormulaireEntity.create({
            email: record.fields.email,
            dateStart: new Date(record.fields.dateStart),
            dateEnd: new Date(record.fields.dateEnd),
          })
        );
      });
      return ok(entities);
    });
  }

  // TODO: Is there a better way to do this? Check out ts-option-result.
  private async _fetchAllPages() {
    const allRecords: Airtable.Record<Airtable.FieldSet>[] = [];
    await this.table.select().eachPage((records, fetchNextPage) => {
      records.forEach((record) => allRecords.push(record));
      fetchNextPage();
    });
    return allRecords;
  }
}

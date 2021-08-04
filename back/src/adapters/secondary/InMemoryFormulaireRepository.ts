import { okAsync, ResultAsync } from "ts-option-result";
import { FormulaireRepository, PersistenceError } from "../../domain/formulaires/ports/FormulaireRepository";
import { FormulaireEntity } from "../../domain/formulaires/entities/FormulaireEntity";

export class InMemoryFormulaireRepository implements FormulaireRepository {
  private _formulaires: FormulaireEntity[] = [];

  public save(formulaireEntity: FormulaireEntity): ResultAsync<void, PersistenceError> {
    this._formulaires.push(formulaireEntity);
    return okAsync(undefined);
  }

  public getAllFormulaires(): ResultAsync<FormulaireEntity[], PersistenceError> {
    return okAsync(this._formulaires.slice());
  }

  setFormulaires(formulaireEntites: FormulaireEntity[]) {
    this._formulaires = formulaireEntites;
  }

  getFormulaires(): FormulaireEntity[] {
    return this._formulaires.slice();
  }
}

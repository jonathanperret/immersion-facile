import { FormulaireRepository } from "../../domain/formulaires/ports/FormulaireRepository";
import { FormulaireEntity } from "../../domain/formulaires/entities/FormulaireEntity";

export class InMemoryFormulaireRepository implements FormulaireRepository {
  private _formulaires: FormulaireEntity[] = [];

  public async save(formulaireEntity: FormulaireEntity) {
    const formulaireAlreadyExists = this._formulaires.some(
      ({ uuid }) => uuid === formulaireEntity.uuid
    );
    if (formulaireAlreadyExists) {
      throw new Error("A Formulaire with the same uuid already exists");
    }
    this._formulaires.push(formulaireEntity);
  }

  public async getAllFormulaires() {
    return this._formulaires;
  }

  get formulaires() {
    return this._formulaires;
  }

  setFormulaires(formulaireEntites: FormulaireEntity[]) {
    this._formulaires = formulaireEntites;
  }
}

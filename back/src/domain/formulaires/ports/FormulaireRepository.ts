import { ResultAsync } from "ts-option-result";
import { FormulaireEntity } from "../entities/FormulaireEntity";

export class PersistenceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export interface FormulaireRepository {
  save: (formulaireEntity: FormulaireEntity) => ResultAsync<void, PersistenceError>;
  getAllFormulaires: () => ResultAsync<FormulaireEntity[], PersistenceError>;
}

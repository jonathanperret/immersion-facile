import { FormulaireDto } from "../../../shared/FormulaireDto";
import { UseCase } from "../../core/UseCase";
import { formulaireEntityToDto } from "../entities/FormulaireEntity";
import { FormulaireRepository } from "../ports/FormulaireRepository";

export class ListFormulaires implements UseCase<void, FormulaireDto[]> {
  constructor(private todoRepository: FormulaireRepository) { }

  public async execute() {
    const entities = await this.todoRepository.getAllFormulaires();
    return entities.map(formulaireEntityToDto);
  }
}

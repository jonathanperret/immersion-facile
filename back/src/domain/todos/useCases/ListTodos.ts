import { chain, fromPromise, ok, okAsync, ResultAsync } from "ts-option-result";
import { TodoDto } from "../../../shared/TodoDto";
import { UseCase } from "../../core/UseCase";
import { TodoEntity, todoEntityToDto } from "../entities/TodoEntity";
import { TodoRepository } from "../ports/TodoRepository";

export class ListTodos implements UseCase<void, TodoDto[]> {
  constructor(private todoRepository: TodoRepository) {}

  public execute() {
    return chain(
      this.todoRepository.getAllTodos(),
      ResultAsync.map((entities) => entities.map(todoEntityToDto))
    );
  }
}

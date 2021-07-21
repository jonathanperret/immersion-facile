import { ResultAsync } from "ts-option-result";
import { TodoEntity } from "../entities/TodoEntity";

export class TodoAlreadyExistsError extends Error {
  constructor(uuid: string) {
    super(`A Todo with the same uuid already exists (uuid: ${uuid})`);
  }
}

export class PersistenceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export interface TodoRepository {
  save: (
    todoEntity: TodoEntity
  ) => ResultAsync<void, TodoAlreadyExistsError | PersistenceError>;
  getAllTodos: () => ResultAsync<TodoEntity[], PersistenceError>;
}

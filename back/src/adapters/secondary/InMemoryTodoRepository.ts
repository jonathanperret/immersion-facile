import {
  PersistenceError,
  TodoAlreadyExistsError,
  TodoRepository,
} from "../../domain/todos/ports/TodoRepository";
import { TodoEntity } from "../../domain/todos/entities/TodoEntity";
import { errAsync, okAsync, ResultAsync } from "ts-option-result";
export class InMemoryTodoRepository implements TodoRepository {
  private _todos: TodoEntity[] = [];

  public save(
    todoEntity: TodoEntity
  ): ResultAsync<void, TodoAlreadyExistsError> {
    const todoAlreadyExists = this._todos.some(
      ({ uuid }) => uuid === todoEntity.uuid
    );
    if (todoAlreadyExists)
      return errAsync(new TodoAlreadyExistsError(todoEntity.uuid));
    this._todos.push(todoEntity);
    return okAsync(undefined);
  }

  public getAllTodos(): ResultAsync<TodoEntity[], PersistenceError> {
    return okAsync(this._todos);
  }

  get todos() {
    return this._todos;
  }

  setTodos(todoEntites: TodoEntity[]) {
    this._todos = todoEntites;
  }
}

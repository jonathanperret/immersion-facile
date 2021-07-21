import { TodoEntity } from "../../domain/todos/entities/TodoEntity";
import {
  PersistenceError,
  TodoAlreadyExistsError,
  TodoRepository,
} from "../../domain/todos/ports/TodoRepository";
import * as fs from "fs";
import * as util from "util";
import {
  chain,
  err,
  fromPromise,
  ok,
  Result,
  ResultAsync,
} from "ts-option-result";

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export class JsonTodoRepository implements TodoRepository {
  constructor(private path: string) {}

  public save(todoEntity: TodoEntity) {
    return chain(
      fromPromise(
        this._readData(),
        (err) => new PersistenceError((err as any).message)
      ),
      ResultAsync.flatMap(
        (todoEntities): Result<TodoEntity[], TodoAlreadyExistsError> => {
          const todoWithSameUuidExists = todoEntities.some(
            ({ uuid }) => uuid === todoEntity.uuid
          );
          if (todoWithSameUuidExists)
            return err(new TodoAlreadyExistsError(todoEntity.uuid));
          todoEntities.push(todoEntity);
          return ok(todoEntities);
        }
      ),
      ResultAsync.flatMap(
        (todoEntities): ResultAsync<void, PersistenceError> => {
          return fromPromise(
            writeFile(this.path, JSON.stringify(todoEntities)),
            (error) => new PersistenceError((error as Error).message)
          );
        }
      )
    );
  }

  public getAllTodos(): ResultAsync<TodoEntity[], PersistenceError> {
    return fromPromise(
      this._readData(),
      (error) => new PersistenceError((error as Error).message)
    );
  }

  private async _readData(): Promise<TodoEntity[]> {
    const data = await readFile(this.path);
    const todos = JSON.parse(data.toString());
    return todos;
  }
}

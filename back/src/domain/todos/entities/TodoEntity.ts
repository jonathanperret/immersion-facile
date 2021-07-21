import { err, ok, Result, ResultAsync } from "ts-option-result";
import { TodoDto } from "../../../shared/TodoDto";
import { Clock } from "../ports/Clock";

type TodoProps = {
  uuid: string;
  description: string;
};

class WrongTimeError extends Error {
  constructor(hour: number) {
    super(`You can only add todos between 08h00 and 12h00. Was: ${hour}`);
  }
}

class ToShortDescriptionError extends Error {
  constructor() {
    super("Todo description should be at least 4 characters long");
  }
}

export class TodoEntity {
  public readonly uuid: string;
  public readonly description: string;

  private constructor({ uuid, description }: TodoProps) {
    this.uuid = uuid;
    this.description = description;
  }

  public static create(
    todoDto: TodoDto,
    clock: Clock
  ): Result<TodoEntity, WrongTimeError | ToShortDescriptionError> {
    const hour = clock.getNow().getHours();
    if (hour < 8 || hour >= 12) return err(new WrongTimeError(hour));

    const trimmedDescription = todoDto.description.trim();
    if (trimmedDescription.length <= 3)
      return err(new ToShortDescriptionError());

    const capitalizedDescription =
      trimmedDescription[0].toUpperCase() + trimmedDescription.slice(1);

    return ok(
      new TodoEntity({
        uuid: todoDto.uuid,
        description: capitalizedDescription,
      })
    );
  }
}

export const todoEntityToDto = (entity: TodoEntity): TodoDto => ({
  uuid: entity.uuid,
  description: entity.description,
});

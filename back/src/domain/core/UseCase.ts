import { ResultAsync } from "ts-option-result";

export type UseCase<T, R = void> = {
  execute(params: T): ResultAsync<R, Error>;
};

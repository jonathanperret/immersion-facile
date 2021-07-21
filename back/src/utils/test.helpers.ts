import { ResultAsync } from "ts-option-result";

export const expectPromiseToFailWith = async (
  promise: Promise<unknown>,
  errorMessage: string
) => {
  await expect(promise).rejects.toThrowError(new Error(errorMessage));
};

export const expectResultAsyncToBeErr = async <A, E>(
  resultAsync: ResultAsync<A, E>,
  expectedError: E
) => {
  const result = await resultAsync;
  expect(result._getErrorOrThrow()).toEqual(expectedError);
};

export const expectResultAsyncToBeOk = async <A, E>(
  resultAsync: ResultAsync<A, E>,
  expectedValue: E
) => {
  const result = await resultAsync;
  expect(result.getOrThrow()).toEqual(expectedValue);
};

import type { UseCase } from "../../../domain/core/UseCase";
import * as yup from "yup";
import { errAsync } from "ts-option-result";

export const callUseCase = <T extends Record<string, unknown>, R = void>({
  useCase,
  validationSchema,
  useCaseParams,
}: {
  useCase: UseCase<T, R>;
  validationSchema: yup.SchemaOf<T>;
  useCaseParams: any;
}) => {
  try {
    const params = validationSchema.validateSync(useCaseParams, {
      abortEarly: false,
    }) as T;
    return useCase.execute(params);
  } catch (error) {
    return errAsync(error);
  }
};

import {
  FormEstablishmentId,
  FormEstablishmentDto,
} from "../../../shared/FormEstablishmentDto";

export interface FormEstablishmentRepository {
  create: (formEstablishmentDto: FormEstablishmentDto) => Promise<void>;
  edit: (formEstablishmentDto: FormEstablishmentDto) => Promise<void>;

  getById: (
    id: FormEstablishmentId,
  ) => Promise<FormEstablishmentDto | undefined>;

  getAll: () => Promise<FormEstablishmentDto[]>;
}

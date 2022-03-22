import type {
  CodeAppellation,
  CodeRome,
  AppellationDto,
  RomeDto,
} from "../../../shared/romeAndAppelationDtos/romeAndAppellation.dto";

export interface RomeRepository {
  appellationToCodeMetier(
    romeCodeAppellation: CodeAppellation,
  ): Promise<CodeRome | undefined>;
  searchMetier: (query: string) => Promise<RomeDto[]>;
  searchAppellation: (query: string) => Promise<AppellationDto[]>;
}

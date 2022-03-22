import { Flavor } from "../typeFlavors";

export type CodeRome = Flavor<string, "CodeRome">;
export type CodeAppellation = Flavor<string, "CodeRome">;

export type RomeDto = {
  libelleRome: string;
  codeRome: CodeRome;
};

export type AppellationDto = RomeDto & {
  libelleAppellation: string;
  codeAppellation: CodeAppellation;
};

export type MatchRangeDto = {
  startIndexInclusive: number;
  endIndexExclusive: number;
};

export type AppellationMatch = {
  appellation: AppellationDto;
  matchRanges: MatchRangeDto[];
};

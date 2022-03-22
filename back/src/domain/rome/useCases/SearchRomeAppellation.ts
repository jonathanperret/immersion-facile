import { map } from "ramda";
import { pipeWithValue } from "../../../shared/pipeWithValue";
import { AppellationMatch } from "../../../shared/romeAndAppelationDtos/romeAndAppellation.dto";
import { zTrimmedString } from "../../../shared/zodUtils";
import { createLogger } from "../../../utils/logger";
import { findMatchRanges } from "../../../utils/textSearch";
import { UseCase } from "../../core/UseCase";
import { RomeRepository } from "../ports/RomeRepository";

const logger = createLogger(__filename);

const MIN_SEARCH_TEXT_LENGTH = 3;

export class SearchRomeAppellation extends UseCase<string, AppellationMatch[]> {
  public constructor(readonly romeRepository: RomeRepository) {
    super();
  }

  inputSchema = zTrimmedString;

  public async _execute(searchText: string): Promise<AppellationMatch[]> {
    if (searchText.length <= MIN_SEARCH_TEXT_LENGTH) return [];

    const result = pipeWithValue(
      await this.romeRepository.searchAppellation(searchText),
      map((appellation) => ({
        appellation,
        matchRanges: findMatchRanges(
          searchText,
          appellation.libelleAppellation,
        ),
      })),
    );

    logger.info({ searchText, result }, "Search Rome Appellation");
    return result;
  }
}

import { RomeRepository } from "../../domain/rome/ports/RomeRepository";
import {
  AppellationDto,
  CodeAppellation,
  CodeRome,
  RomeDto,
} from "../../shared/romeAndAppelationDtos/romeAndAppellation.dto";
import { createLogger } from "../../utils/logger";
import { normalize } from "../../utils/textSearch";

const logger = createLogger(__filename);

const romeDtos: RomeDto[] = [
  {
    codeRome: "A1203",
    libelleRome: "Aménagement et entretien des espaces verts",
  },
  { codeRome: "A1409", libelleRome: "Élevage de lapins et volailles" },
  { codeRome: "D1102", libelleRome: "Boulangerie - viennoiserie" },
  { codeRome: "D1103", libelleRome: "Charcuterie - traiteur" },
  { codeRome: "D1106", libelleRome: "Vente en alimentation" },
  {
    codeRome: "D1201",
    libelleRome: "Achat vente d'objets d'art, anciens ou d'occasion",
  },
  { codeRome: "D1202", libelleRome: "Coiffure" },
  { codeRome: "D1505", libelleRome: "Personnel de caisse" },
  { codeRome: "D1507", libelleRome: "Mise en rayon libre-service" },
  { codeRome: "N4301", libelleRome: "Conduite sur rails" },
];

const appellations: AppellationDto[] = [
  {
    codeAppellation: "12694",
    libelleAppellation: "Coiffeur / Coiffeuse mixte",
    codeRome: "D1202",
    libelleRome: "Coiffure",
  },
  {
    codeAppellation: "14704",
    libelleAppellation: "Éleveur / Éleveuse de lapins angoras",
    codeRome: "A1409",
    libelleRome: "Élevage de lapins et volailles",
  },
  {
    codeAppellation: "16067",
    libelleAppellation: "Jardinier / Jardinière",
    codeRome: "A1203",
    libelleRome: "Aménagement et entretien des espaces verts",
  },
  {
    codeAppellation: "20560",
    libelleAppellation: "Vendeur / Vendeuse en boulangerie-pâtisserie",
    codeRome: "D1106",
    libelleRome: "Vente en alimentation",
  },
  {
    codeAppellation: "20567",
    libelleAppellation: "Vendeur / Vendeuse en chocolaterie",
    codeRome: "D1106",
    libelleRome: "Vente en alimentation",
  },
  {
    codeAppellation: "20714",
    libelleAppellation: "Vitrailliste",
    codeRome: "B1602",
    libelleRome: "The code rome I don't remember",
  },
];

const romeByAppellation: Record<string, CodeRome> = {
  "11987": "A1101",
  "12120": "B2200",
  "12694": "D1202",
  "14704": "A1409",
  "16067": "A1203",
  "20560": "D1106",
  "20567": "D1106",
  "20714": "B1602",
};

export class InMemoryRomeRepository implements RomeRepository {
  public async appellationToCodeMetier(
    romeCodeAppellation: CodeAppellation,
  ): Promise<CodeRome | undefined> {
    return romeByAppellation[romeCodeAppellation];
  }

  public async searchMetier(query: string): Promise<RomeDto[]> {
    logger.info({ query }, "searchMetier");
    const normalizedQuery = normalize(query);
    return romeDtos.filter(
      (metier) => normalize(metier.libelleRome).indexOf(normalizedQuery) >= 0,
    );
  }

  public async searchAppellation(query: string): Promise<AppellationDto[]> {
    logger.info({ query }, "searchAppellation");
    const normalizedQuery = normalize(query);
    return appellations.filter(
      (appellation) =>
        normalize(appellation.libelleAppellation).indexOf(normalizedQuery) >= 0,
    );
  }
}

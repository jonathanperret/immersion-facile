export type EstablishmentFromSireneRepositoryAnswer = {
  siren: string;
  nic: string;
  siret: string;
  uniteLegale: {
    denominationUniteLegale: string;
    activitePrincipaleUniteLegale: string;
    nomenclatureActivitePrincipaleUniteLegale: string;
    trancheEffectifsUniteLegale: string;
  };
  adresseEtablissement: {
    numeroVoieEtablissement: string;
    typeVoieEtablissement: string;
    libelleVoieEtablissement: string;
    codePostalEtablissement: string;
    libelleCommuneEtablissement: string;
  };
};

export type SireneRepositoryAnswer = {
  header: {
    statut: number;
    message: string;
    total: number;
    debut: number;
    nombre: number;
  };
  etablissements: EstablishmentFromSireneRepositoryAnswer[];
};

export interface SireneRepository {
  get: (siret: string) => Promise<SireneRepositoryAnswer | undefined>;
}

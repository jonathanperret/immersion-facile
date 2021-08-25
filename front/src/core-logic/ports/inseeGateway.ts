export interface InseeGateway {
  getInfo: (siret: string) => Promise<any>
}

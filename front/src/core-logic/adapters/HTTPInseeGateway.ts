import axios from "axios";
import { InseeGateway } from "src/core-logic/ports/inseeGateway";

export class HTTPInseeGateway implements InseeGateway {

  private baseURL = "https://api.insee.fr/entreprises/sirene/V3/siret";

  private axios = axios.create({
    baseURL: this.baseURL,
    timeout: 1000,
    headers: {'Authorization': 'Bearer 716e317d-7c1e-348b-b987-7839453aefef'}
  });

  public async getInfo(siret: string) : Promise<any> {
    return this.axios.get("siret/q=?" + siret)
  }

}

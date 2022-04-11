import axios from "axios";
import { map, Observable } from "rxjs";
import { ajax } from "rxjs/ajax";
import { SearchImmersionRequestDto } from "shared/src/searchImmersion/SearchImmersionRequest.dto";
import { SearchImmersionResultDto } from "shared/src/searchImmersion/SearchImmersionResult.dto";
import { ContactEstablishmentRequestDto } from "shared/src/contactEstablishment";
import {
  contactEstablishmentRoute,
  searchImmersionRoute,
} from "shared/src/routes";
import { ImmersionSearchGateway } from "../ports/ImmersionSearchGateway";

const prefix = "api";

export class HttpImmersionSearchGateway implements ImmersionSearchGateway {
  public search(
    searchParams: SearchImmersionRequestDto,
  ): Observable<SearchImmersionResultDto[]> {
    return ajax
      .post<SearchImmersionResultDto[]>(
        `/${prefix}/v1/${searchImmersionRoute}`,
        searchParams,
      )
      .pipe(map(({ response }) => response));
  }

  public async contactEstablishment(
    params: ContactEstablishmentRequestDto,
  ): Promise<void> {
    const response = await axios.post(
      `/${prefix}/${contactEstablishmentRoute}`,
      params,
    );
    console.log(
      "Contact establishments response status",
      response?.data?.status,
    );
  }
}

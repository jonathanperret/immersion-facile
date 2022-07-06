import axios, { AxiosInstance } from "axios";
import {
  HttpPeConnectGateway,
  HttpPeConnectGatewayConfig,
} from "../../adapters/secondary/HttpPeConnectGateway";
import { PeUserAndAdvisors } from "../../domain/peConnect/dto/PeConnect.dto";

describe("HttpPeConnectGateway", () => {
  let axiosInstance: AxiosInstance;
  let peConnectGateway: HttpPeConnectGateway;

  beforeEach(() => {
    axiosInstance = axios.create();

    peConnectGateway = new HttpPeConnectGateway( {} as unknown as HttpPeConnectGatewayConfig, axiosInstance);
  });

  // eslint-disable-next-line @typescript-eslint/require-await
  it("should get user and advisors", async () => {
    const userAndAdvisors: PeUserAndAdvisors = await peConnectGateway.getUserAndAdvisors('plop');
    expect(userAndAdvisors).toBe(false);

  });
});

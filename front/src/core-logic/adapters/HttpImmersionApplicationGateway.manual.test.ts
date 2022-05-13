import { firstValueFrom } from "rxjs";
import { ImmersionApplicationDto } from "shared/src/ImmersionApplication/ImmersionApplication.dto";
import { HttpImmersionApplicationGateway } from "src/core-logic/adapters/HttpImmersionApplicationGateway";

describe("HttpImmersionApplicationGateway", () => {
    const httpImmersionApplicationGateway = new HttpImmersionApplicationGateway("http://localhost:1234");

    describe("addObservable", () => {
        it("When immersion invalid returns 401", async () => {
            const response = await firstValueFrom(httpImmersionApplicationGateway.addObservable({} as ImmersionApplicationDto))

            expect(response).toBeInstanceOf(Error)
            expect((response as any).status).toBe(400)
            expect((response as any).issues[0]).toEqual({
                "code": "invalid_type", "expected": "string", "message": "Obligatoire", "path": ["id"], "received": "undefined"
            })
        });
    });
});
import { Response } from "express";
import { chain, Result, ResultAsync } from "ts-option-result";

export const sendHttpResponse = async (
  res: Response,
  callback: () => ResultAsync<unknown, Error>
) =>
  chain(
    callback(),
    ResultAsync.caseOf({
      ok: (response) => {
        res.status(200);
        return res.json(response || { success: true });
      },
      err: (error) => {
        res.status(400);
        return res.json({ errors: (error as any).errors || [error.message] });
      },
    })
  );

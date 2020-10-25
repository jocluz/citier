import { get } from "./client";
import { RequestConfig } from "./model";

async function getCities(params: any, cancel?: any) {
  const url = `/cities`;
  const req: RequestConfig = {
    url,
    params
  };

  if (cancel) req.cancel = cancel;
  return get(req);
}

export { getCities };

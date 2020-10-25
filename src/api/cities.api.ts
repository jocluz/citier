import { get } from "./client";
import { RequestConfig } from "./model";

async function getCities(params: any) {
  const url = `/cities`;
  const req: RequestConfig = {
    url,
    params
  };

  return get(req);
}

export { getCities };

export const MAX_RETRIES = 3;
export const RETRY_TIMEOUT = 1000;

export async function fetchWithRetry(
  fetcher: Function,
  params: any = null,
  retries: number = MAX_RETRIES
) {
  try {
    return await fetcher(params);
  } catch (error) {
    if (retries <= 0) throw error;
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Retry ${MAX_RETRIES - retries + 1}`);
        resolve(fetchWithRetry(fetcher, params, retries - 1));
      }, RETRY_TIMEOUT);
    });
  }
}

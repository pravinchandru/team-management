export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`${status} ${statusText}`);
    this.name = 'HttpError';
  }
}

export const handleApiError = async (response: Response): Promise<never> => {
  let errorData: any;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: response.statusText };
  }

  throw new HttpError(
    response.status,
    response.statusText,
    errorData
  );
};
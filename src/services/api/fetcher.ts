import { API_URL } from "@/services/api/config";

/**
 * The backend's error envelope (its AllExceptionsFilter): every non-2xx
 * response carries at least these fields.
 */
export type ApiErrorBody = {
  statusCode: number;
  error: string;
  message?: string | string[];
  path?: string;
  timestamp?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null) {
    const message = body?.message;
    super(
      Array.isArray(message)
        ? message.join(", ")
        : (message ?? `Request failed with HTTP ${status}`),
    );
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * The single transport every generated call goes through (orval's mutator —
 * see orval.config.ts).
 *
 * The spec's paths already carry the backend's global `/api` prefix, so that
 * prefix is swapped for API_URL — "/api" in dev (proxied by Vite), absolute in
 * a deployed build. Non-2xx responses throw an ApiError so TanStack Query
 * treats them as errors.
 */
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url.replace(/^\/api(?=\/|$)/, API_URL), options);

  const text = await response.text();
  const body: unknown = text === "" ? null : JSON.parse(text);

  if (!response.ok) {
    throw new ApiError(response.status, body as ApiErrorBody | null);
  }

  return body as T;
}

/** What orval types every generated hook's `error` as — what apiFetch throws. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- orval's ErrorType contract takes a type parameter
export type ErrorType<_Error> = ApiError;

/**
 * A class to handle HTTP requests.
 * @example
 * ```ts
 * const baseUrl = 'https://api.example.com';
 * const authApi = new AuthAPI(baseUrl);
 * const gameApi = new GameAPI(baseUrl);
 *
 * // Sign in
 * authApi.signin({ username: 'user1', password: 'password123' }).then((response) => {
 *  if (response.data) {
 *   console.log('Signin successful');
 * } else {
 *  console.error('Signin failed:', response.error);
 * }
 * });
 *
 * // Get TTS
 * gameApi.getTTS({ text: 'Hello world' }).then((response) => {
 * if (response.data) {
 * console.log('TTS fetched successfully');
 * // Handle Blob data here
 * } else {
 * console.error('TTS fetch failed:', response.error);
 * }
 * });
 * ```
 *
 */
export default class Fetcher {
  /**
   * The base URL for the API.
   */
  protected baseUrl: string;

  /**
   * Creates an instance of Fetcher.
   * @param baseUrl - The base URL for the API.
   */
  constructor(baseUrl: string = import.meta.env.VITE_API_URL as string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Sends an HTTP request to the specified endpoint.
   * @template T - The expected response type.
   * @param endpoint - The API endpoint to send the request to.
   * @param options - The options for the request, such as method, headers, etc.
   * @param responseType - The type of response expected ('json' or 'blob'). Defaults to 'json'.
   * @returns A promise that resolves to an APIResponse containing the response data or an error.
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    responseType: 'json' | 'blob' = 'json',
  ): Promise<APIResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Ensure cookies are sent with requests
    });

    const contentType = response.headers.get('Content-Type');
    const isJson = contentType && contentType.includes('application/json');
    let responseData: any;

    if (responseType === 'json' && isJson) {
      responseData = await response.json();
    } else if (responseType === 'blob') {
      responseData = await response.blob();
    } else {
      responseData = await response.text();
    }

    return responseData;
  }
}

import { API_ROUTES } from "@/lib/routes";

// Configuração base da API
const RAW_API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, "");

function buildApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Avoid duplicated prefix when base is like ".../api" and endpoint is "/api/...".
  if (API_BASE_URL.endsWith("/api") && normalizedEndpoint.startsWith("/api/")) {
    return `${API_BASE_URL}${normalizedEndpoint.slice(4)}`;
  }

  return `${API_BASE_URL}${normalizedEndpoint}`;
}

// Helper para obter o token do localStorage
export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

// Helper para fazer requisições autenticadas
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();
  const isAuthEndpoint =
    endpoint === API_ROUTES.auth.login ||
    endpoint === API_ROUTES.auth.refresh ||
    endpoint === API_ROUTES.auth.forgotPassword;
  
  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers ?? {});

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(endpoint), {
    ...options,
    headers,
  });

  // Se o token expirou (401), tentar renovar
  if (response.status === 401 && !isAuthEndpoint) {
    const refreshToken = getRefreshToken();
    
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(buildApiUrl(API_ROUTES.auth.refresh), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const { accessToken } = await refreshResponse.json();
          localStorage.setItem("accessToken", accessToken);
          
          // Tentar novamente a requisição original com o novo token
          headers.set("Authorization", `Bearer ${accessToken}`);
          return fetch(buildApiUrl(endpoint), {
            ...options,
            headers,
          });
        }
      } catch (error) {
        // Se falhar ao renovar, redireciona para login
        localStorage.clear();
        window.location.href = "/login";
      }
    } else {
      // Sem refresh token, redireciona para login
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return response;
}

// Helper para fazer requisições públicas (sem autenticação, sem redirecionamento)
export async function fetchPublic(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers ?? {});

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(buildApiUrl(endpoint), {
    ...options,
    headers,
  });
}

// Helpers para métodos HTTP comuns
export const api = {
  get: (endpoint: string, options?: RequestInit) => 
    fetchWithAuth(endpoint, { ...options, method: "GET" }),
  
  post: (endpoint: string, data?: any, options?: RequestInit) => 
    fetchWithAuth(endpoint, { 
      ...options, 
      method: "POST", 
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined 
    }),
  
  put: (endpoint: string, data?: any, options?: RequestInit) => 
    fetchWithAuth(endpoint, { 
      ...options, 
      method: "PUT", 
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined 
    }),
  
  patch: (endpoint: string, data?: any, options?: RequestInit) => 
    fetchWithAuth(endpoint, { 
      ...options, 
      method: "PATCH", 
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined 
    }),
  
  delete: (endpoint: string, options?: RequestInit) => 
    fetchWithAuth(endpoint, { ...options, method: "DELETE" }),

  // Métodos públicos (sem token de autenticação, sem redirecionamento para login)
  postPublic: (endpoint: string, data?: unknown, options?: RequestInit) =>
    fetchPublic(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    }),
};

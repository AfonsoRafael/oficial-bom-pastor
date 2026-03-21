export const API_ROUTES = {
  preMatriculas: "/api/pre-matriculas",
  preMatriculasApprove: (id: number | string) => `/api/pre-matriculas/${id}/approve`,
  preMatriculasReject: (id: number | string) => `/api/pre-matriculas/${id}/reject`,
  catequistasInscricao: "/api/catequistas/inscricao",
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    refresh: "/api/auth/refresh",
    forgotPassword: "/api/auth/forgot-password",
  },
  turmas: "/api/turmas",
  catequizandos: {
    base: "/api/catequizandos",
    semTurma: "/api/catequizandos?semTurma=true",
    turma: (id: number | string) => `/api/catequizandos/${id}/turma`,
    documentos: (id: number | string) => `/api/catequizandos/${id}/documentos`,
  },
  catequistas: "/api/catequistas",
};

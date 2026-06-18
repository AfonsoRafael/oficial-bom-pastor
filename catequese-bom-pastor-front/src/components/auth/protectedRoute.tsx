import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Substitua essa lógica pela sua validação real (ex: checar token JWT ou estado do AuthContext)
  const isAuthenticated = !!localStorage.getItem("role");

  if (!isAuthenticated) {
    // Se não estiver autenticado, manda de volta para o login mudando o histórico
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, o Outlet renderiza a rota filha que o usuário tentou acessar
  return <Outlet />;
};

export default ProtectedRoute;
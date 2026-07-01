import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import AddCatequizando from "./pages/AddCatequizando";
import Cronograma from "./pages/Cronograma";
import CatechistDashboard from "./pages/CatechistDashboard";
import Contabilidade from "./pages/Contabilidade";
import Historico from "./pages/Historico";
import Index from "./pages/Index";
import Inscricao from "./pages/Inscricao";
import Login from "./pages/Login";
import EsqueciSenha from "./pages/EsqueciSenha";
import Lojinha from "./pages/Lojinha";
import Material from "./pages/Material";
import MinhasTurmas from "./pages/MinhasTurmas";
import Musicas from "./pages/Musicas";
import NotFound from "./pages/NotFound";
import ParentDashboard from "./pages/ParentDashboard";
import ParentDocumentos from "./pages/ParentDocumentos";
import ParentCronograma from "./pages/ParentCronograma";
import ParentGaleria from "./pages/ParentGaleria";
import AdminInscricoesCatequistas from "./pages/AdminInscricoesCatequistas";
import PreMatriculaCrianca from "./pages/PreMatriculaCrianca";
import PrimeiroAcesso from "./pages/PrimeiroAcesso";
import Sobre from "./pages/Sobre";
import ProtectedRoute from "./components/auth/protectedRoute";
import Photos from "./pages/Photos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/lojinha" element={<Lojinha />} />
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/inscricao" element={<Inscricao />} />
            <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
            <Route path="/pre-matricula" element={<PreMatriculaCrianca />} />
            <Route element={<ProtectedRoute />} >

              {/* Rotas Pais */}
              <Route path="/pais" element={<ParentDashboard />} />
              <Route path="/pais/documentos" element={<ParentDocumentos />} />
              <Route path="/pais/cronograma" element={<ParentCronograma />} />
              <Route path="/pais/galeria" element={<ParentGaleria />} />

              {/* Rotas Admin */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route
                path="/admin/add-catequizando"
                element={
                  <AddCatequizando />
                }
              />
              <Route path="/admin/inscricoes-catequistas" element={<AdminInscricoesCatequistas />} />
              <Route path="/admin/chamada" element={<CatechistDashboard />} />
              <Route path="/admin/minhas-turmas" element={<MinhasTurmas />} />
              <Route path="/admin/cronograma" element={<Cronograma />} />
              <Route path="/admin/material" element={<Material />} />
              <Route path="/admin/musicas" element={<Musicas />} />
              <Route path="/admin/fotos" element={<Photos />} />
              <Route path="/admin/contabilidade" element={<Contabilidade />} />
              <Route path="/admin/historico" element={<Historico />} />

              {/* Rotas Catequista */}
              <Route path="/catequista" element={<CatechistDashboard />} />
              <Route path="/catequista/chamada" element={<CatechistDashboard />} />
              <Route path="/catequista/minhas-turmas" element={<MinhasTurmas />} />
              <Route path="/catequista/cronograma" element={<Cronograma />} />
              <Route path="/catequista/material" element={<Material />} />
              <Route path="/catequista/musicas" element={<Musicas />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

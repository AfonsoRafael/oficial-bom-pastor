import { SidebarNav } from "@/components/layout/SidebarNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePersistentSidebar } from "@/hooks/usePersistentSidebar";
import { ADMIN_NAV_ITEMS } from "@/lib/sidebarNavItems";
import {
  Menu,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Pencil,
  Upload
} from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface HomePagePhoto {
  id: string;
  title: string;
  description?: string;
  url: string; // Guardará a URL temporária ou a URL final do backend
  isActive: boolean;
}

export default function Photos() {
  const { isSidebarOpen, toggleSidebar } = usePersistentSidebar();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Controle do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<HomePagePhoto | null>(null);
  
  // Estados do formulário
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Lista de fotos inicial
  const [photos, setPhotos] = useState<HomePagePhoto[]>([
    {
      id: "1",
      title: "Missa de Abertura da Catequese 2026",
      description: "Momento de bênção com as crianças e os pais no início do ano letivo.",
      url: "https://images.unsplash.com/photo-1544427928-c49cdcaf859b?w=600&auto=format&fit=crop&q=60",
      isActive: true,
    },
    {
      id: "2",
      title: "Teatrinho de Páscoa",
      description: "Apresentação realizada pelos catequizandos da Crisma.",
      url: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=600&auto=format&fit=crop&q=60",
      isActive: true,
    },
    {
      id: "3",
      title: "Encontro de Formação de Catequistas",
      description: "Foto antiga guardada no acervo.",
      url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=60",
      isActive: false,
    }
  ]);

  // Abrir modal no modo "Criar"
  const handleOpenCreateModal = () => {
    setEditingPhoto(null);
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  // Abrir modal no modo "Editar"
  const handleOpenEditModal = (photo: HomePagePhoto) => {
    setEditingPhoto(photo);
    setTitle(photo.title);
    setDescription(photo.description || "");
    setSelectedFile(null); // No modo edição, o upload só é necessário se for trocar a foto
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  // Manipular a seleção do arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Salvar alterações ou nova foto
  const handleSavePhoto = (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();

    // Validação: Se for criação, o arquivo de imagem é obrigatório
    if (!title || (!editingPhoto && !selectedFile)) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e selecione uma imagem para upload.",
        variant: "destructive",
      });
      return;
    }

    // Gera uma URL local temporária para o preview do arquivo selecionado
    const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : "";

    if (editingPhoto) {
      // MODO EDIÇÃO
      setPhotos(prev =>
        prev.map(p =>
          p.id === editingPhoto.id
            ? { 
                ...p, 
                title, 
                description, 
                // Se escolheu uma foto nova substitui, senão mantém a antiga
                url: selectedFile ? previewUrl : p.url 
              }
            : p
        )
      );
      toast({
        title: "Foto atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      // MODO CRIAÇÃO
      const newPhoto: HomePagePhoto = {
        id: Date.now().toString(),
        title,
        description,
        url: previewUrl,
        isActive: !isDraft, // Se for rascunho, nasce inativo (oculto)
      };
      setPhotos(prev => [newPhoto, ...prev]);
      toast({
        title: isDraft ? "Salvo como rascunho!" : "Foto adicionada!",
        description: isDraft 
          ? "A imagem foi guardada como rascunho e está oculta na Home." 
          : "A nova imagem foi enviada e já está ativa na tela inicial.",
      });
    }

    setIsModalOpen(false);
  };

  const togglePhotoStatus = (id: string) => {
    setPhotos(prev =>
      prev.map(photo =>
        photo.id === id ? { ...photo, isActive: !photo.isActive } : photo
      )
    );
    toast({
      title: "Status atualizado",
      description: "A visibilidade da foto foi alterada com sucesso.",
    });
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
    toast({
      title: "Foto removida",
      description: "A imagem foi excluída do gerenciador.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      <SidebarNav items={ADMIN_NAV_ITEMS} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className="flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <ImageIcon className="h-7 w-7 text-primary" /> Galeria da Tela Inicial
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as fotos, destaques e banners que os visitantes e pais visualizam na Home.
              </p>
            </div>
          </div>

          <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto h-11 shadow-sm">
            <Plus className="mr-2 h-5 w-5" /> Adicionar Foto
          </Button>
        </div>

        {/* Modal Dinâmico de Formulário */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPhoto ? "Editar Imagem de Destaque" : "Nova Imagem de Destaque"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => handleSavePhoto(e, false)} className="space-y-4 pt-2">
              
              <div className="space-y-2">
                <Label htmlFor="title">Título da Imagem</Label>
                <Input
                  id="title"
                  placeholder="Ex: Primeira Comunhão Turma 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Upload de Arquivo no lugar do Link de URL */}
              <div className="space-y-2">
                <Label htmlFor="image-file">
                  {editingPhoto ? "Substituir Imagem (Opcional)" : "Upload da Imagem"}
                </Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors relative cursor-pointer">
                  <Input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                  />
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground text-center">
                    {selectedFile ? (
                      <strong className="text-primary truncate block max-w-[250px]">
                        {selectedFile.name}
                      </strong>
                    ) : (
                      "Clique ou arraste um arquivo de imagem aqui"
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição / Legenda</Label>
                <Textarea
                  id="description"
                  placeholder="Breve texto explicativo sobre o evento da foto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              
              {/* Rodapé com botões de Ação + Rascunho */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>

                {/* Salvar como rascunho apenas se estiver criando */}
                {!editingPhoto && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={(e) => handleSavePhoto(e, true)}
                    className="border-amber-500 text-amber-600 hover:bg-amber-50"
                  >
                    Salvar como Rascunho
                  </Button>
                )}

                <Button type="submit">
                  {editingPhoto ? "Salvar Alterações" : "Publicar na Home"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Grid de Banners/Cards */}
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-16 text-center bg-background">
            <ImageIcon className="h-12 w-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-lg font-semibold">Nenhuma foto cadastrada</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden flex flex-col group border shadow-sm hover:shadow-md transition-all">
                
                <div className="relative aspect-video w-full bg-muted overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant={photo.isActive ? "default" : "secondary"} className="shadow-sm">
                      {photo.isActive ? "Exibindo na Home" : "Oculto"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-1">{photo.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                      {photo.description || "Sem descrição informada."}
                    </p>
                  </div>

                  {/* Ações de Linha */}
                  <div className="flex items-center justify-between pt-2 border-t mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePhotoStatus(photo.id)}
                      className="text-xs flex items-center gap-1.5 h-9"
                    >
                      {photo.isActive ? (
                        <>
                          <XCircle className="h-4 w-4 text-amber-500" /> Ocultar da Home
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Ativar na Home
                        </>
                      )}
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditModal(photo)}
                        className="text-muted-foreground hover:text-foreground h-9 w-9"
                        title="Editar detalhes"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9"
                        title="Excluir imagem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
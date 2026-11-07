import santos from "@/assets/santos.jpg";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Camera,
  HandHeart,
  Heart,
  Lightbulb,
  Target,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { API_ROUTES } from "@/lib/routes";
import { fetchPublic } from "@/lib/api";

const values = [
  {
    icon: Heart,
    title: "Amor",
    description:
      "Amor a Deus e ao próximo como fundamento de toda ação catequética.",
  },
  {
    icon: BookOpen,
    title: "Aprendizado",
    description:
      "Formação contínua na fé através do conhecimento das escrituras e tradição.",
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Construção de uma comunidade viva e solidária em Cristo.",
  },
  {
    icon: Target,
    title: "Missão",
    description: "Transmitir a fé cristã com autenticidade e alegria.",
  },
  {
    icon: Lightbulb,
    title: "Inovação",
    description:
      "Metodologias modernas e inclusivas para melhor educação cristã.",
  },
  {
    icon: HandHeart,
    title: "Inclusão",
    description: "Acolhimento de todas as crianças e famílias sem distinção.",
  },
];

const catechists = [
  {
    name: "Coordenador Geral",
    role: "Responsável pelas atividades catequéticas",
    description: "Formação e supervisão de todo o programa.",
  },
  {
    name: "Catequista Nível I",
    role: "Iniciação cristã",
    description: "Normalização das crianças",
  },
  {
    name: "Catequista Nível II",
    role: "Formação intermediária",
    description: "Preparação para receber a Eucaristia.",
  },
  {
    name: "Catequista Nível III",
    role: "Preparação para sacramentos",
    description: "Preparação para a Crisma e vida cristã ativa.",
  },
];

interface PublicPhoto {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  criadoEm: string;
}

export default function Sobre() {
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [photos, setPhotos] = useState<PublicPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      setLoadingPhotos(true);

      try {
        const response = await fetchPublic(API_ROUTES.photosPublic);

        if (!response.ok) {
          setPhotos([]);
          return;
        }

        const data = await response.json();
        const list = Array.isArray(data?.photos)
          ? data.photos
          : Array.isArray(data)
            ? data
            : [];

        setPhotos(
          list.map((item: any) => ({
            id: String(item.id),
            title: String(item.title || ""),
            description: item.description || null,
            imageUrl: String(item.imageUrl || ""),
            criadoEm: String(item.criadoEm || ""),
          })),
        );
      } catch (error) {
        console.error("Erro ao carregar fotos públicas:", error);
        setPhotos([]);
      } finally {
        setLoadingPhotos(false);
      }
    };

    void loadPhotos();
  }, []);

  const visiblePhotos = useMemo(() => {
    return galleryExpanded ? photos : photos.slice(0, 3);
  }, [galleryExpanded, photos]);

  return (
    <MainLayout>
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-navy-dark/60" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${santos})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container relative z-10 px-4 py-32 md:px-6 md:py-48">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl animate-slide-up">
              Nossa História e Missão
            </h1>
            <p
              className="mb-8 text-lg text-primary-foreground/90 md:text-xl animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              O objetivo da Catequese do Bom Pastor é promover o encontro
              pessoal da criança com Jesus através do trabalho e da oração, a
              partir dos 3 anos de idade.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full block translate-y-[1px]"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 font-display text-3xl font-bold text-foreground md:text-4xl">
              Origem da Catequese do Bom Pastor
            </h2>
            <p className="mb-4 text-lg text-muted-foreground">
              A Catequese do Bom Pastor foi criada pela Doutora em Ciências
              Religiosas, <strong>Sofia Cavalletti</strong>, em Roma, em 1954,
              contando com a colaboração de <strong>Gianna Gobbi</strong>,
              perita montessoriana. Difundiu-se rapidamente em ambientes sociais
              muito diversos, e a partir de 1969, expandiu-se para países e
              culturas diferentes como Brasil, Estados Unidos, México, Canadá,
              Argentina, Colômbia, Panamá, Chile, Equador, França, Alemanha,
              Áustria, Croácia, Polônia, Noruega, Austrália e Japão.
            </p>
            <p className="mb-4 text-lg text-muted-foreground">
              <strong>Uma Descoberta Importante:</strong> Observou-se que as
              crianças desde a mais tenra idade procuram avidamente uma
              experiência religiosa. Satisfazem-se apenas se são ajudadas a
              vivê-la em seus elementos mais profundos e essenciais, deixando de
              lado toda infantilidade.
            </p>
            <p className="mb-4 text-lg text-muted-foreground">
              É essencial que o adulto se coloque a seu serviço, conheça a
              criança e lhe proporcione um ambiente propício: quando se
              conseguem estas condições a criança vive com encanto e profunda
              alegria sua relação com Deus. Nosso papel é preparar um ambiente
              ideal, propiciar o encontro da criança com Jesus e desaparecer
              (semelhante a João Batista).
            </p>
          </div>
        </div>
      </section>

      {/* Characteristics of the Child Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 font-display text-3xl font-bold text-foreground md:text-4xl">
              Características da Criança de 3 a 6 Anos
            </h2>
            <div className="space-y-6">
              <Card variant="default">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    A criança nesta faixa etária é essencial, seu interesse é
                    voltado para o mais importante, quer respostas simples, sem
                    adornos. Tem imensa capacidade de contemplação, absorve
                    conhecimentos através de todos os seus sentidos e
                    "permanece" nesta contemplação.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    É metafísica, capaz de relacionar-se com o transcendente.
                    Como a criança é puro amor, assim como Deus, esses dois
                    amores se atraem. Ela busca o amor puro, semelhante ao dela,
                    vivenciando uma relação genuína e profunda.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    <strong>Formação Integral:</strong> A natureza é e o homem
                    se faz: nessa primeira fase, a criança está construindo seu
                    "ser". O intuito da catequese é buscar a simplicidade e o
                    lado contemplativo, para nos transformarmos em crianças,
                    estudando o que responde às necessidades de cada faixa
                    etária. Cada anúncio leva a um momento de oração e
                    contemplação do mistério apresentado.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Themes of Catechesis Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Temas da Catequese
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nossa catequese é estruturada em conteúdos bíblicos, litúrgicos e
              celebrativos
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Biblical Content */}
            <Card variant="default" className="animate-slide-up">
              <CardHeader>
                <CardTitle className="text-xl">Conteúdo Bíblico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  A Catequese é <strong>cristocêntrica</strong>, anuncia quem é
                  Cristo, o que Ele disse, e o que Ele é. Está portanto voltada
                  ao Novo Testamento, vida, morte e ressurreição de Cristo.
                </p>
                <p className="text-muted-foreground text-sm">
                  <strong>Parábolas apresentadas:</strong> Bom Pastor e Ovelha
                  Encontrada, Parábolas do Reino (Semente de Mostarda, Mercador
                  de Pérolas, Tesouro Escondido, Fermento, Grão de Trigo) e os
                  Acontecimentos da Infância, Morte e Ressurreição.
                </p>
              </CardContent>
            </Card>

            {/* Liturgical Content */}
            <Card
              variant="default"
              className="animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader>
                <CardTitle className="text-xl">Conteúdo Litúrgico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  A Liturgia é o trabalho do povo de Deus que permite viver o
                  que a Bíblia anuncia, a Salvação. Apresentamos às crianças:
                </p>
                <ul className="text-muted-foreground text-sm space-y-2">
                  <li>✦ Presença Eucarística</li>
                  <li>✦ Gestos do Sacerdote</li>
                  <li>✦ Cores Litúrgicas</li>
                  <li>✦ Calendário Litúrgico</li>
                  <li>✦ Imagem da Luz</li>
                  <li>✦ Batismo</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Celebration Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 font-display text-3xl font-bold text-foreground md:text-4xl text-center">
              A Catequese Como Celebração
            </h2>
            <p className="text-lg text-muted-foreground mb-8 text-center">
              Dizemos que a catequese não é completa se não tiver o caráter
              celebrativo
            </p>
            <div className="space-y-6">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>O Ambiente Preparado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    O <strong>átrio</strong> é a comunidade na qual as crianças,
                    desde seus primeiríssimos anos, vivem junto com os adultos
                    uma experiência religiosa que as ajuda a inserir-se na
                    comunidade mais ampla, familiar, eclesial e social.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle>Espaço de Oração e Contemplação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    É um lugar de oração no qual o trabalho e o estudo chegam a
                    ser espontaneamente meditação, oração, contemplação e alegre
                    experiência. É um lugar no qual o único mestre é Cristo:
                    crianças e adultos se unem para escutar sua Palavra e buscam
                    penetrar no mistério da celebração litúrgica.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle>O Papel do Catequista</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    O catequista é um instrumento que auxilia o encontro 
                    pessoal de cada catequizando com o Senhor, no espírito de pobreza 
                    cujos frutos não lhe pertencem. Sua tarefa é
                    preparar um ambiente acolhedor e estar a serviço do encontro
                    da criança com Jesus.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle>Elementos da Celebração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-foreground mb-2">
                      1. Alegria e Dignidade
                    </p>
                    <p className="text-muted-foreground text-sm">
                      A alegria vem da dignidade da criança. É no átrio que as
                      crianças encontram a dignidade de sua relação com Deus,
                      sua própria relação, e daí vem a alegria.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">
                      2. Expressão Livre
                    </p>
                    <p className="text-muted-foreground text-sm">
                      A celebração provoca oração, e às vezes desenhos ou outras
                      formas de expressão. O silêncio é a linguagem da
                      celebração.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* PNSV History Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 font-display text-3xl font-bold text-foreground md:text-4xl">
              Catequese Bom Pastor na Paróquia PNSV
            </h2>
            <div className="space-y-6 text-muted-foreground">
              <Card variant="default">
                <CardContent className="pt-6">
                  <p className="leading-relaxed">
                    A Catequese Bom Pastor foi implantada na Paróquia Nossa Senhora de Vigilância com o propósito 
                    de trazer a metodologia inovadora e centrada na criança para nossa comunidade local. 
                    Desde sua fundação, o programa tem se desenvolvido como um espaço de encontro genuíno 
                    entre as crianças e Jesus Cristo.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="pt-6">
                  <p className="font-semibold text-foreground mb-3">Nossa Jornada:</p>
                  <p className="leading-relaxed mb-4">
                    Começamos com um pequeno grupo de crianças e catequistas dedicados, determinados a oferecer 
                    uma formação cristã diferenciada, respeitosa e contemplativa. Ao longo dos anos, crescemos 
                    significativamente, mantendo sempre o foco no desenvolvimento integral da fé das crianças 
                    em um ambiente acolhedor e seguro.
                  </p>
                  <p className="leading-relaxed">
                    Hoje, somos uma comunidade vibrante de crianças, famílias e catequistas que trabalham juntos 
                    para viver e transmitir a fé cristã autêntica, participando ativamente nas celebrações e 
                    eventos da paróquia.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="pt-6">
                  <p className="font-semibold text-foreground mb-3">Compromissos Atuais:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span>Formação cristã de qualidade para crianças de 6 a 9 anos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span>Preparação dos sacramentos (Batismo, Eucaristia e Confirmação)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span>Desenvolvimento de catequistas bem formados e dedicados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span>Integração das famílias na vida comunitária da paróquia</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span>Celebrações e eventos que enriquecem a experiência espiritual</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Momentos Especiais
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Confira as fotos e vídeos dos nossos encontros, celebrações e eventos especiais da catequese
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            {loadingPhotos ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Carregando momentos especiais...
                </CardContent>
              </Card>
            ) : visiblePhotos.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhuma foto publicada no momento.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visiblePhotos.map((photo, index) => (
                  <Card
                    key={photo.id}
                    className="group overflow-hidden transition-shadow hover:shadow-lg animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="pt-4">
                      <p className="text-sm font-semibold text-foreground line-clamp-2">
                        {photo.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {photo.description || "Momento especial da catequese."}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {photos.length > 3 && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setGalleryExpanded(!galleryExpanded)}
                  variant={galleryExpanded ? "outline" : "default"}
                  size="lg"
                  className="min-w-max"
                >
                  {galleryExpanded ? "Mostrar menos" : "Ver Galeria Completa"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Nossa Equipe
            </h2>
            <p className="text-muted-foreground">
              Catequistas dedicados à formação cristã
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {catechists.map((catechist, index) => (
              <Card
                key={catechist.name}
                variant="interactive"
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{catechist.name}</CardTitle>
                  <CardDescription className="text-sm text-primary">
                    {catechist.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {catechist.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Faça Parte de Nossa Comunidade
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Ser catequista é ser um instrumento de salvação de almas. 
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="xl" asChild>
                <Link to="/inscricao">Seja Catequista</Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/login">Entrar no Portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

import logoParoquia from "@/assets/logo-paroquia.jpg";
import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-navy text-primary-foreground">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logoParoquia}
                alt="Logo Paróquia"
                className="h-12 w-12 object-contain rounded-full"
              />
              <div>
                <h3 className="font-display text-lg font-semibold">
                  Portal de Catequese
                </h3>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Formando cristãos comprometidos com a fé, a comunidade e o amor ao
              próximo.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">
              Links Rápidos
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/" className="transition-colors hover:text-gold">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition-colors hover:text-gold">
                  Área do Responsável
                </Link>
              </li>
              <li>
                <Link
                  to="/inscricao"
                  className="transition-colors hover:text-gold"
                >
                  Seja Catequista
                </Link>
              </li>
              <li>
                <Link
                  to="/#lojinha"
                  className="transition-colors hover:text-gold"
                >
                  Lojinha
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Contato</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                (11) 1234-5678
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" />
                catequese@paroquia.org.br
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                Vicente Pires, rua 4
                <br />
                Brasília - DF
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Horários</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <strong className="text-gold">Secretaria:</strong>
                <br />
                Seg a Sex: 9h às 17h
              </li>
              <li>
                <strong className="text-gold">Aulas de Catequese:</strong>
                <br />
                Sábados: 9h às 11h
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/20 pt-8 md:flex-row">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Portal de Catequese. Todos os direitos
            reservados.
          </p>
          <p className="flex items-center gap-1 text-sm text-primary-foreground/60">
            Feito com <Heart className="h-4 w-4 text-gold" /> para a comunidade
          </p>
        </div>
      </div>
    </footer>
  );
}

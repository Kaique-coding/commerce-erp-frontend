import { Genero }        from '../enums/genero.enum';
import { PerfilUsuario } from '../enums/perfil-usuario.enum';

/** Espelha UsuarioResponseDto.java */
export interface UsuarioResponseDto {
  id:                 string;
  usuario:            string;
  nome:               string;
  sobrenome:          string;
  emailPrincipal:     string;
  emailSecundario:    string | null;
  dataNascimento:     string;       // ISO-8601 "YYYY-MM-DD"
  cpf:                string;
  rg:                 string | null;
  senha:              string;       // hash SHA-256 — não exibir
  telefonePrincipal:  string;
  telefoneSecundario: string | null;
  perfilUsuario:      PerfilUsuario;
  genero:             Genero;
  ativo:              boolean;
  criadoPor:          string | null;
  criadoEm:           string;       // ISO-8601 LocalDateTime
}

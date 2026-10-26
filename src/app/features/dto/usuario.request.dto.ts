import { Genero }        from '../enums/genero.enum';
import { PerfilUsuario } from '../enums/perfil-usuario.enum';

/** Espelha UsuarioRequestDto.java */
export interface UsuarioRequestDto {
  usuario:            string;
  nome:               string;
  sobrenome:          string;
  emailPrincipal:     string;
  emailSecundario:    string | null;
  dataNascimento:     string;       // ISO-8601 LocalDate → "YYYY-MM-DD"
  cpf:                string;
  rg:                 string | null;
  /** Omitida no cadastro administrativo; o backend gera uma senha temporária. */
  senha?:             string | null;
  telefonePrincipal:  string;
  telefoneSecundario: string | null;
  perfilUsuario:      PerfilUsuario;
  genero:             Genero;
  ativo:              boolean;
}

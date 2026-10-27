import { Genero }        from '../enums/genero.enum';
import { PerfilUsuario } from '../enums/perfil-usuario.enum';


export interface UsuarioRequestDto {
  usuario:            string;
  nome:               string;
  sobrenome:          string;
  emailPrincipal:     string;
  emailSecundario:    string | null;
  dataNascimento:     string;
  cpf:                string;
  rg:                 string | null;

  senha?:             string | null;
  telefonePrincipal:  string;
  telefoneSecundario: string | null;
  perfilUsuario:      PerfilUsuario;
  genero:             Genero;
  ativo:              boolean;
}

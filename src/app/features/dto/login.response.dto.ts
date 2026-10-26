import { PerfilUsuario } from '../enums/perfil-usuario.enum';

export interface LoginResponseDto {
    acessoPermitido: boolean;
    token: string | null;
    mensagem: string;
    notificacaoBoasVindas?: boolean;
    perfilUsuario?: PerfilUsuario | null;
}

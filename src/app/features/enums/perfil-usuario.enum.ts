
export enum PerfilUsuario {
  CLIENTE          = 'CLIENTE',
  USUARIO_INTERNO  = 'USUARIO_INTERNO',
}

export const PERFIL_USUARIO_LABELS: Record<PerfilUsuario, string> = {
  [PerfilUsuario.CLIENTE]:         'Cliente',
  [PerfilUsuario.USUARIO_INTERNO]: 'Usuário interno',
};

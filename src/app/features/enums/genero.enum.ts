/** Espelha o enum Genero do back-end. */
export enum Genero {
  MASCULINO     = 'MASCULINO',
  FEMININO      = 'FEMININO',
  NAO_INFORMADO = 'NAO_INFORMADO',
}

export const GENERO_LABELS: Record<Genero, string> = {
  [Genero.MASCULINO]:     'Masculino',
  [Genero.FEMININO]:      'Feminino',
  [Genero.NAO_INFORMADO]: 'Prefiro não informar',
};

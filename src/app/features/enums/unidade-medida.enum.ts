
export enum UnidadeMedida {
  UNIDADE     = 'UNIDADE',
  CAIXA       = 'CAIXA',
  METRO       = 'METRO',
  LITRO       = 'LITRO',
  QUILOGRAMA  = 'QUILOGRAMA',
  FARDO       = 'FARDO',
}


export const UNIDADE_MEDIDA_LABELS: Record<UnidadeMedida, string> = {
  [UnidadeMedida.UNIDADE]:    'Unidade (UN)',
  [UnidadeMedida.CAIXA]:      'Caixa (CX)',
  [UnidadeMedida.METRO]:      'Metro (M)',
  [UnidadeMedida.LITRO]:      'Litro (L)',
  [UnidadeMedida.QUILOGRAMA]: 'Quilograma (KG)',
  [UnidadeMedida.FARDO]:      'Fardo (FD)',
};

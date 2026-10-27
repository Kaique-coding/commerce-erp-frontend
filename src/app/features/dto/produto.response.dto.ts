export interface ProdutoResponseDto {
  id: string;
  nome: string;
  descricao: string | null;
  marca: string | null;
  modelo: string | null;
  cor: string | null;
  localizacao: string | null;
  estoque: number | null;
  estoqueMinimo: number | null;
  estoqueMaximo: number | null;

  unidadeMedidaCompra: string | null;
  unidadeMedidaVenda: string | null;
  valorVenda: number;
  valorCompra: number | null;
  ativo: boolean;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm?: string | null;
  imagem?: ProdutoImagemResponseDto | null;
}

export interface ProdutoImagemResponseDto {
  id: string;

  imagem: string | number[];
  nomeArquivo: string | null;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm: string | null;
}

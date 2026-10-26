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
  /** Descrição textual do enum — ex: "Unidade", "Caixa" */
  unidadeMedidaCompra: string | null;
  unidadeMedidaVenda: string | null;
  valorVenda: number;
  valorCompra: number | null;
  ativo: boolean;
  criadoPor: string;
  criadoEm: string; // ISO-8601 LocalDateTime → string no JSON
  atualizadoEm?: string | null; // ISO-8601; null para itens que ainda não foram atualizados
  imagem?: ProdutoImagemResponseDto | null;
}

export interface ProdutoImagemResponseDto {
  id: string;
  /** Jackson serializa byte[] como Base64; array numérico também é aceito para compatibilidade. */
  imagem: string | number[];
  nomeArquivo: string | null;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm: string | null;
}

import { UnidadeMedida } from '../enums/unidade-medida.enum';

export interface ProdutoRequestDto {
  nome: string;
  descricao: string | null;
  marca: string | null;
  modelo: string | null;
  cor: string | null;
  localizacao: string | null;
  estoque: number | null;
  estoqueMinimo: number | null;
  estoqueMaximo: number | null;
  unidadeMedidaCompra: UnidadeMedida | null;
  unidadeMedidaVenda: UnidadeMedida | null;
  valorVenda: number;
  valorCompra: number | null;
  ativo: boolean;

  imagem?: number[] | null;
  nomeArquivo?: string | null;
}

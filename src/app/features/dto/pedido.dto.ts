export type PedidoStatus =
  | 'PENDENTE'
  | 'CONFIRMADO'
  | 'EM_PREPARACAO'
  | 'ENVIADO'
  | 'ENTREGUE'
  | 'CANCELADO';

export type FormaPagamento =
  | 'PIX'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'BOLETO_BANCARIO';

export const FORMA_PAGAMENTO_LABELS: Record<FormaPagamento, string> = {
  PIX: 'Pix',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  BOLETO_BANCARIO: 'Boleto bancário',
};

export interface PedidoProdutoRequestDto {
  produtoId: string;
  quantidade: number;
}

export interface PedidoRequestDto {

  produtos: PedidoProdutoRequestDto[];
  formaPagamento: FormaPagamento;
}

export interface PedidoProdutoResponseDto {
  id: string;
  produtoId: string;
  nomeProduto: string;
  marca: string | null;
  modelo: string | null;
  unidadeMedidaVenda: string | null;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
}

export interface PedidoResponseDto {
  id: string;
  clienteId: string;
  clienteNome: string;
  cliente: PedidoClienteResponseDto;
  status: PedidoStatus;
  formaPagamento: FormaPagamento | null;
  valorTotal: number;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm: string | null;
  produtos: PedidoProdutoResponseDto[];
}

export interface PedidoClienteResponseDto {
  id: string;
  nome: string;
  sobrenome: string;
  emailPrincipal: string;
  telefonePrincipal: string;
}

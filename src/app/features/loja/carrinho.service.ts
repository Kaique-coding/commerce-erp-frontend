import { Injectable, computed, signal } from '@angular/core';
import { ProdutoResponseDto } from '../dto/produto.response.dto';

export interface ItemCarrinho {
  produto: ProdutoResponseDto;
  quantidade: number;
}

const CHAVE_CARRINHO = 'commerce-erp-carrinho';

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private readonly estado = signal<ItemCarrinho[]>(this.carregar());

  readonly itens = this.estado.asReadonly();
  readonly quantidadeTotal = computed(() =>
    this.estado().reduce((total, item) => total + item.quantidade, 0),
  );
  readonly subtotal = computed(() =>
    this.estado().reduce((total, item) => total + item.produto.valorVenda * item.quantidade, 0),
  );

  adicionar(produto: ProdutoResponseDto): boolean {
    const existente = this.estado().find(item => item.produto.id === produto.id);
    const novaQuantidade = (existente?.quantidade ?? 0) + 1;
    if (produto.estoque !== null && novaQuantidade > produto.estoque) return false;


    const produtoCarrinho = { ...produto, imagem: null };
    this.estado.update(itens => existente
      ? itens.map(item => item.produto.id === produto.id
        ? { produto: produtoCarrinho, quantidade: novaQuantidade }
        : item)
      : [...itens, { produto: produtoCarrinho, quantidade: 1 }]);
    this.persistir();
    return true;
  }

  alterarQuantidade(produtoId: string, quantidade: number): void {
    const item = this.estado().find(atual => atual.produto.id === produtoId);
    if (!item) return;

    const limitada = item.produto.estoque === null
      ? Math.max(1, quantidade)
      : Math.max(1, Math.min(quantidade, item.produto.estoque));
    this.estado.update(itens => itens.map(atual => atual.produto.id === produtoId
      ? { ...atual, quantidade: limitada }
      : atual));
    this.persistir();
  }

  remover(produtoId: string): void {
    this.estado.update(itens => itens.filter(item => item.produto.id !== produtoId));
    this.persistir();
  }

  limpar(): void {
    this.estado.set([]);
    this.persistir();
  }

  private carregar(): ItemCarrinho[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const dados: unknown = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) ?? '[]');
      if (!Array.isArray(dados)) return [];
      return dados.filter((item): item is ItemCarrinho =>
        typeof item?.produto?.id === 'string'
        && typeof item?.produto?.nome === 'string'
        && typeof item?.produto?.valorVenda === 'number'
        && Number.isInteger(item?.quantidade)
        && item.quantidade > 0,
      );
    } catch {
      return [];
    }
  }

  private persistir(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(this.estado()));
    }
  }
}

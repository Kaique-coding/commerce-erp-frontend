import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProdutoResponseDto } from '../dto/produto.response.dto';
import { ProdutoService } from '../service/produto.service';
import { CarrinhoService } from './carrinho.service';
import { produtoImagemDataUrl } from '../utils/produto-imagem.util';

@Component({
  selector: 'app-loja-catalogo',
  standalone: true,
  imports: [ButtonModule, InputTextModule, PaginatorModule, ProgressSpinnerModule, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="catalogo" aria-labelledby="catalogo-titulo">
      <header class="catalogo__header">
        <div>
          <span class="catalogo__eyebrow">COMMERCE ERP · LOJA</span>
          <h1 id="catalogo-titulo">Encontre o que você procura</h1>
          <p>Explore nosso catálogo e adicione seus produtos favoritos ao carrinho.</p>
        </div>
        <label class="catalogo__busca">
          <i class="pi pi-search" aria-hidden="true"></i>
          <input pInputText type="search" placeholder="Buscar produtos..." aria-label="Buscar produtos"
            [value]="busca()" (input)="pesquisar($event)" />
        </label>
      </header>

      @if (mensagemCarrinho()) {
        <p class="catalogo__feedback" role="status" aria-live="polite">{{ mensagemCarrinho() }}</p>
      }

      @if (carregando()) {
        <div class="catalogo__estado" role="status" aria-label="Carregando produtos">
          <p-progressspinner strokeWidth="4" />
          <span>Carregando produtos...</span>
        </div>
      } @else if (erro()) {
        <div class="catalogo__estado catalogo__estado--erro" role="alert">
          <i class="pi pi-wifi" aria-hidden="true"></i>
          <strong>Não foi possível carregar o catálogo.</strong>
          <span>{{ erro() }}</span>
          <p-button label="Tentar novamente" icon="pi pi-refresh" severity="secondary" [outlined]="true" (onClick)="carregarProdutos()" />
        </div>
      } @else if (produtosFiltrados().length === 0) {
        <div class="catalogo__estado">
          <i class="pi pi-search" aria-hidden="true"></i>
          <strong>{{ busca() ? 'Nenhum produto encontrado' : 'Ainda não há produtos disponíveis' }}</strong>
          <span>{{ busca() ? 'Tente buscar por outro nome, marca ou modelo.' : 'Volte em breve para conferir as novidades.' }}</span>
        </div>
      } @else {
        <div class="catalogo__resumo" aria-live="polite">
          {{ produtosFiltrados().length }} {{ produtosFiltrados().length === 1 ? 'produto disponível' : 'produtos disponíveis' }}
        </div>
        <div class="catalogo__grid">
          @for (produto of produtosDaPagina(); track produto.id) {
            <article class="produto-card">
              <div class="produto-card__visual">
                @if (imagemSrc(produto); as imagem) {
                  <img [src]="imagem" [alt]="'Imagem de ' + produto.nome" loading="lazy" />
                } @else {
                  <i class="pi pi-box" aria-hidden="true"></i>
                  @if (produto.marca) { <span aria-hidden="true">{{ produto.marca }}</span> }
                }
              </div>
              <div class="produto-card__body">
                <div class="produto-card__tags">
                  @if (produto.marca) { <p-tag [value]="produto.marca" severity="secondary" /> }
                  @if (produto.estoque !== null && produto.estoque <= 0) {
                    <p-tag value="Indisponível" severity="danger" />
                  }
                </div>
                <h2>{{ produto.nome }}</h2>
                @if (produto.modelo) { <p class="produto-card__modelo">{{ produto.modelo }}</p> }
                <p class="produto-card__descricao">{{ produto.descricao || 'Confira os detalhes deste produto.' }}</p>
                @if (produto.estoque !== null && produto.estoque > 0) {
                  <p class="produto-card__estoque">{{ produto.estoque }}{{ produto.unidadeMedidaVenda ? ' ' + produto.unidadeMedidaVenda : '' }} disponíveis</p>
                }
                <div class="produto-card__rodape">
                  <strong class="produto-card__preco">{{ formatarMoeda(produto.valorVenda) }}</strong>
                  <p-button label="Adicionar" icon="pi pi-shopping-cart" (onClick)="adicionar(produto)"
                    [disabled]="produto.estoque !== null && produto.estoque <= quantidadeNoCarrinho(produto.id)"
                    [attr.aria-label]="'Adicionar ' + produto.nome + ' ao carrinho'" />
                </div>
              </div>
            </article>
          }
        </div>
        <p-paginator [first]="primeiro()" [rows]="linhas()" [totalRecords]="produtosFiltrados().length"
          [rowsPerPageOptions]="[8, 12, 24]" (onPageChange)="mudarPagina($event)"
          aria-label="Paginação do catálogo" />
      }
    </section>
  `,
  styleUrl: './loja-catalogo.component.scss',
})
export class LojaCatalogoComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly carrinho = inject(CarrinhoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly busca = signal('');
  readonly mensagemCarrinho = signal('');
  readonly primeiro = signal(0);
  readonly linhas = signal(8);
  private readonly produtos = signal<ProdutoResponseDto[]>([]);

  readonly produtosFiltrados = computed(() => {
    const termos = this.normalizar(this.busca()).split(/\s+/).filter(Boolean);
    return this.produtos().filter(produto => {
      const texto = this.normalizar([produto.nome, produto.marca, produto.modelo, produto.descricao, produto.cor]
        .filter(Boolean).join(' '));
      return termos.every(termo => texto.includes(termo));
    });
  });
  readonly produtosDaPagina = computed(() => this.produtosFiltrados().slice(this.primeiro(), this.primeiro() + this.linhas()));

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.produtoService.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: produtos => {
        this.produtos.set(produtos.filter(produto => produto.ativo));
        this.carregando.set(false);
      },
      error: (error: Error) => {
        this.erro.set(error.message);
        this.carregando.set(false);
      },
    });
  }

  pesquisar(event: Event): void {
    this.busca.set((event.target as HTMLInputElement).value);
    this.primeiro.set(0);
  }

  mudarPagina(event: PaginatorState): void {
    this.primeiro.set(event.first ?? 0);
    this.linhas.set(event.rows ?? 8);
  }

  quantidadeNoCarrinho(produtoId: string): number {
    return this.carrinho.itens().find(item => item.produto.id === produtoId)?.quantidade ?? 0;
  }

  adicionar(produto: ProdutoResponseDto): void {
    if (!this.carrinho.adicionar(produto)) {
      this.mensagemCarrinho.set(`Limite de estoque atingido para “${produto.nome}”.`);
      return;
    }
    this.mensagemCarrinho.set(`“${produto.nome}” foi adicionado ao carrinho.`);
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  imagemSrc(produto: ProdutoResponseDto): string | null {
    return produtoImagemDataUrl(produto.imagem);
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  }
}

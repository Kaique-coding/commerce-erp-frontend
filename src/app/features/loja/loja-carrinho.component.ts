import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CarrinhoService, ItemCarrinho } from './carrinho.service';
import { PedidoService } from '../service/pedido.service';
import { FormaPagamento, FORMA_PAGAMENTO_LABELS } from '../dto/pedido.dto';

@Component({
  selector: 'app-loja-carrinho',
  standalone: true,
  imports: [ButtonModule, DialogModule, FormsModule, RouterLink, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="carrinho" aria-labelledby="carrinho-titulo">
      <header class="carrinho__header">
        <div>
          <span class="carrinho__eyebrow">SUA SELEÇÃO</span>
          <h1 id="carrinho-titulo">Meu carrinho</h1>
          <p>Confira os produtos que você adicionou.</p>
        </div>
        <a routerLink="/loja" class="carrinho__voltar"><i class="pi pi-arrow-left" aria-hidden="true"></i> Continuar comprando</a>
      </header>

      @if (carrinho.itens().length === 0) {
        <div class="carrinho__vazio">
          <i class="pi pi-shopping-cart" aria-hidden="true"></i>
          <h2>Seu carrinho está vazio</h2>
          <p>Explore a loja e adicione produtos para vê-los aqui.</p>
          <p-button label="Ver produtos" icon="pi pi-arrow-right" iconPos="right" routerLink="/loja" />
        </div>
      } @else {
        <div class="carrinho__conteudo">
          <div class="carrinho__lista">
            @for (item of carrinho.itens(); track item.produto.id) {
              <article class="carrinho-item">
                <div class="carrinho-item__icone" aria-hidden="true"><i class="pi pi-box"></i></div>
                <div class="carrinho-item__info">
                  <h2>{{ item.produto.nome }}</h2>
                  <p>{{ item.produto.marca || item.produto.modelo || 'Produto' }}</p>
                  <strong>{{ formatarMoeda(item.produto.valorVenda) }}</strong>
                </div>
                <div class="carrinho-item__quantidade" [attr.aria-label]="'Quantidade: ' + item.quantidade">
                  <button type="button" (click)="diminuir(item)" [attr.aria-label]="'Diminuir quantidade de ' + item.produto.nome">−</button>
                  <span>{{ item.quantidade }}</span>
                  <button type="button" (click)="aumentar(item)" [disabled]="item.produto.estoque !== null && item.quantidade >= item.produto.estoque" [attr.aria-label]="'Aumentar quantidade de ' + item.produto.nome">+</button>
                </div>
                <strong class="carrinho-item__total">{{ formatarMoeda(item.produto.valorVenda * item.quantidade) }}</strong>
                <button class="carrinho-item__remover" type="button" (click)="remover(item)" [attr.aria-label]="'Remover ' + item.produto.nome + ' do carrinho'"><i class="pi pi-trash" aria-hidden="true"></i></button>
              </article>
            }
          </div>
          <aside class="carrinho-resumo" aria-label="Resumo do carrinho">
            <h2>Resumo</h2>
            <div><span>Itens</span><span>{{ carrinho.quantidadeTotal() }}</span></div>
            <div class="carrinho-resumo__total"><span>Subtotal</span><strong>{{ formatarMoeda(carrinho.subtotal()) }}</strong></div>
            <p>O subtotal considera os preços atuais dos produtos selecionados.</p>
            <p-button class="carrinho-resumo__finalizar" label="Finalizar pedido" icon="pi pi-check"
              [disabled]="carrinho.itens().length === 0" (onClick)="abrirConfirmacao()" />
          </aside>
        </div>
      }
    </section>

    <p-dialog header="Confirmar pedido" [visible]="confirmacaoVisivel()"
      (visibleChange)="confirmacaoVisivel.set($event)" [modal]="true" [draggable]="false"
      [resizable]="false" [style]="{ width: '480px', maxWidth: '94vw' }">
      <div class="pedido-confirmacao">
        <span class="pedido-confirmacao__icone"><i class="pi pi-receipt" aria-hidden="true"></i></span>
        <p>Deseja confirmar este pedido com <strong>{{ carrinho.quantidadeTotal() }} {{ carrinho.quantidadeTotal() === 1 ? 'item' : 'itens' }}</strong>?</p>
        <div class="pedido-confirmacao__total"><span>Total do pedido</span><strong>{{ formatarMoeda(carrinho.subtotal()) }}</strong></div>
        <div class="pedido-confirmacao__pagamento">
          <label for="forma-pagamento">Forma de pagamento</label>
          <p-select
            inputId="forma-pagamento"
            [options]="opcoesFormaPagamento"
            [ngModel]="formaPagamento()"
            (ngModelChange)="formaPagamento.set($event)"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione uma forma de pagamento"
            aria-label="Forma de pagamento do pedido"
            appendTo="body"
            styleClass="w-full"
          />
          <small>O pedido será apenas registrado; nenhuma cobrança será realizada.</small>
        </div>
        @if (erroFinalizacao()) {
          <p class="pedido-confirmacao__erro" role="alert">{{ erroFinalizacao() }}</p>
        }
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Voltar ao carrinho" severity="secondary" [outlined]="true"
          [disabled]="finalizando()" (onClick)="confirmacaoVisivel.set(false)" />
        <p-button label="Confirmar pedido" icon="pi pi-check" [loading]="finalizando()"
          [disabled]="!formaPagamento()"
          (onClick)="confirmarPedido()" />
      </ng-template>
    </p-dialog>
  `,
  styleUrl: './loja-carrinho.component.scss',
})
export class LojaCarrinhoComponent {
  readonly carrinho = inject(CarrinhoService);
  private readonly pedidoService = inject(PedidoService);
  private readonly router = inject(Router);
  readonly confirmacaoVisivel = signal(false);
  readonly finalizando = signal(false);
  readonly erroFinalizacao = signal<string | null>(null);
  readonly formaPagamento = signal<FormaPagamento | null>(null);
  readonly opcoesFormaPagamento = Object.entries(FORMA_PAGAMENTO_LABELS).map(([value, label]) => ({
    value: value as FormaPagamento,
    label,
  }));

  diminuir(item: ItemCarrinho): void {
    if (item.quantidade <= 1) this.carrinho.remover(item.produto.id);
    else this.carrinho.alterarQuantidade(item.produto.id, item.quantidade - 1);
  }

  aumentar(item: ItemCarrinho): void {
    this.carrinho.adicionar(item.produto);
  }

  remover(item: ItemCarrinho): void {
    this.carrinho.remover(item.produto.id);
  }

  abrirConfirmacao(): void {
    if (this.carrinho.itens().length === 0) return;
    this.erroFinalizacao.set(null);
    this.formaPagamento.set(null);
    this.confirmacaoVisivel.set(true);
  }

  confirmarPedido(): void {
    const itens = this.carrinho.itens();
    const formaPagamento = this.formaPagamento();
    if (itens.length === 0 || !formaPagamento || this.finalizando()) return;

    this.finalizando.set(true);
    this.erroFinalizacao.set(null);
    this.pedidoService.criar({
      formaPagamento,
      produtos: itens.map(item => ({
        produtoId: item.produto.id,
        quantidade: item.quantidade,
      })),
    }).subscribe({
      next: () => {
        this.finalizando.set(false);
        this.confirmacaoVisivel.set(false);
        this.carrinho.limpar();
        this.formaPagamento.set(null);
        void this.router.navigate(['/loja/pedidos']);
      },
      error: (error: Error) => {
        this.finalizando.set(false);
        this.erroFinalizacao.set(error.message);
      },
    });
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}

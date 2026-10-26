import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { FORMA_PAGAMENTO_LABELS, FormaPagamento, PedidoResponseDto, PedidoStatus } from '../dto/pedido.dto';
import { PedidoService } from '../service/pedido.service';

type StatusSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

@Component({
  selector: 'app-loja-pedidos',
  standalone: true,
  imports: [ButtonModule, DatePipe, ProgressSpinnerModule, RouterLink, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pedidos" aria-labelledby="pedidos-titulo">
      <header class="pedidos__header">
        <div>
          <span class="pedidos__eyebrow">ACOMPANHAMENTO</span>
          <h1 id="pedidos-titulo">Meus pedidos</h1>
          <p>Consulte os produtos e o status dos seus pedidos.</p>
        </div>
        <a routerLink="/loja" class="pedidos__continuar"><i class="pi pi-shopping-bag" aria-hidden="true"></i> Voltar à loja</a>
      </header>

      @if (carregando()) {
        <div class="pedidos__estado" role="status" aria-label="Carregando pedidos">
          <p-progressspinner strokeWidth="4" />
          <span>Carregando seus pedidos...</span>
        </div>
      } @else if (erro()) {
        <div class="pedidos__estado pedidos__estado--erro" role="alert">
          <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
          <strong>Não foi possível carregar seus pedidos.</strong>
          <span>{{ erro() }}</span>
          <p-button label="Tentar novamente" icon="pi pi-refresh" severity="secondary" [outlined]="true" (onClick)="carregar()" />
        </div>
      } @else if (pedidos().length === 0) {
        <div class="pedidos__estado pedidos__vazio">
          <i class="pi pi-receipt" aria-hidden="true"></i>
          <h2>Você ainda não tem pedidos</h2>
          <p>Quando finalizar um pedido, ele aparecerá aqui com os produtos e o status.</p>
          <p-button label="Explorar produtos" icon="pi pi-arrow-right" iconPos="right" routerLink="/loja" />
        </div>
      } @else {
        <div class="pedidos__lista">
          @for (pedido of pedidos(); track pedido.id) {
            <article class="pedido-card">
              <header class="pedido-card__header">
                <div>
                  <span class="pedido-card__referencia">Pedido #{{ pedido.id.slice(0, 8).toUpperCase() }}</span>
                  <p>Feito em {{ pedido.criadoEm | date: 'dd/MM/yyyy, HH:mm' }}</p>
                  <p>Pagamento: {{ formaPagamentoLabel(pedido.formaPagamento) }}</p>
                </div>
                <p-tag [value]="statusLabel(pedido.status)" [severity]="statusSeverity(pedido.status)" />
              </header>
              <div class="pedido-card__produtos">
                @for (item of pedido.produtos; track item.id) {
                  <div class="pedido-item">
                    <span class="pedido-item__icone" aria-hidden="true"><i class="pi pi-box"></i></span>
                    <div class="pedido-item__dados">
                      <strong>{{ item.nomeProduto }}</strong>
                      <span>{{ item.quantidade }}{{ item.unidadeMedidaVenda ? ' ' + item.unidadeMedidaVenda : '' }} × {{ formatarMoeda(item.valorUnitario) }}</span>
                    </div>
                    <strong class="pedido-item__subtotal">{{ formatarMoeda(item.subtotal) }}</strong>
                  </div>
                }
              </div>
              <footer class="pedido-card__footer">
                <span>{{ pedido.produtos.length }} {{ pedido.produtos.length === 1 ? 'produto' : 'produtos' }}</span>
                <div><span>Total do pedido</span><strong>{{ formatarMoeda(pedido.valorTotal) }}</strong></div>
              </footer>
            </article>
          }
        </div>
      }
    </section>
  `,
  styleUrl: './loja-pedidos.component.scss',
})
export class LojaPedidosComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly pedidos = signal<PedidoResponseDto[]>([]);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.pedidoService.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: pedidos => {
        this.pedidos.set(pedidos);
        this.carregando.set(false);
      },
      error: (error: Error) => {
        this.erro.set(error.message);
        this.carregando.set(false);
      },
    });
  }

  statusLabel(status: PedidoStatus): string {
    const labels: Record<PedidoStatus, string> = {
      PENDENTE: 'Pendente',
      CONFIRMADO: 'Confirmado',
      EM_PREPARACAO: 'Em preparação',
      ENVIADO: 'Enviado',
      ENTREGUE: 'Entregue',
      CANCELADO: 'Cancelado',
    };
    return labels[status];
  }

  formaPagamentoLabel(formaPagamento: FormaPagamento | null): string {
    return formaPagamento ? FORMA_PAGAMENTO_LABELS[formaPagamento] : 'Não informado';
  }

  statusSeverity(status: PedidoStatus): StatusSeverity {
    const severities: Record<PedidoStatus, StatusSeverity> = {
      PENDENTE: 'warn',
      CONFIRMADO: 'info',
      EM_PREPARACAO: 'info',
      ENVIADO: 'info',
      ENTREGUE: 'success',
      CANCELADO: 'danger',
    };
    return severities[status];
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}

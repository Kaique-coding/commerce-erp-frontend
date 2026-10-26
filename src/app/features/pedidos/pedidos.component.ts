import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { FORMA_PAGAMENTO_LABELS, FormaPagamento, PedidoResponseDto, PedidoStatus } from '../dto/pedido.dto';
import { PedidoService } from '../service/pedido.service';

interface StatusOption {
  label: string;
  value: PedidoStatus;
}

type StatusSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    DatePipe,
    DialogModule,
    FormsModule,
    InputTextModule,
    ProgressSpinnerModule,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.scss',
})
export class PedidosComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly carregando = signal(true);
  readonly erroCarregamento = signal<string | null>(null);
  readonly filtroTexto = signal('');
  readonly filtroStatus = signal<PedidoStatus | null>(null);
  readonly detalhesVisiveis = signal(false);
  readonly pedidoSelecionado = signal<PedidoResponseDto | null>(null);
  private readonly pedidos = signal<PedidoResponseDto[]>([]);

  readonly opcoesStatus: StatusOption[] = [
    { label: 'Pendente', value: 'PENDENTE' },
    { label: 'Confirmado', value: 'CONFIRMADO' },
    { label: 'Em preparação', value: 'EM_PREPARACAO' },
    { label: 'Enviado', value: 'ENVIADO' },
    { label: 'Entregue', value: 'ENTREGUE' },
    { label: 'Cancelado', value: 'CANCELADO' },
  ];

  readonly pedidosFiltrados = computed(() => {
    const termos = this.normalizar(this.filtroTexto()).split(/\s+/).filter(Boolean);
    const status = this.filtroStatus();
    return this.pedidos().filter(pedido => {
      const texto = this.normalizar([
        pedido.id,
        pedido.clienteNome,
        pedido.cliente?.emailPrincipal,
        pedido.cliente?.telefonePrincipal,
        ...pedido.produtos.map(item => item.nomeProduto),
      ].filter(Boolean).join(' '));
      return (status === null || pedido.status === status)
        && termos.every(termo => texto.includes(termo));
    });
  });

  ngOnInit(): void {
    this.carregarPedidos();
  }

  carregarPedidos(): void {
    this.carregando.set(true);
    this.erroCarregamento.set(null);
    this.pedidoService.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: pedidos => {
        this.pedidos.set(pedidos);
        this.carregando.set(false);
      },
      error: (error: Error) => {
        this.erroCarregamento.set(error.message);
        this.carregando.set(false);
      },
    });
  }

  atualizarPesquisa(texto: string): void {
    this.filtroTexto.set(texto);
  }

  visualizarPedido(pedido: PedidoResponseDto): void {
    this.pedidoSelecionado.set(pedido);
    this.detalhesVisiveis.set(true);
  }

  statusLabel(status: PedidoStatus): string {
    return this.opcoesStatus.find(opcao => opcao.value === status)?.label ?? status;
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

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  }
}

import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { NotificationService } from '../../core/services/notification.service';
import { ProdutoResponseDto } from '../dto/produto.response.dto';
import { UsuarioResponseDto } from '../dto/usuario.response.dto';
import { PerfilUsuario } from '../enums/perfil-usuario.enum';
import { ProdutoService } from '../service/produto.service';
import { UsuarioService } from '../service/usuario.service';

type EstadoCarregamento = 'carregando' | 'carregado' | 'erro';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, DatePipe, ProgressSpinnerModule, TableModule, TagModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly estadoProdutos = signal<EstadoCarregamento>('carregando');
  readonly estadoClientes = signal<EstadoCarregamento>('carregando');
  readonly produtos = signal<ProdutoResponseDto[]>([]);
  readonly clientesAtivos = signal(0);
  readonly clientesCriadosHoje = signal(0);

  readonly produtosRecentes = computed(() => {
    const agora = Date.now();
    const limite = agora - 2 * 24 * 60 * 60 * 1000;

    return this.produtos()
      .filter(produto => {
        const dataAtividade = produto.atualizadoEm ?? produto.criadoEm;
        const instante = new Date(dataAtividade).getTime();
        return Number.isFinite(instante) && instante >= limite && instante <= agora;
      })
      .sort((a, b) => this.instanteAtividade(b) - this.instanteAtividade(a));
  });

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarClientes();
  }

  formatarMoeda(valor: number | null | undefined): string {
    return (valor ?? 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  statusLabel(ativo: boolean): string {
    return ativo ? 'Ativo' : 'Inativo';
  }

  statusSeverity(ativo: boolean): 'success' | 'secondary' {
    return ativo ? 'success' : 'secondary';
  }

  atividadeLabel(produto: ProdutoResponseDto): string {
    return produto.atualizadoEm ? 'Atualizado' : 'Cadastrado';
  }

  private carregarProdutos(): void {
    this.estadoProdutos.set('carregando');
    this.produtoService.listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: produtos => {
          this.produtos.set(produtos);
          this.estadoProdutos.set('carregado');
        },
        error: (error: Error) => {
          this.estadoProdutos.set('erro');
          this.notificationService.error('Erro ao carregar produtos recentes', error.message);
        },
      });
  }

  private carregarClientes(): void {
    this.estadoClientes.set('carregando');
    this.usuarioService.listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: usuarios => {
          const clientes = usuarios.filter(usuario =>
            usuario.perfilUsuario === PerfilUsuario.CLIENTE,
          );
          const hoje = this.dataLocalISO(new Date());

          this.clientesAtivos.set(clientes.filter(usuario => usuario.ativo).length);
          this.clientesCriadosHoje.set(clientes.filter(usuario =>
            usuario.criadoEm?.slice(0, 10) === hoje,
          ).length);
          this.estadoClientes.set('carregado');
        },
        error: (error: Error) => {
          this.estadoClientes.set('erro');
          this.notificationService.error('Erro ao carregar clientes', error.message);
        },
      });
  }

  private instanteAtividade(produto: ProdutoResponseDto): number {
    return new Date(produto.atualizadoEm ?? produto.criadoEm).getTime();
  }

  private dataLocalISO(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return ano + '-' + mes + '-' + dia;
  }
}
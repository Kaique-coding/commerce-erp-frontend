import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type AbstractControl,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { ButtonModule }          from 'primeng/button';
import { CardModule }            from 'primeng/card';
import { TableModule }           from 'primeng/table';
import { DialogModule }          from 'primeng/dialog';
import { InputTextModule }       from 'primeng/inputtext';
import { InputNumberModule }     from 'primeng/inputnumber';
import { SelectModule }          from 'primeng/select';
import { TagModule }             from 'primeng/tag';
import { TooltipModule }         from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToggleSwitchModule }    from 'primeng/toggleswitch';
import { TextareaModule }        from 'primeng/textarea';
import { ConfirmDialogModule }   from 'primeng/confirmdialog';

import { ConfirmationService } from 'primeng/api';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProdutoService }      from '../service/produto.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationCenterService } from '../../core/services/notification-center.service';
import { ProdutoRequestDto } from '../dto/produto.request.dto';
import { ProdutoResponseDto } from '../dto/produto.response.dto';
import { produtoImagemDataUrl } from '../utils/produto-imagem.util';
import {
  UnidadeMedida,
  UNIDADE_MEDIDA_LABELS,
} from '../enums/unidade-medida.enum';

interface SelectOption<T = string> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-produtos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    ToggleSwitchModule,
    TextareaModule,
    ConfirmDialogModule,
  ],
  templateUrl: './produtos.component.html',
  styleUrl:    './produtos.component.scss',
})
export class ProdutosComponent implements OnInit {
  private readonly fb              = inject(FormBuilder);
  private readonly produtoSvc      = inject(ProdutoService);
  private readonly notify          = inject(NotificationService);
  private readonly notificationCenter = inject(NotificationCenterService);
  private readonly confirmationSvc = inject(ConfirmationService);
  private readonly cdr             = inject(ChangeDetectorRef);
  private readonly destroyRef      = inject(DestroyRef);
  private readonly buscaPorId$     = new Subject<string>();



  readonly carregando    = signal(false);
  readonly salvando      = signal(false);
  readonly dialogVisivel = signal(false);
  readonly detalhesVisiveis = signal(false);
  readonly carregandoDetalhes = signal(false);
  readonly produtoSelecionado = signal<ProdutoResponseDto | null>(null);
  readonly modoEdicao    = signal(false);
  readonly imagemSelecionada = signal<File | null>(null);
  readonly previewImagem = signal<string | null>(null);
  readonly erroImagem = signal<string | null>(null);
  readonly nomeImagemOriginal = signal<string | null>(null);
  private readonly imagemOriginalSrc = signal<string | null>(null);

  private idEmEdicao: string | null = null;
  private readonly _produtos = signal<ProdutoResponseDto[]>([]);



  readonly filtroTexto = signal('');
  readonly filtroStatus = signal<boolean | null>(null);

  readonly produtosFiltrados = computed(() => {
    const termos = this.normalizarTexto(this.filtroTexto())
      .split(/\s+/)
      .filter(Boolean);
    const status = this.filtroStatus();

    return this._produtos().filter(p => {
      const textoProduto = this.normalizarTexto([
        p.id,
        p.nome,
        p.descricao,
        p.marca,
        p.modelo,
        p.cor,
        p.localizacao,
      ].filter(Boolean).join(' '));
      const bateTexto = termos.every(termo => textoProduto.includes(termo));
      const bateStatus = status === null ? true : p.ativo === status;
      return bateTexto && bateStatus;
    });
  });



  readonly opcoesUnidade: SelectOption<UnidadeMedida>[] = Object.values(UnidadeMedida).map(v => ({
    label: UNIDADE_MEDIDA_LABELS[v],
    value: v,
  }));

  readonly opcoesStatus: SelectOption<boolean>[] = [
    { label: 'Ativos',   value: true  },
    { label: 'Inativos', value: false },
  ];



  readonly form = this.fb.nonNullable.group({
    nome:               ['', [Validators.required, Validators.maxLength(255)]],
    descricao:          [null as string | null],
    marca:              [null as string | null],
    modelo:             [null as string | null],
    cor:                [null as string | null],
    localizacao:        [null as string | null],
    estoque:            [null as number | null],
    estoqueMinimo:      [null as number | null],
    estoqueMaximo:      [null as number | null],
    unidadeMedidaCompra:[null as UnidadeMedida | null],
    unidadeMedidaVenda: [null as UnidadeMedida | null],
    valorVenda:         [null as number | null, [Validators.required, Validators.min(0.01)]],
    valorCompra:        [null as number | null],
    ativo:              [true],
  });



  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.liberarPreviewImagem());
    this.carregarProdutos();
    this.buscaPorId$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(id => this.ehUuid(id)
          ? this.produtoSvc.buscarPorId(id).pipe(
              catchError((err: Error) => {
                this.notify.error('Erro ao buscar produto por ID', err.message);
                return of(null);
              }),
            )
          : of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(produto => {
        if (!produto) return;

        this._produtos.update(lista => {
          const jaExiste = lista.some(item => item.id === produto.id);
          return jaExiste
            ? lista.map(item => item.id === produto.id ? produto : item)
            : [produto, ...lista];
        });
        this.cdr.markForCheck();
      });
  }



  carregarProdutos(): void {
    this.carregando.set(true);
    this.produtoSvc.listar().subscribe({
      next: lista => {
        this._produtos.set(lista);
        this.carregando.set(false);
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.carregando.set(false);
        this.notify.error('Erro ao carregar produtos', err.message);
        this.cdr.markForCheck();
      },
    });
  }



  atualizarPesquisa(texto: string): void {
    this.filtroTexto.set(texto);
    this.buscaPorId$.next(texto.trim());
  }

  private ehUuid(valor: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor);
  }

  private normalizarTexto(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');
  }



  abrirFormulario(): void {
    this.idEmEdicao = null;
    this.modoEdicao.set(false);
    this.limparImagem();
    this.form.reset({ ativo: true });
    this.dialogVisivel.set(true);
  }

  abrirEdicao(produto: ProdutoResponseDto): void {
    this.idEmEdicao = produto.id;
    this.modoEdicao.set(true);
    this.limparImagem();
    this.imagemOriginalSrc.set(this.imagemProdutoSrc(produto));
    this.nomeImagemOriginal.set(produto.imagem?.nomeArquivo ?? null);
    this.previewImagem.set(this.imagemOriginalSrc());





    this.form.reset({
      nome:               produto.nome,
      descricao:          produto.descricao,
      marca:              produto.marca,
      modelo:             produto.modelo,
      cor:                produto.cor,
      localizacao:        produto.localizacao,
      estoque:            produto.estoque,
      estoqueMinimo:      produto.estoqueMinimo,
      estoqueMaximo:      produto.estoqueMaximo,
      unidadeMedidaCompra: this.resolverEnum(produto.unidadeMedidaCompra),
      unidadeMedidaVenda:  this.resolverEnum(produto.unidadeMedidaVenda),
      valorVenda:         produto.valorVenda,
      valorCompra:        produto.valorCompra,
      ativo:              produto.ativo,
    });
    this.dialogVisivel.set(true);
  }

  visualizarProduto(produto: ProdutoResponseDto): void {
    this.produtoSelecionado.set(produto);
    this.detalhesVisiveis.set(true);
    this.carregandoDetalhes.set(true);


    this.produtoSvc.buscarPorId(produto.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: detalhe => {
          if (this.produtoSelecionado()?.id === produto.id) {
            this.produtoSelecionado.set(detalhe);
          }
          this.carregandoDetalhes.set(false);
          this.cdr.markForCheck();
        },
        error: (err: Error) => {
          this.carregandoDetalhes.set(false);
          this.notify.error('Erro ao carregar dados do produto', err.message);
          this.cdr.markForCheck();
        },
      });
  }

  imagemProdutoSrc(produto: ProdutoResponseDto): string | null {
    return produtoImagemDataUrl(produto.imagem);
  }

  fecharFormulario(): void {
    this.dialogVisivel.set(false);
    this.form.reset();
    this.limparImagem();
  }

  selecionarImagem(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0] ?? null;
    this.erroImagem.set(null);
    if (!arquivo) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    const tamanhoMaximo = 5 * 1024 * 1024;
    if (!tiposPermitidos.includes(arquivo.type)) {
      this.erroImagem.set('Escolha uma imagem PNG, JPG ou WebP.');
      input.value = '';
      return;
    }
    if (arquivo.size > tamanhoMaximo) {
      this.erroImagem.set('A imagem deve ter no máximo 5 MB.');
      input.value = '';
      return;
    }

    this.liberarPreviewImagem();
    this.imagemSelecionada.set(arquivo);
    this.previewImagem.set(URL.createObjectURL(arquivo));
  }

  removerImagem(input: HTMLInputElement): void {
    this.liberarPreviewImagem();
    this.imagemSelecionada.set(null);
    this.erroImagem.set(null);
    this.previewImagem.set(this.imagemOriginalSrc());
    input.value = '';
  }



  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const dto = {
      nome:               raw.nome,
      descricao:          raw.descricao   || null,
      marca:              raw.marca       || null,
      modelo:             raw.modelo      || null,
      cor:                raw.cor         || null,
      localizacao:        raw.localizacao || null,
      estoque:            raw.estoque,
      estoqueMinimo:      raw.estoqueMinimo,
      estoqueMaximo:      raw.estoqueMaximo,
      unidadeMedidaCompra: raw.unidadeMedidaCompra,
      unidadeMedidaVenda:  raw.unidadeMedidaVenda,
      valorVenda:         raw.valorVenda!,
      valorCompra:        raw.valorCompra,
      ativo:              raw.ativo,
    };

    this.salvando.set(true);

    const arquivo = this.imagemSelecionada();
    if (arquivo) {
      arquivo.arrayBuffer().then(buffer => {

        const imagem = Array.from(new Int8Array(buffer));
        this.executarSalvamento({ ...dto, imagem, nomeArquivo: arquivo.name });
      }).catch(() => {
        this.salvando.set(false);
        this.notify.error('Erro ao ler imagem', 'Não foi possível preparar o arquivo selecionado.');
        this.cdr.markForCheck();
      });
      return;
    }

    this.executarSalvamento(dto);
  }

  private executarSalvamento(dto: ProdutoRequestDto): void {
    const operacao$ = this.modoEdicao() && this.idEmEdicao
      ? this.produtoSvc.atualizar(this.idEmEdicao, dto)
      : this.produtoSvc.criar(dto);

    operacao$.subscribe({
      next: produto => {
        this.salvando.set(false);
        if (this.modoEdicao()) {
          this._produtos.update(lista =>
            lista.map(p => (p.id === produto.id ? produto : p))
          );
          this.notify.success('Produto atualizado', `"${produto.nome}" foi atualizado com sucesso.`);
        } else {
          this._produtos.update(lista => [produto, ...lista]);
          this.notify.success('Produto cadastrado', `"${produto.nome}" foi cadastrado com sucesso.`);
          this.notificationCenter.produtoCadastrado(produto.nome);
        }
        this.fecharFormulario();
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.salvando.set(false);
        this.notify.error('Erro ao salvar produto', err.message);
        this.cdr.markForCheck();
      },
    });
  }

  private limparImagem(): void {
    this.liberarPreviewImagem();
    this.imagemSelecionada.set(null);
    this.erroImagem.set(null);
    this.imagemOriginalSrc.set(null);
    this.nomeImagemOriginal.set(null);
  }

  private liberarPreviewImagem(): void {
    const url = this.previewImagem();
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    this.previewImagem.set(null);
  }



  confirmarExclusao(produto: ProdutoResponseDto): void {
    this.notify.confirm({
      header:  'Excluir produto',
      message: `Deseja realmente excluir "${produto.nome}"? Esta ação não pode ser desfeita.`,
      icon:    'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      accept: () => this.executarExclusao(produto),
      
    });
  }

  private executarExclusao(produto: ProdutoResponseDto): void {
    this.confirmationSvc.close();
    this.produtoSvc.excluir(produto.id).subscribe({
      next: () => {
        this._produtos.update(lista => lista.filter(p => p.id !== produto.id));
        this.fecharFormulario();
        this.notify.success('Produto excluído', `"${produto.nome}" foi removido.`);
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.notify.error('Erro ao excluir produto', err.message);
        this.cdr.markForCheck();
      },
    });
  }



  confirmarAlteracaoStatus(produto: ProdutoResponseDto): void {
    const acao   = produto.ativo ? 'inativar' : 'ativar';
    const icone  = produto.ativo ? 'pi pi-ban' : 'pi pi-check-circle';
    this.notify.confirm({
      header:  produto.ativo ? 'Inativar produto' : 'Ativar produto',
      message: `Deseja realmente ${acao} "${produto.nome}"?`,
      icon:    icone,
      acceptLabel: produto.ativo ? 'Inativar' : 'Ativar',
      rejectLabel: 'Cancelar',
      accept: () => this.executarAlteracaoStatus(produto),
    });
  }

  private executarAlteracaoStatus(produto: ProdutoResponseDto): void {
    this.confirmationSvc.close();
    const novoStatus = !produto.ativo;
    this.produtoSvc.atualizarStatus(produto.id, novoStatus).subscribe({
      next: atualizado => {
        this._produtos.update(lista =>
          lista.map(p => (p.id === atualizado.id ? atualizado : p))
        );
        const label = novoStatus ? 'ativado' : 'inativado';
        this.notify.success(`Produto ${label}`, `"${atualizado.nome}" foi ${label} com sucesso.`);
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.notify.error('Erro ao alterar status', err.message);
        this.cdr.markForCheck();
      },
    });
  }



  invalido(campo: string): boolean {
    const ctrl = this.form.get(campo);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  erroMensagem(campo: string): string {
    const ctrl: AbstractControl | null = this.form.get(campo);
    if (!ctrl) return '';
    if (ctrl.hasError('required'))  return 'Campo obrigatório.';
    if (ctrl.hasError('min'))       return `Valor mínimo: ${ctrl.getError('min').min as number}.`;
    if (ctrl.hasError('maxlength')) return `Máximo de ${ctrl.getError('maxlength').requiredLength as number} caracteres.`;
    return '';
  }

  formatarMoeda(valor: number | null | undefined): string {
    if (valor == null) return '—';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }







  private resolverEnum(valor: string | null | undefined): UnidadeMedida | null {
    if (!valor) return null;
    const upper = valor.toUpperCase() as UnidadeMedida;
    return Object.values(UnidadeMedida).includes(upper) ? upper : null;
  }
}

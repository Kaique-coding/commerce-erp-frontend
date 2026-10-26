import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  FormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmationService } from 'primeng/api';
import { NgxMaskDirective } from 'ngx-mask';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NotificationService } from '../../core/services/notification.service';
import { UsuarioRequestDto } from '../dto/usuario.request.dto';
import { UsuarioResponseDto } from '../dto/usuario.response.dto';
import { Genero, GENERO_LABELS } from '../enums/genero.enum';
import { PerfilUsuario, PERFIL_USUARIO_LABELS } from '../enums/perfil-usuario.enum';
import { UsuarioService } from '../service/usuario.service';

interface SelectOption<T = string> {
  label: string;
  value: T;
}

const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const raw = String(control.value ?? '').replace(/\D/g, '');
  if (!raw) return null;
  if (raw.length !== 11 || /^(\d)\1{10}$/.test(raw)) return { cpfInvalido: true };

  const calcularDigito = (tamanho: number): number => {
    let soma = 0;
    for (let i = 0; i < tamanho - 1; i++) soma += Number(raw[i]) * (tamanho - i);
    const resto = (soma * 10) % 11;
    return resto >= 10 ? 0 : resto;
  };

  return calcularDigito(10) === Number(raw[9]) && calcularDigito(11) === Number(raw[10])
    ? null
    : { cpfInvalido: true };
};

const dataNascimentoValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = String(control.value ?? '');
  if (!valor) return null;

  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (!partes) return { dataInvalida: true };

  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  const data = new Date(ano, mes - 1, dia);

  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia
    ? null
    : { dataInvalida: true };
};

@Component({
  selector: 'app-usuarios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    ProgressSpinnerModule,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
    NgxMaskDirective,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.componet.scss',
})
export class UsuariosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notify = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly buscaPorId$ = new Subject<string>();

  readonly dialogVisivel = signal(false);
  readonly detalhesVisiveis = signal(false);
  readonly usuarioSelecionado = signal<UsuarioResponseDto | null>(null);
  readonly salvando = signal(false);
  readonly carregando = signal(false);
  readonly erroCarregamento = signal<string | null>(null);
  readonly modoEdicao = signal(false);
  readonly usuarios = signal<UsuarioResponseDto[]>([]);
  readonly filtroTexto = signal('');
  readonly filtroStatus = signal<boolean | null>(null);
  readonly opcoesStatus: SelectOption<boolean>[] = [
    { label: 'Ativos', value: true },
    { label: 'Inativos', value: false },
  ];
  readonly usuariosFiltrados = computed(() => {
    const consulta = this.normalizarTexto(this.filtroTexto().trim());
    const consultaCpf = consulta.replace(/\D/g, '');
    const status = this.filtroStatus();

    return this.usuarios().filter(usuario => {
      const textoUsuario = this.normalizarTexto([
        usuario.id,
        usuario.usuario,
        usuario.nome,
        usuario.sobrenome,
        usuario.emailPrincipal,
        usuario.cpf,
      ].join(' '));
      const correspondeConsulta = !consulta
        || textoUsuario.includes(consulta)
        || (!!consultaCpf && usuario.cpf.replace(/\D/g, '').includes(consultaCpf));
      const correspondeStatus = status === null || usuario.ativo === status;
      return correspondeConsulta && correspondeStatus;
    });
  });

  private idEmEdicao: string | null = null;

  readonly opcoesGenero: SelectOption<Genero>[] = Object.values(Genero).map(value => ({
    label: GENERO_LABELS[value],
    value,
  }));

  readonly form = this.fb.nonNullable.group({
    usuario: ['', [Validators.required, Validators.maxLength(100)]],
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    sobrenome: ['', [Validators.required, Validators.maxLength(100)]],
    dataNascimento: ['', [Validators.required, dataNascimentoValidator]],
    genero: [null as Genero | null, [Validators.required]],
    cpf: ['', [Validators.required, cpfValidator]],
    rg: [''],
    emailPrincipal: ['', [Validators.required, Validators.email]],
    emailSecundario: ['', [Validators.email]],
    telefonePrincipal: ['', [Validators.required]],
    telefoneSecundario: [''],
  });

  ngOnInit(): void {
    this.carregarUsuarios();
    this.buscaPorId$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(id => this.ehUuid(id)
          ? this.usuarioService.buscarPorId(id).pipe(
              catchError((err: Error) => {
                this.notify.error('Erro ao buscar usuário por ID', err.message);
                return of(null);
              }),
            )
          : of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(usuario => {
        if (!usuario) return;
        this.usuarios.update(lista => lista.some(item => item.id === usuario.id)
          ? lista.map(item => item.id === usuario.id ? usuario : item)
          : [usuario, ...lista]);
        this.cdr.markForCheck();
      });
  }

  carregarUsuarios(): void {
    this.carregando.set(true);
    this.erroCarregamento.set(null);
    this.usuarioService.listar().subscribe({
      next: usuarios => {
        this.usuarios.set(usuarios);
        this.carregando.set(false);
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.carregando.set(false);
        this.erroCarregamento.set(err.message);
        this.cdr.markForCheck();
      },
    });
  }

  abrirFormulario(): void {
    this.idEmEdicao = null;
    this.modoEdicao.set(false);
    this.form.reset({ genero: null });
    this.dialogVisivel.set(true);
  }

  abrirEdicao(usuario: UsuarioResponseDto): void {
    this.idEmEdicao = usuario.id;
    this.modoEdicao.set(true);
    this.form.reset({
      usuario: usuario.usuario,
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      dataNascimento: usuario.dataNascimento ? this.formatarDataParaTela(usuario.dataNascimento) : '',
      genero: usuario.genero,
      cpf: usuario.cpf,
      rg: usuario.rg ?? '',
      emailPrincipal: usuario.emailPrincipal,
      emailSecundario: usuario.emailSecundario ?? '',
      telefonePrincipal: usuario.telefonePrincipal,
      telefoneSecundario: usuario.telefoneSecundario ?? '',
    });
    this.dialogVisivel.set(true);
  }

  visualizarUsuario(usuario: UsuarioResponseDto): void {
    this.usuarioSelecionado.set(usuario);
    this.detalhesVisiveis.set(true);
  }

  mascararCpf(cpf: string | null | undefined): string {
    const numeros = String(cpf ?? '').replace(/\D/g, '');
    if (!numeros) return '—';
    if (numeros.length !== 11) return '***.***.***-**';
    return `${numeros.slice(0, 3)}.***.***-${numeros.slice(-2)}`;
  }

  generoLabel(genero: Genero | null | undefined): string {
    return genero ? GENERO_LABELS[genero] : '—';
  }

  fecharFormulario(): void {
    this.dialogVisivel.set(false);
    this.idEmEdicao = null;
    this.modoEdicao.set(false);
    this.form.reset({ genero: null });
  }

  invalido(campo: string): boolean {
    const controle = this.form.get(campo);
    return !!controle && controle.invalid && controle.touched;
  }

  erroMensagem(campo: string): string {
    const controle = this.form.get(campo);
    if (!controle) return '';
    if (controle.hasError('required')) return 'Campo obrigatório.';
    if (controle.hasError('email')) return 'Informe um e-mail válido.';
    if (controle.hasError('minlength')) {
      return `Mínimo de ${controle.getError('minlength').requiredLength as number} caracteres.`;
    }
    if (controle.hasError('maxlength')) {
      return `Máximo de ${controle.getError('maxlength').requiredLength as number} caracteres.`;
    }
    if (controle.hasError('cpfInvalido')) return 'CPF inválido.';
    if (controle.hasError('dataInvalida')) return 'Informe uma data válida no formato DD/MM/AAAA.';
    return '';
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.salvando()) return;

    const dados = this.form.getRawValue();
    const dto: UsuarioRequestDto = {
      usuario: dados.usuario.trim(),
      nome: dados.nome.trim(),
      sobrenome: dados.sobrenome.trim(),
      dataNascimento: this.formatarData(dados.dataNascimento),
      genero: dados.genero!,
      cpf: dados.cpf.replace(/\D/g, ''),
      rg: dados.rg.trim() || null,
      emailPrincipal: dados.emailPrincipal.trim(),
      emailSecundario: dados.emailSecundario.trim() || null,
      telefonePrincipal: dados.telefonePrincipal.replace(/\D/g, ''),
      telefoneSecundario: dados.telefoneSecundario.replace(/\D/g, '') || null,
      perfilUsuario: this.modoEdicao()
        ? this.usuarios().find(usuario => usuario.id === this.idEmEdicao)?.perfilUsuario ?? PerfilUsuario.USUARIO_INTERNO
        : PerfilUsuario.USUARIO_INTERNO,
      ativo: this.modoEdicao()
        ? this.usuarios().find(usuario => usuario.id === this.idEmEdicao)?.ativo ?? true
        : true,
    };

    this.salvando.set(true);
    const operacao$ = this.modoEdicao() && this.idEmEdicao
      ? this.usuarioService.atualizar(this.idEmEdicao, dto)
      : this.usuarioService.cadastrarInterno(dto);

    operacao$.subscribe({
      next: usuario => {
        this.usuarios.update(lista => this.modoEdicao()
          ? lista.map(item => item.id === usuario.id ? usuario : item)
          : [usuario, ...lista]);
        this.salvando.set(false);
        const editando = this.modoEdicao();
        this.fecharFormulario();
        this.notify.success(
          editando ? 'Usuário atualizado' : 'Usuário cadastrado',
          `${usuario.nome} ${usuario.sobrenome} foi ${editando ? 'atualizado' : 'cadastrado'} com sucesso.`,
        );
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.salvando.set(false);
        this.notify.error(this.modoEdicao() ? 'Erro ao atualizar usuário' : 'Erro ao cadastrar usuário', err.message);
        this.cdr.markForCheck();
      },
    });
  }

  confirmarExclusao(usuario: UsuarioResponseDto): void {
    this.notify.confirm({
      header: 'Excluir usuário',
      message: `Deseja realmente excluir ${usuario.nome} ${usuario.sobrenome}? Esta ação não pode ser desfeita.`,
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      accept: () => this.executarExclusao(usuario),
    });
  }

  private executarExclusao(usuario: UsuarioResponseDto): void {
    this.confirmationService.close();
    this.usuarioService.excluir(usuario.id).subscribe({
      next: () => {
        this.usuarios.update(lista => lista.filter(item => item.id !== usuario.id));
        this.notify.success('Usuário excluído', `${usuario.nome} ${usuario.sobrenome} foi removido.`);
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.notify.error('Erro ao excluir usuário', err.message);
        this.cdr.markForCheck();
      },
    });
  }

  confirmarAlteracaoStatus(usuario: UsuarioResponseDto): void {
    const acao = usuario.ativo ? 'inativar' : 'ativar';
    this.notify.confirm({
      header: usuario.ativo ? 'Inativar usuário' : 'Ativar usuário',
      message: `Deseja realmente ${acao} ${usuario.nome} ${usuario.sobrenome}?`,
      icon: usuario.ativo ? 'pi pi-ban' : 'pi pi-check-circle',
      acceptLabel: usuario.ativo ? 'Inativar' : 'Ativar',
      rejectLabel: 'Cancelar',
      accept: () => this.executarAlteracaoStatus(usuario),
    });
  }

  private executarAlteracaoStatus(usuario: UsuarioResponseDto): void {
    this.confirmationService.close();
    const novoStatus = !usuario.ativo;
    this.usuarioService.atualizarStatus(usuario.id, novoStatus).subscribe({
      next: atualizado => {
        this.usuarios.update(lista => lista.map(item => item.id === atualizado.id ? atualizado : item));
        this.notify.success(
          `Usuário ${novoStatus ? 'ativado' : 'inativado'}`,
          `${atualizado.nome} ${atualizado.sobrenome} foi ${novoStatus ? 'ativado' : 'inativado'} com sucesso.`,
        );
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.notify.error('Erro ao alterar status do usuário', err.message);
        this.cdr.markForCheck();
      },
    });
  }

  private formatarData(data: string): string {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  atualizarPesquisa(texto: string): void {
    this.filtroTexto.set(texto);
    this.buscaPorId$.next(texto.trim());
  }

  perfilLabel(perfil: PerfilUsuario): string {
    return PERFIL_USUARIO_LABELS[perfil];
  }

  private ehUuid(valor: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor);
  }

  private normalizarTexto(valor: string): string {
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  }

  formatarDataParaTela(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

}

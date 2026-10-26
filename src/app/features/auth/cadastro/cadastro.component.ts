import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

import { ButtonModule }     from 'primeng/button';
import { InputTextModule }  from 'primeng/inputtext';
import { PasswordModule }   from 'primeng/password';
import { MessageModule }    from 'primeng/message';
import { ToastModule }      from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule }     from 'primeng/select';
import { MessageService }   from 'primeng/api';

import { NgxMaskDirective } from 'ngx-mask';

import { UsuarioService }   from '../../service/usuario.service';
import { Genero, GENERO_LABELS }                   from '../../enums/genero.enum';
import { PerfilUsuario }    from '../../enums/perfil-usuario.enum';

/** Valida CPF com os dois dígitos verificadores. */
const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const raw = (control.value as string ?? '').replace(/\D/g, '');
  if (!raw) return null; // deixa o Validators.required falar
  if (raw.length !== 11 || /^(\d)\1{10}$/.test(raw)) return { cpfInvalido: true };

  const calc = (mod: number): number => {
    let sum = 0;
    for (let i = 0; i < mod - 1; i++) sum += parseInt(raw[i]) * (mod - i);
    const r = (sum * 10) % 11;
    return r >= 10 ? 0 : r;
  };
  return calc(10) === parseInt(raw[9]) && calc(11) === parseInt(raw[10])
    ? null
    : { cpfInvalido: true };
};

interface SelectOption<T = string> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgClass,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    ToastModule,
    FloatLabelModule,
    SelectModule,
    NgxMaskDirective,
  ],
  templateUrl: './cadastro.component.html',
  styleUrl:    './cadastro.component.scss',
})
export class CadastroComponent {
  private readonly fb             = inject(FormBuilder);
  private readonly router         = inject(Router);
  private readonly toast          = inject(MessageService);
  private readonly usuarioService = inject(UsuarioService);

  readonly isLoading   = signal(false);
  readonly cadastroError = signal<string | null>(null);
  readonly currentYear = new Date().getFullYear();

  readonly opcoesGenero: SelectOption<Genero>[] = Object.values(Genero).map(v => ({
    label: GENERO_LABELS[v],
    value: v,
  }));

  readonly form = this.fb.nonNullable.group({
    usuario:            ['', [Validators.required, Validators.maxLength(100)]],
    nome:               ['', [Validators.required, Validators.maxLength(100)]],
    sobrenome:          ['', [Validators.required, Validators.maxLength(100)]],
    emailPrincipal:     ['', [Validators.required, Validators.email]],
    emailSecundario:    ['', [Validators.email]],
    telefonePrincipal:  ['', [Validators.required]],
    telefoneSecundario: [''],
    dataNascimento:     ['', [Validators.required, Validators.minLength(10)]],
    cpf:                ['', [Validators.required, cpfValidator]],
    rg:                 [''],
    senha:              ['', [Validators.required, Validators.minLength(6)]],
    genero:             [null as Genero | null, [Validators.required]],
  });

  // ── Helpers de validação ────────────────────────────────────────────────────

  invalido(campo: string): boolean {
    const ctrl = this.form.get(campo);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  erroMensagem(campo: string): string {
    const ctrl = this.form.get(campo);
    if (!ctrl) return '';
    if (ctrl.hasError('required'))    return 'Campo obrigatório.';
    if (ctrl.hasError('email'))       return 'Informe um e-mail válido.';
    if (ctrl.hasError('minlength'))   return `Mínimo de ${ctrl.getError('minlength').requiredLength as number} caracteres.`;
    if (ctrl.hasError('maxlength'))   return `Máximo de ${ctrl.getError('maxlength').requiredLength as number} caracteres.`;
    if (ctrl.hasError('pattern'))     return 'Informe apenas números (DDD + número), ex: 11999998888.';
    if (ctrl.hasError('cpfInvalido')) return 'CPF inválido.';
    return '';
  }

  // Computed signals para os campos mais usados no template
  readonly usuarioInvalido    = computed(() => this.invalido('usuario'));
  readonly nomeInvalido       = computed(() => this.invalido('nome'));
  readonly sobrenomeInvalido  = computed(() => this.invalido('sobrenome'));
  readonly emailPrincipalInvalido  = computed(() => this.invalido('emailPrincipal'));
  readonly emailSecundarioInvalido = computed(() => this.invalido('emailSecundario'));
  readonly telPrincipalInvalido    = computed(() => this.invalido('telefonePrincipal'));
  readonly telSecundarioInvalido   = computed(() => this.invalido('telefoneSecundario'));
  readonly dataNascimentoInvalido  = computed(() => this.invalido('dataNascimento'));
  readonly cpfInvalido    = computed(() => this.invalido('cpf'));
  readonly senhaInvalida  = computed(() => this.invalido('senha'));
  readonly generoInvalido = computed(() => this.invalido('genero'));

  // ── Submissão ───────────────────────────────────────────────────────────────

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.cadastroError.set(null);

    const raw = this.form.getRawValue();

    // Converte "DD/MM/AAAA" (valor da máscara) para "AAAA-MM-DD" (LocalDate do back-end)
    const dataFormatada = this.formatarData(raw.dataNascimento);

    this.usuarioService.cadastrar({
      usuario:            raw.usuario,
      nome:               raw.nome,
      sobrenome:          raw.sobrenome,
      emailPrincipal:     raw.emailPrincipal,
      emailSecundario:    raw.emailSecundario || null,
      dataNascimento:     dataFormatada,
      cpf:                raw.cpf.replace(/\D/g, ''),
      rg:                 raw.rg || null,
      senha:              raw.senha,
      telefonePrincipal:  raw.telefonePrincipal.replace(/\D/g, ''),
      telefoneSecundario: raw.telefoneSecundario?.replace(/\D/g, '') || null,
      perfilUsuario:      PerfilUsuario.CLIENTE,
      genero:             raw.genero!,
      ativo:              true,
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.add({
          severity: 'success',
          summary:  'Cadastro realizado!',
          detail:   'Sua conta foi criada com sucesso. Faça o login para continuar.',
          life:     4000,
        });
        void this.router.navigate(['']);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.cadastroError.set(err.message);
      },
    });
  }

  // ── Helpers privados ────────────────────────────────────────────────────────

  /** Converte "DD/MM/AAAA" → "AAAA-MM-DD" (LocalDate esperado pelo back-end). */
  private formatarData(data: string): string {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  }
}

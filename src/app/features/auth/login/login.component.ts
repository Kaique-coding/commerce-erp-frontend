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
  type AbstractControl,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

import { ButtonModule }     from 'primeng/button';
import { InputTextModule }  from 'primeng/inputtext';
import { PasswordModule }   from 'primeng/password';
import { CheckboxModule }   from 'primeng/checkbox';
import { MessageModule }    from 'primeng/message';
import { DividerModule }    from 'primeng/divider';
import { ToastModule }      from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService }   from 'primeng/api';
import { RippleModule }     from 'primeng/ripple';

import { LoginService } from '../../service/login.service';
import { AuthService }  from '../../../core/services/auth.service';
import { NotificationCenterService } from '../../../core/services/notification-center.service';
import { PerfilUsuario } from '../../enums/perfil-usuario.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NgClass,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    MessageModule,
    DividerModule,
    ToastModule,
    FloatLabelModule,
    RippleModule,
    RouterLink
],
  templateUrl: './login.component.html',
  styleUrl:    './login.component.scss',
})
export class LoginComponent {
  private readonly fb           = inject(FormBuilder);
  private readonly router       = inject(Router);
  private readonly toast        = inject(MessageService);
  private readonly loginService = inject(LoginService);
  private readonly authService  = inject(AuthService);
  private readonly notificationCenter = inject(NotificationCenterService);

  readonly isLoading   = signal(false);
  readonly authError   = signal<string | null>(null);
  readonly currentYear = new Date().getFullYear();

  readonly form = this.fb.nonNullable.group({
    email: [
      '',
      [Validators.required, Validators.email],
    ],
    password: [
      '',
      [Validators.required, Validators.minLength(6)],
    ],
    rememberMe: [false],
  });

  get emailCtrl():    AbstractControl { return this.form.controls.email;    }
  get passwordCtrl(): AbstractControl { return this.form.controls.password; }

  readonly emailInvalid    = computed(() => this.emailCtrl.invalid    && this.emailCtrl.touched);
  readonly passwordInvalid = computed(() => this.passwordCtrl.invalid && this.passwordCtrl.touched);

  get emailErrorMsg(): string {
    if (this.emailCtrl.hasError('required')) return 'O e-mail é obrigatório.';
    if (this.emailCtrl.hasError('email'))    return 'Informe um e-mail válido.';
    return '';
  }

  get passwordErrorMsg(): string {
    if (this.passwordCtrl.hasError('required'))  return 'A senha é obrigatória.';
    if (this.passwordCtrl.hasError('minlength')) return 'A senha deve ter no mínimo 6 caracteres.';
    return '';
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.authError.set(null);

    const { email, password, rememberMe } = this.form.getRawValue();

    this.loginService.login({ email, senha: password }).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        if (response.perfilUsuario === PerfilUsuario.CLIENTE) {
          if (!response.acessoPermitido || !response.token) {
            this.authService.clearToken();
            this.authError.set(response.mensagem || 'Não foi possível iniciar a sessão da loja.');
            return;
          }
          this.authService.storeToken(response.token, false, PerfilUsuario.CLIENTE);
          if (response.notificacaoBoasVindas) {
            this.notificationCenter.clienteBemVindo();
          }
          void this.router.navigate(['/loja']);
        } else if (response.acessoPermitido && response.token) {

          this.authService.storeToken(response.token, rememberMe, response.perfilUsuario ?? PerfilUsuario.USUARIO_INTERNO);
          if (response.notificacaoBoasVindas) {
            this.notificationCenter.usuarioBemVindo();
          }

          this.toast.add({
            severity: 'success',
            summary: 'Bem-vindo!',
            detail: response.mensagem || `Acesso autorizado para ${email}`,
            life: 3000,
          });

          void this.router.navigate(['/app/dashboard']);
        } else {

          this.authError.set(response.mensagem || 'Acesso negado. Verifique suas credenciais.');
        }
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.authError.set(err.message);
      },
    });
  }

  onForgotPassword(): void {
    this.toast.add({
      severity: 'info',
      summary: 'Recuperação de senha',
      detail: 'Em breve você receberá as instruções no seu e-mail.',
      life: 4000,
    });
  }
}

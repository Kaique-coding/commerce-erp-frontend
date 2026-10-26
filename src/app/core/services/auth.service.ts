import { Injectable, signal, computed } from '@angular/core';
import { PerfilUsuario } from '../../features/enums/perfil-usuario.enum';

const TOKEN_KEY = 'auth_token';
const PROFILE_KEY = 'auth_profile';

/**
 * Serviço responsável pelo gerenciamento do estado de autenticação.
 *
 * O token é armazenado em sessionStorage por padrão (mais seguro que localStorage
 * para tokens de autenticação — descartado ao fechar o browser/aba). Quando o
 * usuário marca "Lembrar-me", o token é persistido em localStorage.
 *
 * Nunca exponha o valor do token em logs ou respostas.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(this.loadToken());
  private readonly _perfilUsuario = signal<PerfilUsuario | null>(this.loadProfile());

  /** Verdadeiro quando há um token armazenado. */
  readonly isAuthenticated = computed(() => !!this._token());
  readonly perfilUsuario = this._perfilUsuario.asReadonly();
  readonly isUsuarioInterno = computed(() => this._perfilUsuario() === PerfilUsuario.USUARIO_INTERNO);

  // ── Armazenamento ──────────────────────────────────────────────────────────

  /**
   * Salva o token após login bem-sucedido.
   * @param token  Token JWT retornado pelo back-end.
   * @param remember  Se verdadeiro, usa localStorage; caso contrário, sessionStorage.
   */
  storeToken(token: string, remember = false, perfilUsuario: PerfilUsuario | null = null): void {
    // Evita que um token antigo no outro storage seja carregado na próxima inicialização.
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    if (perfilUsuario) storage.setItem(PROFILE_KEY, perfilUsuario);
    this._token.set(token);
    this._perfilUsuario.set(perfilUsuario);
  }

  /** Retorna o token atual, ou null se não autenticado. */
  getToken(): string | null {
    return this._token();
  }

  /** Remove o token e encerra a sessão. */
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(PROFILE_KEY);
    this._token.set(null);
    this._perfilUsuario.set(null);
  }

  // ── Inicialização ──────────────────────────────────────────────────────────

  /**
   * Carrega o token armazenado na inicialização do serviço.
   * Tenta sessionStorage primeiro; se não encontrar, tenta localStorage.
   */
  private loadToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
  }

  private loadProfile(): PerfilUsuario | null {
    const perfil = sessionStorage.getItem(PROFILE_KEY) ?? localStorage.getItem(PROFILE_KEY);
    return perfil && Object.values(PerfilUsuario).includes(perfil as PerfilUsuario)
      ? perfil as PerfilUsuario
      : null;
  }
}

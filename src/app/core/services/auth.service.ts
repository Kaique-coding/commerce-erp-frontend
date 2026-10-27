import { Injectable, signal, computed } from '@angular/core';
import { PerfilUsuario } from '../../features/enums/perfil-usuario.enum';

const TOKEN_KEY = 'auth_token';
const PROFILE_KEY = 'auth_profile';










@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(this.loadToken());
  private readonly _perfilUsuario = signal<PerfilUsuario | null>(this.loadProfile());


  readonly isAuthenticated = computed(() => !!this._token());
  readonly perfilUsuario = this._perfilUsuario.asReadonly();
  readonly isUsuarioInterno = computed(() => this._perfilUsuario() === PerfilUsuario.USUARIO_INTERNO);








  storeToken(token: string, remember = false, perfilUsuario: PerfilUsuario | null = null): void {

    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    if (perfilUsuario) storage.setItem(PROFILE_KEY, perfilUsuario);
    this._token.set(token);
    this._perfilUsuario.set(perfilUsuario);
  }


  getToken(): string | null {
    return this._token();
  }


  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(PROFILE_KEY);
    this._token.set(null);
    this._perfilUsuario.set(null);
  }







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

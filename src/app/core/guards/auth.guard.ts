import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PerfilUsuario } from '../../features/enums/perfil-usuario.enum';

/**
 * Guard que protege as rotas autenticadas.
 * Redireciona para a página de login se o usuário não estiver autenticado.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.isAuthenticated() && authService.isUsuarioInterno()) {
    return true;
  }

  if (authService.perfilUsuario() === PerfilUsuario.CLIENTE) {
    return router.createUrlTree(['/loja']);
  }

  return router.createUrlTree(['']);
};

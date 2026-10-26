import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Autenticação (sem layout com sidebar/topbar) ─────────────────────────
  {
    path: '',
    pathMatch: 'full',
    title: 'Login — Commerce ERP',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'usuario',
    title: 'Cadastro — Commerce ERP',
    loadComponent: () =>
      import('./features/auth/cadastro/cadastro.component').then(m => m.CadastroComponent),
  },
  {
    path: 'loja',
    title: 'Loja — Commerce ERP',
    loadComponent: () =>
      import('./features/loja/loja.component').then(m => m.LojaComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/loja/loja-catalogo.component').then(m => m.LojaCatalogoComponent),
      },
      {
        path: 'carrinho',
        title: 'Carrinho — Commerce ERP',
        loadComponent: () =>
          import('./features/loja/loja-carrinho.component').then(m => m.LojaCarrinhoComponent),
      },
      {
        path: 'pedidos',
        title: 'Meus pedidos — Commerce ERP',
        loadComponent: () =>
          import('./features/loja/loja-pedidos.component').then(m => m.LojaPedidosComponent),
      },
    ],
  },

  // ── Área autenticada (com layout principal) ──────────────────────────────
  {
    path: 'app',
    loadComponent: () =>
      import('./layout/components/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        title: 'Dashboard — Commerce ERP',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'produtos',
        title: 'Produtos — Commerce ERP',
        loadComponent: () =>
          import('./features/produtos/produtos.component').then(m => m.ProdutosComponent),
      },
      {
        path: 'usuarios',
        title: 'Usuários — Commerce ERP',
        loadComponent: () =>
          import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent),
      },
      {
        path: 'pedidos',
        title: 'Pedidos — Commerce ERP',
        loadComponent: () =>
          import('./features/pedidos/pedidos.component').then(m => m.PedidosComponent),
      },
    ],
  },

  // ── Rota coringa ─────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: '',
  },
];

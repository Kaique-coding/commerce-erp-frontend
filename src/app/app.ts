import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Componente raiz da aplicação.
 *
 * Serve apenas como ponto de entrada para o router.
 * O layout visual (sidebar, topbar, toast, confirmDialog) está em AppLayoutComponent,
 * carregado como rota pai em app.routes.ts.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LojaSidebarComponent } from './loja-sidebar.component';
import { LojaTopbarComponent } from './loja-topbar.component';
import { RouterOutlet } from '@angular/router';

/** Componente base da área da loja. A rota será registrada separadamente. */
@Component({
  selector: 'app-loja',
  standalone: true,
  imports: [
    LojaSidebarComponent,
    LojaTopbarComponent,
    RouterOutlet
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="loja-layout">
    <app-loja-sidebar></app-loja-sidebar>

    <div class="loja-layout__main">
      <app-loja-topbar></app-loja-topbar>

      <main class="loja-layout__content">
        <router-outlet></router-outlet>
      </main>
    </div>
  </div>
`,
  styleUrl: './loja.component.scss',
})
export class LojaComponent { }

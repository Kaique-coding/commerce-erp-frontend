import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CarrinhoService } from './carrinho.service';

interface LojaNavItem {
  label: string;
  icon: string;
  route: string;
}


@Component({
  selector: 'app-loja-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonModule, TooltipModule],
  template: `
    <aside
      class="loja-sidebar"
      [class.loja-sidebar--collapsed]="collapsed()"
      aria-label="Menu de navegação da loja"
    >
      <div class="loja-sidebar__toggle">
        <p-button
          [icon]="collapsed() ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"
          severity="secondary"
          [text]="true"
          [rounded]="true"
          [attr.aria-label]="collapsed() ? 'Expandir menu' : 'Recolher menu'"
          (onClick)="toggleCollapse()"
        />
      </div>

      <nav class="loja-sidebar__nav">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="loja-sidebar__link--active"
            [routerLinkActiveOptions]="{ exact: item.route === '/loja' }"
            class="loja-sidebar__link"
            [attr.aria-label]="item.label"
            [pTooltip]="collapsed() ? item.label : ''"
            tooltipPosition="right"
          >
            <i [class]="'pi ' + item.icon" aria-hidden="true"></i>
            @if (!collapsed()) {
              <span class="loja-sidebar__label">{{ item.label }}</span>
            }
            @if (item.route === '/loja/carrinho' && carrinho.quantidadeTotal() > 0) {
              <span class="loja-sidebar__count" [attr.aria-label]="carrinho.quantidadeTotal() + ' itens no carrinho'">
                {{ carrinho.quantidadeTotal() > 99 ? '99+' : carrinho.quantidadeTotal() }}
              </span>
            }
          </a>
        }
      </nav>
    </aside>
  `,
  styleUrl: './loja-sidebar.component.scss',
})
export class LojaSidebarComponent {
  readonly carrinho = inject(CarrinhoService);
  readonly collapsed = signal(false);

  readonly navItems: LojaNavItem[] = [
    { label: 'Loja', icon: 'pi-home', route: '/loja' },
    { label: 'Carrinho', icon: 'pi-shopping-cart', route: '/loja/carrinho' },
    { label: 'Pedidos', icon: 'pi-receipt', route: '/loja/pedidos' },
  ];

  toggleCollapse(): void {
    this.collapsed.update(value => !value);
  }
}

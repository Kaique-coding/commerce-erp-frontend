import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

/**
 * Menu lateral da aplicação.
 * Expansível/recolhível. Adicione itens ao array `navItems`.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonModule, TooltipModule],
  template: `
    <aside
      class="app-sidebar"
      [class.app-sidebar--collapsed]="collapsed()"
      aria-label="Menu de navegação"
    >
      <div class="app-sidebar__toggle">
        <p-button
          [icon]="collapsed() ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"
          severity="secondary"
          [text]="true"
          [rounded]="true"
          [attr.aria-label]="collapsed() ? 'Expandir menu' : 'Recolher menu'"
          (onClick)="toggleCollapse()"
        />
      </div>

      <nav class="app-sidebar__nav">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="app-sidebar__link--active"
            class="app-sidebar__link"
            [attr.aria-label]="item.label"
            [pTooltip]="collapsed() ? item.label : ''"
            tooltipPosition="right"
          >
            <i [class]="'pi ' + item.icon" aria-hidden="true"></i>
            @if (!collapsed()) {
              <span class="app-sidebar__label">{{ item.label }}</span>
            }
          </a>
        }
      </nav>
    </aside>
  `,
  styleUrl: './app-sidebar.component.scss',
})
export class AppSidebarComponent {
  collapsed = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',    icon: 'pi-home',          route: '/app/dashboard'     },
    { label: 'Produtos',     icon: 'pi-box',           route: '/app/produtos'      },
    { label: 'Pedidos',      icon: 'pi-shopping-cart', route: '/app/pedidos'       },
    { label: 'Usuários',     icon: 'pi-users',         route: '/app/usuarios'      },
    { label: 'Relatórios',   icon: 'pi-chart-bar',     route: '/app/relatorios'    },
  ];

  toggleCollapse(): void {
    this.collapsed.update(v => !v);
  }
}

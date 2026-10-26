import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

// PrimeNG Components
import { ButtonModule }       from 'primeng/button';
import { InputTextModule }    from 'primeng/inputtext';
import { SelectModule }       from 'primeng/select';
import { CheckboxModule }     from 'primeng/checkbox';
import { RadioButtonModule }  from 'primeng/radiobutton';
import { TagModule }          from 'primeng/tag';
import { BadgeModule }        from 'primeng/badge';
import { CardModule }         from 'primeng/card';
import { TableModule }        from 'primeng/table';
import { DialogModule }       from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule }      from 'primeng/message';
import { TooltipModule }      from 'primeng/tooltip';
import { DividerModule }      from 'primeng/divider';
import { SkeletonModule }     from 'primeng/skeleton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FloatLabelModule }   from 'primeng/floatlabel';
import { TextareaModule }     from 'primeng/textarea';

import { NotificationService } from '../../core/services/notification.service';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  status: 'active' | 'inactive' | 'pending';
}

interface SelectOption {
  label: string;
  value: string;
}

/**
 * Página de demonstração visual do PrimeNG.
 *
 * Serve para validar que a instalação e o tema estão funcionando corretamente.
 * Todos os dados são fictícios e não representam regras de negócio.
 */
@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    RadioButtonModule,
    TagModule,
    BadgeModule,
    CardModule,
    TableModule,
    DialogModule,
    ProgressSpinnerModule,
    MessageModule,
    TooltipModule,
    DividerModule,
    SkeletonModule,
    ToggleSwitchModule,
    FloatLabelModule,
    TextareaModule,
  ],
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.scss',
})
export class DemoComponent {
  private readonly notificationService = inject(NotificationService);

  // ── Estado dos controles ────────────────────────────────────────────────────

  textValue      = signal('');
  textareaValue  = signal('');
  selectedOption = signal<string | null>(null);
  checkboxValue  = signal(false);
  radioValue     = signal<string>('');
  toggleValue    = signal(false);
  dialogVisible  = signal(false);
  loading        = signal(false);

  // ── Dados para Select ───────────────────────────────────────────────────────

  readonly categoryOptions: SelectOption[] = [
    { label: 'Eletrônicos',  value: 'electronics' },
    { label: 'Vestuário',    value: 'clothing'     },
    { label: 'Alimentos',    value: 'food'         },
    { label: 'Móveis',       value: 'furniture'    },
  ];

  // ── Dados fictícios para a tabela ───────────────────────────────────────────

  readonly products: Product[] = [
    { id: 1, name: 'Notebook Pro 15',   category: 'Eletrônicos', price: 4299.90, status: 'active'   },
    { id: 2, name: 'Teclado Mecânico',  category: 'Eletrônicos', price:  349.90, status: 'active'   },
    { id: 3, name: 'Camiseta Básica',   category: 'Vestuário',   price:   59.90, status: 'inactive' },
    { id: 4, name: 'Mesa Gamer',        category: 'Móveis',      price: 1199.90, status: 'pending'  },
    { id: 5, name: 'Monitor 27"',       category: 'Eletrônicos', price: 1599.90, status: 'active'   },
    { id: 6, name: 'Cadeira Ergonômica',category: 'Móveis',      price: 2499.90, status: 'active'   },
  ];

  // ── Ações ───────────────────────────────────────────────────────────────────

  showSuccess(): void {
    this.notificationService.success('Operação realizada', 'Os dados foram salvos com sucesso.');
  }

  showInfo(): void {
    this.notificationService.info('Informação', 'Esta é uma mensagem informativa.');
  }

  showWarn(): void {
    this.notificationService.warn('Atenção', 'Esta ação pode ter consequências.');
  }

  showError(): void {
    this.notificationService.error('Erro', 'Não foi possível completar a operação.');
  }

  openDialog(): void {
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
  }

  confirmDelete(): void {
    this.notificationService.confirm({
      message: 'Deseja realmente excluir este item?',
      header: 'Confirmar exclusão',
      icon: 'pi pi-trash',
      accept: () => this.notificationService.success('Excluído', 'O item foi removido.'),
      reject: () => this.notificationService.info('Cancelado', 'A exclusão foi cancelada.'),
    });
  }

  simulateLoading(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 2500);
  }

  // ── Helpers de template ─────────────────────────────────────────────────────

  getStatusSeverity(status: Product['status']): 'success' | 'warn' | 'secondary' {
    const map: Record<Product['status'], 'success' | 'warn' | 'secondary'> = {
      active:   'success',
      pending:  'warn',
      inactive: 'secondary',
    };
    return map[status];
  }

  getStatusLabel(status: Product['status']): string {
    const map: Record<Product['status'], string> = {
      active:   'Ativo',
      pending:  'Pendente',
      inactive: 'Inativo',
    };
    return map[status];
  }

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}

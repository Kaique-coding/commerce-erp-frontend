import { Injectable, inject } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';

export type NotificationSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';

/**
 * Serviço centralizado de notificações e confirmações.
 *
 * Utiliza os serviços oficiais do PrimeNG: MessageService e ConfirmationService.
 * Registre `<p-toast>` e `<p-confirmDialog>` no layout principal para que este
 * serviço funcione em qualquer parte da aplicação.
 *
 * Uso:
 *   notificationService.success('Salvo com sucesso');
 *   notificationService.confirm({ message: 'Deseja excluir?', accept: () => ... });
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  success(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 4000,
    });
  }

  info(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 4000,
    });
  }

  warn(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 5000,
    });
  }

  error(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 6000,
    });
  }

  toast(severity: NotificationSeverity, summary: string, detail?: string, life = 4000): void {
    this.messageService.add({ severity, summary, detail, life });
  }

  confirm(options: {
    message: string;
    header?: string;
    icon?: string;
    accept: () => void;
    reject?: () => void;
    acceptLabel?: string;
    rejectLabel?: string;
  }): void {
    this.confirmationService.confirm({
      message: options.message,
      header: options.header ?? 'Confirmação',
      icon: options.icon ?? 'pi pi-exclamation-triangle',
      acceptLabel: options.acceptLabel ?? 'Confirmar',
      rejectLabel: options.rejectLabel ?? 'Cancelar',
      accept: options.accept,
      reject: options.reject,
    });
  }
}

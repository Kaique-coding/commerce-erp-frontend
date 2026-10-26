import { Injectable, signal } from '@angular/core';
import { PerfilUsuario } from '../../features/enums/perfil-usuario.enum';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  icon: string;
  audience: PerfilUsuario;
}

/** Guarda notificações de atividade enquanto a aplicação está aberta. */
@Injectable({ providedIn: 'root' })
export class NotificationCenterService {
  private nextId = 0;

  readonly notifications = signal<AppNotification[]>([]);
  unreadCountFor(perfil: PerfilUsuario): number {
    return this.notifications().filter(notification => notification.audience === perfil && !notification.read).length;
  }

  notificationsFor(perfil: PerfilUsuario): AppNotification[] {
    return this.notifications().filter(notification => notification.audience === perfil);
  }

  produtoCadastrado(nome: string): void {
    this.adicionar({
      title: 'Novo produto cadastrado',
      message: `“${nome}” foi adicionado ao catálogo.`,
      icon: 'pi pi-box',
      audience: PerfilUsuario.USUARIO_INTERNO,
    });
  }

  usuarioBemVindo(): void {
    this.adicionar({
      title: 'Bem-vindo ao commerce ERP!',
      message: 'Seu usuário foi cadastrado com sucesso e agora tem acesso ao sistema\nAcesse seu email cadastrado para pegar sua chave de acesso e ver algumas orientações',
      icon: 'pi pi-check-circle',
      audience: PerfilUsuario.USUARIO_INTERNO,
    });
  }

  clienteBemVindo(): void {
    this.adicionar({
      title: 'Bem-vindo ao commerce ERP!',
      message: 'Seu usuário foi cadastrado com sucesso e agora você pode aproveitar à vontade nosso comércio virtual.',
      icon: 'pi pi-check-circle',
      audience: PerfilUsuario.CLIENTE,
    });
  }

  marcarComoLidas(perfil: PerfilUsuario): void {
    this.notifications.update(items => items.map(item => item.audience === perfil ? { ...item, read: true } : item));
  }

  private adicionar(notification: Pick<AppNotification, 'title' | 'message' | 'icon' | 'audience'>): void {
    this.notifications.update(items => [
      { ...notification, id: ++this.nextId, createdAt: new Date(), read: false },
      ...items,
    ].slice(0, 50));
  }
}

# PrimeNG — Commerce ERP

Documentação da configuração visual do projeto com PrimeNG.

---

## Versões instaladas

| Pacote             | Versão     |
|--------------------|------------|
| Angular            | ~21.2.0    |
| PrimeNG            | 21.1.10    |
| PrimeIcons         | 8.0.2      |
| @angular/cdk       | 21.2.14    |
| @primeuix/themes   | (transitiva, gerenciada pelo PrimeNG) |

---

## Inicialização do PrimeNG

O PrimeNG é inicializado em `src/app/app.config.ts` via `providePrimeNG`:

```typescript
// src/app/app.config.ts
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { primeNGConfig } from './core/theme.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG(primeNGConfig),
    MessageService,
    ConfirmationService,
  ],
};
```

`provideAnimationsAsync` é obrigatório a partir do PrimeNG v19+.

---

## Onde o tema global é configurado

Arquivo: `src/app/core/theme.config.ts`

O tema usa `definePreset` para derivar do Aura oficial sem modificar arquivos da biblioteca:

```typescript
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const AppTheme = definePreset(Aura, {
  semantic: {
    primary: {
      500: '{indigo.500}',
      // ... outros tokens
    },
  },
});

export const primeNGConfig = {
  theme: {
    preset: AppTheme,
    options: {
      darkModeSelector: '.app-dark',
    },
  },
  ripple: true,
};
```

---

## Como personalizar cores e design tokens

Edite `src/app/core/theme.config.ts`. As cores aceitam tokens de paleta do Aura:

```typescript
// Exemplo: trocar a cor primária para violeta
semantic: {
  primary: {
    500: '{violet.500}',
    600: '{violet.600}',
    // ...
  },
}
```

Paletas disponíveis: `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `orange`,
`amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`,
`indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`.

Para tokens de componentes específicos, consulte:
https://primeng.dev/theming/tokens

---

## Onde ficam os estilos globais

```
src/
  styles.scss                  ← Ponto de entrada; importa tudo abaixo
  styles/
    _reset.scss                ← Normalização CSS
    _typography.scss           ← Tipografia global
    _utilities.scss            ← Classes utilitárias (.u-flex, .u-mt-md, etc.)
    _primeng-overrides.scss    ← Ajustes pontuais de componentes PrimeNG
```

**Não importe arquivos de tema CSS do PrimeNG nestes arquivos.**
O tema é injetado pelo `providePrimeNG` em runtime.

---

## Como importar e usar os componentes

O projeto usa componentes standalone. Importe individualmente no componente que os utiliza:

```typescript
import { ButtonModule }    from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule }     from 'primeng/table';

@Component({
  standalone: true,
  imports: [ButtonModule, InputTextModule, TableModule],
  // ...
})
```

Cada componente tem sua rota de import documentada em https://primeng.dev.

---

## Como usar notificações

O `NotificationService` em `src/app/core/services/notification.service.ts` encapsula
o `MessageService` e `ConfirmationService` do PrimeNG.

**Pré-requisito:** `<p-toast>` e `<p-confirmDialog>` estão registrados no
`AppLayoutComponent` e funcionam globalmente.

```typescript
// Em qualquer componente
import { NotificationService } from '../core/services/notification.service';

@Component({ ... })
export class MeuComponent {
  private notifications = inject(NotificationService);

  salvar(): void {
    // faz algo...
    this.notifications.success('Salvo!', 'Os dados foram persistidos.');
  }

  excluir(): void {
    this.notifications.confirm({
      message: 'Deseja excluir este registro?',
      accept: () => {
        // executa exclusão
        this.notifications.success('Excluído com sucesso');
      },
    });
  }
}
```

Métodos disponíveis: `success`, `info`, `warn`, `error`, `toast` (genérico), `confirm`.

---

## Como adicionar novos componentes compartilhados

Crie em `src/app/shared/components/`:

```typescript
// src/app/shared/components/status-tag.component.ts
import { Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [TagModule],
  template: `<p-tag [value]="label()" [severity]="severity()" />`,
})
export class StatusTagComponent {
  label    = input.required<string>();
  severity = input<'success' | 'warn' | 'danger' | 'info' | 'secondary'>('secondary');
}
```

Só crie abstrações quando representarem uso repetido com configuração consistente.
Use os componentes do PrimeNG diretamente quando não houver necessidade de wrapper.

---

## Como adicionar novas páginas / features

1. Crie o componente em `src/app/features/<dominio>/`.
2. Adicione a rota lazy em `src/app/app.routes.ts`:

```typescript
{
  path: 'produtos',
  title: 'Produtos — Commerce ERP',
  loadComponent: () =>
    import('./features/produtos/produtos.component').then(m => m.ProdutosComponent),
},
```

3. Adicione o item ao array `navItems` em `AppSidebarComponent`.
4. Importe os componentes do PrimeNG necessários diretamente no novo componente.

---

## Como executar a aplicação

```bash
npm start           # Servidor de desenvolvimento
npm run build       # Build de produção
npm test            # Testes unitários
```

Acesse: http://localhost:4200 — redireciona automaticamente para `/demo`.

---

## Como validar que a configuração está funcionando

1. `npm run build` deve compilar sem erros.
2. Em `/demo`, os componentes devem estar visualmente estilizados com o tema Aura.
3. Clicar nos botões de toast deve exibir notificações no canto superior direito.
4. Clicar em "Confirmar" deve abrir o dialog de confirmação do PrimeNG.
5. Clicar em "Abrir Dialog" deve exibir o modal centralizado.
6. Clicar em "Simular carregamento" deve exibir o spinner por ~2,5 segundos.
7. O ícone de recolher/expandir na sidebar deve funcionar.

---

## Suporte a tema escuro (preparação)

A arquitetura está preparada para dark mode. O seletor CSS configurado é `.app-dark`.

Para ativar: adicione/remova a classe `.app-dark` no elemento `<html>`:

```typescript
document.documentElement.classList.toggle('app-dark');
```

Implemente um botão de toggle no `AppTopbarComponent` quando o suporte completo
ao tema escuro for necessário. Os tokens `colorScheme.dark` no `theme.config.ts`
já estão configurados com a paleta correta.

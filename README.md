# Commerce ERP — Frontend

Interface web do Commerce ERP, uma aplicação de gestão comercial com área administrativa e loja virtual para clientes. Este projeto foi desenvolvido com Angular e utiliza PrimeNG para componentes de interface.

## Funcionalidades

- Login e cadastro público de clientes.
- Redirecionamento de clientes para a loja e de usuários internos para a área administrativa.
- Área administrativa para consultar e gerenciar produtos e usuários.
- Pesquisa de produtos e usuários.
- Dashboard com indicadores e produtos criados ou atualizados recentemente.
- Notificações separadas por perfil: clientes recebem boas-vindas; usuários internos recebem avisos de novos produtos e de cadastro de usuários internos.
- Área da loja com topbar e sidebar próprias para clientes.

## Requisitos

- Node.js e npm instalados.
- API do Commerce ERP em execução em `http://localhost:8080` para usar login, cadastro e dados do sistema.

## Como executar

1. Clone este repositório e abra a pasta do frontend no terminal.
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Confirme que a API está disponível em `http://localhost:8080`. A URL é definida em `src/environments/environment.ts`.
4. Inicie o servidor de desenvolvimento:

   ```bash
   npm start
   ```

5. Abra [http://localhost:4200](http://localhost:4200) no navegador. O Angular atualiza a aplicação automaticamente quando os arquivos são alterados.

## Comandos úteis

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o servidor Angular de desenvolvimento. |
| `npm run build` | Compila a aplicação para produção em `dist/`. |
| `npm run watch` | Recompila a aplicação automaticamente em modo de desenvolvimento. |
| `npm test` | Executa os testes configurados no projeto. |

## Rotas principais

| Rota | Área |
| --- | --- |
| `/` | Login |
| `/usuario` | Cadastro público de cliente |
| `/loja` | Área do cliente |
| `/app/dashboard` | Dashboard administrativo |
| `/app/produtos` | Gerenciamento de produtos |
| `/app/usuarios` | Gerenciamento de usuários |

As rotas administrativas exigem autenticação. O acesso à loja é destinado a contas com perfil de cliente.

## Tecnologias

- Angular 21 e TypeScript
- PrimeNG e PrimeIcons
- RxJS
- SCSS

## Backend

O frontend consome a API REST do projeto backend. Para executar o sistema completo, inicie também o backend e configure a URL da API em `src/environments/environment.ts` se ela não estiver em `http://localhost:8080`.

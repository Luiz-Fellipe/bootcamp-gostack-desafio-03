<h1 align="center">
  <img alt="Fastfeet" title="Fastfeet" src=".github/logo.png" width="300px" />
</h1>

<h3 align="center">
  Desafio 2: FastFeet, o início
</h3>

<h3 align="center">
  :warning: Etapa 1/4 do Desafio Final :warning:
</h3>

<blockquote align="center">“Não espere para plantar, apenas tenha paciência para colher”!</blockquote>

<p align="center">
<a href="#rocket-sobre-o-desafio">Sobre o desafio</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;


## :rocket: Sobre o desafio
Esse desafio é a primeira parte do Desafio Final

Início do desenvolvimento de um app para uma transportadora fictícia, o FastFeet.

Nesse primeiro desafio criei algumas funcionalidades básicas que aprendi ao longo das aulas até aqui. Esse projeto será desenvolvido aos poucos até o fim da minha jornada onde terei uma aplicação completa envolvendo back-end, front-end e mobile, que será utilizada para a **certificação do bootcamp**.

### **Um pouco sobre as ferramentas**
Durante a resolução do desafio, utilizei as seguintes ferramentas :

- NodeJS
- Yarn
- Express
- Sucrase
- Nodemon
- ESLint
- Prettier 
- EditorConfig
- Yup
- Sequelize (PostgreSQL);

### **Funcionalidades**

Abaixo estão descritas as funcionalidades que adicionei a minha aplicação.

### **1. Autenticação**

Criei a permissão para que um usuário se autentique na aplicação utilizando e-mail e uma senha.

- A autenticação foi feita utilizando JWT.
- Realizei a validação dos dados de entrada;

### 2. Gestão de destinatários

Criei a permissão para que os destinatários sejam mantidos (cadastrados/atualizados) na aplicação.

O cadastro de destinatários só pode ser feito por administradores autenticados na aplicação.

O destinatário não pode se autenticar no sistema, ou seja, não possui senha.


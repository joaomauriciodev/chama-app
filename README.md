# Chama — protótipo React

Protótipo navegável de um marketplace que liga quem precisa de um serviço (limpeza, montagem, elétrica, hidráulica, pintura, jardinagem, frete, reparos) a prestadores próximos. O foco é pedir e responder **só com toques**: um pedido completo sai em cerca de seis toques, sem digitar.

Os dados são fictícios e ficam em memória; timers simulam o backend (propostas chegando, cliente aceitando, mensagens de resposta).

## Rodar

Requer Node 20.19+ (ou 22.12+).

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/ (em produção, a imagem Docker faz o build e serve com nginx no Railway)
```

## O que dá para testar

**Como cliente (Contratar)**
1. Toque numa categoria → subtipos em chips, quantidade, foto/áudio → dia e período → endereço → revisão do pedido. O app não mostra preço nem estimativa: o valor é combinado entre cliente e prestador no chat.
2. Publique: o radar avisa os profissionais e as propostas chegam em ~2 s.
3. Escolha uma proposta, converse com respostas rápidas, simule "a caminho" e "concluído", avalie com estrelas e tags.
4. "Pedir de novo" repete um pedido antigo pulando direto para a data.
5. Aba Buscar: busca por texto, filtro por categoria, ordenação, perfil do profissional e "Chamar" (pedido direto).

**Como prestador (Trabalhar)**
1. Liga/desliga disponibilidade; feed mostra pedidos compatíveis com seus serviços e sua área (CEP).
2. Converse e envie uma proposta digitando o valor que você cobra.
3. Agenda: iniciar trajeto e concluir serviço (mostra o valor líquido).
4. Perfil: serviços, CEP base com área de atendimento (bairro, região ou cidade) e grade de disponibilidade, tudo por toques.

## Estrutura

```
src/
  data/catalog.js          categorias, prestadores, pedidos abertos, constantes
  lib/format.js            moeda, datas, rótulos do pedido
  lib/match.js             regra (simulada) que gera as propostas de um pedido
  state/reducer.js         todo o estado do app e suas transições
  state/AppContext.jsx     provider, ações com efeitos (timers) e toasts
  components/ui.jsx        Avatar, ProCard, Chip, CategoryTile, Stepper, Empty...
  components/Shell.jsx     TabBar, Toast, Sheet, atalho Esc
  screens/client/          Home, Search, Orders, Profile
  screens/provider/        Opportunities, Agenda, ProviderProfile
  flows/RequestFlow.jsx    pedido em 5 passos
  flows/MatchOverlay.jsx   radar + comparação de propostas
  sheets/Sheets.jsx        perfil do prestador, detalhe do pedido, proposta
  styles.css               tokens de cor (claro/escuro) e estilos
```

## Próximos passos para virar produto

- **Backend**: trocar `data/catalog.js` e os timers do `AppContext` por chamadas de API (Supabase/Firebase). O `reducer` já concentra as transições, então cada ação vira uma mutação no servidor + atualização otimista.
- **Match real**: `lib/match.js` vira uma consulta por categoria + área do prestador cobrindo o CEP do pedido (prefixo ou cidade) + disponibilidade, ordenada por nota e taxa de resposta, limitada a 3–5 propostas.
- **Tempo real**: canais para propostas, status e chat.
- **Pagamento**: Pix/cartão com split (Mercado Pago, Pagar.me ou Asaas), retido até a conclusão.
- **Mobile nativo**: os componentes e o reducer portam direto para React Native/Expo; só a camada de estilo muda.

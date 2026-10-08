# Chama — protótipo React

Protótipo navegável de um marketplace que liga quem precisa de um serviço (limpeza, montagem, elétrica, hidráulica, pintura, jardinagem, frete, reparos) a prestadores próximos. O foco é pedir e responder **só com toques**: um pedido completo sai em cerca de seis toques, sem digitar.

Os dados são fictícios e ficam em memória; timers simulam o backend (propostas chegando, cliente aceitando, mensagens de resposta).

## Rodar

Requer Node 20.19+ (ou 22.12+).

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/ para deploy estático (Vercel, Netlify, etc.)
```

## O que dá para testar

**Como cliente (Contratar)**
1. Toque numa categoria → subtipos em chips, quantidade, foto/áudio → dia e período → endereço → revisão com estimativa e pagamento.
2. Publique: o radar avisa os profissionais e as propostas chegam em ~2 s.
3. Escolha uma proposta, converse com respostas rápidas, simule "a caminho" e "concluído", avalie com estrelas e tags.
4. "Pedir de novo" repete um pedido antigo pulando direto para a data.
5. Aba Buscar: busca por texto, filtro por categoria, ordenação, perfil do profissional e "Chamar" (pedido direto).

**Como prestador (Trabalhar)**
1. Liga/desliga disponibilidade; feed mostra pedidos compatíveis com seus serviços e raio.
2. Envie proposta escolhendo entre três valores sugeridos + ajuste de R$ 10. O cliente "aceita" em ~3,5 s.
3. Agenda: iniciar trajeto e concluir serviço (mostra o valor líquido).
4. Perfil: serviços, raio de atendimento e grade de disponibilidade, tudo por toques.

## Estrutura

```
src/
  data/catalog.js          categorias, prestadores, pedidos abertos, constantes
  lib/format.js            moeda, distância, datas, estimativa de preço
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
- **Match real**: `lib/match.js` vira uma consulta por categoria + raio (PostGIS) + disponibilidade, ordenada por distância, nota e taxa de resposta, limitada a 3–5 propostas.
- **Tempo real**: canais para propostas, status e chat.
- **Pagamento**: Pix/cartão com split (Mercado Pago, Pagar.me ou Asaas), retido até a conclusão.
- **Mobile nativo**: os componentes e o reducer portam direto para React Native/Expo; só a camada de estilo muda.

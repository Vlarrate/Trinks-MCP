# Trinks MCP Server

Servidor MCP para integração completa com a API do Trinks.
Cobre agendamentos, clientes, profissionais, serviços, financeiro, fidelidade e clube de assinaturas.

## Variáveis de Ambiente (obrigatórias no Railway)

| Variável | Descrição |
|---|---|
| `TRINKS_API_KEY` | Token de API gerado em trinks.com/MinhaArea/MeuCadastro |
| `TRINKS_ESTABELECIMENTO_ID` | ID do estabelecimento (clínica ou salão) |

## Deploy no Railway

### Projeto 1 — Trinks Clínica
1. Criar novo projeto no Railway
2. Deploy via GitHub (este repositório)
3. Adicionar variáveis de ambiente:
   - `TRINKS_API_KEY` = seu token
   - `TRINKS_ESTABELECIMENTO_ID` = ID da clínica

### Projeto 2 — Trinks Salão
1. Criar novo projeto no Railway
2. Deploy via GitHub (mesmo repositório)
3. Adicionar variáveis de ambiente:
   - `TRINKS_API_KEY` = seu token (mesmo)
   - `TRINKS_ESTABELECIMENTO_ID` = ID do salão

## Ferramentas disponíveis (46 no total)

### Agendamentos
- `listar_agendamentos` — filtra por data, profissional, cliente, status
- `obter_agendamento` — detalhes de um agendamento
- `criar_agendamento`
- `cancelar_agendamento`
- `confirmar_agendamento`
- `finalizar_agendamento`
- `agendamento_cliente_faltou`
- `listar_profissionais_com_agenda` — por data
- `configuracoes_agendamento`

### Clientes
- `listar_clientes` — filtra por nome, e-mail, telefone
- `obter_cliente`
- `criar_cliente`
- `editar_cliente`
- `excluir_cliente`
- `adicionar_credito_cliente`
- `adicionar_vale_presente`
- `listar_etiquetas_cliente`
- `associar_etiqueta_cliente`
- `remover_etiqueta_cliente`
- `listar_telefones_cliente`
- `adicionar_telefone_cliente`

### Profissionais
- `listar_profissionais`
- `listar_servicos_profissional`

### Serviços
- `listar_servicos`
- `listar_promocoes_servico`

### Produtos
- `listar_produtos`

### Financeiro
- `listar_transacoes` — faturamento por período com formas de pagamento
- `listar_transacoes_fiscais` — com detalhes de NFS-e
- `listar_vendas`
- `listar_lancamentos`
- `obter_lancamento`
- `criar_lancamento`
- `listar_categorias_lancamento`
- `listar_formas_pagamento`
- `listar_motivos_desconto`

### Fidelidade
- `listar_movimentacoes_fidelidade`

### Clube de Assinaturas
- `listar_planos_assinatura`
- `listar_assinaturas`
- `estatisticas_assinaturas`

### Etiquetas
- `listar_etiquetas`
- `criar_etiqueta`

### Estabelecimento
- `detalhes_estabelecimento`

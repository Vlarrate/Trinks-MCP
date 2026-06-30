#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_KEY = process.env.TRINKS_API_KEY;
const ESTABELECIMENTO_ID = process.env.TRINKS_ESTABELECIMENTO_ID;
const BASE_URL = "https://api.trinks.com";

if (!API_KEY || !ESTABELECIMENTO_ID) {
  console.error("Erro: TRINKS_API_KEY e TRINKS_ESTABELECIMENTO_ID são obrigatórios.");
  process.exit(1);
}

async function trinks(path, options = {}) {
  const { method = "GET", body, params } = options;
  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (qs) url += `?${qs}`;
  }
  const headers = {
    "X-Api-Key": API_KEY,
    "estabelecimentoId": ESTABELECIMENTO_ID,
    "Content-Type": "application/json",
  };
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Trinks API ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

const tools = [
  // ── AGENDAMENTOS ──────────────────────────────────────────────
  {
    name: "listar_agendamentos",
    description: "Lista os agendamentos do estabelecimento com filtros de data, profissional, cliente e status.",
    inputSchema: {
      type: "object",
      properties: {
        dataInicio: { type: "string", description: "Data início (YYYY-MM-DD)" },
        dataFim: { type: "string", description: "Data fim (YYYY-MM-DD)" },
        profissionalId: { type: "integer", description: "ID do profissional" },
        clienteId: { type: "integer", description: "ID do cliente" },
        status: { type: "string", description: "Status do agendamento" },
        page: { type: "integer", description: "Página (padrão 1)" },
        pageSize: { type: "integer", description: "Itens por página (padrão 20)" },
      },
    },
  },
  {
    name: "obter_agendamento",
    description: "Obtém os detalhes completos de um agendamento pelo ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer", description: "ID do agendamento" },
      },
      required: ["id"],
    },
  },
  {
    name: "criar_agendamento",
    description: "Cria um novo agendamento no estabelecimento.",
    inputSchema: {
      type: "object",
      properties: {
        clienteId: { type: "integer", description: "ID do cliente" },
        profissionalId: { type: "integer", description: "ID do profissional" },
        servicoId: { type: "integer", description: "ID do serviço" },
        dataHoraInicio: { type: "string", description: "Data e hora de início (ISO 8601)" },
        observacao: { type: "string", description: "Observação do agendamento" },
      },
      required: ["clienteId", "profissionalId", "servicoId", "dataHoraInicio"],
    },
  },
  {
    name: "cancelar_agendamento",
    description: "Cancela um agendamento existente.",
    inputSchema: {
      type: "object",
      properties: {
        agendamentoId: { type: "integer", description: "ID do agendamento" },
        motivoCancelamento: { type: "string", description: "Motivo do cancelamento" },
      },
      required: ["agendamentoId"],
    },
  },
  {
    name: "confirmar_agendamento",
    description: "Confirma um agendamento.",
    inputSchema: {
      type: "object",
      properties: {
        agendamentoId: { type: "integer", description: "ID do agendamento" },
      },
      required: ["agendamentoId"],
    },
  },
  {
    name: "finalizar_agendamento",
    description: "Altera o status do agendamento para finalizado.",
    inputSchema: {
      type: "object",
      properties: {
        agendamentoId: { type: "integer", description: "ID do agendamento" },
      },
      required: ["agendamentoId"],
    },
  },
  {
    name: "agendamento_cliente_faltou",
    description: "Registra que o cliente faltou ao agendamento.",
    inputSchema: {
      type: "object",
      properties: {
        agendamentoId: { type: "integer", description: "ID do agendamento" },
      },
      required: ["agendamentoId"],
    },
  },
  {
    name: "listar_profissionais_com_agenda",
    description: "Lista os profissionais que têm agenda em uma data específica.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "string", description: "Data (YYYY-MM-DD)" },
      },
      required: ["data"],
    },
  },
  {
    name: "configuracoes_agendamento",
    description: "Lista as configurações de agendamento do estabelecimento.",
    inputSchema: { type: "object", properties: {} },
  },

  // ── CLIENTES ─────────────────────────────────────────────────
  {
    name: "listar_clientes",
    description: "Lista todos os clientes do estabelecimento com filtro por nome, e-mail ou telefone.",
    inputSchema: {
      type: "object",
      properties: {
        nome: { type: "string", description: "Filtrar por nome" },
        email: { type: "string", description: "Filtrar por e-mail" },
        telefone: { type: "string", description: "Filtrar por telefone" },
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },
  {
    name: "obter_cliente",
    description: "Obtém todos os detalhes de um cliente pelo ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer", description: "ID do cliente" },
      },
      required: ["id"],
    },
  },
  {
    name: "criar_cliente",
    description: "Cria um novo cliente no estabelecimento.",
    inputSchema: {
      type: "object",
      properties: {
        nome: { type: "string", description: "Nome completo" },
        email: { type: "string", description: "E-mail" },
        dataNascimento: { type: "string", description: "Data de nascimento (YYYY-MM-DD)" },
        genero: { type: "string", description: "Gênero" },
        observacao: { type: "string", description: "Observação" },
      },
      required: ["nome"],
    },
  },
  {
    name: "editar_cliente",
    description: "Edita os dados de um cliente existente.",
    inputSchema: {
      type: "object",
      properties: {
        clienteId: { type: "integer", description: "ID do cliente" },
        nome: { type: "string" },
        email: { type: "string" },
        dataNascimento: { type: "string" },
        genero: { type: "string" },
        observacao: { type: "string" },
      },
      required: ["clienteId"],
    },
  },
  {
    name: "excluir_cliente",
    description: "Exclui um cliente do estabelecimento.",
    inputSchema: {
      type: "object",
      properties: {
        clienteId: { type: "integer", description: "ID do cliente" },
      },
      required: ["clienteId"],
    },
  },
  {
    name: "adicionar_credito_cliente",
    description: "Adiciona um crédito a um cliente específico.",
    inputSchema: {
      type: "object",
      properties: {
        clienteId: { type: "integer", description: "ID do cliente" },
        valor: { type: "number", description: "Valor do crédito" },
        descricao: { type: "string", description: "Descrição" },
      },
      required: ["clienteId", "valor"],
    },
  },
  {
    name: "listar_etiquetas_cliente",
    description: "Lista as etiquetas associadas a um cliente.",
    inputSchema: {
      type: "object",
      properties: {
        clienteId: { type: "integer", description: "ID do cliente" },
      },
      required: ["clienteId"],
    },
  },
  {
    name: "associar_etiqueta_cliente",
    description: "Associa uma etiqueta a um cliente.",
    inputSchema: {
      type: "object",
      properties: {
        clienteId: { type: "integer", description: "ID do cliente" },
        etiquetaId: { type: "integer", description: "ID da etiqueta" },
      },
      required: ["clienteId", "etiquetaId"],
    },
  },
  {
    name: "remover_etiqueta_cliente",
    description: "Remove uma etiqueta de um cliente.",
    inputSchema: {
      type: "object",
      properties: {
        clienteId: { type: "integer", description: "ID do cliente" },
        etiquetaId: { type: "integer", description: "ID da etiqueta" },
      },
      required: ["clienteId", "etiquetaId"],
    },
  },
  {
    name: "listar_telefones_cliente",
    description: "Lista os telefones de um cliente.",
    inputSchema: {
      type: "object",
      properties: {
        clienteId: { type: "integer", description: "ID do cliente" },
      },
      required: ["clienteId"],
    },
  },
  {
    name: "adicionar_telefone_cliente",
    description: "Adiciona um telefone a um cliente.",
    inputSchema: {
      type: "object",
      properties: {
        clienteId: { type: "integer", description: "ID do cliente" },
        numero: { type: "string", description: "Número do telefone" },
        tipo: { type: "string", description: "Tipo (celular, fixo, etc.)" },
      },
      required: ["clienteId", "numero"],
    },
  },
  {
    name: "adicionar_vale_presente",
    description: "Adiciona um vale-presente a um cliente.",
    inputSchema: {
      type: "object",
      properties: {
        clienteId: { type: "integer", description: "ID do cliente" },
        valor: { type: "number", description: "Valor do vale-presente" },
        descricao: { type: "string", description: "Descrição" },
      },
      required: ["clienteId", "valor"],
    },
  },

  // ── PROFISSIONAIS ─────────────────────────────────────────────
  {
    name: "listar_profissionais",
    description: "Lista todos os profissionais do estabelecimento.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },
  {
    name: "listar_servicos_profissional",
    description: "Lista os serviços de um profissional específico.",
    inputSchema: {
      type: "object",
      properties: {
        profissionalId: { type: "integer", description: "ID do profissional" },
      },
      required: ["profissionalId"],
    },
  },

  // ── SERVIÇOS ──────────────────────────────────────────────────
  {
    name: "listar_servicos",
    description: "Lista todos os serviços do estabelecimento.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },
  {
    name: "listar_promocoes_servico",
    description: "Lista as promoções de um serviço com valor por dia da semana.",
    inputSchema: {
      type: "object",
      properties: {
        servicoId: { type: "integer", description: "ID do serviço" },
      },
      required: ["servicoId"],
    },
  },

  // ── PRODUTOS ──────────────────────────────────────────────────
  {
    name: "listar_produtos",
    description: "Lista todos os produtos do estabelecimento.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },

  // ── FINANCEIRO: TRANSAÇÕES ────────────────────────────────────
  {
    name: "listar_transacoes",
    description: "Lista todas as transações financeiras (fechamentos de caixa) do estabelecimento por período. Inclui serviços, produtos, formas de pagamento e descontos.",
    inputSchema: {
      type: "object",
      properties: {
        dataInicio: { type: "string", description: "Data início (YYYY-MM-DDThh:mm:ss)" },
        dataFim: { type: "string", description: "Data fim (YYYY-MM-DDThh:mm:ss)" },
        incluirEstornos: { type: "boolean", description: "Incluir estornos (padrão false)" },
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },
  {
    name: "listar_transacoes_fiscais",
    description: "Lista as transações com detalhes fiscais (NFS-e). Útil para emissão e conferência de notas fiscais.",
    inputSchema: {
      type: "object",
      properties: {
        dataInicio: { type: "string", description: "Data início (YYYY-MM-DDThh:mm:ss)" },
        dataFim: { type: "string", description: "Data fim (YYYY-MM-DDThh:mm:ss)" },
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },

  // ── FINANCEIRO: VENDAS ────────────────────────────────────────
  {
    name: "listar_vendas",
    description: "Lista todas as vendas de produto do estabelecimento.",
    inputSchema: {
      type: "object",
      properties: {
        dataInicio: { type: "string", description: "Data início" },
        dataFim: { type: "string", description: "Data fim" },
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },

  // ── FINANCEIRO: LANÇAMENTOS ───────────────────────────────────
  {
    name: "listar_lancamentos",
    description: "Lista todos os lançamentos financeiros (receitas e despesas) do estabelecimento.",
    inputSchema: {
      type: "object",
      properties: {
        dataInicio: { type: "string", description: "Data início" },
        dataFim: { type: "string", description: "Data fim" },
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },
  {
    name: "obter_lancamento",
    description: "Obtém os detalhes completos de um lançamento financeiro.",
    inputSchema: {
      type: "object",
      properties: {
        lancamentoId: { type: "integer", description: "ID do lançamento" },
      },
      required: ["lancamentoId"],
    },
  },
  {
    name: "criar_lancamento",
    description: "Cria um novo lançamento financeiro (receita ou despesa), simples ou recorrente.",
    inputSchema: {
      type: "object",
      properties: {
        categoriaId: { type: "integer", description: "ID da categoria" },
        dataVencimento: { type: "string", description: "Data de vencimento (YYYY-MM-DD)" },
        valor: { type: "number", description: "Valor" },
        statusPagamento: { type: "integer", description: "1=Pago, 2=Não pago" },
        descricao: { type: "string", description: "Descrição" },
        formaPagamentoId: { type: "integer", description: "ID da forma de pagamento" },
      },
      required: ["categoriaId", "dataVencimento", "valor", "statusPagamento"],
    },
  },
  {
    name: "listar_categorias_lancamento",
    description: "Lista as categorias de lançamento disponíveis no estabelecimento.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "listar_formas_pagamento",
    description: "Lista as formas de pagamento disponíveis no estabelecimento.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "listar_motivos_desconto",
    description: "Lista os motivos de desconto cadastrados no estabelecimento.",
    inputSchema: { type: "object", properties: {} },
  },

  // ── FIDELIDADE ────────────────────────────────────────────────
  {
    name: "listar_movimentacoes_fidelidade",
    description: "Lista movimentações de pontos do programa de fidelidade (máximo 90 dias por consulta).",
    inputSchema: {
      type: "object",
      properties: {
        dataInicio: { type: "string", description: "Data início (YYYY-MM-DD)" },
        dataFim: { type: "string", description: "Data fim (YYYY-MM-DD)" },
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },

  // ── CLUBE DE ASSINATURAS ──────────────────────────────────────
  {
    name: "listar_planos_assinatura",
    description: "Lista os planos de assinatura do clube do estabelecimento.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "listar_assinaturas",
    description: "Lista as assinaturas ativas no estabelecimento.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },
  {
    name: "estatisticas_assinaturas",
    description: "Retorna estatísticas das assinaturas do estabelecimento.",
    inputSchema: { type: "object", properties: {} },
  },

  // ── ETIQUETAS ─────────────────────────────────────────────────
  {
    name: "listar_etiquetas",
    description: "Lista todas as etiquetas cadastradas no estabelecimento.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "criar_etiqueta",
    description: "Cria uma nova etiqueta no estabelecimento.",
    inputSchema: {
      type: "object",
      properties: {
        conteudo: { type: "string", description: "Nome/conteúdo da etiqueta" },
      },
      required: ["conteudo"],
    },
  },

  // ── ESTABELECIMENTO ───────────────────────────────────────────
  {
    name: "detalhes_estabelecimento",
    description: "Retorna os detalhes do estabelecimento atual.",
    inputSchema: { type: "object", properties: {} },
  },
];

async function callTool(name, args) {
  switch (name) {
    // AGENDAMENTOS
    case "listar_agendamentos":
      return trinks("/v1/agendamentos", { params: args });
    case "obter_agendamento":
      return trinks(`/v1/agendamentos/${args.id}`);
    case "criar_agendamento":
      return trinks("/v1/agendamentos", { method: "POST", body: args });
    case "cancelar_agendamento": {
      const { agendamentoId, ...body } = args;
      return trinks(`/v1/agendamentos/${agendamentoId}/status/cancelado`, { method: "PATCH", body });
    }
    case "confirmar_agendamento":
      return trinks(`/v1/agendamentos/${args.agendamentoId}/status/confirmado`, { method: "PATCH" });
    case "finalizar_agendamento":
      return trinks(`/v1/agendamentos/${args.agendamentoId}/status/finalizado`, { method: "PATCH" });
    case "agendamento_cliente_faltou":
      return trinks(`/v1/agendamentos/${args.agendamentoId}/status/clientefaltou`, { method: "PATCH" });
    case "listar_profissionais_com_agenda":
      return trinks(`/v1/agendamentos/profissionais/${args.data}`);
    case "configuracoes_agendamento":
      return trinks("/v1/agendamentos/configuracoes");

    // CLIENTES
    case "listar_clientes":
      return trinks("/v1/clientes", { params: args });
    case "obter_cliente":
      return trinks(`/v1/clientes/${args.id}`);
    case "criar_cliente":
      return trinks("/v1/clientes", { method: "POST", body: args });
    case "editar_cliente": {
      const { clienteId, ...body } = args;
      return trinks(`/v1/clientes/${clienteId}`, { method: "PUT", body });
    }
    case "excluir_cliente":
      return trinks(`/v1/clientes/${args.clienteId}`, { method: "DELETE" });
    case "adicionar_credito_cliente": {
      const { clienteId, ...body } = args;
      return trinks(`/v1/clientes/${clienteId}/creditos`, { method: "POST", body });
    }
    case "listar_etiquetas_cliente":
      return trinks(`/v1/clientes/${args.clienteId}/etiquetas`);
    case "associar_etiqueta_cliente":
      return trinks(`/v1/clientes/${args.clienteId}/etiquetas/${args.etiquetaId}`, { method: "POST" });
    case "remover_etiqueta_cliente":
      return trinks(`/v1/clientes/${args.clienteId}/etiquetas/${args.etiquetaId}`, { method: "DELETE" });
    case "listar_telefones_cliente":
      return trinks(`/v1/clientes/${args.clienteId}/telefones`);
    case "adicionar_telefone_cliente": {
      const { clienteId, ...body } = args;
      return trinks(`/v1/clientes/${clienteId}/telefones`, { method: "POST", body });
    }
    case "adicionar_vale_presente": {
      const { clienteId, ...body } = args;
      return trinks(`/v1/clientes/${clienteId}/valespresentes`, { method: "POST", body });
    }

    // PROFISSIONAIS
    case "listar_profissionais":
      return trinks("/v1/profissionais", { params: args });
    case "listar_servicos_profissional":
      return trinks(`/v1/profissionais/${args.profissionalId}/servicos`);

    // SERVIÇOS
    case "listar_servicos":
      return trinks("/v1/servicos", { params: args });
    case "listar_promocoes_servico":
      return trinks(`/v1/servicos/${args.servicoId}/promocoes`);

    // PRODUTOS
    case "listar_produtos":
      return trinks("/v1/produtos", { params: args });

    // FINANCEIRO: TRANSAÇÕES
    case "listar_transacoes":
      return trinks("/v1/transacoes", { params: args });
    case "listar_transacoes_fiscais":
      return trinks("/v1/transacoes/notas-fiscais", { params: args });

    // FINANCEIRO: VENDAS
    case "listar_vendas":
      return trinks("/v1/vendas", { params: args });

    // FINANCEIRO: LANÇAMENTOS
    case "listar_lancamentos":
      return trinks("/v1/lancamentos", { params: args });
    case "obter_lancamento":
      return trinks(`/v1/lancamentos/${args.lancamentoId}`);
    case "criar_lancamento":
      return trinks("/v1/lancamentos", { method: "POST", body: args });
    case "listar_categorias_lancamento":
      return trinks("/v1/lancamentos/categorias");
    case "listar_formas_pagamento":
      return trinks("/v1/formaspagamentos");
    case "listar_motivos_desconto":
      return trinks("/v1/motivosdescontos");

    // FIDELIDADE
    case "listar_movimentacoes_fidelidade":
      return trinks("/v1/fidelidade", { params: args });

    // CLUBE DE ASSINATURAS
    case "listar_planos_assinatura":
      return trinks("/v1/clube/planos");
    case "listar_assinaturas":
      return trinks("/v1/clube/assinaturas", { params: args });
    case "estatisticas_assinaturas":
      return trinks("/v1/clube/assinaturas/statistics");

    // ETIQUETAS
    case "listar_etiquetas":
      return trinks("/v1/etiquetas");
    case "criar_etiqueta":
      return trinks("/v1/etiquetas", { method: "POST", body: args });

    // ESTABELECIMENTO
    case "detalhes_estabelecimento":
      return trinks(`/v1/estabelecimentos/${ESTABELECIMENTO_ID}`);

    default:
      throw new Error(`Ferramenta desconhecida: ${name}`);
  }
}

const server = new Server(
  { name: "trinks-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const result = await callTool(name, args || {});
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: `Erro: ${err.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Trinks MCP rodando.");

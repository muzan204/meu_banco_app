const $ = (selector) => document.querySelector(selector);

const lista = $("#listaPedidos");
const modal = $("#modalPedido");

let pedidos = [];
let clientes = [];
let produtos = [];

/* ======================================================
   UTILITÁRIOS
====================================================== */

function esc(texto) {
  const div = document.createElement("div");

  div.textContent = texto ?? "";

  return div.innerHTML;
}

function money(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function fmt(data) {
  if (!data) {
    return "-";
  }

  const valor = new Date(
    String(data).replace(" ", "T"),
  );

  if (Number.isNaN(valor.getTime())) {
    return "-";
  }

  return valor.toLocaleString("pt-BR");
}

function toast(texto) {
  const elemento = $("#toastPedido");

  if (!elemento) {
    return;
  }

  elemento.textContent = texto;

  elemento.classList.add("show");

  setTimeout(() => {
    elemento.classList.remove("show");
  }, 2500);
}

function menu() {
  const botao = $("#menuBtn");

  const sidebar = $("#sidebar");

  if (!botao || !sidebar) {
    return;
  }

  botao.onclick = () => {
    sidebar.classList.toggle("open");
  };
}

/* ======================================================
   REQUISIÇÕES
====================================================== */

async function get(url) {
  const resposta = await fetch(url, {
    cache: "no-store",
  });

  let dados;

  try {
    dados = await resposta.json();
  } catch {
    throw new Error(
      `Resposta inválida recebida de ${url}`,
    );
  }

  if (!resposta.ok) {
    throw new Error(
      dados.erro ||
        "Não foi possível carregar os dados.",
    );
  }

  return dados;
}

/* ======================================================
   CARREGAMENTO PRINCIPAL
====================================================== */

async function load() {
  if (!lista) {
    return;
  }

  try {
    const resultados = await Promise.all([
      get("listar_pedidos.php"),
      get("listar.php"),
      get("listar_produtos.php"),
    ]);

    pedidos = Array.isArray(resultados[0])
      ? resultados[0]
      : [];

    clientes = Array.isArray(resultados[1])
      ? resultados[1]
      : [];

    produtos = Array.isArray(resultados[2])
      ? resultados[2]
      : [];

    aplicarFiltros();

    stats();

    fillClientes();
  } catch (erro) {
    console.error(erro);

    lista.innerHTML = `
      <tr>
        <td colspan="7" class="empty">
          ${esc(erro.message)}
        </td>
      </tr>
    `;
  }
}

/* ======================================================
   RENDERIZAÇÃO DOS PEDIDOS
====================================================== */

function render(dados) {
  if (!lista) {
    return;
  }

  if (!dados.length) {
    lista.innerHTML = `
      <tr>
        <td colspan="7" class="empty">
          Nenhum pedido registrado.
        </td>
      </tr>
    `;

    return;
  }

  lista.innerHTML = dados
    .map((pedido) => {
      const itens = Array.isArray(pedido.itens)
        ? pedido.itens
        : [];

      const descricaoItens = itens.length
        ? itens
            .map(
              (item) =>
                `${esc(item.nome)} × ${esc(
                  item.quantidade,
                )}`,
            )
            .join(" • ")
        : "Sem itens";

      const totalItens =
        pedido.total_itens ??
        itens.reduce(
          (total, item) =>
            total +
            Number(item.quantidade || 0),
          0,
        );

      return `
        <tr>

          <td>
            <b>#${esc(pedido.id)}</b>
          </td>

          <td>
            <b>
              ${esc(pedido.cliente_nome)}
            </b>

            <div class="details">
              ${esc(pedido.cliente_email)}
            </div>
          </td>

          <td>
            ${esc(totalItens)}

            <div class="details">
              ${descricaoItens}
            </div>
          </td>

          <td>
            <b>
              ${money(pedido.total)}
            </b>
          </td>

          <td>
            ${renderStatus(pedido)}
          </td>

          <td>
            ${fmt(pedido.criado_em)}
          </td>

          <td>
            <button
              class="danger-btn"
              data-del="${esc(pedido.id)}"
            >
              Excluir
            </button>
          </td>

        </tr>
      `;
    })
    .join("");
}

function renderStatus(pedido) {
  const status = pedido.status || "Pendente";

  /*
    Status automáticos:
    Pendente
    Pago
    Enviado
    Concluído

    Cancelado continua podendo ser manual.
  */

  if (status === "Cancelado") {
    return `
      <span class="status-badge status-cancelado">
        Cancelado
      </span>
    `;
  }

  return `
    <span
      class="status-badge status-${slugStatus(
        status,
      )}"
    >
      ${esc(status)}
    </span>

    <button
      type="button"
      class="btn-cancelar-pedido"
      data-cancel="${esc(pedido.id)}"
    >
      Cancelar
    </button>
  `;
}

function slugStatus(status) {
  return String(status)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

/* ======================================================
   ESTATÍSTICAS
====================================================== */

function stats() {
  const totalPedidos =
    $("#totalPedidos");

  const pedidosPendentes =
    $("#pedidosPendentes");

  const valorPedidos =
    $("#valorPedidos");

  if (totalPedidos) {
    totalPedidos.textContent =
      pedidos.length;
  }

  if (pedidosPendentes) {
    pedidosPendentes.textContent =
      pedidos.filter(
        (pedido) =>
          pedido.status === "Pendente",
      ).length;
  }

  if (valorPedidos) {
    const valor = pedidos
      .filter(
        (pedido) =>
          pedido.status !== "Cancelado",
      )
      .reduce(
        (total, pedido) =>
          total +
          Number(pedido.total || 0),
        0,
      );

    valorPedidos.textContent =
      money(valor);
  }
}

/* ======================================================
   CLIENTES
====================================================== */

function fillClientes() {
  const select =
    $("#clientePedido");

  if (!select) {
    return;
  }

  const valorAtual =
    select.value;

  select.innerHTML = `
    <option value="">
      Selecione um cliente
    </option>
  `;

  clientes.forEach((cliente) => {
    const option =
      document.createElement(
        "option",
      );

    option.value =
      cliente.id;

    option.textContent =
      cliente.nome;

    select.appendChild(option);
  });

  if (
    clientes.some(
      (cliente) =>
        String(cliente.id) ===
        String(valorAtual),
    )
  ) {
    select.value = valorAtual;
  }
}

/* ======================================================
   ITENS DO PEDIDO
====================================================== */

function addItem() {
  if (!produtos.length) {
    toast(
      "Cadastre produtos antes de criar um pedido.",
    );

    return;
  }

  const disponiveis =
    produtos.filter(
      (produto) =>
        Number(produto.estoque) > 0,
    );

  if (!disponiveis.length) {
    toast(
      "Nenhum produto possui estoque disponível.",
    );

    return;
  }

  const row =
    document.createElement(
      "div",
    );

  row.className =
    "order-item";

  row.innerHTML = `
    <select class="item-produto">

      <option value="">
        Selecione um produto
      </option>

      ${disponiveis
        .map(
          (produto) => `
            <option
              value="${produto.id}"
            >
              ${esc(produto.nome)}
              — ${money(produto.preco)}
              (${produto.estoque} em estoque)
            </option>
          `,
        )
        .join("")}

    </select>

    <input
      class="item-qtd"
      type="number"
      min="1"
      value="1"
    >

    <button
      type="button"
      class="remove-item"
      title="Remover item"
    >
      ×
    </button>
  `;

  const selectProduto =
    row.querySelector(
      ".item-produto",
    );

  const quantidade =
    row.querySelector(
      ".item-qtd",
    );

  selectProduto.addEventListener(
    "change",
    () => {
      const produto =
        produtos.find(
          (item) =>
            String(item.id) ===
            String(
              selectProduto.value,
            ),
        );

      if (produto) {
        quantidade.max =
          Number(produto.estoque);

        if (
          Number(quantidade.value) >
          Number(produto.estoque)
        ) {
          quantidade.value =
            produto.estoque;
        }
      } else {
        quantidade.removeAttribute(
          "max",
        );
      }

      calc();
    },
  );

  quantidade.addEventListener(
    "input",
    () => {
      const produto =
        produtos.find(
          (item) =>
            String(item.id) ===
            String(
              selectProduto.value,
            ),
        );

      if (produto) {
        const estoque =
          Number(produto.estoque);

        if (
          Number(quantidade.value) >
          estoque
        ) {
          quantidade.value =
            estoque;
        }

        if (
          Number(quantidade.value) <
          1
        ) {
          quantidade.value = 1;
        }
      }

      calc();
    },
  );

  row.querySelector(
    ".remove-item",
  ).onclick = () => {
    row.remove();

    calc();
  };

  $("#itensPedido")
    .appendChild(row);

  calc();
}

/* ======================================================
   CÁLCULO DO TOTAL
====================================================== */

function calc() {
  let total = 0;

  document
    .querySelectorAll(
      ".order-item",
    )
    .forEach((row) => {
      const produtoId =
        row.querySelector(
          ".item-produto",
        ).value;

      const quantidade =
        Number(
          row.querySelector(
            ".item-qtd",
          ).value || 0,
        );

      const produto =
        produtos.find(
          (item) =>
            String(item.id) ===
            String(produtoId),
        );

      if (produto) {
        total +=
          Number(produto.preco) *
          quantidade;
      }
    });

  const totalPedido =
    $("#totalPedido");

  if (totalPedido) {
    totalPedido.textContent =
      money(total);
  }
}

/* ======================================================
   MODAL
====================================================== */

function open() {
  if (!clientes.length) {
    toast(
      "Cadastre um cliente primeiro.",
    );

    return;
  }

  if (!produtos.length) {
    toast(
      "Cadastre um produto primeiro.",
    );

    return;
  }

  const form =
    $("#formPedido");

  if (form) {
    form.reset();
  }

  const itens =
    $("#itensPedido");

  if (itens) {
    itens.innerHTML = "";
  }

  const mensagem =
    $("#mensagemPedido");

  if (mensagem) {
    mensagem.textContent = "";
  }

  fillClientes();

  addItem();

  if (modal) {
    modal.classList.add(
      "active",
    );
  }
}

function close() {
  if (modal) {
    modal.classList.remove(
      "active",
    );
  }
}

/* ======================================================
   FILTROS
====================================================== */

function aplicarFiltros() {
  const campoPesquisa =
    $("#pesquisaPedido");

  const campoStatus =
    $("#filtroStatus");

  const termo =
    campoPesquisa
      ? campoPesquisa.value
          .toLowerCase()
          .trim()
      : "";

  const status =
    campoStatus
      ? campoStatus.value
      : "";

  const filtrados =
    pedidos.filter((pedido) => {
      const cliente =
        String(
          pedido.cliente_nome || "",
        ).toLowerCase();

      const email =
        String(
          pedido.cliente_email || "",
        ).toLowerCase();

      const id =
        String(
          pedido.id || "",
        ).toLowerCase();

      const batePesquisa =
        !termo ||
        id.includes(termo) ||
        cliente.includes(termo) ||
        email.includes(termo);

      const bateStatus =
        !status ||
        pedido.status === status;

      return (
        batePesquisa &&
        bateStatus
      );
    });

  render(filtrados);
}

/* ======================================================
   CRIAR PEDIDO
====================================================== */

async function cadastrarPedido(event) {
  event.preventDefault();

  const clienteId =
    $("#clientePedido").value;

  if (!clienteId) {
    toast(
      "Selecione um cliente.",
    );

    return;
  }

  const itens =
    [
      ...document.querySelectorAll(
        ".order-item",
      ),
    ]
      .map((row) => ({
        produto_id:
          row.querySelector(
            ".item-produto",
          ).value,

        quantidade:
          Number(
            row.querySelector(
              ".item-qtd",
            ).value || 0,
          ),
      }))
      .filter(
        (item) =>
          item.produto_id &&
          item.quantidade > 0,
      );

  if (!itens.length) {
    toast(
      "Adicione pelo menos um produto.",
    );

    return;
  }

  /*
    Evita mandar o mesmo produto
    repetido em várias linhas.
  */

  const agrupados = {};

  itens.forEach((item) => {
    const id =
      String(item.produto_id);

    if (!agrupados[id]) {
      agrupados[id] = {
        produto_id:
          item.produto_id,

        quantidade: 0,
      };
    }

    agrupados[id].quantidade +=
      Number(item.quantidade);
  });

  const itensFinais =
    Object.values(agrupados);

  for (const item of itensFinais) {
    const produto =
      produtos.find(
        (produto) =>
          String(produto.id) ===
          String(
            item.produto_id,
          ),
      );

    if (!produto) {
      toast(
        "Um dos produtos não foi encontrado.",
      );

      return;
    }

    if (
      Number(item.quantidade) >
      Number(produto.estoque)
    ) {
      toast(
        `Estoque insuficiente para ${produto.nome}.`,
      );

      return;
    }
  }

  const dados = {
    cliente_id: clienteId,
    itens: itensFinais,
  };

  const botao =
    $("#btnSalvarPedido");

  if (botao) {
    botao.disabled = true;
    botao.textContent =
      "Salvando...";
  }

  try {
    const resposta =
      await fetch(
        "cadastrar_pedido.php",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              dados,
            ),
        },
      );

    const resultado =
      await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        resultado.erro ||
          "Erro ao cadastrar pedido.",
      );
    }

    toast(
      resultado.mensagem ||
        "Pedido cadastrado com sucesso.",
    );

    close();

    await load();
  } catch (erro) {
    const mensagem =
      $("#mensagemPedido");

    if (mensagem) {
      mensagem.textContent =
        erro.message;
    }

    toast(erro.message);
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent =
        "Cadastrar pedido";
    }
  }
}

/* ======================================================
   CANCELAR PEDIDO
====================================================== */

async function cancelarPedido(id) {
  if (
    !confirm(
      "Cancelar este pedido?",
    )
  ) {
    return;
  }

  try {
    const resposta =
      await fetch(
        "atualizar_status_pedido.php",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              id,
              status:
                "Cancelado",
            }),
        },
      );

    const resultado =
      await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        resultado.erro ||
          "Erro ao cancelar pedido.",
      );
    }

    toast(
      resultado.mensagem ||
        "Pedido cancelado.",
    );

    await load();
  } catch (erro) {
    toast(erro.message);
  }
}

/* ======================================================
   EXCLUIR PEDIDO
====================================================== */

async function excluirPedido(id) {
  const confirmar =
    confirm(
      "Excluir este pedido? O estoque dos itens será devolvido.",
    );

  if (!confirmar) {
    return;
  }

  try {
    const resposta =
      await fetch(
        "excluir_pedido.php",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              id,
            }),
        },
      );

    const resultado =
      await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        resultado.erro ||
          "Erro ao excluir pedido.",
      );
    }

    toast(
      resultado.mensagem ||
        "Pedido excluído.",
    );

    await load();
  } catch (erro) {
    toast(erro.message);
  }
}

/* ======================================================
   CSV
====================================================== */

function csvCell(valor) {
  return (
    '"' +
    String(valor ?? "")
      .replaceAll('"', '""') +
    '"'
  );
}

function baixarCSV(
  nome,
  cabecalho,
  linhas,
) {
  const csv =
    "\uFEFF" +
    [
      cabecalho,
      ...linhas,
    ]
      .map((linha) =>
        linha
          .map(csvCell)
          .join(";"),
      )
      .join("\n");

  const blob =
    new Blob([csv], {
      type:
        "text/csv;charset=utf-8",
    });

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement(
      "a",
    );

  link.href = url;
  link.download = nome;

  document.body.appendChild(
    link,
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

function exportarCSV() {
  baixarCSV(
    "pedidos.csv",

    [
      "Pedido",
      "Cliente",
      "E-mail",
      "Itens",
      "Total",
      "Status",
      "Data",
    ],

    pedidos.map((pedido) => [
      pedido.id,

      pedido.cliente_nome,

      pedido.cliente_email,

      Array.isArray(
        pedido.itens,
      )
        ? pedido.itens
            .map(
              (item) =>
                `${item.nome} x ${item.quantidade}`,
            )
            .join(" | ")
        : "",

      pedido.total,

      pedido.status,

      fmt(
        pedido.criado_em,
      ),
    ]),
  );
}

/* ======================================================
   EVENTOS
====================================================== */

const abrirModalPedido =
  $("#abrirModalPedido");

if (abrirModalPedido) {
  abrirModalPedido.onclick =
    open;
}

const fecharModalPedido =
  $("#fecharModalPedido");

if (fecharModalPedido) {
  fecharModalPedido.onclick =
    close;
}

const cancelarModal =
  $("#cancelarPedido");

if (cancelarModal) {
  cancelarModal.onclick =
    close;
}

if (modal) {
  modal.onclick = (
    event,
  ) => {
    if (
      event.target === modal
    ) {
      close();
    }
  };
}

const adicionarItem =
  $("#adicionarItem");

if (adicionarItem) {
  adicionarItem.onclick =
    addItem;
}

const atualizar =
  $("#btnAtualizarPedidos");

if (atualizar) {
  atualizar.onclick =
    load;
}

const pesquisa =
  $("#pesquisaPedido");

if (pesquisa) {
  pesquisa.oninput =
    aplicarFiltros;
}

const filtroStatus =
  $("#filtroStatus");

if (filtroStatus) {
  filtroStatus.onchange =
    aplicarFiltros;
}

const formPedido =
  $("#formPedido");

if (formPedido) {
  formPedido.onsubmit =
    cadastrarPedido;
}

if (lista) {
  lista.onclick = async (
    event,
  ) => {
    const botaoExcluir =
      event.target.closest(
        "[data-del]",
      );

    if (botaoExcluir) {
      await excluirPedido(
        botaoExcluir.dataset
          .del,
      );

      return;
    }

    const botaoCancelar =
      event.target.closest(
        "[data-cancel]",
      );

    if (botaoCancelar) {
      await cancelarPedido(
        botaoCancelar.dataset
          .cancel,
      );
    }
  };
}

const exportarPedidos =
  $("#exportarPedidos");

if (exportarPedidos) {
  exportarPedidos.onclick =
    exportarCSV;
}

/* ======================================================
   INICIAR
====================================================== */

menu();

load();

/*
  Atualização automática.

  listar_pedidos.php também deve
  atualizar o status automaticamente.
*/

setInterval(() => {
  load();
}, 10000);
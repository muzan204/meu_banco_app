const $ = (selector) =>
  document.querySelector(selector);

let clientes = [];
let produtos = [];
let pedidos = [];

let atualizando = false;


/* ======================================================
   UTILITÁRIOS
====================================================== */

function esc(texto) {
  const div =
    document.createElement("div");

  div.textContent =
    texto ?? "";

  return div.innerHTML;
}


function money(valor) {
  return Number(
    valor || 0
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}


function fmt(data) {
  if (!data) {
    return "-";
  }

  const valor =
    new Date(
      String(data).replace(
        " ",
        "T"
      )
    );

  if (
    Number.isNaN(
      valor.getTime()
    )
  ) {
    return "-";
  }

  return valor
    .toLocaleString(
      "pt-BR"
    );
}


function slugStatus(status) {
  return String(
    status || ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /\s+/g,
      "-"
    );
}


function toast(texto) {
  const elemento =
    $("#toast");

  if (!elemento) {
    return;
  }

  elemento.textContent =
    texto;

  elemento.classList.add(
    "show"
  );

  setTimeout(() => {
    elemento.classList.remove(
      "show"
    );
  }, 2500);
}


/* ======================================================
   MENU MOBILE
====================================================== */

function menu() {
  const botao =
    $("#menuBtn");

  const sidebar =
    $("#sidebar");

  if (
    !botao ||
    !sidebar
  ) {
    return;
  }

  botao.onclick = () => {
    sidebar.classList.toggle(
      "open"
    );
  };
}


/* ======================================================
   FETCH
====================================================== */

async function get(url) {
  const resposta =
    await fetch(
      url,
      {
        cache: "no-store",
      }
    );

  let dados;

  try {
    dados =
      await resposta.json();
  } catch {
    throw new Error(
      `Resposta inválida de ${url}`
    );
  }

  if (!resposta.ok) {
    throw new Error(
      dados.erro ||
      "Erro ao carregar dados."
    );
  }

  return dados;
}


/* ======================================================
   DASHBOARD
====================================================== */

async function loadDashboard(
  mostrarMensagem = false
) {
  if (atualizando) {
    return;
  }

  atualizando = true;

  const botao =
    $("#btnAtualizarDashboard");

  if (botao) {
    botao.disabled = true;

    botao.textContent =
      "↻ Atualizando...";
  }

  try {

    const resultado =
      await Promise.all([
        get("listar.php"),
        get(
          "listar_produtos.php"
        ),
        get(
          "listar_pedidos.php"
        ),
      ]);


    clientes =
      Array.isArray(
        resultado[0]
      )
        ? resultado[0]
        : [];


    produtos =
      Array.isArray(
        resultado[1]
      )
        ? resultado[1]
        : [];


    pedidos =
      Array.isArray(
        resultado[2]
      )
        ? resultado[2]
        : [];


    atualizarCards();

    atualizarStatus();

    renderUltimosPedidos();

    renderEstoqueBaixo();

    atualizarHorario();


    if (
      mostrarMensagem
    ) {
      toast(
        "Dashboard atualizado."
      );
    }

  } catch (erro) {

    console.error(erro);

    toast(
      erro.message
    );

    const container =
      $("#ultimosPedidos");

    if (container) {
      container.innerHTML = `
        <div class="empty">
          ${esc(
            erro.message
          )}
        </div>
      `;
    }

  } finally {

    atualizando = false;

    if (botao) {
      botao.disabled =
        false;

      botao.textContent =
        "↻ Atualizar";
    }
  }
}


/* ======================================================
   CARDS
====================================================== */

function atualizarCards() {

  setText(
    "#statClientes",
    clientes.length
  );

  setText(
    "#statProdutos",
    produtos.length
  );

  setText(
    "#statPedidos",
    pedidos.length
  );


  /* PEDIDOS HOJE */

  const hoje =
    new Date();

  const pedidosHoje =
    pedidos.filter(
      (pedido) => {

        if (
          !pedido.criado_em
        ) {
          return false;
        }

        const dataPedido =
          new Date(
            String(
              pedido.criado_em
            ).replace(
              " ",
              "T"
            )
          );

        if (
          Number.isNaN(
            dataPedido.getTime()
          )
        ) {
          return false;
        }

        return (
          dataPedido.getFullYear() ===
            hoje.getFullYear() &&

          dataPedido.getMonth() ===
            hoje.getMonth() &&

          dataPedido.getDate() ===
            hoje.getDate()
        );
      }
    ).length;


  setText(
    "#statPedidosHoje",
    pedidosHoje
  );


  /* FATURAMENTO */

  const confirmados =
    pedidos.filter(
      (pedido) =>
        [
          "Pago",
          "Enviado",
          "Concluído",
        ].includes(
          pedido.status
        )
    );


  const faturamento =
    confirmados.reduce(
      (
        total,
        pedido
      ) =>
        total +
        Number(
          pedido.total || 0
        ),
      0
    );


  setText(
    "#statFaturamento",
    money(faturamento)
  );


  /* TICKET MÉDIO */

  const ticket =
    confirmados.length
      ? faturamento /
        confirmados.length
      : 0;


  setText(
    "#statTicket",
    money(ticket)
  );


  /* VALOR DO ESTOQUE */

  const valorEstoque =
    produtos.reduce(
      (
        total,
        produto
      ) => {

        const preco =
          Number(
            produto.preco ||
            0
          );

        const estoque =
          Number(
            produto.estoque ||
            0
          );

        return (
          total +
          preco * estoque
        );
      },
      0
    );


  setText(
    "#statValorEstoque",
    money(valorEstoque)
  );


  /* ESTOQUE BAIXO */

  const estoqueBaixo =
    produtos.filter(
      (produto) =>
        Number(
          produto.estoque
        ) <= 5
    );


  setText(
    "#statBaixo",
    estoqueBaixo.length
  );
}


/* ======================================================
   STATUS
====================================================== */

function atualizarStatus() {

  const contar =
    (status) =>
      pedidos.filter(
        (pedido) =>
          pedido.status ===
          status
      ).length;


  setText(
    "#statusPendente",
    contar("Pendente")
  );

  setText(
    "#statusPago",
    contar("Pago")
  );

  setText(
    "#statusEnviado",
    contar("Enviado")
  );

  setText(
    "#statusConcluido",
    contar("Concluído")
  );

  setText(
    "#statusCancelado",
    contar("Cancelado")
  );
}


/* ======================================================
   ÚLTIMOS PEDIDOS
====================================================== */

function renderUltimosPedidos() {

  const container =
    $("#ultimosPedidos");

  if (!container) {
    return;
  }


  const ultimos =
    [...pedidos]
      .sort(
        (a, b) => {

          const dataA =
            new Date(
              String(
                a.criado_em ||
                ""
              ).replace(
                " ",
                "T"
              )
            );

          const dataB =
            new Date(
              String(
                b.criado_em ||
                ""
              ).replace(
                " ",
                "T"
              )
            );

          return (
            dataB -
            dataA
          );
        }
      )
      .slice(
        0,
        6
      );


  if (
    !ultimos.length
  ) {

    container.innerHTML = `
      <div class="empty">
        Nenhum pedido registrado.
      </div>
    `;

    return;
  }


  container.innerHTML =
    ultimos
      .map(
        (pedido) => `
          <a
            href="pedidos.html"
            class="activity-item"
          >

            <div class="activity-id">
              #${esc(
                pedido.id
              )}
            </div>


            <div class="activity-main">

              <strong>
                ${esc(
                  pedido.cliente_nome
                )}
              </strong>

              <small>
                ${fmt(
                  pedido.criado_em
                )}
              </small>

            </div>


            <div class="activity-side">

              <strong>
                ${money(
                  pedido.total
                )}
              </strong>

              <span
                class="
                  status-badge
                  status-${slugStatus(
                    pedido.status
                  )}
                "
              >
                ${esc(
                  pedido.status
                )}
              </span>

            </div>

          </a>
        `
      )
      .join("");
}


/* ======================================================
   ESTOQUE BAIXO
====================================================== */

function renderEstoqueBaixo() {

  const container =
    $("#listaEstoqueBaixo");

  if (!container) {
    return;
  }


  const baixos =
    [...produtos]
      .filter(
        (produto) =>
          Number(
            produto.estoque
          ) <= 5
      )
      .sort(
        (a, b) =>
          Number(
            a.estoque
          ) -
          Number(
            b.estoque
          )
      )
      .slice(
        0,
        5
      );


  if (
    !baixos.length
  ) {

    container.innerHTML = `
      <div class="stock-ok">

        <span>
          ✓
        </span>

        <div>

          <strong>
            Estoque saudável
          </strong>

          <small>
            Nenhum produto precisa de reposição.
          </small>

        </div>

      </div>
    `;

    return;
  }


  container.innerHTML =
    baixos
      .map(
        (produto) => `
          <div class="stock-row">

            <div>

              <strong>
                ${esc(
                  produto.nome
                )}
              </strong>

              <small>
                ${money(
                  produto.preco
                )}
              </small>

            </div>

            <span
              class="
                stock-quantity
                ${
                  Number(
                    produto.estoque
                  ) === 0
                    ? "danger"
                    : ""
                }
              "
            >
              ${esc(
                produto.estoque
              )}
              un.
            </span>

          </div>
        `
      )
      .join("");
}


/* ======================================================
   HORÁRIO
====================================================== */

function atualizarHorario() {

  const elemento =
    $("#ultimaAtualizacao");

  if (!elemento) {
    return;
  }

  const agora =
    new Date();

  elemento.textContent =
    agora.toLocaleTimeString(
      "pt-BR",
      {
        hour:
          "2-digit",

        minute:
          "2-digit",

        second:
          "2-digit",
      }
    );
}


/* ======================================================
   AUXILIAR
====================================================== */

function setText(
  selector,
  valor
) {

  const elemento =
    $(selector);

  if (elemento) {
    elemento.textContent =
      valor;
  }
}


/* ======================================================
   EVENTOS
====================================================== */

const btnAtualizar =
  $("#btnAtualizarDashboard");

if (btnAtualizar) {

  btnAtualizar.onclick =
    () =>
      loadDashboard(true);
}


/* ======================================================
   INICIAR
====================================================== */

menu();

loadDashboard();


/*
  Atualização automática
  a cada 10 segundos.
*/

setInterval(
  () => {

    /*
      Evita ficar atualizando
      escondido se a aba não
      estiver sendo usada.
    */

    if (
      !document.hidden
    ) {
      loadDashboard();
    }

  },
  10000
);


/*
  Quando voltar para a aba,
  atualiza novamente.
*/

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      !document.hidden
    ) {
      loadDashboard();
    }

  }
);
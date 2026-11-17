const $ = (s) => document.querySelector(s),
  lista = $("#listaProdutos"),
  modal = $("#modalProduto");
let produtos = [];
const esc = (t) => {
    const d = document.createElement("div");
    d.textContent = t ?? "";
    return d.innerHTML;
  },
  money = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }),
  fmt = (d) =>
    d ? new Date(d.replace(" ", "T")).toLocaleDateString("pt-BR") : "-";
function toast(t) {
  const e = $("#toastProduto");
  e.textContent = t;
  e.classList.add("show");
  setTimeout(() => e.classList.remove("show"), 2400);
}
function menu() {
  const b = $("#menuBtn");
  if (b) b.onclick = () => $("#sidebar").classList.toggle("open");
}
async function load() {
  try {
    const r = await fetch("listar_produtos.php");
    const d = await r.json();
    if (!r.ok) throw new Error(d.erro);
    produtos = d;
    render(d);
    stats();
  } catch (e) {
    lista.innerHTML = `<tr><td colspan="7" class="empty">${esc(e.message)}</td></tr>`;
  }
}
function render(a) {
  if (!a.length) {
    lista.innerHTML =
      '<tr><td colspan="7" class="empty">Nenhum produto cadastrado.</td></tr>';
    return;
  }
  lista.innerHTML = a
    .map(
      (p) =>
        `<tr><td>#${p.id}</td><td><b>${esc(p.nome)}</b></td><td>${money(p.preco)}</td><td>${p.estoque}</td><td><span class="badge ${Number(p.estoque) <= 5 ? "low" : "ok"}">${Number(p.estoque) <= 5 ? "Estoque baixo" : "Disponível"}</span></td><td>${fmt(p.criado_em)}</td><td><div class="actions"><button class="edit-btn" data-edit="${p.id}">Editar</button><button class="danger-btn" data-del="${p.id}">Excluir</button></div></td></tr>`,
    )
    .join("");
}
function stats() {
  $("#totalProdutos").textContent = produtos.length;
  $("#totalEstoque").textContent = produtos.reduce(
    (s, p) => s + Number(p.estoque),
    0,
  );
  $("#estoqueBaixo").textContent = produtos.filter(
    (p) => Number(p.estoque) <= 5,
  ).length;
  const ve = $("#valorEstoque");
  if (ve)
    ve.textContent = money(
      produtos.reduce((s, p) => s + Number(p.preco) * Number(p.estoque), 0),
    );
}
function open(p = null) {
  $("#formProduto").reset();
  $("#produtoId").value = p?.id || "";
  $("#nomeProduto").value = p?.nome || "";
  $("#precoProduto").value = p?.preco || "";
  $("#estoqueProduto").value = p?.estoque ?? "";
  $("#tituloModalProduto").textContent = p ? "Editar produto" : "Novo produto";
  $("#btnSalvarProduto").textContent = p ? "Salvar alterações" : "Cadastrar";
  $("#mensagemProduto").textContent = "";
  modal.classList.add("active");
}
function close() {
  modal.classList.remove("active");
}
$("#abrirModalProduto").onclick = () => open();
$("#fecharModalProduto").onclick = close;
$("#cancelarProduto").onclick = close;
modal.onclick = (e) => {
  if (e.target === modal) close();
};
$("#btnAtualizarProdutos").onclick = load;
$("#pesquisaProduto").oninput = (e) => {
  const q = e.target.value.toLowerCase().trim();
  render(produtos.filter((p) => p.nome.toLowerCase().includes(q)));
};
$("#formProduto").onsubmit = async (e) => {
  e.preventDefault();
  const id = $("#produtoId").value,
    d = {
      nome: $("#nomeProduto").value.trim(),
      preco: $("#precoProduto").value,
      estoque: $("#estoqueProduto").value,
    };
  if (id) d.id = id;
  const b = $("#btnSalvarProduto");
  b.disabled = true;
  try {
    const r = await fetch(id ? "editar_produto.php" : "cadastrar_produto.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.erro);
    toast(j.mensagem);
    close();
    load();
  } catch (err) {
    $("#mensagemProduto").textContent = err.message;
  } finally {
    b.disabled = false;
  }
};
lista.onclick = async (e) => {
  const edit = e.target.dataset.edit,
    del = e.target.dataset.del;
  if (edit) {
    open(produtos.find((p) => p.id == edit));
    return;
  }
  if (del && confirm("Excluir este produto?")) {
    try {
      const r = await fetch("excluir_produto.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: del }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro);
      toast(j.mensagem);
      load();
    } catch (err) {
      toast(err.message);
    }
  }
};
menu();
load();

function csvCell(v) {
  return '"' + String(v ?? "").replaceAll('"', '""') + '"';
}
function baixarCSV(nome, cabecalho, linhas) {
  const csv =
    "\uFEFF" +
    [cabecalho, ...linhas].map((l) => l.map(csvCell).join(";")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  a.download = nome;
  a.click();
  URL.revokeObjectURL(a.href);
}
const exportarProdutos = document.querySelector("#exportarProdutos");
if (exportarProdutos)
  exportarProdutos.onclick = () =>
    baixarCSV(
      "produtos.csv",
      ["ID", "Produto", "Preço", "Estoque", "Cadastro"],
      produtos.map((p) => [p.id, p.nome, p.preco, p.estoque, fmt(p.criado_em)]),
    );

const $ = (s) => document.querySelector(s),
  lista = $("#listaClientes"),
  modal = $("#modal");
let clientes = [];
const esc = (t) => {
  const d = document.createElement("div");
  d.textContent = t ?? "";
  return d.innerHTML;
};
const fmt = (d) =>
  d ? new Date(d.replace(" ", "T")).toLocaleDateString("pt-BR") : "-";
function toast(t) {
  const el = $("#toast");
  el.textContent = t;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2400);
}
function menu() {
  const b = $("#menuBtn");
  if (b) b.onclick = () => $("#sidebar").classList.toggle("open");
}
async function load() {
  lista.innerHTML = '<tr><td colspan="6" class="empty">Carregando...</td></tr>';
  try {
    const r = await fetch("listar.php");
    const d = await r.json();
    if (!r.ok) throw new Error(d.erro);
    clientes = d;
    render(d);
    stats();
  } catch (e) {
    lista.innerHTML = `<tr><td colspan="6" class="empty">${esc(e.message)}</td></tr>`;
  }
}
function render(arr) {
  if (!arr.length) {
    lista.innerHTML =
      '<tr><td colspan="6" class="empty">Nenhum cliente encontrado.</td></tr>';
    return;
  }
  lista.innerHTML = arr
    .map(
      (c) =>
        `<tr><td>#${c.id}</td><td><div class="client-cell"><span class="avatar">${esc(c.nome.charAt(0).toUpperCase())}</span><b>${esc(c.nome)}</b></div></td><td>${esc(c.email)}</td><td>${esc(c.telefone || "-")}</td><td>${fmt(c.criado_em)}</td><td><div class="actions"><button class="edit-btn" data-edit="${c.id}">Editar</button><button class="danger-btn" data-del="${c.id}">Excluir</button></div></td></tr>`,
    )
    .join("");
}
function stats() {
  $("#totalClientes").textContent = clientes.length;
  const hoje = new Date().toLocaleDateString("pt-BR");
  $("#clientesHoje").textContent = clientes.filter(
    (c) => fmt(c.criado_em) === hoje,
  ).length;
}
function open(c = null) {
  $("#formCliente").reset();
  $("#clienteId").value = c?.id || "";
  $("#nome").value = c?.nome || "";
  $("#email").value = c?.email || "";
  $("#telefone").value = c?.telefone || "";
  $("#tituloModal").textContent = c ? "Editar cliente" : "Novo cliente";
  $("#btnSalvar").textContent = c ? "Salvar alterações" : "Cadastrar";
  $("#mensagem").textContent = "";
  modal.classList.add("active");
}
function close() {
  modal.classList.remove("active");
}
$("#abrirModal").onclick = () => open();
$("#fecharModal").onclick = close;
$("#cancelarModal").onclick = close;
modal.onclick = (e) => {
  if (e.target === modal) close();
};
$("#btnAtualizar").onclick = load;
$("#pesquisa").oninput = (e) => {
  const q = e.target.value.toLowerCase().trim();
  render(
    clientes.filter((c) =>
      [c.nome, c.email, c.telefone || ""].some((v) =>
        v.toLowerCase().includes(q),
      ),
    ),
  );
};
$("#telefone").oninput = (e) => {
  let v = e.target.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  else if (v.length > 2) v = v.replace(/(\d{2})(\d+)/, "($1) $2");
  e.target.value = v;
};
$("#formCliente").onsubmit = async (e) => {
  e.preventDefault();
  const id = $("#clienteId").value,
    d = {
      nome: $("#nome").value.trim(),
      email: $("#email").value.trim(),
      telefone: $("#telefone").value.trim(),
    };
  if (id) d.id = id;
  const btn = $("#btnSalvar");
  btn.disabled = true;
  try {
    const r = await fetch(id ? "editar.php" : "cadastrar.php", {
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
    $("#mensagem").textContent = err.message;
  } finally {
    btn.disabled = false;
  }
};
lista.onclick = async (e) => {
  const edit = e.target.dataset.edit,
    del = e.target.dataset.del;
  if (edit) {
    open(clientes.find((c) => c.id == edit));
    return;
  }
  if (del && confirm("Excluir este cliente?")) {
    try {
      const r = await fetch("excluir.php", {
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
const exportarClientes = document.querySelector("#exportarClientes");
if (exportarClientes)
  exportarClientes.onclick = () =>
    baixarCSV(
      "clientes.csv",
      ["ID", "Nome", "E-mail", "Telefone", "Cadastro"],
      clientes.map((c) => [
        c.id,
        c.nome,
        c.email,
        c.telefone || "",
        fmt(c.criado_em),
      ]),
    );

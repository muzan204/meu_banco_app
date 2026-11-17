document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = document.getElementById("entrar");
  const error = document.getElementById("erro");
  button.disabled = true; button.textContent = "Verificando..."; error.textContent = "";
  try {
    const response = await fetch("auth_login.php", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario: document.getElementById("usuario").value.trim(),
        senha: document.getElementById("senha").value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.erro || "Não foi possível entrar.");
    location.replace("index.html");
  } catch (e) { error.textContent = e.message; }
  finally { button.disabled = false; button.textContent = "Entrar"; }
});

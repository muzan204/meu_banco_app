(() => {
  const originalFetch = window.fetch.bind(window);
  let csrfToken = "";
  const loginPage = location.pathname.endsWith("login.html");
  const authReady = (async () => {
    if (loginPage) return false;
    try {
      const response = await originalFetch("auth_me.php", { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) { location.replace("login.html"); return false; }
      const data = await response.json();
      csrfToken = data.csrfToken || "";
      if (data.autenticado !== true) { location.replace("login.html"); return false; }
      return true;
    } catch { location.replace("login.html"); return false; }
  })();
  window.fetch = async (input, init = {}) => {
    if (loginPage) return originalFetch(input, init);
    if (!(await authReady)) return new Response(JSON.stringify({ erro: "Faça login para continuar." }), { status: 401, headers: { "Content-Type": "application/json" } });
    const options = { ...init, credentials: "same-origin" };
    const method = String(options.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      const headers = new Headers(options.headers || (input instanceof Request ? input.headers : {}));
      headers.set("X-CSRF-Token", csrfToken);
      options.headers = headers;
    }
    const response = await originalFetch(input, options);
    if (response.status === 401) location.replace("login.html");
    return response;
  };
  authReady.then((ok) => {
    if (!ok) return;
    const topbar = document.querySelector(".topbar-actions, .topbar");
    if (!topbar || document.getElementById("logoutButton")) return;
    const button = document.createElement("button");
    button.id = "logoutButton"; button.type = "button"; button.className = "ghost-btn"; button.textContent = "Sair";
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        const response = await window.fetch("auth_logout.php", { method: "POST" });
        if (!response.ok) throw new Error("Não foi possível encerrar a sessão.");
        location.replace("login.html");
      } catch (error) { button.disabled = false; alert(error.message); }
    });
    topbar.appendChild(button);
  });
})();

const revenue = document.getElementById("revenueItems");
const cogs = document.getElementById("cogsItems");
const expenses = document.getElementById("expenseItems");
const currencyEl = document.getElementById("currency");

function addItem(container, name = "", value = "") {
  const row = document.createElement("div");
  row.className = "item";
  row.innerHTML = `
    <input class="item-name" type="text" placeholder="Description" value="${escapeHtml(name)}">
    <input class="item-value" type="number" min="0" step="0.01" placeholder="Amount" value="${value}">
    <button class="remove" type="button" aria-label="Remove item">×</button>`;
  row.querySelector(".remove").addEventListener("click", () => {
    row.remove();
    calculate();
  });
  container.appendChild(row);
  row.querySelector(".item-value").addEventListener("input", calculate);
  row.querySelector(".item-name").addEventListener("input", calculate);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function readItems(container) {
  return [...container.querySelectorAll(".item")].map(row => ({
    name: row.querySelector(".item-name").value.trim() || "Unspecified",
    value: Math.max(0, Number(row.querySelector(".item-value").value) || 0)
  }));
}

function formatMoney(value) {
  const currency = currencyEl.value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  }).format(value);
}

function calculate() {
  const rev = readItems(revenue);
  const cost = readItems(cogs);
  const exp = readItems(expenses);

  const totalRevenue = rev.reduce((a,b) => a + b.value, 0);
  const totalCogs = cost.reduce((a,b) => a + b.value, 0);
  const totalExpenses = exp.reduce((a,b) => a + b.value, 0);
  const grossProfit = totalRevenue - totalCogs;
  const netProfit = grossProfit - totalExpenses;

  document.getElementById("totalRevenue").textContent = formatMoney(totalRevenue);
  document.getElementById("totalCogs").textContent = formatMoney(totalCogs);
  document.getElementById("grossProfit").textContent = formatMoney(grossProfit);
  document.getElementById("totalExpenses").textContent = formatMoney(totalExpenses);
  document.getElementById("netProfit").textContent = formatMoney(netProfit);

  document.getElementById("grossMargin").textContent =
    totalRevenue ? ((grossProfit / totalRevenue) * 100).toFixed(2) + "%" : "0.00%";
  document.getElementById("netMargin").textContent =
    totalRevenue ? ((netProfit / totalRevenue) * 100).toFixed(2) + "%" : "0.00%";

  const allExpenses = [...cost, ...exp].filter(x => x.value > 0);
  document.getElementById("breakdown").innerHTML = allExpenses.length
    ? allExpenses.map(x => `<div class="breakdown-row"><span>${escapeHtml(x.name)}</span><strong>${formatMoney(x.value)}</strong></div>`).join("")
    : '<div class="breakdown-row"><span>No expenses entered</span><strong>—</strong></div>';

  const business = document.getElementById("businessName").value.trim() || "Your Business";
  document.getElementById("reportBusiness").textContent = business;
  document.getElementById("reportPeriod").textContent =
    document.getElementById("period").value.trim() || "Accounting Period";
}

document.getElementById("addRevenue").addEventListener("click", () => addItem(revenue));
document.getElementById("addCogs").addEventListener("click", () => addItem(cogs));
document.getElementById("addExpense").addEventListener("click", () => addItem(expenses));
document.getElementById("calculate").addEventListener("click", calculate);
document.getElementById("businessName").addEventListener("input", calculate);
document.getElementById("period").addEventListener("input", calculate);
currencyEl.addEventListener("change", calculate);
document.getElementById("print").addEventListener("click", () => window.print());

document.getElementById("copy").addEventListener("click", async () => {
  const text = [
    "PROFIT & LOSS STATEMENT",
    document.getElementById("reportBusiness").textContent,
    document.getElementById("reportPeriod").textContent,
    "",
    "Total Revenue: " + document.getElementById("totalRevenue").textContent,
    "Cost of Goods Sold: " + document.getElementById("totalCogs").textContent,
    "Gross Profit: " + document.getElementById("grossProfit").textContent,
    "Operating Expenses: " + document.getElementById("totalExpenses").textContent,
    "Net Profit: " + document.getElementById("netProfit").textContent
  ].join("\n");
  try {
    await navigator.clipboard.writeText(text);
    document.getElementById("copy").textContent = "Copied!";
    setTimeout(() => document.getElementById("copy").textContent = "Copy", 1400);
  } catch {
    alert("Copy was not available in this browser.");
  }
});

document.getElementById("reset").addEventListener("click", () => {
  revenue.innerHTML = "";
  cogs.innerHTML = "";
  expenses.innerHTML = "";
  document.getElementById("businessName").value = "";
  document.getElementById("period").value = "FY 2026-27";
  currencyEl.value = "INR";
  addItem(revenue, "Sales Revenue", 0);
  addItem(cogs, "Cost of Goods Sold", 0);
  addItem(expenses, "Rent", 0);
  addItem(expenses, "Salaries", 0);
  addItem(expenses, "Utilities", 0);
  calculate();
});

addItem(revenue, "Sales Revenue", 0);
addItem(cogs, "Cost of Goods Sold", 0);
addItem(expenses, "Rent", 0);
addItem(expenses, "Salaries", 0);
addItem(expenses, "Utilities", 0);
calculate();

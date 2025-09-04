// script.js

let accounts = [];
let transactions = [];

// =======================
// Account Management
// =======================
function addAccount() {
  const name = document.getElementById("account-name").value.trim();
  const type = document.getElementById("account-type").value;
  if (!name) return alert("Enter account name");

  accounts.push({ name, type });
  document.getElementById("account-name").value = "";
  renderAccounts();
  renderAccountOptions();
}

function removeAccount(index) {
  accounts.splice(index, 1);
  renderAccounts();
  renderAccountOptions();
}

function renderAccounts() {
  const list = document.getElementById("account-list");
  list.innerHTML = "";
  accounts.forEach((acc, i) => {
    list.innerHTML += `
      <div>${acc.name} (${acc.type})
        <button onclick="removeAccount(${i})">❌</button>
      </div>`;
  });
}

function renderAccountOptions() {
  const from = document.getElementById("from-account");
  const to = document.getElementById("to-account");
  from.innerHTML = "";
  to.innerHTML = "";
  accounts.forEach(acc => {
    from.innerHTML += `<option value="${acc.name}">${acc.name}</option>`;
    to.innerHTML += `<option value="${acc.name}">${acc.name}</option>`;
  });
}

// =======================
// Transactions
// =======================
function recordTransaction() {
  const date = document.getElementById("transaction-date").value;
  const desc = document.getElementById("transaction-desc").value || "";
  const from = document.getElementById("from-account").value;
  const to = document.getElementById("to-account").value;
  const amount = parseFloat(document.getElementById("amount").value);
  if (!date || !from || !to || isNaN(amount)) return alert("Enter all fields");

  transactions.push({ date, desc, from, to, amount });
  renderLedgers();
  renderTrialBalance();
  renderStatements();
}

// =======================
// Ledgers
// =======================
function renderLedgers() {
  const ledgers = document.getElementById("ledgers");
  ledgers.innerHTML = "";

  accounts.forEach(acc => {
    let rows = transactions
      .filter(t => t.from === acc.name || t.to === acc.name)
      .map(t => `
        <tr>
          <td>${t.date}</td>
          <td>${t.desc}</td>
          <td>${t.from === acc.name ? t.amount.toFixed(2) + " (" + t.to + ")" : ""}</td>
          <td>${t.to === acc.name ? t.amount.toFixed(2) + " (" + t.from + ")" : ""}</td>
        </tr>
      `).join("");

    if (!rows) rows = `<tr><td colspan="4">No transactions</td></tr>`;

    ledgers.innerHTML += `
      <div class="ledger">
        <h3>${acc.name}</h3>
        <table>
          <thead>
            <tr><th>Date</th><th>Description</th><th>Credit</th><th>Debit</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  });
}

// =======================
// Trial Balance
// =======================
function renderTrialBalance() {
  const tbody = document.querySelector("#trial-balance tbody");
  tbody.innerHTML = "";
  let totalDebit = 0, totalCredit = 0;

  accounts.forEach(acc => {
    let debit = 0, credit = 0;
    transactions.forEach(t => {
      if (t.from === acc.name) credit += t.amount;
      if (t.to === acc.name) debit += t.amount;
    });
    totalDebit += debit;
    totalCredit += credit;

    tbody.innerHTML += `
      <tr>
        <td>${acc.name}</td>
        <td>${debit.toFixed(2)}</td>
        <td>${credit.toFixed(2)}</td>
      </tr>`;
  });

  // Totals row
  tbody.innerHTML += `
    <tr>
      <td><strong>Totals</strong></td>
      <td><strong>${totalDebit.toFixed(2)}</strong></td>
      <td><strong>${totalCredit.toFixed(2)}</strong></td>
    </tr>`;
}


// =======================
// Financial Statements
// =======================
function renderStatements() {
  let income = 0, expenses = 0, assets = 0, liabilities = 0, equity = 0;
  let profit = 0;
  let accountBalances = {};

  accounts.forEach(acc => {
    let balance = 0;

    transactions.forEach(t => {
      if (acc.type === "asset" || acc.type === "expense") {
        if (t.to === acc.name) balance += t.amount;
        if (t.from === acc.name) balance -= t.amount;
      } else if (acc.type === "liability" || acc.type === "equity" || acc.type === "income") {
        if (t.to === acc.name) balance -= t.amount;
        if (t.from === acc.name) balance += t.amount;
      }
    });

    accountBalances[acc.name] = balance;

    if (acc.type === "income") income += balance;
    if (acc.type === "expense") expenses += balance;
    if (acc.type === "asset") assets += balance;
    if (acc.type === "liability") liabilities += balance;
    if (acc.type === "equity") equity += balance;
  });

  profit = income - expenses;

  // Income Statement
  document.getElementById("income-statement").innerText =
    `Total Income: ${income.toFixed(2)}\n` +
    `Total Expenses: ${expenses.toFixed(2)}\n` +
    `Net Profit: ${profit.toFixed(2)}`;

  // Balance Sheet in boxes
  let bsHTML = "";

  // Assets
  bsHTML += `<div class="bs-box"><h3>Assets</h3>`;
  accounts.filter(a => a.type === "asset").forEach(acc => {
    bsHTML += `<p>${acc.name}: ${accountBalances[acc.name].toFixed(2)}</p>`;
  });
  bsHTML += `<p><strong>Total Assets = ${assets.toFixed(2)}</strong></p></div>`;

  // Liabilities
  bsHTML += `<div class="bs-box"><h3>Liabilities</h3>`;
  accounts.filter(a => a.type === "liability").forEach(acc => {
    bsHTML += `<p>${acc.name}: ${accountBalances[acc.name].toFixed(2)}</p>`;
  });
  bsHTML += `<p><strong>Total Liabilities = ${liabilities.toFixed(2)}</strong></p></div>`;

  // Equity
  bsHTML += `<div class="bs-box"><h3>Equity</h3>`;
  bsHTML += `<p>Capital contributed: ${(equity + (equity < 0 ? -equity : 0)).toFixed(2)}</p>`;
  bsHTML += `<p>Profit: ${profit.toFixed(2)}</p>`;
  bsHTML += `<p><strong>Total Equity = ${(equity + profit).toFixed(2)}</strong></p></div>`;

  // Render
  document.getElementById("balance-sheet").innerHTML = bsHTML;
}

// =======================
// Reset App
// =======================
function resetApp() {
  accounts = [];
  transactions = [];
  renderAccounts();
  renderAccountOptions();
  renderLedgers();
  renderTrialBalance();
  renderStatements();
}

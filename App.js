// simple local "database"
const STORAGE_KEY = "holdings_v1";
const tbody = document.getElementById("tbody");
const investedEl = document.getElementById("invested");
const currentEl  = document.getElementById("current");
const plEl       = document.getElementById("pl");
const statusEl   = document.getElementById("status");

let holdings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
if (holdings.length === 0) {
  // starter rows — change to your actual micro-caps (symbols end with .NS)
  holdings = [
    { symbol: "SDBL.NS", buyPrice: 0, quantity: 0, price: 0, change: 0 },
    { symbol: "PITTIENG.NS", buyPrice: 0, quantity: 0, price: 0, change: 0 }
  ];
}
save();

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings)); }

function render() {
  tbody.innerHTML = "";
  let totalCost = 0, totalNow = 0;

  holdings.forEach((h, i) => {
    const invested = (h.buyPrice||0) * (h.quantity||0);
    const current  = (h.price||0)    * (h.quantity||0);
    const gain = current - invested;
    const gainPct = invested ? ((h.price - h.buyPrice)/h.buyPrice)*100 : 0;

    totalCost += invested; totalNow += current;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input value="${h.symbol}" /></td>
      <td><input type="number" step="0.01" value="${h.buyPrice||0}" /></td>
      <td><input type="number" step="1" value="${h.quantity||0}" /></td>
      <td>₹${(h.price||0).toFixed(2)}</td>
      <td class="${(h.change||0)>=0?"positive":"negative"}">${(h.change||0).toFixed(2)}%</td>
      <td class="${gain>=0?"positive":"negative"}">₹${gain.toFixed(2)}</td>
      <td class="${gainPct>=0?"positive":"negative"}">${gainPct.toFixed(2)}%</td>
      <td><button class="small">Remove</button></td>
    `;

    // inputs
    const [symIn,buyIn,qtyIn] = tr.querySelectorAll("input");
    symIn.addEventListener("input", e => { holdings[i].symbol = e.target.value.toUpperCase(); save(); });
    buyIn.addEventListener("input", e => { holdings[i].buyPrice = parseFloat(e.target.value)||0; save(); render(); });
    qtyIn.addEventListener("input", e => { holdings[i].quantity = parseInt(e.target.value)||0; save(); render(); });
    tr.querySelector("button").addEventListener("click", () => { holdings.splice(i,1); save(); render(); });

    tbody.appendChild(tr);
  });

  investedEl.textContent = `Invested: ₹${totalCost.toFixed(2)}`;
  currentEl.textContent  = `Current: ₹${totalNow.toFixed(2)}`;
  const pnl = totalNow - totalCost;
  const pnlPct = totalCost ? (pnl/totalCost)*100 : 0;
  plEl.textContent = `P/L: ₹${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%)`;
  plEl.className = pnl>0?"positive":(pnl<0?"negative":"neutral");
}

async function fetchLive() {
  if (!holdings.length) return;
  try {
    statusEl.textContent = "Updating…";
    const symbols = holdings.map(h => h.symbol).join(",");
    const res = await fetch(`/api/quote?symbols=${encodeURIComponent(symbols)}`);
    const data = await res.json();
    holdings = holdings.map(h => {
      const d = data[h.symbol] || {};
      const price = parseFloat(d.price || d.close || 0);
      const change = parseFloat(d.percent_change || 0);
      return {...h, price, change};
    });
    save();
    render();
    statusEl.textContent = "Updated. Auto-refresh every 60s";
  } catch (e) {
    console.error(e);
    statusEl.textContent = "Update failed. Check connection.";
  }
}

document.getElementById("addRow").addEventListener("click", () => {
  holdings.push({ symbol: "NEW.NS", buyPrice: 0, quantity: 0, price: 0, change: 0 });
  save(); render();
});
document.getElementById("refresh").addEventListener("click", fetchLive);

render();
fetchLive();
setInterval(fetchLive, 60000);

// Your stock portfolio data
let portfolio = [
    { name: "Stock 1", symbol: "ABC", quantity: 10, buyPrice: 100, price: 0 },
    { name: "Stock 2", symbol: "XYZ", quantity: 20, buyPrice: 150, price: 0 }
];

// Fetch latest prices from NSE via proxy
async function fetchPrices() {
    const proxyUrl = "https://api.allorigins.win/get?url=";

    for (let i = 0; i < portfolio.length; i++) {
        try {
            const targetUrl = `https://www.nseindia.com/api/quote-equity?symbol=${portfolio[i].symbol}`;
            const encodedUrl = proxyUrl + encodeURIComponent(targetUrl);

            const response = await fetch(encodedUrl);
            const data = await response.json();
            const jsonData = JSON.parse(data.contents);

            const price = jsonData.priceInfo.lastPrice;
            portfolio[i].price = price;

        } catch (error) {
            console.error(`Error fetching ${portfolio[i].symbol}:`, error);
        }
    }

    updateTable();
}

// Update HTML table with portfolio data
function updateTable() {
    const tableBody = document.getElementById("portfolio-table-body");
    tableBody.innerHTML = "";

    portfolio.forEach(stock => {
        const currentValue = stock.price * stock.quantity;
        const investedValue = stock.buyPrice * stock.quantity;
        const profitLoss = currentValue - investedValue;
        const profitLossPercent = ((profitLoss / investedValue) * 100).toFixed(2);

        const row = `
            <tr>
                <td>${stock.name}</td>
                <td>${stock.symbol}</td>
                <td>${stock.quantity}</td>
                <td>₹${stock.buyPrice}</td>
                <td>₹${stock.price || "-"}</td>
                <td>₹${currentValue.toFixed(2)}</td>
                <td>₹${profitLoss.toFixed(2)}</td>
                <td>${profitLossPercent}%</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Auto-refresh prices every 1 minute
setInterval(fetchPrices, 60000);

// Initial load
fetchPrices();

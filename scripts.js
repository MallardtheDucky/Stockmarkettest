// Fetch stock data from Google Apps Script Web App
const WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL'; // Replace with your deployed Web App URL

async function fetchStocks() {
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getStocks`);
        const data = await response.json();
        if (data.error) {
            console.error('Error fetching stocks:', data.error);
            return;
        }
        displayStocks(data);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Display stocks in the table
function displayStocks(stocks) {
    const tableBody = document.getElementById('stockTableBody');
    tableBody.innerHTML = '';
    stocks.forEach(stock => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${stock['Company Name']}</td>
            <td class="px-6 py-4 whitespace-nowrap">${stock.Ticker}</td>
            <td class="px-6 py-4 whitespace-nowrap">${stock.Sector}</td>
            <td class="px-6 py-4 whitespace-nowrap">$${parseFloat(stock['New Price']).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${stock['Shares Available']}</td>
            <td class="px-6 py-4 whitespace-nowrap">${stock['Market Cap']}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Handle buy/sell form submission
document.getElementById('transactionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('user').value;
    const ticker = document.getElementById('ticker').value.toUpperCase();
    const action = document.getElementById('action').value;
    const shares = parseInt(document.getElementById('shares').value);

    try {
        const response = await fetch(`${WEB_APP_URL}?action=submitTransaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, ticker, action, shares })
        });
        const result = await response.json();
        if (result.success) {
            alert(`Transaction successful: ${action} ${shares} shares of ${ticker}`);
            fetchStocks(); // Refresh stock data
        } else {
            alert(`Transaction failed: ${result.error}`);
        }
    } catch (error) {
        console.error('Transaction error:', error);
        alert('Error processing transaction');
    }
});

// Initial fetch
fetchStocks();
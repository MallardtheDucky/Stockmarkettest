const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1p2MEdU5mZiRRe-axBYB9_retcLu8f6vzbSX-pvq5TJ9n-NY6CTrWFiz57KCLmn2x/exec'; // Replace with your Apps Script web app URL

async function loadStocks() {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getStocks' }),
    });
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message);

    const stocks = result.data;
    const stockBody = document.getElementById('stockBody');
    const tickerSelect = document.getElementById('ticker');
    stockBody.innerHTML = '';
    tickerSelect.innerHTML = '<option value="">Select Ticker</option>';

    stocks.forEach(stock => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="py-3 px-6">${stock['Company Name']}</td>
        <td class="py-3 px-6">${stock['Ticker']}</td>
        <td class="py-3 px-6">${stock['Sector']}</td>
        <td class="py-3 px-6">$${Number(stock['Current Price']).toFixed(2)}</td>
        <td class="py-3 px-6">${stock['Shares Available']}</td>
        <td class="py-3 px-6">$${(stock['Market Cap'] / 1e6).toFixed(2)}M</td>
      `;
      stockBody.appendChild(row);

      const option = document.createElement('option');
      option.value = stock['Ticker'];
      option.text = `${stock['Ticker']} - ${stock['Company Name']}`;
      tickerSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading stocks:', error);
    alert('Failed to load stocks: ' + error.message);
  }
}

async function loadPortfolio() {
  const username = document.getElementById('username').value || 'user1';
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getPortfolio', user: username }),
    });
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message);

    const portfolio = result.data;
    const portfolioBody = document.getElementById('portfolioBody');
    portfolioBody.innerHTML = '';
    portfolio.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="py-3 px-6">${entry['Ticker']}</td>
        <td class="py-3 px-6">${entry['Shares Owned']}</td>
        <td class="py-3 px-6">$${Number(entry['Average Purchase Price']).toFixed(2)}</td>
      `;
      portfolioBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading portfolio:', error);
    alert('Failed to load portfolio: ' + error.message);
  }
}

async function submitTrade() {
  const username = document.getElementById('username').value;
  const ticker = document.getElementById('ticker').value;
  const action = document.getElementById('action').value;
  const quantity = parseInt(document.getElementById('quantity').value);

  if (!username || !ticker || !quantity || quantity <= 0) {
    alert('Please fill all fields with valid values');
    return;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'processTransaction',
        user: username,
        ticker: ticker,
        action: action,
        quantity: quantity,
      }),
    });
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message);

    alert(`Trade successful! ${action} ${quantity} shares of ${ticker} at $${result.price.toFixed(2)}`);
    loadStocks();
    loadPortfolio();
  } catch (error) {
    console.error('Error processing trade:', error);
    alert('Error: ' + error.message);
  }
}

window.onload = () => {
  loadStocks();
  document.getElementById('username').addEventListener('change', loadPortfolio);
};

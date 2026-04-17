const API = 'http://localhost:3000/api';

// ─── Verificar sesión ────────────────────────────────────────────────────
const token = sessionStorage.getItem('token');
const user = JSON.parse(sessionStorage.getItem('user') || 'null');

if (!token || !user) {
  window.location.href = 'login.html';
}

document.getElementById('navUserName').textContent = user?.name || 'Usuario';

// ─── Logout ───────────────────────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch(`${API}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  }).catch(() => {});
  sessionStorage.clear();
  window.location.href = 'login.html';
});

// ─── API 1: REST Countries ───────────────────────────────────────────────

const COUNTRIES_API = 'https://restcountries.com/v3.1';
let allCountries = [];
let currentRegion = 'all';

async function loadCountries(region = 'all') {
  const grid = document.getElementById('countriesGrid');
  grid.innerHTML = '<div class="loading-state">Cargando países...</div>';

  try {
    const url = region === 'all'
      ? `${COUNTRIES_API}/all?fields=name,flags,capital,population,region,area,cca3,languages,currencies,latlng`
      : `${COUNTRIES_API}/region/${region}?fields=name,flags,capital,population,region,area,cca3,languages,currencies,latlng`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar países');
    const data = await res.json();

    allCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
    if (region === 'all') updateGlobalStats(allCountries);
    renderCountriesGrid(allCountries);

  } catch (err) {
    grid.innerHTML = `<div class="loading-state">Error: ${err.message}</div>`;
  }
}

function renderCountriesGrid(countries) {
  const grid = document.getElementById('countriesGrid');
  if (!countries.length) {
    grid.innerHTML = '<div class="loading-state">No se encontraron países.</div>';
    return;
  }

  grid.innerHTML = countries.slice(0, 48).map(c => `
    <div class="country-card" onclick="openCountryModal(${JSON.stringify(c).replace(/"/g, '&quot;')})">
      <img src="${c.flags?.png || c.flags?.svg || ''}" alt="Bandera de ${c.name.common}" loading="lazy" />
      <div class="country-card-body">
        <h4>${c.name.common}</h4>
        <p>${c.capital?.[0] || 'Sin capital'} · ${c.region}</p>
      </div>
    </div>
  `).join('');
}

function updateGlobalStats(countries) {
  const totalPop = countries.reduce((sum, c) => sum + (c.population || 0), 0);
  const languages = new Set(countries.flatMap(c => c.languages ? Object.values(c.languages) : []));
  const currencies = new Set(countries.flatMap(c => c.currencies ? Object.keys(c.currencies) : []));

  document.getElementById('statCountries').textContent = countries.length.toLocaleString('es');
  document.getElementById('statPopulation').textContent = (totalPop / 1e9).toFixed(2) + 'B';
  document.getElementById('statLanguages').textContent = languages.size.toLocaleString('es');
  document.getElementById('statCurrencies').textContent = currencies.size.toLocaleString('es');
}

// Búsqueda de país individual
document.getElementById('searchBtn').addEventListener('click', searchCountry);
document.getElementById('countrySearch').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchCountry();
});

async function searchCountry() {
  const query = document.getElementById('countrySearch').value.trim();
  if (!query) return;

  const resultEl = document.getElementById('countryResult');
  resultEl.classList.remove('hidden');
  resultEl.innerHTML = '<div class="loading-state">Buscando...</div>';

  try {
    const res = await fetch(`${COUNTRIES_API}/name/${encodeURIComponent(query)}?fields=name,flags,capital,population,region,area,languages,currencies,latlng,cca3`);
    if (!res.ok) throw new Error('País no encontrado');
    const data = await res.json();
    const c = data[0];

    const pop = c.population?.toLocaleString('es') || 'N/D';
    const area = c.area?.toLocaleString('es') || 'N/D';
    const langs = c.languages ? Object.values(c.languages).join(', ') : 'N/D';
    const curr = c.currencies ? Object.values(c.currencies).map(x => `${x.name} (${x.symbol || ''})`).join(', ') : 'N/D';

    resultEl.innerHTML = `
      <img src="${c.flags?.png || ''}" alt="Bandera" />
      <div class="country-result-info">
        <h3>${c.name.common} ${c.name.official !== c.name.common ? `<small style="color:var(--text2);font-weight:400;font-size:.8em">(${c.name.official})</small>` : ''}</h3>
        <p>
          <strong>Capital:</strong> ${c.capital?.[0] || 'N/D'} &nbsp;|&nbsp;
          <strong>Región:</strong> ${c.region} &nbsp;|&nbsp;
          <strong>Población:</strong> ${pop}<br>
          <strong>Área:</strong> ${area} km² &nbsp;|&nbsp;
          <strong>Idiomas:</strong> ${langs}<br>
          <strong>Moneda:</strong> ${curr}
        </p>
      </div>
    `;
  } catch {
    resultEl.innerHTML = '<div class="loading-state">País no encontrado. Intenta en inglés (ej: Mexico, France)</div>';
  }
}

// Chips de región
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentRegion = chip.dataset.region;
    loadCountries(currentRegion);
  });
});

// Modal de país
function openCountryModal(country) {
  const pop = country.population?.toLocaleString('es') || 'N/D';
  const area = country.area?.toLocaleString('es') || 'N/D';
  const langs = country.languages ? Object.values(country.languages).join(', ') : 'N/D';
  const curr = country.currencies ? Object.values(country.currencies).map(x => `${x.name} (${x.symbol || ''})`).join(', ') : 'N/D';

  document.getElementById('modalContent').innerHTML = `
    <img class="modal-flag" src="${country.flags?.png || ''}" alt="Bandera de ${country.name.common}" />
    <h2>${country.name.common}</h2>
    <p class="modal-subtitle">${country.name.official}</p>
    <div class="modal-grid">
      <div class="modal-item"><label>Capital</label><span>${country.capital?.[0] || 'N/D'}</span></div>
      <div class="modal-item"><label>Región</label><span>${country.region}</span></div>
      <div class="modal-item"><label>Población</label><span>${pop}</span></div>
      <div class="modal-item"><label>Área</label><span>${area} km²</span></div>
      <div class="modal-item"><label>Idiomas</label><span>${langs}</span></div>
      <div class="modal-item"><label>Moneda</label><span>${curr}</span></div>
      <div class="modal-item"><label>Código</label><span>${country.cca3}</span></div>
      <div class="modal-item"><label>Coordenadas</label><span>${country.latlng ? country.latlng.map(n => n.toFixed(2)).join(', ') : 'N/D'}</span></div>
    </div>
  `;

  document.getElementById('countryModal').classList.remove('hidden');
}

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('countryModal').classList.add('hidden');
});
document.getElementById('countryModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
});

// ─── API 2: Open-Meteo (clima por coordenadas) ───────────────────────────

const CAPITALS = [
  { city: 'Ciudad de México', country: 'México', lat: 19.43, lon: -99.13 },
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.61, lon: -58.38 },
  { city: 'Madrid', country: 'España', lat: 40.42, lon: -3.70 },
  { city: 'Tokio', country: 'Japón', lat: 35.69, lon: 139.69 },
  { city: 'París', country: 'Francia', lat: 48.85, lon: 2.35 },
  { city: 'Washington D.C.', country: 'EE.UU.', lat: 38.91, lon: -77.04 },
  { city: 'Londres', country: 'Reino Unido', lat: 51.51, lon: -0.13 },
  { city: 'Brasilia', country: 'Brasil', lat: -15.78, lon: -47.93 },
];

function weatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code <= 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

function weatherDesc(code) {
  if (code === 0) return 'Despejado';
  if (code <= 2) return 'Parcialmente nublado';
  if (code <= 3) return 'Nublado';
  if (code <= 48) return 'Neblina';
  if (code <= 67) return 'Lluvia';
  if (code <= 77) return 'Nieve';
  if (code <= 82) return 'Chubascos';
  if (code <= 99) return 'Tormenta';
  return 'Desconocido';
}

async function loadWeather() {
  const grid = document.getElementById('weatherCards');
  grid.innerHTML = '<div class="loading-state">Cargando datos del clima...</div>';

  try {
    const requests = CAPITALS.map(cap =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cap.lat}&longitude=${cap.lon}&current=temperature_2m,weathercode&timezone=auto`)
        .then(r => r.json())
        .then(data => ({ ...cap, temp: data.current?.temperature_2m, code: data.current?.weathercode }))
        .catch(() => ({ ...cap, temp: null, code: null }))
    );

    const results = await Promise.all(requests);

    grid.innerHTML = results.map(r => `
      <div class="weather-card">
        <span class="weather-icon">${weatherIcon(r.code)}</span>
        <div class="weather-city">${r.city}</div>
        <div class="weather-country">${r.country}</div>
        <div class="weather-temp">${r.temp !== null ? r.temp + '°C' : 'N/D'}</div>
        <div class="weather-desc">${r.code !== null ? weatherDesc(r.code) : ''}</div>
      </div>
    `).join('');

  } catch (err) {
    grid.innerHTML = `<div class="loading-state">Error al cargar clima: ${err.message}</div>`;
  }
}

// ─── API 3: CoinGecko (crypto precios) ───────────────────────────────────

async function loadCrypto() {
  const grid = document.getElementById('cryptoCards');
  grid.innerHTML = '<div class="loading-state">Cargando precios...</div>';

  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=8&page=1&price_change_percentage=24h'
    );
    if (!res.ok) throw new Error('Error al cargar crypto');
    const coins = await res.json();

    grid.innerHTML = coins.map(coin => {
      const change = coin.price_change_percentage_24h ?? 0;
      const changeStr = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
      const changeClass = change >= 0 ? 'up' : 'down';
      const price = coin.current_price?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'N/D';

      return `
        <div class="crypto-card">
          <div class="crypto-header">
            <img src="${coin.image}" alt="${coin.name}" />
            <div>
              <div class="crypto-name">${coin.name}</div>
              <div class="crypto-symbol">${coin.symbol}</div>
            </div>
          </div>
          <div class="crypto-price">${price}</div>
          <div class="crypto-change ${changeClass}">${changeStr} (24h)</div>
        </div>
      `;
    }).join('');

  } catch (err) {
    grid.innerHTML = `<div class="loading-state">Error al cargar precios: ${err.message}</div>`;
  }
}

// ─── Inicializar todo ────────────────────────────────────────────────────
loadCountries();
loadWeather();
loadCrypto();

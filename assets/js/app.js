const DATA_SOURCE = {
  label: "Локално копие",
  isLive: false,
  error: "",
};

function winRate(player) {
  return player.played === 0 ? 0 : (player.wins / player.played) * 100;
}

function sortedPlayers() {
  return [...leagueData.players].sort((a, b) => {
    return (
      winRate(b) - winRate(a) ||
      b.played - a.played ||
      b.wins - a.wins ||
      b.mvp - a.mvp ||
      b.participation - a.participation ||
      a.name.localeCompare(b.name, "bg")
    );
  });
}

function initials(name) {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function percent(value) {
  return `${value.toFixed(2)}%`;
}

function parseNumber(value) {
  if (typeof value === "number") return value;
  if (value == null) return 0;

  const normalized = String(value)
    .replace("%", "")
    .replace(",", ".")
    .trim();

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeHeader(header) {
  return String(header || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getCellValue(cell) {
  if (!cell) return "";
  return cell.f ?? cell.v ?? "";
}

function mapSheetPlayer(row, headers) {
  const values = Object.fromEntries(
    headers.map((header, index) => [normalizeHeader(header), getCellValue(row.c[index])]),
  );

  const name = values["футболист"] || values["player"] || values["name"];
  if (!name) return null;

  return {
    name: String(name).trim(),
    played: parseNumber(values["изиграни мачове"] || values["played"] || values["matches"]),
    wins: parseNumber(values["победи"] || values["wins"]),
    losses: parseNumber(values["загуби"] || values["losses"]),
    mvp: parseNumber(values["mvp"]),
    participation: parseNumber(values["participation"] || values["участие"]),
  };
}

function loadGoogleSheetPlayers() {
  if (!leagueData.sheet?.id) return Promise.resolve([]);

  return new Promise((resolve, reject) => {
    const callbackName = `xiorSheetCallback_${Date.now()}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Google Sheet request timed out"));
    }, 8000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (response) => {
      cleanup();

      if (response.status === "error") {
        reject(new Error(response.errors?.[0]?.detailed_message || "Google Sheet returned an error"));
        return;
      }

      const table = response.table;
      const headers = table.cols.map((col) => col.label || col.id);
      const players = table.rows.map((row) => mapSheetPlayer(row, headers)).filter(Boolean);
      resolve(players);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Google Sheet script could not be loaded"));
    };

    const query = encodeURIComponent("select *");
    script.src = `https://docs.google.com/spreadsheets/d/${leagueData.sheet.id}/gviz/tq?tqx=responseHandler:${callbackName}&tq=${query}`;
    document.head.append(script);
  });
}

async function hydrateLeagueData() {
  try {
    const players = await loadGoogleSheetPlayers();

    if (players.length > 0) {
      leagueData.players = players;
      leagueData.matchday = Math.max(...players.map((player) => player.played));
      DATA_SOURCE.label = "Google Sheets";
      DATA_SOURCE.isLive = true;
    }
  } catch (error) {
    DATA_SOURCE.error = error.message;
  }
}

function renderDataSourceStatus() {
  const targets = document.querySelectorAll("[data-source-status]");
  if (!targets.length) return;

  targets.forEach((target) => {
    target.innerHTML = `
      <span class="tag ${DATA_SOURCE.isLive ? "live" : ""}">
        ${DATA_SOURCE.isLive ? "Live" : "Fallback"} · ${DATA_SOURCE.label}
      </span>
      ${
        leagueData.sheet?.url
          ? `<a class="text-link" href="${leagueData.sheet.url}" target="_blank" rel="noreferrer">Google Sheet <i data-lucide="external-link"></i></a>`
          : ""
      }
    `;
  });
}

function getNextSaturdayKickoff() {
  const now = new Date();
  const kickoff = new Date(now);
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7;

  kickoff.setDate(now.getDate() + daysUntilSaturday);
  kickoff.setHours(leagueData.nextMatch.hour, leagueData.nextMatch.minute, 0, 0);

  if (kickoff <= now) {
    kickoff.setDate(kickoff.getDate() + 7);
  }

  return kickoff;
}

function renderCountdown() {
  const countdown = document.querySelector("#countdown");
  const title = document.querySelector("#next-match-title");
  const date = document.querySelector("#next-match-date");

  if (!countdown || !title || !date) return;

  const kickoff = getNextSaturdayKickoff();
  const diff = Math.max(0, kickoff - new Date());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  title.textContent = leagueData.nextMatch.title;
  date.textContent =
    `${kickoff.toLocaleDateString("bg-BG", { weekday: "long", day: "2-digit", month: "long" })} в ${kickoff.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" })} · ${leagueData.nextMatch.venue}`;

  countdown.innerHTML = [
    ["Дни", days],
    ["Часа", hours],
    ["Мин", minutes],
    ["Сек", seconds],
  ]
    .map(([label, value]) => `<span>${String(value).padStart(2, "0")}<small>${label}</small></span>`)
    .join("");
}

function renderHome() {
  const stats = document.querySelector("#home-stats");
  const leaders = document.querySelector("#home-leaders");
  if (!stats || !leaders) return;

  const players = sortedPlayers();
  const topPlayer = players[0];
  const totalMatches = Math.max(...leagueData.players.map((player) => player.played));

  stats.innerHTML = [
    ["Играчи", leagueData.players.length],
    ["Кръг", leagueData.matchday],
    ["Лидер", topPlayer.name],
    ["Макс. мачове", totalMatches],
  ]
    .map(([label, value]) => `<article><span>${value}</span><small>${label}</small></article>`)
    .join("");

  leaders.innerHTML = players
    .slice(0, 5)
    .map(
      (player, index) => `
        <li>
          <span class="leader-rank">${index + 1}</span>
          <span class="leader-name">${player.name}</span>
          <strong>${percent(winRate(player))}</strong>
        </li>
      `,
    )
    .join("");
}

function renderStandings() {
  const table = document.querySelector("#standings-table");
  const criteria = document.querySelector("#ranking-criteria");
  if (!table || !criteria) return;

  table.innerHTML = sortedPlayers()
    .map(
      (player, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <span class="player-cell">
              <span class="avatar">${initials(player.name)}</span>
              ${player.name}
            </span>
          </td>
          <td>${player.played}</td>
          <td>${player.wins}</td>
          <td>${player.losses}</td>
          <td><strong>${percent(winRate(player))}</strong></td>
          <td>${player.mvp}</td>
          <td>${percent(player.participation)}</td>
        </tr>
      `,
    )
    .join("");

  criteria.innerHTML = leagueData.rankingCriteria
    .map((item, index) => `<li><span>${index + 1}</span>${item}</li>`)
    .join("");
}

function renderTeamSplit() {
  const target = document.querySelector("#team-split");
  if (!target) return;

  target.innerHTML = leagueData.teamSplit
    .map(
      (team) => `
        <article class="team-box">
          <h3>
            <span>${team.name}</span>
            <small>${team.players.length} играчи</small>
          </h3>
          <ul>
            ${team.players.map((player) => `<li>${player}</li>`).join("")}
          </ul>
        </article>
      `,
    )
    .join("");
}

function renderPosts() {
  const target = document.querySelector("#post-list");
  if (!target) return;

  target.innerHTML = leagueData.posts
    .map(
      (post) => `
        <a class="post-card" href="${post.link}" target="_blank" rel="noreferrer">
          <span class="post-thumb"><i data-lucide="${post.icon}"></i></span>
          <span>
            <span class="label">${post.type}</span>
            <h3>${post.title}</h3>
            <p>${post.copy}</p>
          </span>
        </a>
      `,
    )
    .join("");
}

function renderPlayers() {
  const target = document.querySelector("#player-list");
  if (!target) return;

  target.innerHTML = sortedPlayers()
    .map(
      (player, index) => `
        <article class="player-card" data-player-card data-player-index="${index}" role="button" tabindex="0" aria-expanded="false">
          <div class="player-card-summary">
            ${playerImageMarkup(player)}
            <span>
              <h3>${player.name}</h3>
              <p class="player-note">${player.wins} победи от ${player.played} мача · ${player.mvp} MVP · ${percent(player.participation)} участие</p>
              <span class="player-meta">
                <span class="tag">${percent(winRate(player))} Win Rate</span>
                <span class="tag">${player.losses} загуби</span>
              </span>
            </span>
          </div>
          <div class="player-expanded" hidden></div>
        </article>
      `,
    )
    .join("");

  target.addEventListener("click", handlePlayerCardInteraction);
  target.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const card = event.target.closest("[data-player-card]");
    if (!card) return;

    event.preventDefault();
    togglePlayerCard(card, sortedPlayers()[Number(card.dataset.playerIndex)]);
  });
}

function handlePlayerCardInteraction(event) {
  const card = event.target.closest("[data-player-card]");
  if (!card) return;

  togglePlayerCard(card, sortedPlayers()[Number(card.dataset.playerIndex)]);
}

function getPlayerProfile(player) {
  return (
    leagueData.playerProfiles?.[player.name] || {
      bio: "Профилът предстои да бъде попълнен. Засега статистиката говори вместо него.",
      skills: ["Хъс", "Присъствие", "Потенциал"],
    }
  );
}

function playerImageMarkup(player, className = "player-photo") {
  const profile = getPlayerProfile(player);

  if (profile.image) {
    return `<img class="${className}" src="${profile.image}" alt="Снимка на ${player.name}" loading="lazy" />`;
  }

  return `
    <span class="${className} placeholder" aria-label="Снимка предстои за ${player.name}"></span>
  `;
}

function togglePlayerCard(card, player) {
  const expanded = card?.querySelector(".player-expanded");
  if (!card || !expanded) return;

  const isOpen = card.classList.contains("open");

  if (isOpen) {
    card.classList.remove("open");
    expanded.hidden = true;
    card.setAttribute("aria-expanded", "false");
    return;
  }

  document.querySelectorAll("[data-player-card].open").forEach((openCard) => {
    openCard.classList.remove("open");
    openCard.querySelector(".player-expanded").hidden = true;
    openCard.setAttribute("aria-expanded", "false");
  });

  const profile = getPlayerProfile(player);
  expanded.innerHTML = `
    <div class="profile-photo-placeholder">
      ${playerImageMarkup(player, "profile-photo")}
      <small>Снимка скоро</small>
    </div>
    <div class="profile-content">
      <span class="label">Профил</span>
      <h2>${player.name}</h2>
      <p>${profile.bio}</p>
      <div class="profile-stats">
        <article><span>${percent(winRate(player))}</span><small>Win Rate</small></article>
        <article><span>${player.wins}/${player.played}</span><small>Победи</small></article>
        <article><span>${player.mvp}</span><small>MVP</small></article>
        <article><span>${percent(player.participation)}</span><small>Участие</small></article>
      </div>
      <div class="skills-list">
        ${profile.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}
      </div>
    </div>
  `;

  expanded.hidden = false;
  card.classList.add("open");
  card.setAttribute("aria-expanded", "true");
}

async function boot() {
  await hydrateLeagueData();
  renderDataSourceStatus();
  renderHome();
  renderStandings();
  renderCountdown();
  renderTeamSplit();
  renderPosts();
  renderPlayers();
  setInterval(renderCountdown, 1000);

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

boot();

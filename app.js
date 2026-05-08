const leagueData = {
  matchday: 4,
  nextMatch: {
    title: "Съботен split мач",
    venue: "Xior игрище",
    hour: 15,
    minute: 0,
  },
  players: [
    { name: "Alex", played: 4, won: 3, drawn: 1, lost: 0, gf: 22, ga: 14, form: ["W", "W", "D", "W"], note: "Бяга постоянно, стреля рано." },
    { name: "Niki", played: 4, won: 3, drawn: 0, lost: 1, gf: 20, ga: 15, form: ["W", "L", "W", "W"], note: "Първо пас, после спор." },
    { name: "Denis", played: 4, won: 2, drawn: 1, lost: 1, gf: 19, ga: 17, form: ["D", "W", "W", "L"], note: "Винаги е около добавката." },
    { name: "Marto", played: 4, won: 2, drawn: 0, lost: 2, gf: 17, ga: 17, form: ["L", "W", "L", "W"], note: "Вратарска енергия, нападателско самочувствие." },
    { name: "Ivo", played: 4, won: 1, drawn: 1, lost: 2, gf: 15, ga: 18, form: ["W", "D", "L", "L"], note: "Влиза в единоборства сякаш носят двойни точки." },
    { name: "Sam", played: 4, won: 1, drawn: 0, lost: 3, gf: 13, ga: 20, form: ["L", "L", "W", "L"], note: "Играе навсякъде, подозрително много тича." },
    { name: "Viktor", played: 4, won: 0, drawn: 1, lost: 3, gf: 12, ga: 19, form: ["L", "D", "L", "L"], note: "Продължава да идва. Уважение." },
  ],
  teamSplit: [
    { name: "Зелени потници", players: ["Alex", "Denis", "Sam", "Viktor"] },
    { name: "Без потници", players: ["Niki", "Marto", "Ivo"] },
  ],
  posts: [
    {
      type: "Reel",
      title: "STONE. COLD. GATEV",
      copy: "Публичен Instagram Reel от 18 март. Видими реакции: 22 харесвания и 3 коментара.",
      icon: "video",
      link: "https://www.instagram.com/p/DWBZbt_jILq/",
    },
    {
      type: "Пост",
      title: "Таблица след кръга",
      copy: "Място за седмичната графика с класирането след мача.",
      icon: "table-2",
      link: "https://www.instagram.com/xiorbetliga/",
    },
    {
      type: "Story",
      title: "Анкета за следващия мач",
      copy: "За присъствие, гласуване за отбори или скрийншоти от trash talk-а.",
      icon: "messages-square",
      link: "https://www.instagram.com/xiorbetliga/",
    },
  ],
};

const tableBody = document.querySelector("#player-table");
const teamSplit = document.querySelector("#team-split");
const postList = document.querySelector("#post-list");
const playerList = document.querySelector("#player-list");

function points(player) {
  return player.won * 3 + player.drawn;
}

function goalDifference(player) {
  return player.gf - player.ga;
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function resultLabel(result) {
  return {
    W: "П",
    D: "Р",
    L: "З",
  }[result];
}

function sortedPlayers() {
  return [...leagueData.players].sort((a, b) => {
    return points(b) - points(a) || goalDifference(b) - goalDifference(a) || b.gf - a.gf;
  });
}

function renderTable() {
  tableBody.innerHTML = sortedPlayers()
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
          <td>${player.won}</td>
          <td>${player.drawn}</td>
          <td>${player.lost}</td>
          <td>${goalDifference(player) > 0 ? "+" : ""}${goalDifference(player)}</td>
          <td>${points(player)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderTeamSplit() {
  teamSplit.innerHTML = leagueData.teamSplit
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
  postList.innerHTML = leagueData.posts
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
  playerList.innerHTML = sortedPlayers()
    .map(
      (player) => `
        <article class="player-card">
          <span class="avatar">${initials(player.name)}</span>
          <div>
            <h3>${player.name}</h3>
            <p class="player-note">${player.note}</p>
            <div class="player-meta">
              <span class="tag">${points(player)} т.</span>
              <span class="tag">${goalDifference(player) > 0 ? "+" : ""}${goalDifference(player)} ГР</span>
              <span class="form" aria-label="Последна форма на ${player.name}">
                ${player.form.map((result) => `<span class="${result.toLowerCase()}">${resultLabel(result)}</span>`).join("")}
              </span>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
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

function updateCountdown() {
  const kickoff = getNextSaturdayKickoff();
  const diff = Math.max(0, kickoff - new Date());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  document.querySelector("#next-match-title").textContent = leagueData.nextMatch.title;
  document.querySelector("#next-match-date").textContent =
    `${kickoff.toLocaleDateString("bg-BG", { weekday: "long", day: "2-digit", month: "long" })} в ${kickoff.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" })} · ${leagueData.nextMatch.venue}`;

  document.querySelector("#countdown").innerHTML = [
    ["Дни", days],
    ["Часа", hours],
    ["Мин", minutes],
    ["Сек", seconds],
  ]
    .map(([label, value]) => `<span>${String(value).padStart(2, "0")}<small>${label}</small></span>`)
    .join("");
}

function boot() {
  document.querySelector("#matchday-pill").textContent = `Кръг ${leagueData.matchday}`;
  renderTable();
  renderTeamSplit();
  renderPosts();
  renderPlayers();
  updateCountdown();
  setInterval(updateCountdown, 1000);

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

boot();

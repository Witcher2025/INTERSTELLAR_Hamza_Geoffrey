const TICK_INTERVAL_MS = 100; // Constant: game loop interval in milliseconds (100ms = 10 ticks per second)
const GAME_SITE_URL = "https://example.com"; // Constant: game website URL

// 2. GAME STATE

const gameState = {
  // Object containing all game state
  cosmicEnergy: 5000000,

  // Black hole life (in percentage and HP)
  // Comment: black hole life in percentage and hit points
  blackHolePercent: 100, // Property: black hole life percentage (100% = full life)
  blackHoleHP: 200, // Property: current black hole hit points
  blackHoleMaxHP: 200, // Property: maximum black hole hit points

  manualClickPower: 1, // Property: manual click power (can be increased with upgrades)
  autoClicksPerSecond: 0, // Property: total automatic hero production (CPS = Clicks Per Second)

  // Manual click statistics
  // Comment: manual click statistics
  manualClicksThisTick: 0, // Property: number of manual clicks performed during this tick (100ms)
  manualClicksPerSecond: 0, // Property: number of manual clicks per second (calculated on average)
  manualClicksBuffer: [], // Property: buffer array to store click history (to calculate average)

  lastActivityTime: Date.now(), // Property: timestamp of last player activity (for black hole regeneration)
  lastOnlineTime: Date.now(), // Property: timestamp of last time player was online
  totalPlayTime: 0, // Property: total play time in seconds
  gameWon: false, // Property: boolean indicating if player won the game (black hole at 0%)

  // Black hole bonus phase states
  // Comment: black hole bonus phase states
  bonusPhase1Active: false, // Property: phase 1 active (100% --> 70%, production bonus x1.5)
  bonusPhase2Active: false, // Property: phase 2 active (70% --> 40%, clicks bonus x100)
  bonusPhase3Active: false, // Property: phase 3 active (40% --> 0%, Thanos unlock)

  // Temporary bonuses for each hero
  // Comment: temporary bonuses for each hero
  heroBonuses: {
    // Object containing temporary bonuses for each hero
    ROBIN: { active: false, endTime: 0 }, // Robin's bonus: active (true/false) and end time (timestamp)
    BATMAN: { active: false, endTime: 0 }, // Batman's bonus: active (true/false) and end time (timestamp)
    SPIDERMAN: { active: false, endTime: 0 }, // Spider-Man's bonus: active (true/false) and end time (timestamp)
    IRONMAN: { active: false, endTime: 0 }, // Iron Man's bonus: active (true/false) and end time (timestamp)
    BUMBLEBEE: { active: false, endTime: 0 }, // Bumblebee's bonus: active (true/false) and end time (timestamp)
    OPTIMUS: { active: false, endTime: 0 }, // Optimus Prime's bonus: active (true/false) and end time (timestamp)
    THANOS: { active: false, endTime: 0 }, // Thanos's bonus: active (true/false) and end time (timestamp)
  },
};

// 3. HERO CONFIGURATION

const heroesConfig = {
  ROBIN: {
    id: "ROBIN",
    name: "Robin",
    type: "autoclick", // Produces energy automatically
    baseCost: 100, // Starting cost
    costGrowth: 0.1, // Cost increase per purchase (+10%)
    baseCps: 1, // Base production (Clicks Per Second)
    cpsPerPurchase: 0.5, // Production added per additional purchase
    bonusThreshold: 10, // Number of purchases to activate bonus
    bonusMultiplier: 1.5, // Temporary bonus multiplier
    bonusDurationMs: 60_000, // Bonus duration (60 seconds)
    bonusDescription: "Multiplies Robin's production by 1.5 for 60 seconds",
    avatarUrl: "assets/images/Robin.png",
    ringUrl: "assets/images/Robin.png",
  },

  BATMAN: {
    id: "BATMAN",
    name: "Batman",
    type: "booster", // Multiplies Robin's production
    baseCost: 1500,
    costGrowth: 0.1,
    targetHeroId: "ROBIN", // Hero whose production is boosted
    baseMultiplier: 2, // Base multiplier
    multiplierPerPurchase: 0.1, // Multiplier added per purchase
    bonusThreshold: 10,
    bonusMultiplier: 2,
    bonusDurationMs: 60_000,
    bonusDescription: "Multiplies all heroes' production by 2 for 60 seconds",
    avatarUrl: "assets/images/Batman.png",
    ringUrl: "assets/images/Batman.png",
  },

  SPIDERMAN: {
    id: "SPIDERMAN",
    name: "Spider-Man",
    type: "autoclick",
    baseCost: 5000,
    costGrowth: 0.13,
    baseCps: 3,
    cpsPerPurchase: 2,
    bonusThreshold: 9,
    bonusMultiplier: 3,
    bonusDurationMs: 60_000,
    bonusDescription: "Multiplies Spider-Man's production by 3 for 60 seconds",
    avatarUrl: "assets/images/Spider_Man.png",
    ringUrl: "assets/images/Spider_Man.png",
  },

  IRONMAN: {
    id: "IRONMAN",
    name: "Iron Man",
    type: "booster", // Multiplies Spider-Man's production
    baseCost: 20_000,
    costGrowth: 0.17,
    targetHeroId: "SPIDERMAN", // Hero whose production is boosted
    baseMultiplier: 2,
    multiplierPerPurchase: 0.2,
    bonusThreshold: 7,
    bonusMultiplier: 4,
    bonusDurationMs: 60_000,
    bonusDescription: "Multiplies all heroes' production by 4 for 60 seconds",
    avatarUrl: "assets/images/Iron_Man.png",
    ringUrl: "assets/images/Iron_Man.png",
  },

  BUMBLEBEE: {
    id: "BUMBLEBEE",
    name: "Bumblebee",
    type: "autoclick",
    baseCost: 45_000,
    costGrowth: 0.17,
    baseCps: 5,
    cpsPerPurchase: 4,
    bonusThreshold: 5,
    bonusMultiplier: 5,
    bonusDurationMs: 60_000,
    bonusDescription: "Multiplies Bumblebee's production by 5 for 60 seconds",
    avatarUrl: "assets/images/Bumblebee.png",
    ringUrl: "assets/images/Bumblebee.png",
  },

  OPTIMUS: {
    id: "OPTIMUS",
    name: "Optimus Prime",
    type: "booster", // Multiplies Bumblebee's production
    baseCost: 90_000,
    costGrowth: 0.2,
    targetHeroId: "BUMBLEBEE", // Hero whose production is boosted
    baseMultiplier: 3,
    multiplierPerPurchase: 0.35,
    bonusThreshold: 3,
    bonusMultiplier: 6,
    bonusDurationMs: 60_000,
    bonusDescription: "Multiplies all heroes' production by 6 for 60 seconds",
    avatarUrl: "assets/images/Optimus_Prime.png",
    ringUrl: "assets/images/Optimus_Prime.png",
  },

  THANOS: {
    id: "THANOS",
    name: "Thanos",
    type: "autoclick",
    baseCost: 500_000,
    costGrowth: 0.5,
    baseCps: 100,
    cpsPerPurchase: 50,
    bonusThreshold: 5,
    bonusMultiplier: 10,
    bonusDurationMs: 60_000,
    bonusDescription: "Multiplies Thanos's production by 10 for 60 seconds.",
    avatarUrl: "assets/images/Thanos.png",
    ringUrl: "assets/images/Thanos.png",
  },
};

const heroesOrder = [
  // Hero unlock order
  "ROBIN",
  "BATMAN",
  "SPIDERMAN",
  "IRONMAN",
  "BUMBLEBEE",
  "OPTIMUS",
  "THANOS",
];

// 4. DYNAMIC HERO STATE

const heroesState = {}; // Initialize state for each hero
for (const key in heroesConfig) {
  heroesState[key] = {
    owned: 0, // Number owned
    cost: heroesConfig[key].baseCost, // Current cost
    multiplierBonusActive: 1, // Temporary bonus multiplier (x1.5, x2, etc.)
    itemOwned: 0, // Number of special items purchased
    itemCost: Math.floor(heroesConfig[key].baseCost * 4), // Special item cost
  };
}

// 5. FUNCTIONS

function now() {
  return Date.now();
}

/**
 * Formats a number with thousand separators
 * @param {number} n - The number to format
 * @returns {string} Formatted number string
 */
function formatNumber(n) {
  return Math.floor(n).toLocaleString("en-US");
}

/**
 * Checks if a hero is unlocked (at least 1 purchase)
 * @param {string} heroId - The hero ID to check
 * @returns {boolean} True if hero is unlocked
 */
function isHeroUnlocked(heroId) {
  return heroesState[heroId].owned > 0;
}

/**
 * Checks if a hero can be visible (previous hero unlocked)
 * @param {string} heroId - The hero ID to check
 * @returns {boolean} True if hero should be visible
 */
function isHeroVisible(heroId) {
  if (heroId === "THANOS") {
    // Thanos is visible only in phase 3
    return gameState.bonusPhase3Active;
  }

  const index = heroesOrder.indexOf(heroId);
  if (index === 0) return true; // Robin is always visible
  if (index === -1) return false;

  const previousHeroId = heroesOrder[index - 1];
  return isHeroUnlocked(previousHeroId);
}

/**
 * Formats time in hours/minutes/seconds
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  else if (minutes > 0) return `${minutes}m ${secs}s`;
  else return `${secs}s`;
}

// 6. BLACK HOLE MANAGEMENT
/**
 * Applies click damage to the black hole
 * Calculates damage based on automatic production and applies phase bonuses
 * @param {Event} event - The click event (optional, for bonus phase 2)
 */
function applyClickToBlackHole(event) {
  let damagePerClick = gameState.autoClicksPerSecond; // Damage = total automatic production

  if (gameState.bonusPhase2Active && event) {
    // Bonus 2: chaque clic ajoute 100 fois la production automatique (s'ajoute aux dégâts automatiques)
    damagePerClick += gameState.autoClicksPerSecond * 100;
  }

  gameState.blackHoleHP = Math.max(0, gameState.blackHoleHP - damagePerClick); // Reduce HP (cannot go below 0)

  gameState.blackHolePercent =
    (gameState.blackHoleHP / gameState.blackHoleMaxHP) * 100; // Recalculate percentage

  updateBlackHolePhases(); // Update phases (includes victory check)
}

/**
 * Updates the black hole bonus phases based on life percentage
 * Phase 1: 100% --> 70% (production x1.5)
 * Phase 2: 70% --> 40% (manual clicks x100)
 * Phase 3: 40% --> 0% (Thanos unlocked)
 */
function updateBlackHolePhases() {
  const p = gameState.blackHolePercent;

  gameState.bonusPhase1Active = p < 100 && p > 70; // Phase 1: 100% --> 70% (production x 1.5)
  gameState.bonusPhase2Active = p <= 70 && p > 40; // Phase 2: 70% --> 40% (manual clicks x 100)
  gameState.bonusPhase3Active = p <= 40 && p >= 0; // Phase 3: 40% --> 0% (Thanos unlock)

  // Check for victory condition
  if (p <= 0 && !gameState.gameWon) {
    triggerVictory();
  }
}

/**
 * Triggers the victory sequence when black hole reaches 0%
 * Shows victory modal and awards bonus cosmic energy
 */
function triggerVictory() {
  if (gameState.gameWon) return; // Prevent multiple triggers

  gameState.gameWon = true;
  gameState.blackHolePercent = 0;
  gameState.blackHoleHP = 0;

  // Award victory bonus
  const victoryBonus = 1000000;
  gameState.cosmicEnergy += victoryBonus;

  // Show victory modal
  const victoryModal = document.getElementById("victory-modal");
  if (victoryModal) {
    victoryModal.classList.add("active");
  }

  updateUI();
}

/**
 * Regenerates the black hole after inactivity (only in phase 3)
 * Regenerates 100 HP per tick if inactive for 2 hours
 */
function regenerateBlackHoleIfInactive() {
  const timeSinceLastActivity = now() - gameState.lastActivityTime;

  const delayBeforeRegenMs = 2 * 60 * 60 * 1000; // Delay before regeneration: 2 hours
  if (timeSinceLastActivity < delayBeforeRegenMs) return;

  if (gameState.blackHolePercent <= 40 && gameState.blackHolePercent > 0) {
    // Regeneration only in phase 3 (40% --> 0%)
    const regenHP = 100; // Regenerate 100 HP per tick
    gameState.blackHoleHP = Math.min(
      gameState.blackHoleMaxHP,
      gameState.blackHoleHP + regenHP
    );
    gameState.blackHolePercent =
      (gameState.blackHoleHP / gameState.blackHoleMaxHP) * 100;
    updateBlackHolePhases();
  }
}

// 7. HERO MANAGEMENT
/**
 * Calculates the effective CPS (Clicks Per Second) of a hero
 * Takes into account base production, additional purchases, boosters, temporary bonuses, and phase bonuses
 * @param {string} heroId - The hero ID
 * @returns {number} Effective CPS for the hero
 */
function getHeroEffectiveCps(heroId) {
  const config = heroesConfig[heroId];
  const state = heroesState[heroId];

  if (config.type !== "autoclick") return 0; // If it's a booster or not owned --> no production
  if (state.owned === 0) return 0;

  let cps = config.baseCps; // Base production

  if (state.owned > 1) {
    // Add production from additional purchases
    cps += (state.owned - 1) * config.cpsPerPurchase;
  }

  // Apply booster multipliers
  for (const key in heroesConfig) {
    const booster = heroesConfig[key];
    const boosterState = heroesState[key];

    if (
      booster.type === "booster" &&
      booster.targetHeroId === heroId &&
      boosterState.owned > 0
    ) {
      let mult = booster.baseMultiplier;
      if (boosterState.owned > 1) {
        mult += (boosterState.owned - 1) * booster.multiplierPerPurchase;
      }
      mult *= boosterState.multiplierBonusActive;
      cps *= mult;
    }
  }

  cps *= state.multiplierBonusActive; // Apply hero's temporary bonus

  if (gameState.bonusPhase1Active) {
    // Apply phase 1 bonus
    cps *= 1.5;
  }

  return Math.max(0, cps);
}

/**
 * Calculates the total automatic clicks per second from all heroes
 * Updates the gameState.autoClicksPerSecond value
 */
function calculateTotalAutoClicksPerSecond() {
  let total = 0;
  for (const key in heroesConfig) {
    total += getHeroEffectiveCps(key);
  }
  gameState.autoClicksPerSecond = total;
}

/**
 * Buys a hero from the shop
 * Deducts cosmic energy, increases owned count, updates cost, and activates bonus if threshold is reached
 * @param {string} heroId - The hero ID to buy
 */
function buyHero(heroId) {
  const config = heroesConfig[heroId];
  const state = heroesState[heroId];

  if (!config) return;

  if (!isHeroVisible(heroId)) {
    // Check: is hero visible?
    return;
  }

  if (gameState.cosmicEnergy < state.cost) {
    // Check: sufficient funds?
    return;
  }

  gameState.cosmicEnergy -= state.cost; // Deduct cost
  state.owned += 1; // Add hero
  state.cost = Math.floor(state.cost * (1 + config.costGrowth)); // Increase cost for next purchase

  if (state.owned === config.bonusThreshold) {
    // If bonus threshold reached --> automatic activation
    activateHeroTemporaryBonus(heroId);
  }

  calculateTotalAutoClicksPerSecond(); // Recalculate total production
  updateUI(); // Update interface
}

/**
 * Buys a hero's special item (from the popup)
 * Requires the hero to be owned at least once and sufficient cosmic energy
 * @param {string} heroId - The hero ID whose item to buy
 */
function buyItem(heroId) {
  const config = heroesConfig[heroId];
  const state = heroesState[heroId];
  const bonus = gameState.heroBonuses[heroId];

  if (!config) return;

  // CHECK: Hero must be owned at least once
  if (state.owned === 0) return;

  if (gameState.cosmicEnergy < state.itemCost) return; // Verification: sufficient funds?

  if (bonus.active && now() < bonus.endTime) return; // Verification: cooldown active? (bonus in progress)

  gameState.cosmicEnergy -= state.itemCost; // Deduct cost
  state.itemOwned += 1; // Add item
  state.itemCost = Math.floor(state.itemCost * 1.25); // Increase item cost (+25%)

  activateHeroTemporaryBonus(heroId); // Activate temporary bonus
  updateUI(); // Update interface
}

/**
 * Activates a hero's temporary bonus (60 seconds)
 * Sets the bonus multiplier and end time
 * @param {string} heroId - The hero ID to activate bonus for
 */
function activateHeroTemporaryBonus(heroId) {
  const config = heroesConfig[heroId];
  const state = heroesState[heroId];
  const bonus = gameState.heroBonuses[heroId];

  state.multiplierBonusActive = 1; // Complete reset
  state.multiplierBonusActive = config.bonusMultiplier; // Apply new bonus

  bonus.active = true; // Record end time
  bonus.endTime = now() + config.bonusDurationMs;
}

/**
 * Checks if temporary bonuses should end
 * Deactivates bonuses whose time has elapsed
 */
function updateHeroBonuses() {
  const t = now();

  for (const heroId in gameState.heroBonuses) {
    const bonus = gameState.heroBonuses[heroId];
    if (!bonus.active) continue;

    if (t >= bonus.endTime) {
      // If time elapsed --> deactivation
      heroesState[heroId].multiplierBonusActive = 1;
      bonus.active = false;
      bonus.endTime = 0;
    }
  }
}

// 8. PLAYER CLICK MANAGEMENT
/**
 * Handles player click on the black hole
 * Calculates cosmic energy gain, applies damage, and shows explosion effect
 * @param {Event} event - The click event
 */
function handlePlayerClick(event) {
  gameState.lastActivityTime = now();
  gameState.manualClicksThisTick++;

  let gainPerClick = gameState.manualClickPower + gameState.autoClicksPerSecond;

  if (gameState.bonusPhase2Active) {
    // Bonus 2: chaque clic ajoute 100 fois la production automatique
    gainPerClick += gameState.autoClicksPerSecond * 100;
  }

  gameState.cosmicEnergy += gainPerClick;
  applyClickToBlackHole(event);

  showClickExplosion(event);

  updateUI();
}

/**
 * Shows click explosion animation at click position
 * Uses different image based on whether a bonus is active
 * @param {Event} event - The click event
 */
function showClickExplosion(event) {
  // Check if bonus is active
  let bonusActive = false;
  for (const heroId in gameState.heroBonuses) {
    if (gameState.heroBonuses[heroId].active) {
      bonusActive = true;
      break;
    }
  }

  // Image based on bonus
  let explosionImg;

  if (bonusActive) {
    explosionImg = "assets/images/bonus_dammages.png";
  } else {
    explosionImg = "assets/images/normal_dammages.png";
  }

  const explosion = document.createElement("div");
  explosion.className = "click-explosion";
  explosion.style.backgroundImage = `url('${explosionImg}')`;

  // Click position
  const blackHoleZone = document.getElementById("click-zone");
  if (blackHoleZone && event) {
    const rect = blackHoleZone.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;

    blackHoleZone.appendChild(explosion);

    setTimeout(() => {
      explosion.remove();
    }, 300);
  }
}

// 9. GAME LOOP
let gameLoopInterval = null; // Variable to store interval ID (allows stopping if needed)

/**
 * Starts the game loop
 * Runs every TICK_INTERVAL_MS milliseconds
 * Updates automatic production, manual click stats, hero bonuses, and UI
 */
function startGameLoop() {
  gameLoopInterval = setInterval(() => {
    calculateTotalAutoClicksPerSecond(); // Calculate automatic hero production

    const autoClicksPerTick =
      (gameState.autoClicksPerSecond * TICK_INTERVAL_MS) / 1000; // Convert CPS --> production per tick

    if (autoClicksPerTick > 0) {
      // Add passive production
      gameState.cosmicEnergy += autoClicksPerTick;
    }

    // Update manual click statistics (average over 1 second)
    gameState.manualClicksBuffer.push(gameState.manualClicksThisTick);

    const maxTicks = 1000 / TICK_INTERVAL_MS;
    if (gameState.manualClicksBuffer.length > maxTicks) {
      gameState.manualClicksBuffer.shift();
    }

    const sumClicks = gameState.manualClicksBuffer.reduce((a, b) => a + b, 0);
    gameState.manualClicksPerSecond = sumClicks;
    gameState.manualClicksThisTick = 0; // Reset counter for next tick

    updateHeroBonuses(); // Check temporary bonuses
    regenerateBlackHoleIfInactive(); // Regenerate black hole if inactive
    updateUI(); // Update interface
  }, TICK_INTERVAL_MS);
}

// 10. USER INTERFACE MANAGEMENT
let energyEl, blackHoleEl, clicksPerSecondEl, clickZone;
let heroRingContainer, heroListContainer, leftHeroesContainer, popupLayer;

const heroButtons = {}; // Storage for hero buttons

/**
 * Creates the entire hero interface (avatars, popups, cards)
 * Generates avatar elements for left panel, popup information windows, and shop cards for right panel
 */
function createHeroInterface() {
  heroesOrder.forEach((heroId, index) => {
    // For each hero in unlock order
    const config = heroesConfig[heroId];
    const state = heroesState[heroId];

    // CREATE LEFT AVATAR
    const avatar = document.createElement("div");
    avatar.className = "hero-avatar";
    avatar.dataset.heroId = heroId;
    avatar.innerHTML = `
      <div class="hero-count-badge" id="badge-${heroId}">0</div>
    `;

    if (config.avatarUrl) {
      // Apply background image
      avatar.style.backgroundImage = `url('${config.avatarUrl}')`;
      avatar.style.backgroundSize = "cover";
      avatar.style.backgroundPosition = "center";
    }

    if (!isHeroVisible(heroId)) {
      // Progressive appearance animation
      avatar.style.display = "none";
    }

    leftHeroesContainer.appendChild(avatar);

    // CREATE INFORMATION POPUP

    const popup = document.createElement("div");
    popup.className = "hero-popup";
    popup.id = `popup-${heroId}`;
    popup.style.display = "none";
    popup.style.left = "180px";
    popup.style.top = `${140 + index * 70}px`;
    popup.innerHTML = `
      <div class="hero-popup-header">${config.name}</div>
      <div class="hero-popup-row">
        <span>Items purchased</span>
        <strong id="item-count-${heroId}">${state.itemOwned}</strong>
      </div>
      <div class="hero-popup-row">
        <span>Item price</span>
        <strong id="item-price-${heroId}">${formatNumber(
      state.itemCost
    )} CE</strong>
      </div>
      <div class="hero-popup-description">
        Special item that enhances ${config.name}'s special abilities.
      </div>
      ${
        config.bonusDescription
          ? `<div class="hero-bonus-info"><strong>Bonus:</strong> ${config.bonusDescription}</div>`
          : ""
      }
      <div class="hero-bonus-timeline" id="bonus-timeline-${heroId}" style="display: none;">
        <div class="timeline-bar">
          <div class="timeline-progress" id="timeline-progress-${heroId}"></div>
        </div>
        <div class="timeline-text" id="timeline-text-${heroId}">0s</div>
      </div>
      <button class="buy-button" data-hero-item="${heroId}" id="buy-item-btn-${heroId}">BUY ITEM</button>
    `;
    popupLayer.appendChild(popup);

    popup.addEventListener("pointerleave", (e) => {
      // Close popup when mouse leaves the field
      const related = e.relatedTarget;
      if (!popup.contains(related) && !avatar.contains(related)) {
        popup.style.display = "none";
      }
    });

    avatar.addEventListener("click", () => {
      // Toggle popup state on avatar click
      const visible = popup.style.display === "block";
      document
        .querySelectorAll(".hero-popup")
        .forEach((p) => (p.style.display = "none")); // Close all other popups
      popup.style.display = visible ? "none" : "block"; // Toggle current popup
    });

    // CREATE HERO CARD ON RIGHT (SHOP)

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = `btn-hero-${heroId.toLowerCase()}`;
    btn.className = "hero-card hero-unavailable";
    btn.innerHTML = `
      <div class="hero-card-content">
        <div class="hero-icon-small" style="${
          config.avatarUrl
            ? `background-image:url('${config.avatarUrl}');background-size:cover;background-position:center;`
            : ""
        }"></div>
        <div class="hero-card-info">
          <div class="hero-name">${config.name}</div>
          <div class="hero-stats">
            <span class="hero-owned">0</span>
            <span class="hero-cost">${formatNumber(state.cost)} CE</span>
            <span class="hero-production"></span>
            <span class="hero-unavailable-text">Unavailable</span>
            <span class="lock-icon"></span>
          </div>
        </div>
        <div class="buy-button">BUY</div>
      </div>
    `;
    heroListContainer.appendChild(btn);
    heroButtons[heroId] = btn;

    btn.addEventListener("click", () => buyHero(heroId)); // Purchase event listener
  });
}

/**
 * Updates the entire game interface
 * Updates all displayed values, hero cards, popups, and visual states
 */
function updateUI() {
  // UPDATE MAIN GAME VALUES

  if (energyEl) {
    energyEl.textContent = formatNumber(gameState.cosmicEnergy);
  }

  if (clicksPerSecondEl) {
    clicksPerSecondEl.textContent = formatNumber(gameState.autoClicksPerSecond);
  }

  if (blackHoleEl) {
    const percent = gameState.blackHolePercent;

    // Safety: check NaN (not a number) = impossible calculation result = set correct value (100) if calculation fails
    if (isNaN(percent) || percent < 0) {
      blackHoleEl.textContent = "100,00";
    } else {
      // Format avec virgule pour le format français (ex: 99,56 %)
      blackHoleEl.textContent = percent.toFixed(2).replace(".", ",");
    }
  }

  // UPDATE AVATAR BADGES

  heroesOrder.forEach((heroId) => {
    const badge = document.getElementById(`badge-${heroId}`);
    if (badge) {
      badge.textContent = heroesState[heroId].owned;
    }
  });

  // SHOW/HIDE AVATARS

  heroesOrder.forEach((heroId) => {
    const avatar = document.querySelector(`[data-hero-id="${heroId}"]`);
    if (avatar) {
      if (isHeroVisible(heroId)) {
        avatar.style.display = "flex";
        if (!avatar.classList.contains("visible")) {
          // Appearance animation if hero was just unlocked
          setTimeout(() => {
            avatar.classList.add("visible");
          }, 200);
        }
      } else {
        avatar.style.display = "none";
      }
    }
  });

  // UPDATE HERO CARDS (SHOP ON RIGHT)
  for (const heroId of heroesOrder) {
    const btn = heroButtons[heroId];
    if (!btn) continue;

    const config = heroesConfig[heroId];
    const state = heroesState[heroId];

    const visible = isHeroVisible(heroId);

    if (!visible && state.owned === 0) {
      // If not visible and not owned --> hide
      btn.style.display = "none";
      continue;
    }

    btn.style.display = "flex";

    if (state.owned > 0 || gameState.cosmicEnergy >= state.cost) {
      // Manage states: available / unavailable
      btn.classList.remove("hero-unavailable");
      btn.classList.add("hero-active");
      btn.disabled = false;
    } else {
      btn.classList.remove("hero-active");
      btn.classList.add("hero-unavailable");
      btn.disabled = true;
    }

    // Update content
    const ownedEl = btn.querySelector(".hero-owned");
    const costEl = btn.querySelector(".hero-cost");
    const unavailableEl = btn.querySelector(".hero-unavailable-text");
    const lockEl = btn.querySelector(".lock-icon");

    if (ownedEl) {
      if (state.owned > 0) {
        ownedEl.textContent = state.owned;
        ownedEl.style.display = "inline";
      } else {
        ownedEl.style.display = "none";
      }
    }

    if (costEl) {
      costEl.textContent = formatNumber(state.cost) + " CE";
    }

    if (unavailableEl && lockEl) {
      if (state.owned > 0 || gameState.cosmicEnergy >= state.cost) {
        unavailableEl.style.display = "none";
        lockEl.style.display = "none";
      } else {
        unavailableEl.style.display = "inline";
        lockEl.style.display = "inline";
      }
    }
  }

  // UPDATE ITEM POPUPS

  heroesOrder.forEach((heroId) => {
    const config = heroesConfig[heroId];
    const state = heroesState[heroId];
    const countEl = document.getElementById(`item-count-${heroId}`);
    const priceEl = document.getElementById(`item-price-${heroId}`);
    const timelineEl = document.getElementById(`bonus-timeline-${heroId}`);
    const timelineProgressEl = document.getElementById(
      `timeline-progress-${heroId}`
    );
    const timelineTextEl = document.getElementById(`timeline-text-${heroId}`);
    const buyBtnEl = document.getElementById(`buy-item-btn-${heroId}`);

    if (countEl) countEl.textContent = state.itemOwned;
    if (priceEl) priceEl.textContent = `${formatNumber(state.itemCost)} CE`;

    // Visual cooldown management
    const bonus = gameState.heroBonuses[heroId];
    if (bonus.active && now() < bonus.endTime) {
      // Bonus active --> show timeline + disable button
      const timeRemaining = bonus.endTime - now();
      const totalTime = config.bonusDurationMs;
      const percentage = (timeRemaining / totalTime) * 100;
      const secondsRemaining = Math.ceil(timeRemaining / 1000);

      if (timelineEl) {
        timelineEl.style.display = "block";
      }
      if (timelineProgressEl) {
        timelineProgressEl.style.width = `${percentage}%`;
      }
      if (timelineTextEl) {
        timelineTextEl.textContent = `${secondsRemaining}s`;
      }
      if (buyBtnEl) {
        buyBtnEl.disabled = true;
        buyBtnEl.textContent = "ON COOLDOWN";
        buyBtnEl.style.opacity = "0.5";
        buyBtnEl.style.cursor = "not-allowed";
      }
    } else if (state.owned === 0) {
      // Hero not yet owned --> button disabled
      if (timelineEl) {
        timelineEl.style.display = "none";
      }
      if (buyBtnEl) {
        buyBtnEl.disabled = true;
        buyBtnEl.textContent = "HERO REQUIRED";
        buyBtnEl.style.opacity = "0.5";
        buyBtnEl.style.cursor = "not-allowed";
      }
    } else {
      // Bonus inactive --> hide timeline + enable button
      if (timelineEl) {
        timelineEl.style.display = "none";
      }
      if (buyBtnEl) {
        buyBtnEl.disabled = false;
        buyBtnEl.textContent = "Buy Item";
        buyBtnEl.style.opacity = "1";
        buyBtnEl.style.cursor = "pointer";
      }
    }
  });

  // UPDATE BLACK HOLE PHASE VISUALS

  const clickZoneEl = document.getElementById("click-zone");
  if (clickZoneEl) {
    clickZoneEl.classList.remove("phase-1", "phase-2", "phase-3");
    if (gameState.bonusPhase1Active) {
      clickZoneEl.classList.add("phase-1");
    } else if (gameState.bonusPhase2Active) {
      clickZoneEl.classList.add("phase-2");
    } else if (gameState.bonusPhase3Active) {
      clickZoneEl.classList.add("phase-3");
    }
  }

  updateHeroRing(); // Update hero circle around black hole
  updateBonusPopups(); // Update phase bonus status popups
}

/**
 * Updates phase bonus status popups
 * Shows active/inactive status for each bonus phase
 */
function updateBonusPopups() {
  const bonus1Status = document.getElementById("bonus-1-status");
  const bonus2Status = document.getElementById("bonus-2-status");
  const bonus3Status = document.getElementById("bonus-3-status");

  if (bonus1Status) {
    if (gameState.bonusPhase1Active) {
      bonus1Status.textContent = "Active";
      bonus1Status.style.background = "rgba(0, 255, 0, 0.2)";
      bonus1Status.style.color = "#00ff00";
    } else {
      bonus1Status.textContent = "Inactive";
      bonus1Status.style.background = "rgba(255, 0, 0, 0.2)";
      bonus1Status.style.color = "#ff4444";
    }
  }

  if (bonus2Status) {
    if (gameState.bonusPhase2Active) {
      bonus2Status.textContent = "Active";
      bonus2Status.style.background = "rgba(0, 255, 0, 0.2)";
      bonus2Status.style.color = "#00ff00";
    } else {
      bonus2Status.textContent = "Inactive";
      bonus2Status.style.background = "rgba(255, 0, 0, 0.2)";
      bonus2Status.style.color = "#ff4444";
    }
  }

  if (bonus3Status) {
    if (gameState.bonusPhase3Active) {
      bonus3Status.textContent = "Active";
      bonus3Status.style.background = "rgba(0, 255, 0, 0.2)";
      bonus3Status.style.color = "#00ff00";
    } else {
      bonus3Status.textContent = "Inactive";
      bonus3Status.style.background = "rgba(255, 0, 0, 0.2)";
      bonus3Status.style.color = "#ff4444";
    }
  }
}

/**
 * Progressively shows hero avatars
 * Creates staggered animation for hero appearances
 */
function showHeroBonusesProgressively() {
  heroesOrder.forEach((heroId, index) => {
    const avatar = document.querySelector(`[data-hero-id="${heroId}"]`);
    if (avatar) {
      const state = heroesState[heroId];
      if (state.owned > 0) {
        // Animation only for owned heroes
        setTimeout(() => {
          avatar.classList.add("visible");
        }, index * 200);
      }
    }
  });
}

/**
 * Creates hero icons around the black hole
 * Positions heroes on concentric circles based on their type
 */
function updateHeroRing() {
  if (!heroRingContainer) return;
  heroRingContainer.innerHTML = "";

  // Assign radius per hero (3 concentric circles)
  const heroRadius = {
    ROBIN: 50, // Outer circle (furthest)
    BATMAN: 50, // Outer circle
    SPIDERMAN: 42, // Middle circle
    IRONMAN: 42, // Middle circle
    BUMBLEBEE: 34, // Inner circle (closest)
    OPTIMUS: 34, // Inner circle
    THANOS: 42, // Middle circle (default)
  };

  // Group icons by circle
  const iconsByRadius = {};

  heroesOrder.forEach((heroId) => {
    const state = heroesState[heroId];
    const config = heroesConfig[heroId];
    const radius = heroRadius[heroId] || 42;

    for (let i = 0; i < state.owned; i++) {
      if (!iconsByRadius[radius]) iconsByRadius[radius] = [];
      iconsByRadius[radius].push({
        heroId,
        url: config.ringUrl || config.avatarUrl || "",
      });
    }
  });

  // Position each circle independently
  for (const radius in iconsByRadius) {
    const icons = iconsByRadius[radius];
    const total = icons.length;

    icons.forEach((icon, index) => {
      const angle = (index / total) * Math.PI * 2;
      const x = 50 + parseFloat(radius) * Math.cos(angle);
      const y = 50 + parseFloat(radius) * Math.sin(angle);

      const div = document.createElement("div");
      div.className = "hero-ring-icon";
      if (icon.url) {
        div.style.backgroundImage = `url('${icon.url}')`;
      }
      div.style.left = `${x}%`;
      div.style.top = `${y}%`;
      div.style.transform = "translate(-50%, -50%)";

      heroRingContainer.appendChild(div);
    });
  }
}

// 11. EXTERNAL LIBRARY INITIALIZATION

/**
 * Initializes particles.js (star background animation)
 * Sets up particle effects for the game background
 */
function initParticles() {
  if (typeof particlesJS !== "undefined") {
    particlesJS("particles-js", {
      particles: {
        number: {
          value: 50,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: "#ffffff",
        },
        shape: {
          type: "circle",
        },
        opacity: {
          value: 0.5,
          random: true,
        },
        size: {
          value: 3,
          random: true,
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#ffffff",
          opacity: 0.2,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab",
          },
          onclick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 0.5,
            },
          },
          push: {
            particles_nb: 4,
          },
        },
      },
      retina_detect: true,
    });
  }
}

// Global variable for music state
let musicEnabled = true;

/**
 * Initializes background music
 * Loads saved music state from localStorage and starts playback if enabled
 */
function initMusic() {
  const audio = document.getElementById("background-music");
  if (audio) {
    audio.volume = 0.3; // Reduced volume to not be too intrusive

    // Retrieve saved state from localStorage
    const savedMusicState = localStorage.getItem("musicEnabled");
    if (savedMusicState !== null) {
      musicEnabled = savedMusicState === "true";
    }

    // Update music state
    updateMusicState();

    // Try to play music if it's enabled
    if (musicEnabled) {
      audio.play().catch((err) => {
        console.log("Music cannot play automatically:", err);
        // User will need to interact with the page to start music
      });
    }
  }
}

/**
 * Toggles music on/off
 * Saves state to localStorage and updates UI
 */
function toggleMusic() {
  const audio = document.getElementById("background-music");
  if (!audio) return;

  musicEnabled = !musicEnabled;
  updateMusicState();

  // Save state to localStorage
  localStorage.setItem("musicEnabled", musicEnabled.toString());

  if (musicEnabled) {
    audio.play().catch((err) => {
      console.log("Music cannot play:", err);
    });
  } else {
    audio.pause();
  }
}

/**
 * Updates music state display in UI
 */
function updateMusicState() {
  const musicText = document.getElementById("music-text");
  if (musicText) {
    musicText.textContent = musicEnabled ? "Music: ON" : "Music: OFF";
  }
}

// 12. GAME INITIALIZATION

/**
 starts the game loop
 */
document.addEventListener("DOMContentLoaded", () => {
  // STEP 1: GET DOM ELEMENTS
  energyEl = document.getElementById("energie-value");
  blackHoleEl = document.getElementById("trou-noir-value");
  clicksPerSecondEl = document.getElementById("clics-seconde-value");
  clickZone = document.getElementById("click-zone");
  heroRingContainer = document.getElementById("hero-ring");
  heroListContainer = document.getElementById("hero-list");
  leftHeroesContainer = document.getElementById("left-heroes");
  popupLayer = document.getElementById("hero-popup-layer");

  // STEP 2: INITIALIZE VALUES

  if (!gameState.blackHoleHP || !gameState.blackHoleMaxHP) {
    // Safety: verify and initialize black hole HP
    gameState.blackHoleHP = 10_000_000;
    gameState.blackHoleMaxHP = 10_000_000;
  }
  gameState.blackHolePercent =
    (gameState.blackHoleHP / gameState.blackHoleMaxHP) * 100;

  // STEP 3: CREATE INTERFACE
  createHeroInterface();

  // STEP 4: SET UP EVENT LISTENERS

  if (clickZone) {
    // Click on black hole
    clickZone.addEventListener("click", handlePlayerClick);
  }

  if (popupLayer) {
    // Purchase items via popups
    popupLayer.addEventListener("click", (e) => {
      const heroId = e.target.getAttribute("data-hero-item");
      if (!heroId) return;
      buyItem(heroId);
    });
  }

  // Dropdown menu management
  const menuBox = document.getElementById("clics-menu");
  const dropdownMenu = document.getElementById("dropdown-menu");

  if (menuBox && dropdownMenu) {
    // Open/close menu on click
    menuBox.addEventListener("click", (e) => {
      e.stopPropagation();
      menuBox.classList.toggle("active");
    });

    // Close menu if clicking outside
    document.addEventListener("click", (e) => {
      if (!menuBox.contains(e.target)) {
        menuBox.classList.remove("active");
      }
    });
  }

  // "Visit Website" button
  const btnSite = document.getElementById("btn-site");
  if (btnSite) {
    btnSite.addEventListener("click", (e) => {
      e.stopPropagation();
      // Open site in new tab
      window.open(GAME_SITE_URL, "_blank");
      menuBox?.classList.remove("active");
    });
  }

  // "How to Play" button - Open help modal
  const btnHelp = document.getElementById("btn-help");
  const helpModal = document.getElementById("help-modal");
  const closeHelpModal = document.getElementById("close-help-modal");

  if (btnHelp && helpModal) {
    btnHelp.addEventListener("click", (e) => {
      e.stopPropagation();
      helpModal.classList.add("active");
      menuBox?.classList.remove("active");
    });
  }

  if (closeHelpModal && helpModal) {
    closeHelpModal.addEventListener("click", () => {
      helpModal.classList.remove("active");
    });

    // Close modal if clicking outside
    helpModal.addEventListener("click", (e) => {
      if (e.target === helpModal) {
        helpModal.classList.remove("active");
      }
    });
  }

  // Victory modal management
  const victoryModal = document.getElementById("victory-modal");
  const closeVictoryModal = document.getElementById("close-victory-modal");

  if (closeVictoryModal && victoryModal) {
    closeVictoryModal.addEventListener("click", () => {
      victoryModal.classList.remove("active");
    });

    // Close modal if clicking outside
    victoryModal.addEventListener("click", (e) => {
      if (e.target === victoryModal) {
        victoryModal.classList.remove("active");
      }
    });
  }

  // "Music" button
  const btnMusic = document.getElementById("btn-music");
  if (btnMusic) {
    btnMusic.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMusic();
      menuBox?.classList.remove("active");
    });
  }

  // "Quit Game" button
  const btnQuit = document.getElementById("btn-quit");
  if (btnQuit) {
    btnQuit.addEventListener("click", (e) => {
      e.stopPropagation();
      // Ask for confirmation before quitting
      if (confirm("Are you sure you want to quit the game?")) {
        // Close tab or redirect
        window.close();
        // If window.close() doesn't work, redirect to home page
        if (!document.hidden) {
          window.location.href = "about:blank";
        }
      }
      menuBox?.classList.remove("active");
    });
  }

  // STEP 5: INITIAL CALCULATIONS
  updateBlackHolePhases();
  calculateTotalAutoClicksPerSecond();

  // STEP 6: FIRST UI UPDATE
  updateUI();

  // STEP 7: INITIALIZE EXTERNAL LIBRARIES
  initParticles();
  initMusic();

  // STEP 8: START GAME LOOP
  startGameLoop();

  // STEP 9: PROGRESSIVE ANIMATIONS
  showHeroBonusesProgressively();

  setInterval(() => {
    // Continuous animation updates
    showHeroBonusesProgressively();
  }, 1000);
});

FIGMA : https://www.figma.com/design/Ae1BvSlQrD3eqWq2xk5St7/INTERSTELLAR---IDLE-GAME?node-id=1-211&p=f&t=6LaH4UxoPaBGEWfr-0


# INTERSTELLAR – Space Clicker Game

An **idle clicker** game where you must destroy a black hole by buying heroes and clicking strategically.

---

## 🚀 Quick Start

1. **Download** all project files
2. **Open** `index.html` in your browser
3. **Play**!

> ⚠️ Make sure all files are in the correct folders (see structure below)

---

## 📁 File Structure

```
interstellar/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── images/
│   │   ├── space.gif
│   │   ├── black_hole.gif
│   │   ├── normal_dammages.png
│   │   ├── bonus_dammages.png
│   │   └── [hero].png
│   └── sounds/
│       └── background_music.mp3
└── libs/
    └── particles.min.js
```

---

## 🎮 How to Play

1. **Click** on the black hole to earn Cosmic Energy (CE)
2. **Buy heroes** with your CE to generate energy automatically
3. **Reduce the black hole’s health** from 100% to 0% to win

### 7 Available Heroes

* **Robin** (100 CE) → Auto-clicker
* **Batman** (1,500 CE) → Boosts Robin
* **Spider-Man** (5,000 CE) → Auto-clicker
* **Iron Man** (20,000 CE) → Boosts Spider-Man
* **Bumblebee** (45,000 CE) → Auto-clicker
* **Optimus Prime** (90,000 CE) → Boosts Bumblebee
* **Thanos** (500,000 CE) → Powerful auto-clicker (unlocked in Phase 3)

### 3 Bonus Phases

| Phase       | Black Hole Health | Effect           |
| ----------- | ----------------- | ---------------- |
| **Phase 1** | 100% → 70%        | Production x1.5  |
| **Phase 2** | 70% → 40%         | 100 CE per click |
| **Phase 3** | 40% → 0%          | Thanos unlocked  |

---

## 🎯 Strategy

* **Early game**: Buy Robin and Batman quickly
* **Phase 2**: Click as much as possible (100 CE per click!)
* **Phase 3**: Unlock Thanos and finish the black hole
* **Tip**: Boosters multiply the production of heroes!

---

## ⚙️ Configuration

### Change starting energy

In `script.js`, around line ~13:

```javascript
cosmicEnergy: 100,  // Instead of 100000000
```

### Change click power

In `script.js`, around line ~17:

```javascript
manualClickPower: 10,  // Instead of 1
```

---

## 🐛 Common Issues

**The game won’t start?**

* Check that all files are in the correct locations
* Open the browser console (F12) to view errors

**Missing images?**

* Check the path: `assets/images/`
* File names must match exactly

**No music?**

* Make sure `background_music.mp3` is in `assets/sounds/`
* Enable music via the top-right menu

---

## 📝 License

Free project – Use and modify it however you like!

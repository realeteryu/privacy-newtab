<div align="center">
  <img src="assets/favicon.svg" width="128" height="128" alt="Privacy NewTab Logo">
  
  # Privacy NewTab
  
  **Minimalistyczna, w 100% prywatna strona startowa (New Tab).**

  [![License: MIT](https://img.shields.io/badge/License-MIT-f50056.svg)](https://opensource.org/licenses/MIT)
  [![Live Demo](https://img.shields.io/badge/Demo-newtab.eteryu.space-f50056)](https://newtab.eteryu.space)

</div>

Projekt open-source stworzony z myślą o pełnej prywatności i minimalizmie. Strona startowa inspirowana stylem wizualnym przeglądarki **RedApp** oraz funkcjonalnością **Hostux.page**.

## 🛡️ Filozofia "Distrust"

- **Zero logów** – żadne dane nie są wysyłane na serwer.
- **Zero analityki** – brak jakichkolwiek skryptów śledzących.
- **Zero backendu** – wszystko działa lokalnie w przeglądarce.
- **Zero zewnętrznych zależności** – brak frameworków CSS/JS, zewnętrznych czcionek czy bibliotek.

## ✨ Funkcje (MVP)

- **Ciemne, minimalistyczne tło** – możliwość ustawienia własnego obrazu z dysku (przechowywanego w `localStorage`).
- **Duży, wyraźny zegar i data** – z automatycznym wskaźnikiem popularnych świąt.
- **Pasek wyszukiwania** – umieszczony centralnie, pod zegarem.
- **Wybór wyszukiwarki** – rozwijana lista z prywatnymi wyszukiwarkami.
- **Powitanie i cytaty** – dynamiczny tekst powitalny dostosowany do pory dnia oraz losowy cytat o prywatności.
- **PWA Ready** – możliwość zainstalowania jako aplikacja/skrót na telefonie (dzięki manifestowi).
- **Responsywność** – działa zarówno na desktopie, jak i na urządzeniach mobilnych.

## 🔍 Wspierane wyszukiwarki

Projekt stawia na wolność wyboru i wspiera narzędzia dbające o prywatność:
- DuckDuckGo
- Startpage
- Brave Search
- Qwant
- **SearXNG (lab042)** – serdeczne podziękowania dla [@michal@101010.pl](https://101010.pl/@michal) za udostępnienie instancji!

## 🛠️ Technologie

- Czysty HTML5
- CSS3 (zmienne, flexbox, animacje)
- Vanilla JavaScript (ES6+)
- `localStorage` do zapisywania ustawień

## 📁 Struktura plików

```text
/
├── assets/
│   ├── icon-512.png          # Główna ikona (PWA)
│   ├── favicon.ico           # Ikona dla przeglądarek
│   ├── favicon.svg           # Wektorowa ikona dla nowoczesnych przeglądarek
│   ├── favicon-96x96.png     # Ikona PNG
│   └── apple-touch-icon.png  # Ikona dla urządzeń Apple
├── css/
│   └── style.css             # Arkusz stylów
├── js/
│   ├── data.js               # Statyczne dane (wyszukiwarki, cytaty, święta)
│   └── script.js             # Logika aplikacji
├── index.html                # Główny plik HTML
├── manifest.json             # Konfiguracja PWA
├── README.md                 # Ten plik
└── LICENSE                   # Licencja MIT
```

## 📄 Licencja

Ten projekt jest objęty licencją **MIT**. Szczegóły w pliku [LICENSE](LICENSE).

## 🙏 Inspiracje

- [RedApp](https://redapp.app/) – styl wizualny
- [Hostux.page](https://hostux.page/) – układ i funkcjonalność

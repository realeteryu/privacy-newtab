# Minimalistyczna, Prywatna Strona Startowa (New Tab)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Projekt open-source stworzony z myślą o pełnej prywatności i minimalizmie. Strona startowa (New Tab) inspirowana stylem wizualnym przeglądarki **RedApp** oraz funkcjonalnością **Hostux.page**.

## 🛡️ Filozofia "Distrust"

- **Zero logów** – żadne dane nie są wysyłane na serwer.
- **Zero analityki** – brak jakichkolwiek skryptów śledzących.
- **Zero backendu** – wszystko działa lokalnie w przeglądarce.
- **Zero zewnętrznych zależności** – brak frameworków CSS/JS, zewnętrznych czcionek czy bibliotek.

## ✨ Funkcje (MVP)

- **Ciemne, minimalistyczne tło** – możliwość ustawienia własnego obrazu z dysku (przechowywanego w `localStorage`).
- **Duży, wyraźny zegar i data** – z automatycznym wskaźnikiem popularnych świąt.
- **Pasek wyszukiwania** – umieszczony centralnie, pod zegarem.
- **Wybór wyszukiwarki** – rozwijana lista z prywatnymi wyszukiwarkami. Domyślnie ustawiona jest prywatna wyszukiwarka.
- **Powitanie i cytaty** – dynamiczny tekst powitalny oraz losowy cytat o prywatności.
- **Responsywność** – działa zarówno na desktopie, jak i na urządzeniach mobilnych.
- **Delikatne animacje** – płynne pojawianie się elementów.

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
├── assets/         # Zasoby graficzne (ikony, domyślne tła)
├── css/
│   └── style.css   # Arkusz stylów
├── js/
│   ├── data.js     # Statyczne dane (wyszukiwarki, cytaty, święta)
│   └── script.js   # Logika aplikacji
├── index.html      # Główny plik HTML
├── README.md       # Ten plik
└── LICENSE         # Licencja MIT
```

## 🔧 Konfiguracja

Wszystkie ustawienia (wybrana wyszukiwarka, tło) są zapisywane w `localStorage` przeglądarki. Nie są wysyłane nigdzie indziej.

## 📄 Licencja

Ten projekt jest objęty licencją **MIT**. Szczegóły w pliku [LICENSE](LICENSE).

## 🙏 Inspiracje

- [RedApp](https://redapp.app/) – styl wizualny
- [Hostux.page](https://hostux.page/) – układ i funkcjonalność

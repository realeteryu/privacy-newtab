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
- **Duży, wyraźny zegar i data** – aktualizowany co sekundę.
- **Pasek wyszukiwania** – umieszczony centralnie, pod zegarem.
- **Wybór wyszukiwarki** – rozwijana lista z prywatnymi wyszukiwarkami (DuckDuckGo, Startpage, Brave Search, Qwant). Domyślnie ustawiona jest prywatna wyszukiwarka.
- **Powitanie** – dynamiczny tekst w zależności od godziny (np. "Dzień dobry").
- **Responsywność** – działa zarówno na desktopie, jak i na urządzeniach mobilnych.
- **Delikatne animacje** – płynne pojawianie się elementów.

## 🚀 Instalacja i uruchomienie

Projekt jest w 100% statyczny. Aby go uruchomić lokalnie:

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/twoj-username/privacy-newtab.git
   ```
2. Otwórz plik `index.html` w przeglądarce.

### Wdrożenie na GitHub Pages

1. Wypchnij kod do repozytorium na GitHubie.
2. Przejdź do **Settings → Pages**.
3. W sekcji **Source** wybierz gałąź `main` (lub `master`) i folder `/ (root)`.
4. Zapisz. Strona będzie dostępna pod adresem `https://twoj-username.github.io/privacy-newtab/`.

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

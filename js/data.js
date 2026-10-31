/**
 * Plik z danymi statycznymi dla privacy-newtab.
 * Definiuje globalny obiekt APP_DATA, z którego korzysta script.js.
 */
const APP_DATA = {
    searchEngines: {
        duckduckgo: {
            name: 'DuckDuckGo',
            url: 'https://duckduckgo.com/?q=%s'
        },
        startpage: {
            name: 'Startpage',
            url: 'https://www.startpage.com/sp/search?query=%s'
        },
        brave: {
            name: 'Brave Search',
            url: 'https://search.brave.com/search?q=%s'
        },
        qwant: {
            name: 'Qwant',
            url: 'https://www.qwant.com/?q=%s'
        },
        searxng_lab042: {
            name: 'SearXNG (lab042)',
            url: 'https://search.lab042.it/search?q=%s'
        }
    },
    privacyQuotes: [
        "Prywatność to nie sekret. To kontrola nad tym, co chcesz udostępnić.",
        "Nie jesteś produktem.",
        "Brak logów to brak historii.",
        "Twoje dane należą do Ciebie.",
        "W sieci, jak w życiu: nie zostawiaj śladów, jeśli nie musisz.",
        "Prywatność to nie ukrywanie czegoś, to wolność od nadzoru.",
        "Zaufanie jest dobre, ale weryfikacja jest lepsza.",
        "Najbezpieczniejszy komputer to ten wyłączony, ale z niego nie skorzystasz."
    ],
    holidays: {
        "01-01": "Nowy Rok 🎉",
        "01-06": "Trzech Króli 👑",
        "02-14": "Walentynki ❤️",
        "03-08": "Dzień Kobiet 🌷",
        "04-01": "Prima Aprilis 🃏",
        "05-01": "Święto Pracy 🇵🇱",
        "05-03": "Święto Konstytucji 3 Maja 🇵🇱",
        "06-01": "Dzień Dziecka 🧸",
        "08-15": "Wniebowzięcie NMP 🌿",
        "10-31": "Halloween 🎃",
        "11-01": "Wszystkich Świętych 🕯️",
        "11-11": "Święto Niepodległości 🇵🇱",
        "12-24": "Wigilia 🎄",
        "12-25": "Boże Narodzenie 🎄",
        "12-26": "Drugi Dzień Świąt 🎁",
        "12-31": "Sylwester 🥂"
    }
};

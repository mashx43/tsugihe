# Tsugihe

Tsugihe is a browser extension that allows you to navigate to the next and previous pages of a website using keyboard shortcuts. It guesses the next/previous page by analyzing the URL, and you can also define custom rules for specific websites.

## Features

*   **Keyboard Shortcuts:** Navigate through paginated content without using the mouse.
*   **Site-Specific Navigation Strategies:** Choose and configure specific navigation strategies (All / Disabled / URL Pattern / DOM Parsing / URL Lookup) per domain.
*   **Customizable Rules:** Add custom URL patterns using regular expressions for websites that are not supported by default.
*   **Configurable Keys:** Set your preferred keys for "next" and "previous" navigation.
*   **Intelligent Discovery:** Automatically finds "Next" and "Prev" links from the page content, even if they aren't explicitly using `href` attributes (via DOM interaction).

## How to Use

1.  Install the extension.
2.  Navigate to a website with pagination (e.g., a news article, a search result, a comic).
3.  Use the default keyboard shortcuts (or your own if you've configured them) to move to the next or previous page.

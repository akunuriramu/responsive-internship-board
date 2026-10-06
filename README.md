# Responsive Internship Board

A responsive, accessible, and interactive student internship discovery board built for the **EdVyro Full Stack Development Internship (Task 2)**.

The application allows students to browse, search, and filter verified internship listings across multiple technical domains in real-time. It is built strictly using **semantic HTML5**, **modern CSS3**, and **Vanilla JavaScript** without relying on external UI frameworks or third-party libraries.

---

## Short Project Description

The **Responsive Internship Board** is a lightweight, high-performance web interface designed to help students discover relevant internship openings. The application dynamically loads internship records from a local JSON dataset (`internship-records.json`), provides immediate multi-criteria filtering (real-time search and domain selection), handles loading/empty/error states gracefully, and conforms to modern accessibility and responsive web design best practices across mobile, tablet, and desktop screens.

---

## Features

- **Dynamic Card Generation**: Reusable internship cards generated dynamically using Vanilla JavaScript from JSON records.
- **Full Internship Detail Presentation**:
  - Role title
  - Technical domain
  - Internship mode (Remote, Hybrid, On-site)
  - Geographic location
  - Number of openings
  - Required technical skills (presented as distinct visual tags)
  - Unique reference identifier (e.g., `INT-101`)
- **Real-Time Substring Search**:
  - Multi-attribute query matching across job title, domain, location, work mode, and individual technical skills.
  - Case-insensitive, instant feedback upon typing with quick-clear button.
- **Domain Filter Dropdown**:
  - Filter by `All Domains`, `Full Stack Development`, `UI/UX`, `Data Analytics`, and `Cyber Security`.
- **Combined Multi-Criteria Filtering**:
  - Text search and domain filter seamlessly operate together (logical AND operation).
- **One-Click Filter Reset**:
  - Dedicated "Reset Filters" action in the filter bar and inside the empty search state.
- **Comprehensive State Management**:
  - **Loading State**: Visual loading spinner and live status announcement during data fetch.
  - **Empty State**: Friendly graphic state with instructions and a quick-reset button when no records match filter criteria.
  - **Error State**: User-friendly notification with technical error details and a "Retry Loading" button if `internship-records.json` fails to load.
- **Live Search Statistics**:
  - Dynamic results counter showing exact matching count (e.g. `Showing 2 of 5 internships`) alongside active filter chips.

---

## Technologies Used

- **HTML5**:
  - Semantic tags (`<header>`, `<main>`, `<section>`, `<article>`, `<form>`, `<label>`, `<input>`, `<select>`, `<button>`).
  - Native form controls with accessible labeling.
  - ARIA attributes (`role="status"`, `role="alert"`, `aria-live="polite"`, `aria-labelledby`) where appropriate.
- **CSS3 (Vanilla)**:
  - CSS Custom Properties (Design tokens for color palettes, spacing, shadows, and typography).
  - Modern CSS Grid and Flexbox layouts.
  - Card hover micro-interactions (`transform`, `box-shadow`).
  - High-contrast `:focus-visible` states for keyboard navigability.
  - Zero dependencies or CSS frameworks (no Bootstrap, Tailwind, etc.).
- **Vanilla JavaScript (ES6+)**:
  - Asynchronous `fetch()` API for reading `internship-records.json`.
  - DOM manipulation and dynamic template literals with HTML escaping.
  - Modular event handlers for input, select change, reset, and retry actions.
  - Zero JavaScript libraries or frameworks (no React, Vue, Angular, jQuery).

---

## How the Project Works

```
+-----------------------------------------------------------+
|                   internship-records.json                 |
+-----------------------------+-----------------------------+
                              | (fetch API via script.js)
                              v
+-----------------------------------------------------------+
|                   Application State                       |
|   - internships: Array of loaded records                  |
|   - filters: { searchTerm: "", domain: "all" }            |
|   - status: isLoading | hasError | isReady                |
+-----------------------------+-----------------------------+
                              |
                              +---> Filter Evaluation (search + domain)
                              |
                              v
+-----------------------------------------------------------+
|                     DOM Rendering                         |
|   - cards-grid: Renders <article class="internship-card"> |
|   - empty-state: Displayed if filtered matches === 0      |
|   - error-state: Displayed if fetch() fails               |
|   - results-count: Live ARIA-polite updates               |
+-----------------------------------------------------------+
```

1. **Initialization (`init`)**: When the DOM content finishes loading, `script.js` attaches listeners to user controls and triggers `loadInternships()`.
2. **Data Fetching (`loadInternships`)**: The client issues an asynchronous `fetch('internship-records.json')` request. If successful, data is committed to memory; if an error occurs (such as a missing file or network disconnection), the error state is displayed with a retry button.
3. **Filtering (`getFilteredInternships`)**:
   - Compares the `domain` select option against each item's `domain` field (or allows all when set to `"all"`).
   - Normalizes the search string and checks if it is contained within `title`, `domain`, `location`, `mode`, or any item in the `skills` array.
4. **Rendering (`renderUI`)**:
   - Generates sanitized card markup using `createCardHTML()` and injects it into `#internships-grid`.
   - If zero items match, toggles the visibility of the `#empty-state` container.
   - Updates the live results text and active filter badges.

---

## Accessibility Considerations

- **Skip Navigation Link**: A `.skip-link` element at the top of the document enables keyboard users to bypass header elements and jump straight to main content.
- **Accessible Form Controls**: Every interactive input and select dropdown has an associated `<label for="...">`.
- **Keyboard Navigation & Visible Focus**:
  - All interactive controls (`<input>`, `<select>`, `<button>`, and cards) have custom `:focus-visible` outline rings with clear contrast.
  - Cards can be focused via keyboard (`tabindex="0"`).
- **ARIA Live Regions**:
  - Results counter uses `role="status"` and `aria-live="polite"` so screen readers announce changes in result count without interrupting user speech.
  - Error container uses `role="alert"` for critical notifications.
- **Color Contrast & Typography**:
  - Strict compliance with WCAG 2.1 AA contrast ratios for body text, badges, and actionable buttons against their respective backgrounds.
  - System font stack fallback for fast initial paint and legibility.
- **Screen Reader Utilities**:
  - Utility `.sr-only` class used to provide descriptive headings for sections without visual clutter.

---

## Responsive Testing Section

The user interface was crafted with a mobile-first philosophy using modern CSS Grid and Flexbox, tested and optimized across three primary viewports:

| Viewport Category | Screen Width Range | Layout Behavior & Design Adjustments |
| :--- | :--- | :--- |
| **Mobile** | **~360px – 480px** | - Single-column vertical layout for filter controls and card grid.<br>- Touch targets scaled to at least 44x44px for comfortable tapping.<br>- Compact header padding and condensed typography for small mobile viewports.<br>- Horizontal skill pills wrap cleanly without horizontal scrolling. |
| **Tablet** | **~768px – 1023px** | - 2-column layout for search and domain filters.<br>- Filter actions button spans full row or fits alongside inputs.<br>- 2-column card grid (`repeat(auto-fill, minmax(290px, 1fr))`).<br>- Generous spacing and balanced card proportions. |
| **Desktop** | **1024px and wider** | - 3-column inline filter toolbar (`Search | Domain | Reset`).<br>- Multi-column card grid (`repeat(auto-fill, minmax(330px, 1fr))`) capped at `1200px` max-width.<br>- Smooth hover elevations (`translateY(-3px)` + soft drop shadows). |

---

## How to Run Locally

Since modern web browsers enforce CORS (Cross-Origin Resource Sharing) restrictions when fetching local JSON files via the `file://` protocol, `internship-records.json` must be served via a local HTTP server.

### Option 1: Using Python 3 (Recommended)
Open your terminal or command prompt in this project folder and run:
```bash
python -m http.server 8000
```
Then visit [http://localhost:8000](http://localhost:8000) in your web browser.

### Option 2: Using Node.js `npx serve` or `http-server`
If you have Node.js installed:
```bash
npx serve .
```
or:
```bash
npx http-server . -p 8000
```
Then open the displayed local URL in your browser.

### Option 3: Using VS Code Live Server
1. Open the project folder in VS Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click on `index.html` and click **"Open with Live Server"**.

---

## Project Structure

```
internship-board/
├── index.html               # Semantic HTML5 layout and accessibility markup
├── style.css                # Pure CSS3 design system, responsive grid & tokens
├── script.js                # Vanilla JavaScript state management, search & rendering
├── internship-records.json  # Internship dataset (ONLY data source)
└── README.md                # Project documentation and specifications
```

---

## Verification & Validation Checklist

- [x] Semantic HTML5 elements used (`header`, `main`, `section`, `form`, `label`, `input`, `select`, `button`, `article`)
- [x] Zero external frameworks (No React, Vue, Angular, Bootstrap, Tailwind)
- [x] Data loaded exclusively from `internship-records.json`
- [x] Reusable internship cards generated dynamically
- [x] Displays title, domain, mode, location, skills, and number of openings
- [x] Real-time substring search by title, domain, location, mode, and skills
- [x] Domain filter dropdown with all required options
- [x] Combined search and domain filtering (AND logic)
- [x] Filter reset/clear option
- [x] Empty state when no internships match
- [x] Error state with retry option when JSON fails to load
- [x] Full keyboard navigation and visible focus rings
- [x] Responsive on mobile (~360px), tablet (~768px), and desktop
- [x] Clean separation of HTML, CSS, and JavaScript

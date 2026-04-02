# Functional Specification - Up Down River Score

## 1. Goal

Build a **mobile web** application to track scores for **Up Down River** card game matches (trick-taking variant), focused exclusively on simplifying hand registration and automatic scoring.

The application **does not simulate gameplay**, does not deal cards, and does not track trick-by-trick play. Its purpose is to act as a **scorekeeper** during a real in-person match, operated by a single person on a mobile device.

---

## 2. Current MVP scope

The current version allows users to:

- create a new game
- enter between 3 and 7 players
- choose the UI language (**Spanish** or **English**) from the home screen
- choose a global font size option (**normal**, **large**, **extra large**)
- keep **English as the default language** when the app opens
- choose the rule applied to a missed zero bid
- define which player starts as dealer
- automatically progress through the full hand sequence
- show who is dealing on each hand
- enter the declared tricks for each player
- mark whether each player hit their bid or not
- automatically calculate the score for each hand
- keep an accumulated total for each player
- show hand results and final ranking
- review the full match history
- restart the app and begin a brand-new match at any time
- persist the in-progress match locally
- show a persistent copyright footer
- show the current version number in the footer
- allow reopening the most recently closed hand to correct it

The current version **does not include**:

- online multiplayer
- login or user accounts
- device synchronization
- backend services
- store publication
- game simulation
- card-by-card or trick-by-trick play management
- editing previously closed hands

---

## 3. Target platform

- **type:** mobile web
- **initial use:** mobile browser and desktop browser
- **operation:** a single person records and manages the match
- **persistence:** browser local storage (`localStorage`)
- **possible future evolution:** installable PWA

---

## 4. Game rules supported

### 4.1 Number of players

- minimum: **3 players**
- maximum: **7 players**

### 4.2 Hand sequence

The match follows this fixed sequence of dealt cards per hand:

**7, 6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6, 7**

Total number of hands:
- **14 hands**

### 4.3 Base scoring rule

For each player in a hand:

#### If the player declared a number greater than 0 and hits it

- they score **10 + declared tricks**

Examples:
- if the player declared 3 and hits it: **13 points**
- if the player declared 1 and hits it: **11 points**

#### If the player declared a number greater than 0 and misses

- they score **0**

#### If the player declared 0 and hits it

- they score **10 + number of cards dealt in that hand**

Examples:
- hand with 7 cards: **17 points**
- hand with 4 cards: **14 points**
- hand with 1 card: **11 points**

### 4.4 Configurable missed zero rule

When starting the game, the user can choose one of these options:

#### Option A
**Missed zero subtracts 10 points**
- if the player declared `0` and missed:
  - points = `-10`

#### Option B
**Missed zero gives no points**
- if the player declared `0` and missed:
  - points = `0`

### 4.5 Formula summary

Given:
- `handCards`
- `declared`
- `hit`
- `zeroMissRule`

Rules:

- if `hit = true` and `declared > 0` → points = `10 + declared`
- if `hit = true` and `declared = 0` → points = `10 + handCards`
- if `hit = false` and `declared > 0` → points = `0`
- if `hit = false` and `declared = 0`:
  - if `zeroMissRule = "minus10"` → points = `-10`
  - if `zeroMissRule = "zero"` → points = `0`

---

## 5. UI functional goal

The app must minimize friction while entering each hand.

By design, the hand screen **does not require entering how many tricks the player actually won**. It only records:

- how many tricks the player declared
- whether they hit the bid or not

That is enough to calculate the score for the chosen variant.

This significantly simplifies real-world usage during play.

---

## 6. General usage flow

### 6.1 Home screen
The user:
- opens the app
- sees the home screen
- can choose the language (**Español** or **English**)
- can choose the font size (**normal**, **large**, **extra large**)
- can start a new game
- if there is an in-progress game, can continue it or discard it and start from scratch

### 6.2 Create game
The user:
- enters player names
- defines the missed zero rule
- chooses which player starts dealing
- starts the match

### 6.3 Enter hand
For each hand:
- the app shows how many cards are dealt in that hand
- the app shows which player is dealing that hand
- the user enters how many tricks each player declared
- the user marks whether the player hit the bid or not
- the user presses **Close hand**

### 6.4 Calculate result
When closing the hand:
- the app calculates each player’s score according to the selected rules
- updates accumulated totals
- stores the hand in history
- shows the hand result
- allows moving to the next hand
- allows going back and reopening the just-closed hand to correct data

### 6.5 End match
After hand 14:
- the app shows the final ranking
- allows reviewing history
- allows starting a new game
- allows replaying with the same players

---

## 7. Functional screens

## 7.1 Home screen

### Goal
Entry point to the application.

### Content
- app name
- language selector
- global font size selector
- **New game** button
- if a saved game exists:
  - button to continue current game
  - button to start fresh from zero

### Behavior
- the default language on load is **English**
- the user can switch to Spanish manually

---

## 7.2 New game screen

### Goal
Configure a new match.

### Fields
- implicit number of players based on entered players
- player names
- missed zero rule option
- selector for the player who starts dealing

### Configurable missed zero rule
There must be a clear control to choose one of these options:

- **Missed zero subtracts 10 points**
- **Missed zero gives no points**

### Initial dealer
There must be a selector to define:
- which player starts dealing on the first hand

### Rules
- no fewer than 3 players
- no more than 7 players
- all players must have names
- a missed zero rule must be selected
- an initial dealer must be selected

### Main action
- **Start game** button

---

## 7.3 Current hand screen

### Goal
Enter the minimum hand information as quickly as possible.

### Fixed information shown
- hand number
- total number of hands
- number of cards dealt in this hand
- progress indicator
- current missed zero rule
- player dealing this hand

Example:
- **Hand 3 / 14**
- **5 cards dealt**
- **Dealer: Luis**

### Per-player information
Each player is shown in a card or row with:

- player name
- current total
- numeric field: **Declared tricks**
- state control: **Hit / Missed**, positioned to the right of the numeric field, without dropping below it, to keep the list more compact and tidy

### Per-player interaction

#### Declared field
- numeric input
- required
- minimum value: `0`
- maximum value: number of cards in the current hand

#### Hit state
- simple visual control
- implemented as a toggle button
- off = missed
- on = hit

### Main action on this screen
- large bottom button: **Close hand**

### Secondary action
- button to start a brand-new game from zero without finishing the current one

### Behavior when closing hand
- validate data
- calculate scores
- store results
- update totals
- show the hand result

---

## 7.4 Hand result screen

### Goal
Show the summary of the hand that was just closed.

### Information per player
- name
- declared value
- hit/miss status
- points earned in the hand
- accumulated total

### Context information
- hand number
- hand card count
- player who dealt that hand

### Visual recommendation
- green for positive score
- red for negative score
- neutral for zero

### Main actions
- **Next hand** button
- **See history** button
- **Back** button to reopen the just-closed hand and correct it
- button to start a new game from zero

If it was the last hand:
- **See final result** button

---

## 7.5 Final result screen

### Goal
Show the end of the match.

### Information
- final ranking
- player name
- total score

### Possible actions
- **New game**
- **Play again with same players**
- **See full history**

---

## 7.6 Match history screen

### Goal
Allow reviewing the full recorded match.

### Expected content
For each hand:
- hand number
- cards dealt
- dealer name
- per-player results:
  - declared
  - hit or missed
  - hand points
  - total after that hand

### Note
For the MVP, history is still read-only for older hands, but the most recently closed hand can be reopened immediately from the result screen to correct mistakes.

### Additional action
- option to start a new game from zero

---

## 8. Functional validations

### 8.1 Validations when creating a game
- number of players between 3 and 7
- all names required
- names must be unique
- a missed zero rule must be selected
- an initial dealer must be selected
- do not allow starting if required data is missing

### 8.2 Validations when closing a hand
For each player:
- declared value is required
- declared must be an integer
- declared must be between `0` and `handCards`
- hit/miss state must be defined

### 8.3 Error behavior
If data is missing or invalid:
- do not close the hand
- show a clear message
- keep the current input intact so it can be corrected without losing information

---

## 9. User experience requirements

The app is used during a real match, on a phone, with a need for speed.

Therefore the UX must prioritize:

- few taps
- large inputs
- good readability
- simple navigation
- fast per-hand entry
- clear and visible buttons
- automatic local persistence
- an easy way to restart from zero

### Concrete recommendations
- **mobile-first** layout
- cards per player for better touch handling
- accessible **Close hand** button
- always-visible totals where useful
- immediate color feedback
- simple language switcher on home screen
- global font size selector on the home screen
- the font size change must also affect the main numeric trick input
- persistent footer with copyright and visible version

---

## 10. Suggested data model

## 10.1 Game entity
Suggested fields:
- `id`
- `createdAt`
- `players[]`
- `currentHandIndex`
- `sequence[]`
- `zeroMissRule`
- `firstDealerId`
- `hands[]`
- `status`
- `currentInputs`

## 10.2 Player entity
Suggested fields:
- `id`
- `name`
- `total`

## 10.3 Hand entity
Suggested fields:
- `number`
- `handCards`
- `dealerName`
- `results[]`

## 10.4 Per-player hand result entity
Suggested fields:
- `playerId`
- `playerName`
- `declared`
- `hit`
- `points`
- `totalAfterHand`

## 10.5 Persisted application state
Suggested fields:
- `screen`
- `setup`
- `match`
- `lastHandResult`
- `language`

---

## 11. Implemented technical architecture for MVP

### Stack
- **React**
- **Vite**
- **mobile-first CSS**

### Persistence
- `localStorage`

### Backend
- not required

### Build
- `npm run build`

### Local development
- `npm run dev`
- for testing on phone within the local network: `npm run dev -- --host`

---

## 12. Features included in the current version

- new game
- 3 to 7 players
- configurable missed zero rule
- initial dealer selection
- automatic dealer rotation by hand
- fixed 14-hand sequence
- per-hand entry of declared bid and hit/miss state
- automatic scoring
- accumulated totals
- hand result screen
- per-hand history
- final ranking
- Spanish / English language selector
- global font size selector (normal, large, extra large)
- English as default language
- automatic local persistence
- ability to start a fresh game from zero at any time
- persistent footer with text:
  - **Copyright: Morales-Wise-Picone Team**
  - **Version 2.2**

---

## 13. Current publication

The app is ready to be published as a static site.

### Suggested and used platform
- **Vercel**

### Expected deployment configuration
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Deployment source
- GitHub repository: `luispicone/updownriver-score`
- main branch: `main`

### Deployment behavior
- every `push` to `main` can trigger an automatic redeploy in Vercel
- if it does not happen automatically, it can be manually relaunched from the project’s **Deployments** section in Vercel

---

## 14. Acceptance criteria for the current version

The current version is considered correct if it allows:

1. creating a game with 3 to 7 players
2. choosing the language from the home screen
3. starting in English by default
4. choosing the missed zero rule when creating the game
5. choosing the player who starts dealing
6. automatically going through the 14-hand sequence
7. showing the dealer on every hand
8. entering a declared value and hit/miss status for each player
9. calculating scores correctly according to the selected rule set
10. maintaining accumulated totals per player
11. showing each hand result
12. showing the full match history
13. showing the final ranking at the end
14. allowing a fresh restart from zero at any time
15. working correctly in mobile and desktop browsers
16. being deployable on Vercel
17. allowing font size changes for accessibility
18. showing the current version in the footer
19. allowing the most recently closed hand to be reopened immediately for correction

---

## 15. Executive summary

A low-to-medium complexity **mobile web** app was defined and developed to solve a real use-case: keeping score for Up Down River quickly and simply.

The most important functional decisions in this version are:
- only recording each player’s declared bid and whether they hit it or not
- allowing a configurable missed zero rule
- allowing selection of the starting dealer and rotating the dealer automatically
- allowing the app to restart from zero at any time
- supporting both Spanish and English
- using English as the default language
- enabling easy free deployment through Vercel

The result is a functional, publishable MVP ready for further iteration. The currently documented version is **2.2**.

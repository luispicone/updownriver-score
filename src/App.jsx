import { useEffect, useMemo, useState } from 'react'
import './App.css'

const HAND_SEQUENCE = [7, 6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6, 7]
const STORAGE_KEY = 'updownriver-score-state'
const APP_VERSION = '2.2'

const translations = {
  es: {
    appTag: 'Scorekeeper mobile',
    appTitle: 'Up Down River Score',
    history: 'Historial',
    controlFromPhone: 'Controlá toda la partida desde el celular',
    homeDescription:
      'Creá una partida, cargá lo que dijo cada jugador, marcá si acertó y dejá que la app calcule el puntaje automáticamente.',
    newGame: 'Nueva partida',
    continueCurrentGame: 'Continuar partida actual',
    startFreshGame: 'Empezar nueva desde cero',
    languageLabel: 'Idioma',
    spanish: 'Español',
    english: 'Inglés',
    fontSizeLabel: 'Tamaño de fuente',
    fontNormal: 'Normal',
    fontLarge: 'Grande',
    fontExtraLarge: 'Extra grande',
    setupTag: 'Nueva partida',
    setupTitle: 'Configuración inicial',
    playersCount: 'jugadores',
    playersLabel: 'Jugadores',
    playerPlaceholder: 'Jugador',
    addPlayer: 'Agregar jugador',
    zeroMissRuleLabel: 'Regla para cero fallado',
    zeroMissMinus10Title: 'Resta 10 puntos',
    zeroMissMinus10Description: 'Si dijo 0 y no acertó, pierde 10 puntos.',
    zeroMissZeroTitle: 'No suma puntos',
    zeroMissZeroDescription: 'Si dijo 0 y no acertó, no gana ni pierde puntos.',
    firstDealerLabel: 'Jugador que comienza dando cartas',
    selectPlayer: 'Seleccionar jugador',
    back: 'Volver',
    startGame: 'Comenzar partida',
    handOf: 'Mano',
    cardsDealt: 'cartas repartidas',
    zeroMissBadge: 'Cero fallado',
    currentTotal: 'Total actual',
    declaredTricks: 'Bazas que dijo',
    hit: 'Acertó',
    miss: 'No acertó',
    closeHand: 'Cerrar mano',
    handResultTag: 'Resultado de la mano',
    declared: 'Dijo',
    total: 'Total',
    seeHistory: 'Ver historial',
    nextHand: 'Siguiente mano',
    seeFinalResult: 'Ver resultado final',
    finishedGameTag: 'Partida finalizada',
    finalRanking: 'Ranking final',
    points: 'puntos',
    repeatWithSamePlayers: 'Repetir con mismos jugadores',
    fullHistory: 'Ver historial completo',
    gameHistoryTag: 'Historial',
    gameHistoryTitle: 'Detalle de la partida',
    failed: 'Falló',
    dealBy: 'Reparte',
    round: 'Ronda',
    currentDealer: 'Reparte',
    playersCountError: 'La partida debe tener entre 3 y 7 jugadores.',
    playersNameError: 'Todos los jugadores deben tener nombre.',
    uniqueNamesError: 'Los nombres de jugadores deben ser únicos.',
    missingDeclaredError: 'Falta cargar cuánto dijo',
    integerDeclaredError: 'debe tener un número entero.',
    rangeDeclaredError: 'debe tener un valor entre',
    firstDealerError: 'Debés indicar quién comienza dando cartas.',
    versionLabel: 'Versión',
    copyrightLabel: 'Copyright: Morales-Wise-Picone Team',
  },
  en: {
    appTag: 'Mobile scorekeeper',
    appTitle: 'Up Down River Score',
    history: 'History',
    controlFromPhone: 'Run the whole match from your phone',
    homeDescription:
      'Create a match, enter each player’s bid, mark whether they hit it, and let the app calculate the score automatically.',
    newGame: 'New game',
    continueCurrentGame: 'Continue current game',
    startFreshGame: 'Start fresh game',
    languageLabel: 'Language',
    spanish: 'Spanish',
    english: 'English',
    fontSizeLabel: 'Font size',
    fontNormal: 'Normal',
    fontLarge: 'Large',
    fontExtraLarge: 'Extra large',
    setupTag: 'New game',
    setupTitle: 'Initial setup',
    playersCount: 'players',
    playersLabel: 'Players',
    playerPlaceholder: 'Player',
    addPlayer: 'Add player',
    zeroMissRuleLabel: 'Missed zero rule',
    zeroMissMinus10Title: 'Subtract 10 points',
    zeroMissMinus10Description: 'If a player says 0 and misses, they lose 10 points.',
    zeroMissZeroTitle: 'No points awarded',
    zeroMissZeroDescription: 'If a player says 0 and misses, they gain no points.',
    firstDealerLabel: 'Player who starts dealing',
    selectPlayer: 'Select player',
    back: 'Back',
    startGame: 'Start game',
    handOf: 'Hand',
    cardsDealt: 'cards dealt',
    zeroMissBadge: 'Missed zero',
    currentTotal: 'Current total',
    declaredTricks: 'Declared tricks',
    hit: 'Hit',
    miss: 'Missed',
    closeHand: 'Close hand',
    handResultTag: 'Hand result',
    declared: 'Declared',
    total: 'Total',
    seeHistory: 'See history',
    nextHand: 'Next hand',
    seeFinalResult: 'See final result',
    finishedGameTag: 'Game finished',
    finalRanking: 'Final ranking',
    points: 'points',
    repeatWithSamePlayers: 'Play again with same players',
    fullHistory: 'See full history',
    gameHistoryTag: 'History',
    gameHistoryTitle: 'Match details',
    failed: 'Missed',
    dealBy: 'Dealer',
    round: 'Round',
    currentDealer: 'Dealer',
    playersCountError: 'The match must have between 3 and 7 players.',
    playersNameError: 'All players must have a name.',
    uniqueNamesError: 'Player names must be unique.',
    missingDeclaredError: 'Missing declared tricks for',
    integerDeclaredError: 'must have an integer number.',
    rangeDeclaredError: 'must have a value between',
    firstDealerError: 'You must choose the first dealer.',
    versionLabel: 'Version',
    copyrightLabel: 'Copyright: Morales-Wise-Picone Team',
  },
}

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const createEmptyPlayer = () => ({ id: createId(), name: '' })

const initialSetupState = {
  players: [createEmptyPlayer(), createEmptyPlayer(), createEmptyPlayer()],
  zeroMissRule: 'minus10',
  firstDealerId: '',
}

function calculatePoints({ declared, hit, handCards, zeroMissRule }) {
  if (hit) {
    if (declared === 0) return 10 + handCards
    return 10 + declared
  }
  if (declared === 0) return zeroMissRule === 'minus10' ? -10 : 0
  return 0
}

function rankPlayers(players) {
  return [...players].sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total
    return a.name.localeCompare(b.name, 'es')
  })
}

function buildMatch(players, zeroMissRule, firstDealerId) {
  const sanitizedPlayers = players.map((player) => ({
    id: player.id,
    name: player.name.trim(),
    total: 0,
  }))

  const handInputs = Object.fromEntries(
    sanitizedPlayers.map((player) => [
      player.id,
      {
        declared: '',
        hit: false,
      },
    ]),
  )

  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    zeroMissRule,
    sequence: HAND_SEQUENCE,
    currentHandIndex: 0,
    firstDealerId,
    players: sanitizedPlayers,
    hands: [],
    status: 'playing',
    currentInputs: handInputs,
  }
}

function getStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getDealerForHand(match) {
  if (!match?.players?.length || !match.firstDealerId) return null
  const firstIndex = match.players.findIndex((player) => player.id === match.firstDealerId)
  if (firstIndex === -1) return null
  const dealerIndex = (firstIndex + match.currentHandIndex) % match.players.length
  return match.players[dealerIndex]
}

function App() {
  const [screen, setScreen] = useState('home')
  const [setup, setSetup] = useState(initialSetupState)
  const [match, setMatch] = useState(null)
  const [lastHandResult, setLastHandResult] = useState(null)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('en')
  const [fontScale, setFontScale] = useState('normal')

  const t = translations[language]

  useEffect(() => {
    const stored = getStoredState()
    if (!stored) return

    setScreen(stored.screen ?? 'home')
    setSetup(stored.setup ?? initialSetupState)
    setMatch(stored.match ?? null)
    setLastHandResult(stored.lastHandResult ?? null)
    setLanguage(stored.language ?? 'en')
    setFontScale(stored.fontScale ?? 'normal')
  }, [])

  useEffect(() => {
    const payload = JSON.stringify({
      screen,
      setup,
      match,
      lastHandResult,
      language,
      fontScale,
    })
    localStorage.setItem(STORAGE_KEY, payload)
  }, [screen, setup, match, lastHandResult, language, fontScale])

  const currentHandCards = match ? match.sequence[match.currentHandIndex] : null
  const ranking = useMemo(() => (match ? rankPlayers(match.players) : []), [match])
  const currentDealer = useMemo(() => getDealerForHand(match), [match])

  const addPlayerField = () => {
    if (setup.players.length >= 7) return
    const newPlayer = createEmptyPlayer()
    setSetup((current) => ({
      ...current,
      players: [...current.players, newPlayer],
      firstDealerId: current.firstDealerId || newPlayer.id,
    }))
  }

  const removePlayerField = (playerId) => {
    if (setup.players.length <= 3) return
    setSetup((current) => {
      const remainingPlayers = current.players.filter((player) => player.id !== playerId)
      return {
        ...current,
        players: remainingPlayers,
        firstDealerId:
          current.firstDealerId === playerId ? remainingPlayers[0]?.id ?? '' : current.firstDealerId,
      }
    })
  }

  const updatePlayerName = (playerId, value) => {
    setSetup((current) => ({
      ...current,
      players: current.players.map((player) =>
        player.id === playerId ? { ...player, name: value } : player,
      ),
      firstDealerId: current.firstDealerId || playerId,
    }))
  }

  const startMatch = () => {
    const trimmedPlayers = setup.players.map((player) => ({
      ...player,
      name: player.name.trim(),
    }))

    if (trimmedPlayers.length < 3 || trimmedPlayers.length > 7) {
      setError(t.playersCountError)
      return
    }

    if (trimmedPlayers.some((player) => !player.name)) {
      setError(t.playersNameError)
      return
    }

    const uniqueNames = new Set(trimmedPlayers.map((player) => player.name.toLowerCase()))
    if (uniqueNames.size !== trimmedPlayers.length) {
      setError(t.uniqueNamesError)
      return
    }

    if (!setup.firstDealerId) {
      setError(t.firstDealerError)
      return
    }

    const newMatch = buildMatch(trimmedPlayers, setup.zeroMissRule, setup.firstDealerId)
    setMatch(newMatch)
    setLastHandResult(null)
    setError('')
    setScreen('hand')
  }

  const updateHandInput = (playerId, field, value) => {
    setMatch((current) => {
      if (!current) return current
      return {
        ...current,
        currentInputs: {
          ...current.currentInputs,
          [playerId]: {
            ...current.currentInputs[playerId],
            [field]: value,
          },
        },
      }
    })
  }

  const closeHand = () => {
    if (!match) return

    const validationError = match.players
      .map((player) => {
        const input = match.currentInputs[player.id]
        const declaredValue = Number(input.declared)
        if (input.declared === '') {
          return `${t.missingDeclaredError} ${player.name}.`
        }
        if (!Number.isInteger(declaredValue)) {
          return `${player.name} ${t.integerDeclaredError}`
        }
        if (declaredValue < 0 || declaredValue > currentHandCards) {
          return `${player.name} ${t.rangeDeclaredError} 0 y ${currentHandCards}.`
        }
        return null
      })
      .find(Boolean)

    if (validationError) {
      setError(validationError)
      return
    }

    const updatedPlayers = match.players.map((player) => {
      const input = match.currentInputs[player.id]
      const declared = Number(input.declared)
      const points = calculatePoints({
        declared,
        hit: input.hit,
        handCards: currentHandCards,
        zeroMissRule: match.zeroMissRule,
      })

      return {
        ...player,
        total: player.total + points,
      }
    })

    const playerMap = new Map(updatedPlayers.map((player) => [player.id, player]))
    const dealer = getDealerForHand(match)

    const handResult = {
      number: match.currentHandIndex + 1,
      handCards: currentHandCards,
      dealerName: dealer?.name ?? '',
      results: match.players.map((player) => {
        const input = match.currentInputs[player.id]
        const declared = Number(input.declared)
        const points = calculatePoints({
          declared,
          hit: input.hit,
          handCards: currentHandCards,
          zeroMissRule: match.zeroMissRule,
        })

        return {
          playerId: player.id,
          playerName: player.name,
          declared,
          hit: input.hit,
          points,
          totalAfterHand: playerMap.get(player.id)?.total ?? player.total,
        }
      }),
    }

    const nextHandIndex = match.currentHandIndex + 1
    const finished = nextHandIndex >= match.sequence.length

    const nextInputs = Object.fromEntries(
      updatedPlayers.map((player) => [
        player.id,
        {
          declared: '',
          hit: false,
        },
      ]),
    )

    setMatch({
      ...match,
      players: updatedPlayers,
      hands: [...match.hands, handResult],
      currentHandIndex: nextHandIndex,
      currentInputs: nextInputs,
      status: finished ? 'finished' : 'playing',
    })

    setLastHandResult(handResult)
    setError('')
    setScreen('hand-result')
  }

  const goToNextStep = () => {
    if (!match) return
    if (match.status === 'finished') {
      setScreen('final')
      return
    }
    setScreen('hand')
  }


  const reopenLastHand = () => {
    if (!match || !lastHandResult) return

    const previousHandIndex = Math.max(match.currentHandIndex - 1, 0)
    const previousPlayers = match.players.map((player) => {
      const result = lastHandResult.results.find((item) => item.playerId === player.id)
      return {
        ...player,
        total: result ? player.total - result.points : player.total,
      }
    })

    const restoredInputs = Object.fromEntries(
      lastHandResult.results.map((result) => [
        result.playerId,
        {
          declared: String(result.declared),
          hit: result.hit,
        },
      ]),
    )

    setMatch({
      ...match,
      players: previousPlayers,
      hands: match.hands.slice(0, -1),
      currentHandIndex: previousHandIndex,
      currentInputs: restoredInputs,
      status: 'playing',
    })

    setLastHandResult(null)
    setError('')
    setScreen('hand')
  }

  const resetAll = () => {
    setSetup(initialSetupState)
    setMatch(null)
    setLastHandResult(null)
    setError('')
    setScreen('home')
  }

  const restartWithSamePlayers = () => {
    if (!match) return
    const players = match.players.map((player) => ({ id: createId(), name: player.name }))
    const firstDealerId = players[0]?.id ?? ''
    setSetup({
      players,
      zeroMissRule: match.zeroMissRule,
      firstDealerId,
    })
    const restartedMatch = buildMatch(players, match.zeroMissRule, firstDealerId)
    setMatch(restartedMatch)
    setLastHandResult(null)
    setError('')
    setScreen('hand')
  }

  return (
    <div className={`app-shell font-${fontScale}`}>
      <header className="topbar">
        <div>
          <p className="eyebrow">{t.appTag}</p>
          <h1>{t.appTitle}</h1>
        </div>
        <div className="topbar-actions">
          {match ? (
            <button type="button" className="ghost-button compact-button" onClick={() => setScreen('history')}>
              {t.history}
            </button>
          ) : null}
        </div>
      </header>

      <section className="panel preferences-panel">
        <div className="preference-group">
          <span>{t.languageLabel}</span>
          <div className="segmented-control">
            <button
              type="button"
              className={language === 'es' ? 'active' : ''}
              onClick={() => setLanguage('es')}
            >
              {t.spanish}
            </button>
            <button
              type="button"
              className={language === 'en' ? 'active' : ''}
              onClick={() => setLanguage('en')}
            >
              {t.english}
            </button>
          </div>
        </div>
        <div className="preference-group">
          <span>{t.fontSizeLabel}</span>
          <div className="segmented-control segmented-control-3">
            <button
              type="button"
              className={fontScale === 'normal' ? 'active' : ''}
              onClick={() => setFontScale('normal')}
            >
              {t.fontNormal}
            </button>
            <button
              type="button"
              className={fontScale === 'large' ? 'active' : ''}
              onClick={() => setFontScale('large')}
            >
              {t.fontLarge}
            </button>
            <button
              type="button"
              className={fontScale === 'xlarge' ? 'active' : ''}
              onClick={() => setFontScale('xlarge')}
            >
              {t.fontExtraLarge}
            </button>
          </div>
        </div>
      </section>

      {error ? <div className="alert-error">{error}</div> : null}

      {screen === 'home' && (
        <section className="panel hero-panel">
          <h2>{t.controlFromPhone}</h2>
          <p>{t.homeDescription}</p>
          <button type="button" className="primary-button" onClick={() => setScreen('setup')}>
            {t.newGame}
          </button>
          {match ? (
            <>
              <button type="button" className="secondary-button" onClick={() => setScreen('hand')}>
                {t.continueCurrentGame}
              </button>
              <button type="button" className="ghost-button" onClick={resetAll}>
                {t.startFreshGame}
              </button>
            </>
          ) : null}
        </section>
      )}

      {screen === 'setup' && (
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">{t.setupTag}</p>
              <h2>{t.setupTitle}</h2>
            </div>
            <span className="badge">{setup.players.length} {t.playersCount}</span>
          </div>

          <div className="form-block">
            <label className="field-label">{t.playersLabel}</label>
            <div className="players-list">
              {setup.players.map((player, index) => (
                <div className="player-row" key={player.id}>
                  <span className="player-index">{index + 1}</span>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(event) => updatePlayerName(player.id, event.target.value)}
                    placeholder={`${t.playerPlaceholder} ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => removePlayerField(player.id)}
                    disabled={setup.players.length <= 3}
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="secondary-button small"
              onClick={addPlayerField}
              disabled={setup.players.length >= 7}
            >
              {t.addPlayer}
            </button>
          </div>

          <div className="form-block">
            <label className="field-label">{t.firstDealerLabel}</label>
            <select
              className="select-input"
              value={setup.firstDealerId}
              onChange={(event) => setSetup((current) => ({ ...current, firstDealerId: event.target.value }))}
            >
              <option value="">{t.selectPlayer}</option>
              {setup.players.map((player, index) => (
                <option key={player.id} value={player.id}>
                  {player.name.trim() || `${t.playerPlaceholder} ${index + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-block">
            <label className="field-label">{t.zeroMissRuleLabel}</label>
            <div className="radio-group">
              <label className="radio-card">
                <input
                  type="radio"
                  name="zero-rule"
                  checked={setup.zeroMissRule === 'minus10'}
                  onChange={() => setSetup((current) => ({ ...current, zeroMissRule: 'minus10' }))}
                />
                <div>
                  <strong>{t.zeroMissMinus10Title}</strong>
                  <span>{t.zeroMissMinus10Description}</span>
                </div>
              </label>
              <label className="radio-card">
                <input
                  type="radio"
                  name="zero-rule"
                  checked={setup.zeroMissRule === 'zero'}
                  onChange={() => setSetup((current) => ({ ...current, zeroMissRule: 'zero' }))}
                />
                <div>
                  <strong>{t.zeroMissZeroTitle}</strong>
                  <span>{t.zeroMissZeroDescription}</span>
                </div>
              </label>
            </div>
          </div>

          <div className="actions">
            <button type="button" className="ghost-button" onClick={() => setScreen('home')}>
              {t.back}
            </button>
            <button type="button" className="primary-button" onClick={startMatch}>
              {t.startGame}
            </button>
          </div>
        </section>
      )}

      {screen === 'hand' && match && (
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">
                {t.handOf} {match.currentHandIndex + 1} / {match.sequence.length}
              </p>
              <h2>{currentHandCards} {t.cardsDealt}</h2>
            </div>
            <span className="badge badge-accent">
              {t.zeroMissBadge}: {match.zeroMissRule === 'minus10' ? '−10' : '0'}
            </span>
          </div>

          {currentDealer ? (
            <div className="dealer-banner">
              <strong>{t.currentDealer}:</strong> <span>{currentDealer.name}</span>
            </div>
          ) : null}

          <div className="score-strip">
            {ranking.map((player) => (
              <div className="score-pill" key={player.id}>
                <strong>{player.name}</strong>
                <span>{player.total} pts</span>
              </div>
            ))}
          </div>

          <div className="player-cards">
            {match.players.map((player) => {
              const input = match.currentInputs[player.id]
              return (
                <article className="player-card compact-player-card" key={player.id}>
                  <div className="player-card-header">
                    <div>
                      <h3>{player.name}</h3>
                      <p>
                        {t.currentTotal}: {player.total} pts
                      </p>
                    </div>
                  </div>

                  <div className="declared-row">
                    <div className="declared-field">
                      <label className="field-label" htmlFor={`declared-${player.id}`}>
                        {t.declaredTricks}
                      </label>
                      <input
                        id={`declared-${player.id}`}
                        className="declared-input"
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        max={currentHandCards}
                        value={input.declared}
                        onChange={(event) => updateHandInput(player.id, 'declared', event.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <button
                      type="button"
                      className={`toggle-hit inline-toggle ${input.hit ? 'is-hit' : ''}`}
                      onClick={() => updateHandInput(player.id, 'hit', !input.hit)}
                    >
                      <span className="toggle-dot" />
                      {input.hit ? t.hit : t.miss}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="actions">
            <button type="button" className="primary-button sticky-button" onClick={closeHand}>
              {t.closeHand}
            </button>
            <button type="button" className="ghost-button" onClick={resetAll}>
              {t.startFreshGame}
            </button>
          </div>
        </section>
      )}

      {screen === 'hand-result' && lastHandResult && (
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">
                {t.handResultTag} {lastHandResult.number}
              </p>
              <h2>{lastHandResult.handCards} {t.cardsDealt}</h2>
            </div>
          </div>

          {lastHandResult.dealerName ? (
            <div className="dealer-banner compact">
              <strong>{t.dealBy}:</strong> <span>{lastHandResult.dealerName}</span>
            </div>
          ) : null}

          <div className="results-list">
            {lastHandResult.results.map((result) => (
              <article className="result-card" key={result.playerId}>
                <div>
                  <h3>{result.playerName}</h3>
                  <p>
                    {t.declared}: {result.declared}
                  </p>
                </div>
                <div className="result-stats">
                  <span className={`status-badge ${result.hit ? 'ok' : 'off'}`}>
                    {result.hit ? t.hit : t.miss}
                  </span>
                  <strong className={result.points > 0 ? 'positive' : result.points < 0 ? 'negative' : ''}>
                    {result.points > 0 ? `+${result.points}` : result.points}
                  </strong>
                  <small>
                    {t.total}: {result.totalAfterHand}
                  </small>
                </div>
              </article>
            ))}
          </div>

          <div className="actions actions-4">
            <button type="button" className="ghost-button" onClick={() => setScreen('history')}>
              {t.seeHistory}
            </button>
            <button type="button" className="ghost-button" onClick={resetAll}>
              {t.startFreshGame}
            </button>
            <button type="button" className="ghost-button" onClick={reopenLastHand}>
              {t.back}
            </button>
            <button type="button" className="primary-button" onClick={goToNextStep}>
              {match?.status === 'finished' ? t.seeFinalResult : t.nextHand}
            </button>
          </div>
        </section>
      )}

      {screen === 'final' && match && (
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">{t.finishedGameTag}</p>
              <h2>{t.finalRanking}</h2>
            </div>
          </div>

          <div className="ranking-list">
            {rankPlayers(match.players).map((player, index) => (
              <article className="ranking-card" key={player.id}>
                <span className="ranking-position">#{index + 1}</span>
                <div>
                  <h3>{player.name}</h3>
                  <p>
                    {player.total} {t.points}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="actions stacked">
            <button type="button" className="primary-button" onClick={restartWithSamePlayers}>
              {t.repeatWithSamePlayers}
            </button>
            <button type="button" className="secondary-button" onClick={() => setScreen('history')}>
              {t.fullHistory}
            </button>
            <button type="button" className="ghost-button" onClick={resetAll}>
              {t.newGame}
            </button>
          </div>
        </section>
      )}

      {screen === 'history' && match && (
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">{t.gameHistoryTag}</p>
              <h2>{t.gameHistoryTitle}</h2>
            </div>
          </div>

          <div className="history-list">
            {match.hands.map((hand) => (
              <article className="history-card" key={hand.number}>
                <div className="history-header">
                  <strong>
                    {t.round} {hand.number}
                  </strong>
                  <span>
                    {hand.handCards} {t.cardsDealt}
                  </span>
                </div>
                {hand.dealerName ? (
                  <div className="history-dealer">
                    <strong>{t.dealBy}:</strong> <span>{hand.dealerName}</span>
                  </div>
                ) : null}
                <div className="history-results">
                  {hand.results.map((result) => (
                    <div className="history-row" key={result.playerId}>
                      <div>
                        <strong>{result.playerName}</strong>
                        <small>
                          {t.declared} {result.declared}
                        </small>
                      </div>
                      <div className="history-right">
                        <span>{result.hit ? t.hit : t.failed}</span>
                        <strong className={result.points > 0 ? 'positive' : result.points < 0 ? 'negative' : ''}>
                          {result.points > 0 ? `+${result.points}` : result.points}
                        </strong>
                        <small>
                          {t.total} {result.totalAfterHand}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setScreen(match.status === 'finished' ? 'final' : 'hand')}
            >
              {t.back}
            </button>
            <button type="button" className="ghost-button" onClick={resetAll}>
              {t.startFreshGame}
            </button>
          </div>
        </section>
      )}

      <footer className="app-footer">
        <span>{t.copyrightLabel}</span>
        <span>
          {t.versionLabel}: {APP_VERSION}
        </span>
      </footer>
    </div>
  )
}

export default App

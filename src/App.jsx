import { useEffect, useMemo, useState } from 'react'
import './App.css'

const HAND_SEQUENCE = [7, 6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6, 7]
const STORAGE_KEY = 'updownriver-score-state'

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const createEmptyPlayer = () => ({ id: createId(), name: '' })

const initialSetupState = {
  players: [createEmptyPlayer(), createEmptyPlayer(), createEmptyPlayer()],
  zeroMissRule: 'minus10',
}

function calculatePoints({ declared, hit, handCards, zeroMissRule }) {
  if (hit) return 10 + handCards
  if (declared === 0) return zeroMissRule === 'minus10' ? -10 : 0
  return 0
}

function rankPlayers(players) {
  return [...players].sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total
    return a.name.localeCompare(b.name, 'es')
  })
}

function buildMatch(players, zeroMissRule) {
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

function App() {
  const [screen, setScreen] = useState('home')
  const [setup, setSetup] = useState(initialSetupState)
  const [match, setMatch] = useState(null)
  const [lastHandResult, setLastHandResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = getStoredState()
    if (!stored) return

    setScreen(stored.screen ?? 'home')
    setSetup(stored.setup ?? initialSetupState)
    setMatch(stored.match ?? null)
    setLastHandResult(stored.lastHandResult ?? null)
  }, [])

  useEffect(() => {
    const payload = JSON.stringify({
      screen,
      setup,
      match,
      lastHandResult,
    })
    localStorage.setItem(STORAGE_KEY, payload)
  }, [screen, setup, match, lastHandResult])

  const currentHandCards = match ? match.sequence[match.currentHandIndex] : null
  const ranking = useMemo(() => (match ? rankPlayers(match.players) : []), [match])

  const addPlayerField = () => {
    if (setup.players.length >= 7) return
    setSetup((current) => ({
      ...current,
      players: [...current.players, createEmptyPlayer()],
    }))
  }

  const removePlayerField = (playerId) => {
    if (setup.players.length <= 3) return
    setSetup((current) => ({
      ...current,
      players: current.players.filter((player) => player.id !== playerId),
    }))
  }

  const updatePlayerName = (playerId, value) => {
    setSetup((current) => ({
      ...current,
      players: current.players.map((player) =>
        player.id === playerId ? { ...player, name: value } : player,
      ),
    }))
  }

  const startMatch = () => {
    const trimmedPlayers = setup.players.map((player) => ({
      ...player,
      name: player.name.trim(),
    }))

    if (trimmedPlayers.length < 3 || trimmedPlayers.length > 7) {
      setError('La partida debe tener entre 3 y 7 jugadores.')
      return
    }

    if (trimmedPlayers.some((player) => !player.name)) {
      setError('Todos los jugadores deben tener nombre.')
      return
    }

    const uniqueNames = new Set(trimmedPlayers.map((player) => player.name.toLowerCase()))
    if (uniqueNames.size !== trimmedPlayers.length) {
      setError('Los nombres de jugadores deben ser únicos.')
      return
    }

    const newMatch = buildMatch(trimmedPlayers, setup.zeroMissRule)
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
        if (input.declared === '') return `Falta cargar cuánto dijo ${player.name}.`
        if (!Number.isInteger(declaredValue)) return `${player.name} debe tener un número entero.`
        if (declaredValue < 0 || declaredValue > currentHandCards) {
          return `${player.name} debe tener un valor entre 0 y ${currentHandCards}.`
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

    const handResult = {
      number: match.currentHandIndex + 1,
      handCards: currentHandCards,
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
    setSetup({
      players,
      zeroMissRule: match.zeroMissRule,
    })
    const restartedMatch = buildMatch(players, match.zeroMissRule)
    setMatch(restartedMatch)
    setLastHandResult(null)
    setError('')
    setScreen('hand')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Scorekeeper mobile</p>
          <h1>Up Down River Score</h1>
        </div>
        {match ? (
          <button type="button" className="ghost-button" onClick={() => setScreen('history')}>
            Historial
          </button>
        ) : null}
      </header>

      {error ? <div className="alert-error">{error}</div> : null}

      {screen === 'home' && (
        <section className="panel hero-panel">
          <h2>Controlá toda la partida desde el celular</h2>
          <p>
            Creá una partida, cargá lo que dijo cada jugador, marcá si acertó y dejá que la app
            calcule el puntaje automáticamente.
          </p>
          <button type="button" className="primary-button" onClick={() => setScreen('setup')}>
            Nueva partida
          </button>
          {match ? (
            <button type="button" className="secondary-button" onClick={() => setScreen('hand')}>
              Continuar partida actual
            </button>
          ) : null}
        </section>
      )}

      {screen === 'setup' && (
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Nueva partida</p>
              <h2>Configuración inicial</h2>
            </div>
            <span className="badge">{setup.players.length} jugadores</span>
          </div>

          <div className="form-block">
            <label className="field-label">Jugadores</label>
            <div className="players-list">
              {setup.players.map((player, index) => (
                <div className="player-row" key={player.id}>
                  <span className="player-index">{index + 1}</span>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(event) => updatePlayerName(player.id, event.target.value)}
                    placeholder={`Jugador ${index + 1}`}
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
              Agregar jugador
            </button>
          </div>

          <div className="form-block">
            <label className="field-label">Regla para cero fallado</label>
            <div className="radio-group">
              <label className="radio-card">
                <input
                  type="radio"
                  name="zero-rule"
                  checked={setup.zeroMissRule === 'minus10'}
                  onChange={() => setSetup((current) => ({ ...current, zeroMissRule: 'minus10' }))}
                />
                <div>
                  <strong>Resta 10 puntos</strong>
                  <span>Si dijo 0 y no acertó, pierde 10 puntos.</span>
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
                  <strong>No suma puntos</strong>
                  <span>Si dijo 0 y no acertó, no gana ni pierde puntos.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="actions">
            <button type="button" className="ghost-button" onClick={() => setScreen('home')}>
              Volver
            </button>
            <button type="button" className="primary-button" onClick={startMatch}>
              Comenzar partida
            </button>
          </div>
        </section>
      )}

      {screen === 'hand' && match && (
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Mano {match.currentHandIndex + 1} de {match.sequence.length}</p>
              <h2>{currentHandCards} cartas repartidas</h2>
            </div>
            <span className="badge badge-accent">
              Cero fallado: {match.zeroMissRule === 'minus10' ? '−10' : '0'}
            </span>
          </div>

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
                <article className="player-card" key={player.id}>
                  <div className="player-card-header">
                    <div>
                      <h3>{player.name}</h3>
                      <p>Total actual: {player.total} pts</p>
                    </div>
                  </div>

                  <label className="field-label" htmlFor={`declared-${player.id}`}>
                    Bazas que dijo
                  </label>
                  <input
                    id={`declared-${player.id}`}
                    className="declared-input"
                    type="number"
                    min="0"
                    max={currentHandCards}
                    value={input.declared}
                    onChange={(event) => updateHandInput(player.id, 'declared', event.target.value)}
                    placeholder="0"
                  />

                  <button
                    type="button"
                    className={`toggle-hit ${input.hit ? 'is-hit' : ''}`}
                    onClick={() => updateHandInput(player.id, 'hit', !input.hit)}
                  >
                    <span className="toggle-dot" />
                    {input.hit ? 'Acertó' : 'No acertó'}
                  </button>
                </article>
              )
            })}
          </div>

          <button type="button" className="primary-button sticky-button" onClick={closeHand}>
            Cerrar mano
          </button>
        </section>
      )}

      {screen === 'hand-result' && lastHandResult && (
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Resultado de la mano {lastHandResult.number}</p>
              <h2>{lastHandResult.handCards} cartas</h2>
            </div>
          </div>

          <div className="results-list">
            {lastHandResult.results.map((result) => (
              <article className="result-card" key={result.playerId}>
                <div>
                  <h3>{result.playerName}</h3>
                  <p>Dijo: {result.declared}</p>
                </div>
                <div className="result-stats">
                  <span className={`status-badge ${result.hit ? 'ok' : 'off'}`}>
                    {result.hit ? 'Acertó' : 'No acertó'}
                  </span>
                  <strong className={result.points > 0 ? 'positive' : result.points < 0 ? 'negative' : ''}>
                    {result.points > 0 ? `+${result.points}` : result.points}
                  </strong>
                  <small>Total: {result.totalAfterHand}</small>
                </div>
              </article>
            ))}
          </div>

          <div className="actions">
            <button type="button" className="ghost-button" onClick={() => setScreen('history')}>
              Ver historial
            </button>
            <button type="button" className="primary-button" onClick={goToNextStep}>
              {match?.status === 'finished' ? 'Ver resultado final' : 'Siguiente mano'}
            </button>
          </div>
        </section>
      )}

      {screen === 'final' && match && (
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Partida finalizada</p>
              <h2>Ranking final</h2>
            </div>
          </div>

          <div className="ranking-list">
            {rankPlayers(match.players).map((player, index) => (
              <article className="ranking-card" key={player.id}>
                <span className="ranking-position">#{index + 1}</span>
                <div>
                  <h3>{player.name}</h3>
                  <p>{player.total} puntos</p>
                </div>
              </article>
            ))}
          </div>

          <div className="actions stacked">
            <button type="button" className="primary-button" onClick={restartWithSamePlayers}>
              Repetir con mismos jugadores
            </button>
            <button type="button" className="secondary-button" onClick={() => setScreen('history')}>
              Ver historial completo
            </button>
            <button type="button" className="ghost-button" onClick={resetAll}>
              Nueva partida
            </button>
          </div>
        </section>
      )}

      {screen === 'history' && match && (
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Historial</p>
              <h2>Detalle de la partida</h2>
            </div>
          </div>

          <div className="history-list">
            {match.hands.map((hand) => (
              <article className="history-card" key={hand.number}>
                <div className="history-header">
                  <strong>Mano {hand.number}</strong>
                  <span>{hand.handCards} cartas</span>
                </div>
                <div className="history-results">
                  {hand.results.map((result) => (
                    <div className="history-row" key={result.playerId}>
                      <div>
                        <strong>{result.playerName}</strong>
                        <small>Dijo {result.declared}</small>
                      </div>
                      <div className="history-right">
                        <span>{result.hit ? 'Acertó' : 'Falló'}</span>
                        <strong className={result.points > 0 ? 'positive' : result.points < 0 ? 'negative' : ''}>
                          {result.points > 0 ? `+${result.points}` : result.points}
                        </strong>
                        <small>Total {result.totalAfterHand}</small>
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
              Volver
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default App

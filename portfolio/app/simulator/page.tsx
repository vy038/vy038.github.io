export default function SimulatorPage() {
  const url = process.env.NEXT_PUBLIC_SIMULATOR_URL ?? ''

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#080808', overflow: 'hidden' }}>
      {url ? (
        <iframe
          src={url}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="fullscreen"
          title="Talos Simulator"
        />
      ) : (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#444',
            fontFamily: 'monospace',
            fontSize: 12,
            letterSpacing: '0.1em',
          }}
        >
          SIMULATOR OFFLINE — NEXT_PUBLIC_SIMULATOR_URL not set
        </div>
      )}
    </div>
  )
}

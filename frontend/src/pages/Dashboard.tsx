import AppHeader from '../components/AppHeader'

export default function Dashboard() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AppHeader />
      <main style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '8px' }}>My Trips</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Your trips will appear here.</p>
      </main>
    </div>
  )
}

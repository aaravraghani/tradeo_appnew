import { UserButton } from '@clerk/nextjs'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Simple Header */}
      <header className="bg-white border-b border-divider">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="text-xl font-bold text-text-primary">Tradeo</span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <Container className="py-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold text-text-primary">
            Welcome to Your Dashboard! 🎉
          </h1>
          <p className="text-xl text-text-secondary">
            This is a placeholder for your personalized home dashboard.
          </p>
          <p className="text-text-secondary">
            The full dashboard with learning modules, simulation, AI chatbot, and more will be built in the next phase.
          </p>
          
          <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature Cards Preview */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-semibold text-text-primary mb-2">Learning Modules</h3>
              <p className="text-sm text-text-secondary">Coming soon</p>
            </div>

            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="font-semibold text-text-primary mb-2">Stock Simulation</h3>
              <p className="text-sm text-text-secondary">Coming soon</p>
            </div>

            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-semibold text-text-primary mb-2">AI Coach</h3>
              <p className="text-sm text-text-secondary">Coming soon</p>
            </div>
          </div>

          <div className="pt-8">
            <Button href="/" variant="ghost">
              ← Back to Landing Page
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}



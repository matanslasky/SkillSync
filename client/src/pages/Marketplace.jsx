import Sidebar from '../components/Sidebar'

const Marketplace = () => {
  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <h2 className="text-3xl font-bold mb-4">Project Marketplace</h2>
        <p className="text-gray-500">Coming soon...</p>
      </main>
    </div>
  )
}

export default Marketplace

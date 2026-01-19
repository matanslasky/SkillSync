const ProgressBar = ({ progress, label, color = 'green' }) => {
  const colorClasses = {
    green: 'bg-neon-green shadow-neon-green',
    blue: 'bg-neon-blue shadow-neon-blue',
    pink: 'bg-neon-pink shadow-neon-pink',
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{label}</span>
          <span className="text-white font-semibold">{progress}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-dark-lighter rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar

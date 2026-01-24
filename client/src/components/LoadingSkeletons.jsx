// Loading Skeleton Components

export const PageLoader = () => (
  <div className="min-h-screen bg-dark flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
)

export const CardSkeleton = () => (
  <div className="glass-effect rounded-xl p-6 border border-gray-800 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="h-6 bg-gray-800 rounded w-2/3"></div>
      <div className="h-6 bg-gray-800 rounded w-16"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-800 rounded w-full"></div>
      <div className="h-4 bg-gray-800 rounded w-5/6"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-800 rounded w-24"></div>
      <div className="h-4 bg-gray-800 rounded w-32"></div>
    </div>
  </div>
)

export const ProjectCardSkeleton = () => (
  <div className="glass-effect rounded-xl p-6 border border-gray-800 animate-pulse flex flex-col h-full">
    <div className="flex items-start justify-between mb-4">
      <div className="h-6 bg-gray-800 rounded w-3/4"></div>
      <div className="h-6 w-20 bg-gray-800 rounded-full"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-800 rounded w-full"></div>
      <div className="h-4 bg-gray-800 rounded w-4/5"></div>
    </div>
    <div className="space-y-3 flex-1">
      <div className="h-4 bg-gray-800 rounded w-28"></div>
      <div className="h-4 bg-gray-800 rounded w-32"></div>
      <div className="h-4 bg-gray-800 rounded w-24"></div>
    </div>
    <div className="h-10 bg-gray-800 rounded mt-4"></div>
  </div>
)

export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-800 rounded-full"></div>
        <div>
          <div className="h-4 bg-gray-800 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-800 rounded w-24"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-800 rounded w-28"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-800 rounded w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-8 bg-gray-800 rounded w-20"></div>
    </td>
  </tr>
)

export const StatCardSkeleton = () => (
  <div className="glass-effect rounded-xl p-6 border border-gray-800 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-800 rounded-lg"></div>
      <div className="h-4 bg-gray-800 rounded w-24"></div>
    </div>
    <div className="h-8 bg-gray-800 rounded w-16 mb-2"></div>
    <div className="h-3 bg-gray-800 rounded w-28"></div>
  </div>
)

export const TeamMemberSkeleton = () => (
  <div className="flex items-center justify-between p-4 bg-dark-lighter rounded-lg border border-gray-800 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
      <div>
        <div className="h-4 bg-gray-800 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-800 rounded w-24"></div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gray-800 rounded-lg"></div>
      <div className="w-20 h-8 bg-gray-800 rounded-lg"></div>
      <div className="w-8 h-8 bg-gray-800 rounded-lg"></div>
    </div>
  </div>
)

export const KanbanCardSkeleton = () => (
  <div className="glass-effect rounded-lg p-4 border border-gray-800 animate-pulse">
    <div className="h-5 bg-gray-800 rounded w-3/4 mb-3"></div>
    <div className="space-y-2 mb-3">
      <div className="h-3 bg-gray-800 rounded w-full"></div>
      <div className="h-3 bg-gray-800 rounded w-5/6"></div>
    </div>
    <div className="flex items-center justify-between">
      <div className="h-6 w-16 bg-gray-800 rounded"></div>
      <div className="h-4 w-20 bg-gray-800 rounded"></div>
    </div>
  </div>
)

export const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center gap-6">
      <div className="w-32 h-32 bg-gray-800 rounded-full"></div>
      <div className="flex-1">
        <div className="h-8 bg-gray-800 rounded w-48 mb-3"></div>
        <div className="h-4 bg-gray-800 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-800 rounded w-64"></div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-effect rounded-xl p-6 border border-gray-800">
          <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-800 rounded w-16"></div>
        </div>
      ))}
    </div>
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <div className="h-6 bg-gray-800 rounded w-32 mb-4"></div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-8 w-20 bg-gray-800 rounded-full"></div>
        ))}
      </div>
    </div>
  </div>
)

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-gray-800 border-t-neon-green rounded-full animate-spin`}></div>
    </div>
  )
}

export default {
  PageLoader,
  CardSkeleton,
  ProjectCardSkeleton,
  TableRowSkeleton,
  ProfileSkeleton,
  LoadingSpinner
}
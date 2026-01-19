import { Users, Circle } from 'lucide-react'

const TeamCard = ({ member }) => {
  const statusColors = {
    online: 'bg-neon-green',
    away: 'bg-yellow-500',
    offline: 'bg-gray-600',
  }

  return (
    <div className="flex items-center gap-3 p-3 glass-effect rounded-lg hover:bg-dark-lighter transition-all">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-pink flex items-center justify-center text-sm font-bold">
          {member.name.charAt(0)}
        </div>
        <Circle
          size={12}
          className={`absolute -bottom-0.5 -right-0.5 ${statusColors[member.status]} rounded-full fill-current`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{member.name}</p>
        <p className="text-xs text-gray-500 truncate">{member.role}</p>
      </div>
      <div className="text-xs text-gray-400">{member.score}</div>
    </div>
  )
}

const TeamList = ({ members = [] }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-neon-blue" />
        <h3 className="text-lg font-semibold">Project Squad</h3>
      </div>
      <div className="space-y-2">
        {members.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>
      {members.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users size={48} className="mx-auto mb-2 opacity-20" />
          <p>No team members yet</p>
        </div>
      )}
    </div>
  )
}

export default TeamList

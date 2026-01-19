import ProgressBar from './ProgressBar'
import { getRoleMetrics } from '../constants/roles'

const RoleContribution = ({ role, contributions = {} }) => {
  const metrics = getRoleMetrics(role)
  
  // Default contributions if not provided
  const defaultContributions = {
    primary: contributions.primary || Math.floor(Math.random() * 100),
    secondary: contributions.secondary || Math.floor(Math.random() * 100),
    tertiary: contributions.tertiary || Math.floor(Math.random() * 100),
  }

  return (
    <div className="space-y-2">
      <ProgressBar 
        progress={defaultContributions.primary} 
        label={metrics.primary} 
        color="green" 
      />
      <ProgressBar 
        progress={defaultContributions.secondary} 
        label={metrics.secondary} 
        color="blue" 
      />
      <ProgressBar 
        progress={defaultContributions.tertiary} 
        label={metrics.tertiary} 
        color="pink" 
      />
    </div>
  )
}

export default RoleContribution

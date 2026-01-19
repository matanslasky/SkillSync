// All available roles in SkillSync with their contribution metrics
export const ROLES = {
  DEVELOPER: {
    value: 'Developer',
    label: 'Developer',
    icon: '💻',
    metrics: {
      primary: 'Code Commits',
      secondary: 'Pull Requests',
      tertiary: 'Code Reviews'
    }
  },
  DESIGNER: {
    value: 'Designer',
    label: 'Designer',
    icon: '🎨',
    metrics: {
      primary: 'Design Deliverables',
      secondary: 'UI Components',
      tertiary: 'User Feedback'
    }
  },
  PRODUCT_MANAGER: {
    value: 'Product Manager',
    label: 'Product Manager',
    icon: '📊',
    metrics: {
      primary: 'Requirements Documented',
      secondary: 'Sprint Planning',
      tertiary: 'Stakeholder Meetings'
    }
  },
  GROWTH_LEAD: {
    value: 'Growth Lead',
    label: 'Growth Lead',
    icon: '📈',
    metrics: {
      primary: 'Marketing Campaigns',
      secondary: 'User Acquisition',
      tertiary: 'Content Created'
    }
  },
  LEGAL_CONSULTANT: {
    value: 'Legal Consultant',
    label: 'Legal Consultant',
    icon: '⚖️',
    metrics: {
      primary: 'Documents Reviewed',
      secondary: 'Compliance Checks',
      tertiary: 'Legal Research'
    }
  },
  USER_RESEARCHER: {
    value: 'User Researcher',
    label: 'User Researcher',
    icon: '🔍',
    metrics: {
      primary: 'User Interviews',
      secondary: 'Research Reports',
      tertiary: 'Insights Shared'
    }
  },
  CONTENT_STRATEGIST: {
    value: 'Content Strategist',
    label: 'Content Strategist',
    icon: '✍️',
    metrics: {
      primary: 'Content Published',
      secondary: 'Content Strategy',
      tertiary: 'Engagement Rate'
    }
  }
}

export const ROLE_LIST = Object.values(ROLES)

export const getRoleMetrics = (roleName) => {
  const role = ROLE_LIST.find(r => r.value === roleName)
  return role ? role.metrics : ROLES.DEVELOPER.metrics
}

export const getRoleIcon = (roleName) => {
  const role = ROLE_LIST.find(r => r.value === roleName)
  return role ? role.icon : '👤'
}

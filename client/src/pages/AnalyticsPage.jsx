import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Users, CheckCircle, Clock, Target, Activity, Zap, Award 
} from 'lucide-react';
import {
  getProjectAnalytics,
  getTeamPerformanceMetrics,
  getProjectTimeline,
  getVelocityMetrics
} from '../services/analyticsService';
import { getProjectById } from '../services/firestoreService';

const COLORS = {
  primary: '#00ff9d',
  secondary: '#00b8ff',
  tertiary: '#ff4757',
  quaternary: '#ffa502',
  gray: '#6c757d'
};

const STATUS_COLORS = {
  todo: '#6c757d',
  'in-progress': '#00b8ff',
  'in-review': '#ffa502',
  done: '#00ff9d'
};

const AnalyticsPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [teamMetrics, setTeamMetrics] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [velocity, setVelocity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    if (projectId) {
      loadAnalytics();
    }
  }, [projectId, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [projectData, analyticsData, teamData, timelineData, velocityData] = await Promise.all([
        getProjectById(projectId),
        getProjectAnalytics(projectId),
        getTeamPerformanceMetrics(projectId),
        getProjectTimeline(projectId, timeRange),
        getVelocityMetrics(projectId, 4)
      ]);

      setProject(projectData);
      setAnalytics(analyticsData);
      setTeamMetrics(teamData);
      setTimeline(timelineData);
      setVelocity(velocityData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusData = () => {
    if (!analytics) return [];
    return [
      { name: 'To Do', value: analytics.statusCounts.todo, color: STATUS_COLORS.todo },
      { name: 'In Progress', value: analytics.statusCounts['in-progress'], color: STATUS_COLORS['in-progress'] },
      { name: 'In Review', value: analytics.statusCounts['in-review'], color: STATUS_COLORS['in-review'] },
      { name: 'Done', value: analytics.statusCounts.done, color: STATUS_COLORS.done }
    ].filter(item => item.value > 0);
  };

  const getPriorityData = () => {
    if (!analytics) return [];
    return [
      { name: 'Low', value: analytics.priorityCounts.low },
      { name: 'Medium', value: analytics.priorityCounts.medium },
      { name: 'High', value: analytics.priorityCounts.high },
      { name: 'Urgent', value: analytics.priorityCounts.urgent }
    ].filter(item => item.value > 0);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-dark">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-neon-green text-xl">Loading analytics...</div>
        </main>
      </div>
    );
  }

  if (!project || !analytics) {
    return (
      <div className="flex h-screen bg-dark">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Analytics not available</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              <TrendingUp className="inline w-8 h-8 mr-2 text-neon-green" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-400">{project.name || project.title}</p>
          </div>

          {/* Time Range Filter */}
          <div className="mb-6 flex gap-2">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === days
                    ? 'bg-neon-green text-dark font-medium'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={<Target className="text-neon-green" />}
              label="Total Tasks"
              value={analytics.totalTasks}
              change={`${analytics.completionRate}% complete`}
            />
            <MetricCard
              icon={<CheckCircle className="text-neon-blue" />}
              label="Completed"
              value={analytics.completedTasks}
              change={`${analytics.todoTasks} remaining`}
            />
            <MetricCard
              icon={<Clock className="text-neon-pink" />}
              label="In Progress"
              value={analytics.inProgressTasks}
              change={`${analytics.reviewTasks} in review`}
            />
            <MetricCard
              icon={<Zap className="text-yellow-500" />}
              label="Avg Velocity"
              value={velocity?.averageVelocity || 0}
              change="tasks/week"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Task Status Distribution */}
            <div className="glass-effect rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Task Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Priority Distribution */}
            <div className="glass-effect rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Task Priority</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getPriorityData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                  <Bar dataKey="value" fill={COLORS.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Timeline and Velocity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Project Timeline */}
            <div className="glass-effect rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Project Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke={COLORS.secondary} 
                    name="Total Tasks"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke={COLORS.primary} 
                    name="Completed"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="remaining" 
                    stroke={COLORS.tertiary} 
                    name="Remaining"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Velocity */}
            <div className="glass-effect rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                <Zap className="inline w-5 h-5 mr-2 text-yellow-500" />
                Weekly Velocity
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={velocity?.weeklyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="week" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                  <Bar dataKey="completed" fill={COLORS.primary} name="Tasks Completed" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-gray-400">Average Velocity</p>
                <p className="text-2xl font-bold text-neon-green">
                  {velocity?.averageVelocity || 0} tasks/week
                </p>
              </div>
            </div>
          </div>

          {/* Team Performance */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6">
              <Users className="inline w-5 h-5 mr-2 text-neon-blue" />
              Team Performance
            </h3>
            <div className="space-y-4">
              {teamMetrics?.teamData.map((member, index) => (
                <div key={member.userId} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-pink flex items-center justify-center text-lg font-bold">
                    {member.userName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{member.userName}</span>
                      <span className="text-sm text-gray-400">
                        {member.completed}/{member.total} tasks
                      </span>
                    </div>
                    <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-green to-neon-blue transition-all"
                        style={{ width: `${member.completionRate}%` }}
                      />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>✅ {member.completed} done</span>
                      <span>⚡ {member.inProgress} in progress</span>
                      <span>📋 {member.todo} to do</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neon-green">
                      {member.completionRate}%
                    </div>
                    <div className="text-xs text-gray-400">completion</div>
                  </div>
                </div>
              ))}
              {(!teamMetrics?.teamData || teamMetrics.teamData.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  No team data available
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const MetricCard = ({ icon, label, value, change }) => (
  <div className="glass-effect rounded-xl p-6 border border-gray-800">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-xs text-gray-500 mt-2">{change}</div>
  </div>
);

export default AnalyticsPage;

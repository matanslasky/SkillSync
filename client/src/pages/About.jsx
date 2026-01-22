import Sidebar from '../components/Sidebar'
import { Users, Target, Zap, Shield, Rocket, Heart, Award, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const About = () => {
  const navigate = useNavigate()
  
  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="neon-text-green">Skill</span>
            <span className="text-neon-blue">Sync</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl">
            Where ambitious students transform ideas into reality through meaningful collaboration.
          </p>
        </div>

        {/* Mission Section */}
        <div className="glass-effect rounded-xl p-8 border border-gray-800 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-neon-green/20 flex items-center justify-center flex-shrink-0">
              <Target className="text-neon-green" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed">
                SkillSync bridges the gap between classroom learning and real-world experience. We believe 
                that the best way to learn is by doing, and the best projects are built by diverse teams 
                working together toward a common goal.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ValueCard 
              icon={<Users className="text-neon-blue" />}
              title="Collaboration"
              description="Building together is better than building alone"
            />
            <ValueCard 
              icon={<Zap className="text-neon-green" />}
              title="Innovation"
              description="Encouraging creative solutions and bold ideas"
            />
            <ValueCard 
              icon={<Shield className="text-neon-purple" />}
              title="Trust"
              description="Creating a safe space for learning and growth"
            />
            <ValueCard 
              icon={<Heart className="text-neon-pink" />}
              title="Community"
              description="Supporting each other's journey to success"
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard 
              icon={<Award className="text-neon-green" />}
              title="Commitment Scoring"
              description="Track your reliability and build a reputation that matters to recruiters and teammates."
            />
            <FeatureCard 
              icon={<TrendingUp className="text-neon-blue" />}
              title="Synergy Meter"
              description="Measure team diversity and get insights on what roles you need to succeed."
            />
            <FeatureCard 
              icon={<Rocket className="text-neon-pink" />}
              title="Portfolio Building"
              description="Showcase your work with milestone timelines and proof-of-work deliverables."
            />
            <FeatureCard 
              icon={<Users className="text-neon-purple" />}
              title="Real Collaboration"
              description="Built-in messaging, task management, and team coordination tools."
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="glass-effect rounded-xl p-8 border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard number="1000+" label="Active Students" />
            <StatCard number="250+" label="Projects Launched" />
            <StatCard number="7" label="Specialized Roles" />
            <StatCard number="89%" label="Success Rate" />
          </div>
        </div>

        {/* Who It's For */}
        <div className="glass-effect rounded-xl p-8 border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold mb-6">Who Is SkillSync For?</h2>
          <div className="space-y-4">
            <WhoCard 
              emoji="💻"
              title="Developers"
              description="Build real projects, learn new tech stacks, and create a portfolio that stands out."
            />
            <WhoCard 
              emoji="🎨"
              title="Designers"
              description="Design for real products, work with developers, and see your designs come to life."
            />
            <WhoCard 
              emoji="📊"
              title="Product Managers"
              description="Lead projects from idea to launch, coordinate teams, and develop leadership skills."
            />
            <WhoCard 
              emoji="📈"
              title="Growth & Marketing"
              description="Launch campaigns, analyze metrics, and grow user bases for real products."
            />
            <WhoCard 
              emoji="⚖️"
              title="Legal & Compliance"
              description="Navigate regulations, draft agreements, and ensure projects meet legal standards."
            />
            <WhoCard 
              emoji="🔍"
              title="User Researchers"
              description="Conduct studies, gather insights, and shape products based on real user needs."
            />
            <WhoCard 
              emoji="✍️"
              title="Content Strategists"
              description="Craft compelling narratives, develop content strategies, and tell product stories."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass-effect rounded-xl p-8 border border-neon-green/30 bg-neon-green/5 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Something Amazing?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Join thousands of students who are turning their ideas into reality. Start your next project today.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="px-8 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all"
          >
            Get Started
          </button>
        </div>
      </main>
    </div>
  )
}

const ValueCard = ({ icon, title, description }) => (
  <div className="glass-effect rounded-xl p-6 border border-gray-800 text-center">
    <div className="w-12 h-12 rounded-lg bg-dark-lighter flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h3 className="font-bold mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
)

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-effect rounded-xl p-6 border border-gray-800">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-dark-lighter flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  </div>
)

const StatCard = ({ number, label }) => (
  <div className="text-center">
    <div className="text-3xl font-bold text-neon-green mb-2">{number}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
)

const WhoCard = ({ emoji, title, description }) => (
  <div className="flex items-start gap-4 p-4 bg-dark-lighter rounded-lg">
    <div className="text-3xl">{emoji}</div>
    <div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </div>
)

export default About

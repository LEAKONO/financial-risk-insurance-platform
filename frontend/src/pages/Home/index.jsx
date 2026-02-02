// frontend/src/pages/Home/index.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button/Button'
import StatsCard from '../../components/ui/Card/StatsCard'
import { 
  Shield, TrendingUp, Zap, Award, ChevronRight, 
  ArrowRight, Users, CheckCircle, Clock, BarChart3,
  DollarSign, Globe, ShieldCheck, Sparkles, Lock, Headphones, Rocket
} from 'lucide-react'

const Home = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState([
    { label: 'Active Policies', value: '1.2M+', icon: Shield, change: '+12%', color: 'blue' },
    { label: 'Claims Processed', value: '850K+', icon: TrendingUp, change: '+8%', color: 'green' },
    { label: 'Customer Satisfaction', value: '98.7%', icon: Award, change: '+2.3%', color: 'purple' },
    { label: 'Risk Coverage', value: '$4.5B+', icon: Zap, change: '+15%', color: 'orange' },
  ])

  const features = [
    {
      icon: ShieldCheck,
      title: 'AI Risk Assessment',
      description: 'Real-time risk analysis using advanced machine learning algorithms',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Zap,
      title: 'Instant Coverage',
      description: 'Get insured in minutes with automated underwriting process',
      color: 'from-orange-500 to-yellow-400',
    },
    {
      icon: BarChart3,
      title: 'Predictive Analytics',
      description: 'Forecast risks and optimize coverage strategies',
      color: 'from-green-500 to-emerald-400',
    },
    {
      icon: Award,
      title: 'Premium Support',
      description: '24/7 expert support and claim assistance',
      color: 'from-purple-500 to-pink-400',
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Comprehensive protection across multiple regions',
      color: 'from-indigo-500 to-blue-400',
    },
    {
      icon: DollarSign,
      title: 'Competitive Pricing',
      description: 'Optimized premiums based on accurate risk assessment',
      color: 'from-teal-500 to-green-400',
    },
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-20">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSg5OSwgMTAyLCAyNDEsIDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')]" />
        
        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Trusted by 50K+ Businesses</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              >
                Advanced Risk Protection
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Tailored Insurance Solutions
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600"
              >
                AI-powered risk assessment and comprehensive insurance solutions for 
                modern businesses. Get personalized coverage in minutes, not weeks.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                {isAuthenticated ? (
                  <>
                    <Button
                      size="lg"
                      variant="primary"
                      onClick={() => navigate('/dashboard')}
                      icon={<ChevronRight />}
                      iconPosition="right"
                      className="w-full sm:w-auto"
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/dashboard/policies')}
                      className="w-full sm:w-auto"
                    >
                      View Policies
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="primary"
                      onClick={() => navigate('/register')}
                      icon={<ArrowRight />}
                      iconPosition="right"
                      className="w-full sm:w-auto"
                    >
                      Get Started Free
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/risk-assessment')}
                      className="w-full sm:w-auto"
                    >
                      Risk Assessment
                    </Button>
                  </>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6 pt-8"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Instant approval</span>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="relative lg:ml-12"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Risk Dashboard</h3>
                        <p className="text-sm text-gray-600">Real-time monitoring</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-700">Risk Score</span>
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-blue-900">85</div>
                        <div className="text-xs text-blue-600 mt-1">Excellent</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-700">Coverage</span>
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-green-900">$2.5M</div>
                        <div className="text-xs text-green-600 mt-1">Active</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Policy Status</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Claims This Month</span>
                        <span className="font-medium text-gray-900">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Premium Due</span>
                        <span className="font-medium text-gray-900">$1,250</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Updated just now</span>
                        <span className="text-blue-600 font-medium">View Details →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl rotate-12 opacity-90 shadow-xl animate-float" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl -rotate-12 opacity-90 shadow-xl animate-float" style={{ animationDelay: '2s' }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <StatsCard {...stat} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-blue-600">RiskGuard</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced features designed for modern risk management and comprehensive insurance protection
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-10 mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color.includes('blue') ? 'text-blue-600' : feature.color.includes('green') ? 'text-green-600' : feature.color.includes('orange') ? 'text-orange-600' : feature.color.includes('purple') ? 'text-purple-600' : feature.color.includes('indigo') ? 'text-indigo-600' : 'text-teal-600'}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link
                  to="/risk-assessment"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group-hover:translate-x-1 transition-transform"
                >
                  Learn more
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 sm:p-12"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
            
            <div className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Ready to Secure Your Future?
                  </h2>
                  <p className="text-blue-100 text-lg mb-8">
                    Join thousands of businesses that trust us for their risk management needs. 
                    Get started in minutes with our AI-powered platform.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                      icon={<Rocket />}
                      iconPosition="left"
                      className="bg-white text-blue-600 hover:bg-gray-100"
                    >
                      {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/risk-assessment')}
                      className="border-white text-white hover:bg-white/10"
                    >
                      Risk Assessment
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <Lock className="h-8 w-8 text-white mb-4" />
                    <h4 className="text-white font-semibold mb-2">Secure Platform</h4>
                    <p className="text-blue-100 text-sm">Bank-level security for all your data</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <Headphones className="h-8 w-8 text-white mb-4" />
                    <h4 className="text-white font-semibold mb-2">24/7 Support</h4>
                    <p className="text-blue-100 text-sm">Expert assistance whenever you need it</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
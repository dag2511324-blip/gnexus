import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Users, FolderOpen, Activity, BarChart3, Plus, Settings, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggleSimple } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalSessions: number;
  totalGenerations: number;
  activeUsers: number;
  recentActivity: Record<string, unknown>[];
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalSessions: 0,
    totalGenerations: 0,
    activeUsers: 0,
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [
        { count: userCount },
        { count: projectCount },
        { count: sessionCount },
        { count: generationCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('sessions').select('*', { count: 'exact', head: true }),
        supabase.from('artifacts').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: userCount || 0,
        totalProjects: projectCount || 0,
        totalSessions: sessionCount || 0,
        totalGenerations: generationCount || 0,
        activeUsers: Math.floor((userCount || 0) * 0.7),
        recentActivity: [],
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface-1 to-surface-2 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-8"
          >
            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Server className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GNEXUS Agent
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground">Loading interface...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-1 to-surface-2">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggleSimple />
      </div>

      <section className="relative min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8 inline-block"
            >
              <div className="relative">
                <motion.div
                  className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="h-16 w-16 text-white" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div className="mb-8">
              <motion.h1
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-7xl lg:text-9xl font-bold mb-4 leading-tight"
              >
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  GNEXUS
                </span>
                <br />
                <span className="text-5xl lg:text-7xl bg-gradient-to-r from-accent/80 to-primary/80 bg-clip-text text-transparent">
                  Agent
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-2xl lg:text-3xl text-muted-foreground max-w-5xl mx-auto leading-relaxed"
              >
                Next-Generation AI Platform with Advanced HuggingFace Integration
                <br />
                <span className="text-lg opacity-75">Create • Generate • Transform • Deploy</span>
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-12"
            >
              <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Link to="/ai-studio">
                  <Button size="lg" className="text-xl px-12 py-6 h-16">
                    <Sparkles className="h-6 w-6 mr-4" />
                    Start Creating
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Link to="/projects">
                  <Button variant="outline" size="lg" className="text-xl px-12 py-6 h-16">
                    <FolderOpen className="h-6 w-6 mr-4" />
                    View Projects
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-12 bg-surface-1/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold text-center mb-8">Platform Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Users />, value: stats.totalUsers, label: "Total Users" },
                { icon: <FolderOpen />, value: stats.totalProjects, label: "Active Projects" },
                { icon: <Activity />, value: stats.totalGenerations, label: "AI Generations" },
                { icon: <BarChart3 />, value: stats.activeUsers, label: "Active Now" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card rounded-2xl p-6 text-center group cursor-pointer border"
                  onClick={() => navigate('/profile')}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold text-center mb-8">Quick Actions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'AI Studio',
                  description: 'Generate text, images, audio, and video',
                  icon: <Sparkles className="h-6 w-6" />,
                  href: '/ai-studio',
                  color: 'from-violet-500 to-purple-600',
                  features: ['50+ Models', 'Real-time', 'Multi-modal']
                },
                {
                  title: 'New Project',
                  description: 'Create a new AI project',
                  icon: <Plus className="h-6 w-6" />,
                  href: '/projects/new',
                  color: 'from-blue-500 to-cyan-600',
                  features: ['Templates', 'Collaboration', 'Version Control']
                },
                {
                  title: 'Projects',
                  description: 'Manage your existing projects',
                  icon: <FolderOpen className="h-6 w-6" />,
                  href: '/projects',
                  color: 'from-green-500 to-emerald-600',
                  features: ['Analytics', 'Sharing', 'Export']
                },
                {
                  title: 'Admin Panel',
                  description: 'System administration',
                  icon: <Settings className="h-6 w-6" />,
                  href: '/admin',
                  color: 'from-orange-500 to-red-600',
                  features: ['User Management', 'System Health', 'Monitoring']
                },
              ].map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to={action.href}>
                    <div className="bg-card rounded-2xl p-6 h-full border hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${action.color}`}>
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {action.features.slice(0, 2).map((feature, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-secondary rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

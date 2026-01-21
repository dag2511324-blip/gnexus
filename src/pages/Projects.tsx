import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Plus,
  FolderOpen,
  Clock,
  Layout,
  Search,
  Grid,
  List,
  MoreVertical,
  Trash2,
  Edit,
  ArrowLeft,
  Shield,
  LogOut,
  Zap,
} from 'lucide-react';
import { ToolsRegistry } from '@/components/gnexus/ToolsRegistry';
import { GnexusToolsGrid } from '@/components/gnexus/GnexusToolsGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGnexus } from '@/contexts/GnexusContext';
import { AIQuickActions } from '@/components/gnexus/AIQuickActions';
import {
  TextGenerationTool,
  ImageGenerationTool,
  AudioTool,
  VideoGenerationTool,
} from '@/components/gnexus/tools';

interface Project {
  id: string;
  name: string;
  description: string | null;
  product_type: string | null;
  platforms: string[];
  target_audience: string | null;
  business_model: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function ProjectsContent() {
  const { openToolModal } = useGnexus();
  const { user, isAdmin, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  // New project form
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    product_type: '',
    platforms: ['web'] as string[],
    target_audience: '',
    business_model: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch projects',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user, toast]);



  const createProject = async () => {
    if (!newProject.name.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user!.id,
          name: newProject.name,
          description: newProject.description || null,
          product_type: newProject.product_type || null,
          platforms: newProject.platforms,
          target_audience: newProject.target_audience || null,
          business_model: newProject.business_model || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Project created',
        description: 'New project has been created successfully',
      });

      setProjects([data, ...projects]);
      setIsCreateModalOpen(false);
      setNewProject({
        name: '',
        description: '',
        product_type: '',
        platforms: ['web'],
        target_audience: '',
        business_model: '',
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  const generateProjectDetails = async () => {
    if (!newProject.name) {
      toast({
        title: 'Name required',
        description: 'Please enter a project name or idea first',
        variant: 'destructive',
      });
      return;
    }

    const loadingToast = toast({
      title: 'Generating details...',
      description: 'Using AI to brainstorm project details',
    });

    try {
      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a product product manager assistant. Generate project details (description, product type, target audience, business model) based on the project name/idea. Return valid JSON only.',
            },
            {
              role: 'user',
              content: `Project Name/Idea: ${newProject.name}\n\nGenerate a JSON object with fields: description, product_type, target_audience, business_model, platforms (array of strings).`,
            },
          ],
        },
      });

      if (error) throw error;

      const generated = JSON.parse(data.choices[0].message.content);

      setNewProject(prev => ({
        ...prev,
        description: generated.description || prev.description,
        product_type: generated.product_type || prev.product_type,
        target_audience: generated.target_audience || prev.target_audience,
        business_model: generated.business_model || prev.business_model,
        platforms: generated.platforms || prev.platforms,
      }));

      toast({
        title: 'Generated!',
        description: 'Project details have been populated',
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate details',
        variant: 'destructive',
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    setIsDeleting(projectId);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast({
        title: 'Project deleted',
        description: 'The project has been removed',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleAIAction = (actionId: 'video' | 'image' | 'audio' | 'text') => {
    const toolMap: Record<string, 'video-generation' | 'image-generation' | 'audio-tool' | 'text-generation'> = {
      video: 'video-generation',
      image: 'image-generation',
      audio: 'audio-tool',
      text: 'text-generation',
    };
    openToolModal(toolMap[actionId]);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">GNEXUS</span>
              </div>
            </div>

            <nav className="flex items-center gap-4">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
            <p className="text-muted-foreground">
              Manage your design projects
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsToolsOpen(true)}>
              <Zap className="h-4 w-4 mr-2" />
              AI Tools
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* AI Quick Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-border bg-card p-4"
        >
          <AIQuickActions variant="full" onActionClick={handleAIAction} />
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Projects */}
        {filteredProjects.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Link to={`/projects/${project.id}`} className="flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Layout className="h-5 w-5 text-primary" />
                      </div>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteProject(project.id)}
                          className="text-destructive"
                          disabled={isDeleting === project.id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeleting === project.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Link to={`/projects/${project.id}`}>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {project.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                      <span className={`ml-auto px-2 py-0.5 rounded-full ${project.status === 'active'
                        ? 'bg-success/20 text-success'
                        : 'bg-muted text-muted-foreground'
                        }`}>
                        {project.status}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Layout className="h-5 w-5 text-primary" />
                  </div>
                  <Link to={`/projects/${project.id}`} className="flex-1">
                    <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.description || 'No description'}
                    </p>
                  </Link>
                  <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'active'
                    ? 'bg-success/20 text-success'
                    : 'bg-muted text-muted-foreground'
                    }`}>
                    {project.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteProject(project.id)}
                        className="text-destructive"
                        disabled={isDeleting === project.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting === project.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first project to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up your new design project
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name / Idea</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. AI-powered Task Manager"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateProjectDetails}
                  title="Auto-fill details with AI"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your project..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_type">Product Type</Label>
              <Input
                id="product_type"
                placeholder="e.g., SaaS, Mobile App, E-commerce"
                value={newProject.product_type}
                onChange={(e) => setNewProject({ ...newProject, product_type: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex gap-2">
                {['web', 'mobile', 'desktop'].map((platform) => (
                  <Button
                    key={platform}
                    variant={newProject.platforms.includes(platform) ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setNewProject({
                        ...newProject,
                        platforms: newProject.platforms.includes(platform)
                          ? newProject.platforms.filter((p) => p !== platform)
                          : [...newProject.platforms, platform],
                      });
                    }}
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                placeholder="e.g., Small business owners, Students"
                value={newProject.target_audience}
                onChange={(e) => setNewProject({ ...newProject, target_audience: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* AI Tool Modals */}
      <TextGenerationTool />
      <ImageGenerationTool />
      <AudioTool />
      <VideoGenerationTool />
      <ToolsRegistry />

      {/* Tools Dialog */}
      <Dialog open={isToolsOpen} onOpenChange={setIsToolsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gnexus AI Tools</DialogTitle>
            <DialogDescription>
              Access our complete suite of AI tools for every task.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <GnexusToolsGrid />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Projects() {
  return (
    <ProjectsContent />
  );
}

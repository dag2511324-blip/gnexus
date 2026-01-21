import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Settings, BarChart3, Key, ArrowLeft, Mail, Calendar,
  Shield, Zap, Trophy, Download, Upload, Camera, Edit2, Save, X,
  Activity, Clock, TrendingUp, Award, Star, GitBranch, Code,
  Palette, Music, Video, FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ThemeToggleSimple } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  github_username: string | null;
  twitter_username: string | null;
}

interface UsageStats {
  totalGenerations: number;
  totalTokens: number;
  favoriteTask: string;
  joinDate: string;
  lastActive: string;
  streak: number;
  achievements: string[];
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    bio: '',
    avatar_url: '',
    website: '',
    location: '',
    github_username: '',
    twitter_username: '',
  });

  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalGenerations: 0,
    totalTokens: 0,
    favoriteTask: 'text-generation',
    joinDate: '',
    lastActive: '',
    streak: 0,
    achievements: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchProfileData();
    fetchUsageStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        const profile = data as unknown as ProfileData;
        setProfileData({
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || '',
          website: profile.website || '',
          location: profile.location || '',
          github_username: profile.github_username || '',
          twitter_username: profile.twitter_username || '',
        });
      } else {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
          });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    if (!user) return;

    try {
      // Fetch artifacts count instead of generations
      const { count: artifactsCount } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch sessions for activity tracking
      const { data: sessions } = await supabase
        .from('sessions')
        .select('start_time, message_count')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(30);

      const totalTokens = sessions?.reduce((acc, session) => acc + (session.message_count * 100), 0) || 0;

      setUsageStats({
        totalGenerations: artifactsCount || 0,
        totalTokens,
        favoriteTask: 'text-generation',
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : '',
        lastActive: sessions?.[0]?.start_time ? new Date(sessions[0].start_time).toLocaleDateString() : '',
        streak: calculateStreak(sessions || []),
        achievements: generateAchievements(artifactsCount || 0),
      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const calculateStreak = (sessions: { start_time: string }[]) => {
    // Simple streak calculation - can be enhanced
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const recentSessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= yesterday;
    });

    return recentSessions.length > 0 ? Math.min(recentSessions.length, 30) : 0;
  };

  const generateAchievements = (generations: number) => {
    const achievements = [];
    if (generations >= 1) achievements.push('First Generation');
    if (generations >= 10) achievements.push('Rising Star');
    if (generations >= 50) achievements.push('Power User');
    if (generations >= 100) achievements.push('AI Master');
    if (generations >= 500) achievements.push('Legend');
    return achievements;
  };

  const saveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (error) {
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'Failed to upload avatar',
        variant: 'destructive',
      });
    }
  };

  if (isLoading && !profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggleSimple />
      </div>

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-accent/15 to-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Enhanced Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-50 shadow-glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Profile</h1>
                  <p className="text-xs text-muted-foreground">Manage your account and settings</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveProfile} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileData.avatar_url || ''} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/50">
                        {profileData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/80 transition-colors">
                        <Camera className="h-4 w-4" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                        />
                      </label>
                    )}
                  </div>

                  <div className="w-full">
                    {isEditing ? (
                      <Input
                        value={profileData.full_name || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Full Name"
                        className="text-center font-semibold"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold">{profileData.full_name || 'User'}</h2>
                    )}
                    <p className="text-muted-foreground text-sm">{user?.email}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {user?.user_metadata?.role || 'User'}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined {usageStats.joinDate}
                    </Badge>
                  </div>

                  {isEditing ? (
                    <div className="w-full space-y-3">
                      <Input
                        value={profileData.website || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="Website"
                      />
                      <Input
                        value={profileData.location || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Location"
                      />
                      <Input
                        value={profileData.github_username || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, github_username: e.target.value }))}
                        placeholder="GitHub Username"
                      />
                      <div className="relative">
                        <Textarea
                          value={profileData.bio || ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Bio"
                          rows={3}
                          className="pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-8 w-8 text-primary hover:text-primary/80"
                          onClick={generateBio}
                          title="Generate Bio with AI"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full space-y-2 text-sm">
                      {profileData.bio && (
                        <p className="text-muted-foreground">{profileData.bio}</p>
                      )}
                      {profileData.website && (
                        <p className="text-blue-500 hover:underline cursor-pointer">{profileData.website}</p>
                      )}
                      {profileData.location && (
                        <p className="text-muted-foreground">📍 {profileData.location}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Generations</span>
                  <span className="font-semibold">{usageStats.totalGenerations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tokens Used</span>
                  <span className="font-semibold">{usageStats.totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Activity Streak</span>
                  <Badge variant="secondary">{usageStats.streak} days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Active</span>
                  <span className="text-sm">{usageStats.lastActive}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-muted/50 p-1 grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="achievements" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="api" className="gap-2">
                  <Key className="h-4 w-4" />
                  API Keys
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Activity Overview</CardTitle>
                    <CardDescription>Your recent AI generation activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Text Gen</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Images</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg">
                        <Music className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Audio</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-lg">
                        <Video className="h-8 w-8 mx-auto mb-2 text-red-500" />
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Video</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">No recent activity</span>
                        <span className="text-xs text-muted-foreground ml-auto">Never</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Achievements
                    </CardTitle>
                    <CardDescription>Your accomplishments and milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {usageStats.achievements.length > 0 ? (
                        usageStats.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
                            <Trophy className="h-8 w-8 text-amber-500" />
                            <div>
                              <p className="font-semibold">{achievement}</p>
                              <p className="text-sm text-muted-foreground">Achievement unlocked!</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Start generating to unlock achievements!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Customize your experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates about your generations</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Use dark theme across the platform</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-save History</Label>
                        <p className="text-sm text-muted-foreground">Automatically save generation history</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="space-y-6">
                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage your API access tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">API access coming soon</p>
                      <Button variant="outline" disabled>
                        Generate API Key
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}

// Fix missing import
const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

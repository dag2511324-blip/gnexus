import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  User as UserIcon,
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Zap,
  Award,
  TrendingUp,
  Clock,
  MessageSquare,
  Code,
  FileText,
  Download,
  Upload,
  Camera,
  Edit2,
  Save,
  X,
  Check,
  AlertCircle,
  Info,
  Star,
  Target,
  Activity,
  BarChart3,
  Users,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  Lock,
  Key,
  Smartphone,
  Laptop,
  Globe2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadAvatar } from '@/lib/api/profiles';
import { fetchConversations } from '@/lib/api/supabase-conversations';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  github: string;
  twitter: string;
  linkedin: string;
  phone: string;
  timezone: string;
  language: string;
  theme: string;
  defaultModel: string;
  notifications: {
    email: boolean;
    push: boolean;
    chat: boolean;
    updates: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    showActivity: boolean;
  };
  stats: {
    conversationsCount: number;
    codeGenerated: number;
    filesProcessed: number;
    apiCalls: number;
    storageUsed: number;
    storageLimit: number;
    joinDate: string;
    lastActive: string;
  };
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
    progress: number;
    maxProgress: number;
  }[];
  activity: {
    id: string;
    type: 'chat' | 'code' | 'file' | 'settings';
    title: string;
    description: string;
    timestamp: string;
    metadata?: any;
  }[];
}

const Profile = () => {
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [convCount, setConvCount] = useState(0);

  // Mock profile data - in real app, this would come from API
  const mockProfile: UserProfile = {
    id: user?.id || '',
    email: user?.email || '',
    username: user?.username || 'user',
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    avatar: user?.avatar || '',
    bio: 'Passionate developer and AI enthusiast. Love building innovative solutions and exploring new technologies.',
    location: 'Addis Ababa, Ethiopia',
    website: 'https://johndoe.dev',
    github: 'johndoe',
    twitter: 'johndoe_dev',
    linkedin: 'johndoe',
    phone: '+251 911 234 567',
    timezone: 'Africa/Addis_Ababa',
    language: 'en',
    theme: 'dark',
    defaultModel: 'gpt-4',
    notifications: {
      email: true,
      push: true,
      chat: true,
      updates: false,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showActivity: true
    },
    stats: {
      conversationsCount: 156,
      codeGenerated: 2340,
      filesProcessed: 89,
      apiCalls: 15420,
      storageUsed: 2.3,
      storageLimit: 10,
      joinDate: '2024-01-15',
      lastActive: new Date().toISOString()
    },
    achievements: [
      {
        id: '1',
        title: 'Early Adopter',
        description: 'Joined during the beta phase',
        icon: 'Star',
        unlockedAt: '2024-01-15',
        progress: 100,
        maxProgress: 100
      },
      {
        id: '2',
        title: 'Chat Master',
        description: 'Completed 100+ conversations',
        icon: 'MessageSquare',
        unlockedAt: '2024-03-20',
        progress: 100,
        maxProgress: 100
      },
      {
        id: '3',
        title: 'Code Wizard',
        description: 'Generated 2000+ lines of code',
        icon: 'Code',
        unlockedAt: '2024-04-10',
        progress: 117,
        maxProgress: 200
      }
    ],
    activity: [
      {
        id: '1',
        type: 'chat',
        title: 'New Conversation',
        description: 'Started a conversation about React hooks',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: '2',
        type: 'code',
        title: 'Code Generation',
        description: 'Generated TypeScript utility functions',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: '3',
        type: 'file',
        title: 'File Processing',
        description: 'Processed and analyzed PDF document',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ]
  };

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch real conversation count
        let actualConvCount = 0;
        try {
          const convs = await fetchConversations();
          actualConvCount = convs?.conversations?.length || 0;
        } catch (convError) {
          console.warn('Could not fetch conversations:', convError);
        }
        setConvCount(actualConvCount);

        const userProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          username: user.username || 'user',
          firstName: user.firstName || 'John',
          lastName: user.lastName || 'Doe',
          avatar: user.avatar || '',
          bio: user.bio || 'Passionate developer and AI enthusiast.',
          location: user.location || 'Addis Ababa, Ethiopia',
          website: user.website || '',
          github: user.github || '',
          twitter: user.twitter || '',
          linkedin: user.linkedin || '',
          phone: user.phone || '',
          timezone: user.timezone || 'Africa/Addis_Ababa',
          language: user.language || 'en',
          theme: user.theme || 'dark',
          defaultModel: user.defaultModel || 'planner',
          notifications: {
            email: true,
            push: true,
            chat: true,
            updates: false,
            marketing: false
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false,
            showLocation: true,
            showActivity: true
          },
          stats: {
            conversationsCount: actualConvCount,
            codeGenerated: 0,
            filesProcessed: 0,
            apiCalls: 0,
            storageUsed: 0,
            storageLimit: 10,
            joinDate: new Date().toISOString(), // In real app, get from profiles table
            lastActive: new Date().toISOString()
          },
          achievements: [],
          activity: []
        };

        setProfile(userProfile);
        setEditedProfile(userProfile);
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  const handleSave = async () => {
    if (!editedProfile) return;

    setSaving(true);
    try {
      await updateAuthProfile({
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        username: editedProfile.username,
        bio: editedProfile.bio,
        location: editedProfile.location,
        website: editedProfile.website,
        github: editedProfile.github,
        twitter: editedProfile.twitter,
        linkedin: editedProfile.linkedin,
        phone: editedProfile.phone,
        timezone: editedProfile.timezone,
        language: editedProfile.language,
        theme: editedProfile.theme,
        defaultModel: editedProfile.defaultModel,
        avatar: editedProfile.avatar,
      });

      setProfile(editedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      try {
        setSaving(true);
        const publicUrl = await uploadAvatar(user.id, file);
        if (editedProfile) {
          setEditedProfile({
            ...editedProfile,
            avatar: publicUrl
          });
        }
        // Save immediately or let user click save? 
        // Let's save immediately for better UX
        await updateAuthProfile({ avatar: publicUrl });
        toast.success('Avatar updated successfully!');
      } catch (error) {
        toast.error('Failed to upload avatar');
      } finally {
        setSaving(false);
      }
    }
  };

  const getStoragePercentage = () => {
    if (!profile) return 0;
    return (profile.stats.storageUsed / profile.stats.storageLimit) * 100;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      case 'code': return <Code className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      case 'settings': return <Settings className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Star': return <Star className="w-6 h-6" />;
      case 'MessageSquare': return <MessageSquare className="w-6 h-6" />;
      case 'Code': return <Code className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile || !editedProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold/10 to-cyan/10 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-gold/20">
                  <AvatarImage src={profile.avatar} alt={profile.username} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-gold to-cyan text-white">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gold/80 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-muted-foreground">@{profile.username}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(profile.stats.joinDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Last active {new Date(profile.stats.lastActive).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.firstName}
                          onChange={(e) => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-foreground">{profile.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.lastName}
                          onChange={(e) => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-foreground">{profile.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <p className="text-foreground mt-1">{profile.bio}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <p className="text-foreground">{profile.email}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.phone}
                          onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <p className="text-foreground">{profile.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.website}
                          onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <LinkIcon className="w-4 h-4 text-muted-foreground" />
                          <a href={profile.website} className="text-gold hover:underline">
                            {profile.website}
                          </a>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.location}
                          onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <p className="text-foreground">{profile.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">GitHub</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.github}
                          onChange={(e) => setEditedProfile({ ...editedProfile, github: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Github className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">@{profile.github}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Twitter</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.twitter}
                          onChange={(e) => setEditedProfile({ ...editedProfile, twitter: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Twitter className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">@{profile.twitter}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">LinkedIn</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.linkedin}
                          onChange={(e) => setEditedProfile({ ...editedProfile, linkedin: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Linkedin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">@{profile.linkedin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversations</span>
                    <Badge variant="secondary">{profile.stats.conversationsCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Code Generated</span>
                    <Badge variant="secondary">{profile.stats.codeGenerated} lines</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Files Processed</span>
                    <Badge variant="secondary">{profile.stats.filesProcessed}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">API Calls</span>
                    <Badge variant="secondary">{profile.stats.apiCalls}</Badge>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Storage Used</span>
                      <span className="text-sm text-foreground">
                        {profile.stats.storageUsed}GB / {profile.stats.storageLimit}GB
                      </span>
                    </div>
                    <Progress value={getStoragePercentage()} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editedProfile.username}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        username: e.target.value
                      })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={editedProfile.timezone}
                      onValueChange={(value) => setEditedProfile({
                        ...editedProfile,
                        timezone: value
                      })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Addis_Ababa">Africa/Addis Ababa</SelectItem>
                        <SelectItem value="America/New_York">America/New York</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={editedProfile.language}
                      onValueChange={(value) => setEditedProfile({
                        ...editedProfile,
                        language: value
                      })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="am">Amharic</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={editedProfile.theme}
                      onValueChange={(value) => setEditedProfile({
                        ...editedProfile,
                        theme: value
                      })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive email updates</p>
                    </div>
                    <Switch
                      checked={editedProfile.notifications.email}
                      onCheckedChange={(checked) => setEditedProfile({
                        ...editedProfile,
                        notifications: {
                          ...editedProfile.notifications,
                          email: checked
                        }
                      })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications</p>
                    </div>
                    <Switch
                      checked={editedProfile.notifications.push}
                      onCheckedChange={(checked) => setEditedProfile({
                        ...editedProfile,
                        notifications: {
                          ...editedProfile.notifications,
                          push: checked
                        }
                      })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Chat Notifications</Label>
                      <p className="text-sm text-muted-foreground">Notifications for new messages</p>
                    </div>
                    <Switch
                      checked={editedProfile.notifications.chat}
                      onCheckedChange={(checked) => setEditedProfile({
                        ...editedProfile,
                        notifications: {
                          ...editedProfile.notifications,
                          chat: checked
                        }
                      })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive marketing emails</p>
                    </div>
                    <Switch
                      checked={editedProfile.notifications.marketing}
                      onCheckedChange={(checked) => setEditedProfile({
                        ...editedProfile,
                        notifications: {
                          ...editedProfile.notifications,
                          marketing: checked
                        }
                      })}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-password"
                      checked={showPassword}
                      onCheckedChange={setShowPassword}
                    />
                    <Label htmlFor="show-password">Show password</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable 2FA</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch disabled={!isEditing} />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Backup Codes</Label>
                    <p className="text-sm text-muted-foreground">Save these backup codes in a safe place</p>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      <div className="p-2 bg-muted rounded">123456</div>
                      <div className="p-2 bg-muted rounded">789012</div>
                      <div className="p-2 bg-muted rounded">345678</div>
                      <div className="p-2 bg-muted rounded">901234</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.achievements.map((achievement) => (
                <Card key={achievement.id} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gold to-cyan rounded-lg flex items-center justify-center text-white">
                        {getAchievementIcon(achievement.icon)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <CardDescription>{achievement.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                  {achievement.progress === achievement.maxProgress && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-gold text-white">
                        <Check className="w-3 h-3" />
                      </Badge>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-gold">
                        {getActivityIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{item.title}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Usage Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Daily Active Users</span>
                      <Badge variant="secondary">+12%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Weekly Conversations</span>
                      <Badge variant="secondary">+8%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Monthly API Calls</span>
                      <Badge variant="secondary">+15%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Response Time</span>
                      <Badge variant="secondary">245ms</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Uptime</span>
                      <Badge variant="secondary">99.9%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Error Rate</span>
                      <Badge variant="secondary">0.1%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;

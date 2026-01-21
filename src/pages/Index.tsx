import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GnexusProvider } from '@/contexts/GnexusContext';
import { Sidebar } from '@/components/gnexus/Sidebar';
import { ChatPanel } from '@/components/gnexus/ChatPanel';
import { RightPanel } from '@/components/gnexus/RightPanel';
import { Header } from '@/components/gnexus/Header';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import {
  PersonaTool,
  JTBDTool,
  JourneyTool,
  FlowTool,
  WireframeTool,
  ComponentTool,
  MicrocopyTool,
  HandoffTool,
  MarketResearchTool,
  CompetitorTool,
  TrendTool,
  ABTestTool,
  AccessibilityTool,
  ColorPaletteTool,
  TypographyTool,
  ErrorMessageTool,
  OnboardingTool,
  TextGenerationTool,
  ImageGenerationTool,
  AudioTool,
  VideoGenerationTool,
} from '@/components/gnexus/tools';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <GnexusProvider>
      <div className="flex h-screen flex-col bg-background overflow-hidden">
        {/* Top Header with AI Studio Button */}
        <div className="flex items-center justify-between border-b border-border">
          <Header />
          <div className="pr-4">
            <Link to="/ai-studio">
              <Button variant="outline" size="sm" className="gap-2 bg-primary/10 border-primary/30 hover:bg-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Studio
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Chat Area */}
          <main className="flex-1 overflow-hidden">
            <ChatPanel />
          </main>

          {/* Right Panel */}
          <RightPanel />
        </div>

        {/* Tool Modals */}
        <PersonaTool />
        <JTBDTool />
        <JourneyTool />
        <FlowTool />
        <WireframeTool />
        <ComponentTool />
        <MicrocopyTool />
        <HandoffTool />
        <MarketResearchTool />
        <CompetitorTool />
        <TrendTool />
        <ABTestTool />
        <AccessibilityTool />
        <ColorPaletteTool />
        <TypographyTool />
        <ErrorMessageTool />
        <OnboardingTool />
        <TextGenerationTool />
        <ImageGenerationTool />
        <AudioTool />
        <VideoGenerationTool />
      </div>
    </GnexusProvider>
  );
};

export default Index;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GnexusProvider } from '@/contexts/GnexusContext';
import { Sidebar } from '@/components/gnexus/Sidebar';
import { ChatPanel } from '@/components/gnexus/ChatPanel';
import { RightPanel } from '@/components/gnexus/RightPanel';
import { Header } from '@/components/gnexus/Header';
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
import { useAuth } from '@/contexts/AuthContext';

export default function ProjectWorkspace() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <GnexusProvider>
      <div className="flex h-screen flex-col bg-background overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <ChatPanel />
          </main>
          <RightPanel />
        </div>
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
}

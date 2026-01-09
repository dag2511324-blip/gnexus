import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import AIChatWidget from "@/components/AIChatWidget";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/LoadingSpinner";
import { CookieConsent } from "@/components/CookieConsent";
import { SkipToContent } from "@/components/SkipToContent";
import { CommandPalette } from "@/components/CommandPalette";
import { ScrollToTop } from "@/components/ScrollToTop";
import '@/i18n/config';
import { useEffect, Suspense, lazy } from 'react';
import { initGA } from '@/lib/analytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import { GoogleTranslateInitializer } from '@/components/GoogleTranslateInitializer';
import { HelmetProvider } from 'react-helmet-async';

// Lazy load all route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const WebDevelopment = lazy(() => import("./pages/WebDevelopment"));
const ThreeDArchitecture = lazy(() => import("./pages/ThreeDArchitecture"));
const AIAutomation = lazy(() => import("./pages/AIAutomation"));
const GNexusPlatform = lazy(() => import("./pages/GNexusPlatform"));
const About = lazy(() => import("./pages/About"));
const Team = lazy(() => import("./pages/Team"));
const Careers = lazy(() => import("./pages/Careers"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Status = lazy(() => import("./pages/Status"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Chat = lazy(() => import("./pages/Chat"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));

// Auth imports
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient();

const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};

const App = () => {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <ScrollToTop />
                <SkipToContent />
                <AnalyticsTracker />
                <GoogleTranslateInitializer />
                <PageTransition>
                  <Suspense fallback={<PageLoader message="Loading page..." />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/web-development" element={<WebDevelopment />} />
                      <Route path="/3d-architecture" element={<ThreeDArchitecture />} />
                      <Route path="/ai-automation" element={<AIAutomation />} />
                      <Route path="/gnexus" element={<GNexusPlatform />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/careers" element={<Careers />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/documentation" element={<Documentation />} />
                      <Route path="/status" element={<Status />} />
                      <Route path="/portfolio" element={<Portfolio />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                      <Route path="/agent" element={<Navigate to="/chat?mode=agent" replace />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </PageTransition>
                <AIChatWidget />
                <CommandPalette />
                <PWAInstallPrompt />
                <CookieConsent />
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;

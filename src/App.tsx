import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GnexusProvider } from "./contexts/GnexusContext";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Projects from "./pages/Projects";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Admin from "./pages/Admin";
import ToolPage from "./pages/ToolPage";
import ToolsIndex from "./pages/ToolsIndex";
import AIStudio from "./pages/AIStudio";
import Profile from "./pages/Profile";
import AIEnhancementGuide from "./pages/AIEnhancementGuide";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <GnexusProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/new" element={<Projects />} />
                <Route path="/projects/:projectId" element={<ProjectWorkspace />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/tools" element={<ToolsIndex />} />
                <Route path="/tools/:toolId" element={<ToolPage />} />
                <Route path="/ai-studio" element={<AIStudio />} />
                <Route path="/ai-enhancement-guide" element={<AIEnhancementGuide />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </GnexusProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

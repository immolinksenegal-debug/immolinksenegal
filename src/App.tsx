import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FreeEstimation from "./pages/FreeEstimation";
import EstimationManagement from "./pages/EstimationManagement";
import UserManagement from "./pages/UserManagement";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import AIChatbot from "./components/AIChatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/estimation-gratuite" element={<FreeEstimation />} />
          <Route path="/admin/estimations" element={<EstimationManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/comment-ca-marche" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/conditions" element={<Terms />} />
          <Route path="/confidentialite" element={<Privacy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

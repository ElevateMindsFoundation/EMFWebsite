import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Innovations } from './pages/Innovations';
import { InnovationDetail } from './pages/InnovationDetail';
import { EarlyInterventions } from './pages/EarlyInterventions';
import { EarlyInterventionDetail } from './pages/EarlyInterventionDetail';
import { About } from './pages/About';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { NewsEvents } from './pages/NewsEvents';
import { NewsEventDetail } from './pages/NewsEventDetail';
import { Donate } from './pages/Donate';
import { Stories } from './pages/Stories';
import { Volunteer } from './pages/Volunteer';
import { VolunteerDetail } from './pages/VolunteerDetail';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RequireRole } from './components/auth/RequireRole';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminInnovations } from './pages/admin/AdminInnovations';
import { AdminEarlyInterventions } from './pages/admin/AdminEarlyInterventions';
import { AdminNewsEvents } from './pages/admin/AdminNewsEvents';
import { AdminTeam } from './pages/admin/AdminTeam';
import { AdminTestimonials } from './pages/admin/AdminTestimonials';
import { AdminStories } from './pages/admin/AdminStories';
import { AdminVolunteerOpportunities } from './pages/admin/AdminVolunteerOpportunities';
import { AdminContactMessages } from './pages/admin/AdminContactMessages';
import { AdminVolunteerHours } from './pages/admin/AdminVolunteerHours';
import { useAuth } from './store/useAuth';

function App() {
  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="innovations" element={<Innovations />} />
          <Route path="innovations/:id" element={<InnovationDetail />} />
          <Route path="early-interventions" element={<EarlyInterventions />} />
          <Route path="early-interventions/:id" element={<EarlyInterventionDetail />} />
          <Route path="about" element={<About />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="news-events" element={<NewsEvents />} />
          <Route path="news-events/:id" element={<NewsEventDetail />} />
          <Route path="donate" element={<Donate />} />
          <Route path="stories" element={<Stories />} />
          {/* Contact is now merged into the About page; keep the old path working. */}
          <Route path="contact" element={<Navigate to="/about#contact" replace />} />
          <Route path="volunteer" element={<Volunteer />} />
          <Route path="volunteer/:id" element={<VolunteerDetail />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <RequireRole roles={['ADMIN']}>
                  <AdminLayout />
                </RequireRole>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="innovations" element={<AdminInnovations />} />
            <Route path="early-interventions" element={<AdminEarlyInterventions />} />
            <Route path="news-events" element={<AdminNewsEvents />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="stories" element={<AdminStories />} />
            <Route path="volunteer-opportunities" element={<AdminVolunteerOpportunities />} />
            <Route path="contact-messages" element={<AdminContactMessages />} />
            <Route path="volunteer-hours" element={<AdminVolunteerHours />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

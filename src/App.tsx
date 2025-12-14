import {
  Header,
  Footer,
  Hero,
  Experience,
  Education,
  Publications,
  Skills,
  Contact,
  Gallery,
} from './components';
import { AdminThoughts } from './components/admin/AdminThoughts';

/**
 * Main App component
 * Follows Single Responsibility - orchestrates layout only
 * Each section is a self-contained, independently maintainable component
 */
function App() {
  // Check if we're on the admin page
  const isAdminPage = window.location.pathname === '/admin' || window.location.hash === '#admin';

  if (isAdminPage) {
    return <AdminThoughts />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Navigation */}
      <Header />

      {/* Main Content */}
      <main>
        {/* Hero / About Section with Thoughts Sidebar */}
        <Hero />

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Experience Timeline */}
        <Experience />

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Education & Projects */}
        <Education />

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Publications */}
        <Publications />

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Skills & Achievements */}
        <Skills />

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Gallery */}
        <Gallery />

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Contact */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
      </div>
  );
}

export default App;

import {
  Header,
  Footer,
  Hero,
  Experience,
  Education,
  Publications,
  Skills,
  Contact,
} from './components';

/**
 * Main App component
 * Follows Single Responsibility - orchestrates layout only
 * Each section is a self-contained, independently maintainable component
 */
function App() {
  return (
    <div className="relative min-h-screen">
      {/* Navigation */}
      <Header />

      {/* Main Content */}
      <main>
        {/* Hero / About Section */}
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

        {/* Contact */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
      </div>
  );
}

export default App;

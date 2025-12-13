import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { portfolioData } from '../../data/portfolio';
import { Section, Card, LinkButton } from '../ui';

/**
 * Contact section - streamlined with no redundant social links
 * Social links already appear in Hero and Footer
 */
export function Contact() {
  const { personalInfo } = portfolioData;

  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
    },
    {
      icon: Phone,
      label: 'Phone',
      value: personalInfo.phone,
      href: `tel:${personalInfo.phone.replace(/[^+\d]/g, '')}`,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: personalInfo.location,
      href: null,
    },
  ];

  return (
    <Section
      id="contact"
      title="Get In Touch"
      subtitle="Contact"
      className="pb-12"
    >
      <div className="max-w-3xl mx-auto">
        {/* Intro Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-lg text-midnight-300 mb-10"
        >
          Interested in collaborating or discussing AI/ML opportunities? Feel free to reach out!
        </motion.p>

        {/* Contact Cards - Horizontal Layout */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {contactMethods.map((method, index) => (
            <Card key={method.label} glass hover={!!method.href} delay={index * 0.1}>
              {method.href ? (
                <a href={method.href} className="block text-center group">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-gradient-to-br from-accent-500/20 to-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <method.icon className="text-accent-400" size={20} />
                  </div>
                  <h4 className="text-xs text-midnight-400 mb-1">{method.label}</h4>
                  <p className="text-midnight-100 text-sm font-medium group-hover:text-accent-400 transition-colors truncate">
                    {method.value}
                  </p>
                </a>
              ) : (
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-gradient-to-br from-accent-500/20 to-teal-500/20 flex items-center justify-center">
                    <method.icon className="text-accent-400" size={20} />
                  </div>
                  <h4 className="text-xs text-midnight-400 mb-1">{method.label}</h4>
                  <p className="text-midnight-100 text-sm font-medium">{method.value}</p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Single CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <LinkButton
            href={`mailto:${personalInfo.email}`}
            variant="primary"
            size="lg"
          >
            <Send size={18} />
            Send an Email
          </LinkButton>
        </motion.div>
      </div>
    </Section>
  );
}

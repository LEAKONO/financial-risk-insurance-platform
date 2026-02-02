// frontend/src/components/common/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Facebook, Twitter, Linkedin, Instagram, Mail } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Product: [
      { label: 'Risk Assessment', href: '/risk-assessment' },
      { label: 'Policy Management', href: '/dashboard/policies' },
      { label: 'Claims Processing', href: '/dashboard/claims' },
      { label: 'Premium Calculator', href: '/risk-assessment' },
    ],
    Company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Press', href: '#' },
    ],
    Support: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact Us', href: '#' },
      { label: 'Documentation', href: '#' },
      { label: 'API Status', href: '#' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'GDPR', href: '#' },
    ],
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">RiskGuard</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Advanced risk management and insurance solutions powered by AI. 
              Protecting businesses with cutting-edge technology and comprehensive coverage.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">
              © {currentYear} RiskGuard Insurance. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>support@riskgard.com</span>
              </div>
              <div className="text-gray-400">
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  24/7 Support Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
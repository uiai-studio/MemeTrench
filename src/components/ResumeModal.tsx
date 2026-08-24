import React, { useState } from 'react';
import { X, Download, Printer, Copy, Check, ExternalLink, Award, FileText, User, Mail, MapPin, Code, Briefcase, GraduationCap, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ResumeModalProps {
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDirectDownloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      // Margins & Dimensions (A4 is 595.28 x 841.89 pt)
      const leftMargin = 38;
      const rightMargin = 557;
      const contentWidth = rightMargin - leftMargin;
      let y = 42;

      // Primary Colors
      const primaryColor = [15, 23, 42]; // #0f172a
      const accentBlue = [2, 132, 199];  // #0284c7
      const textSlate = [51, 65, 85];    // #334155
      const mutedSlate = [100, 116, 139];// #64748b

      // HEADER
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('MUHAMMAD IDRIS UMAR', leftMargin, y);
      y += 16;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
      doc.text('FULL-STACK & WEB3 SOFTWARE ENGINEER', leftMargin, y);
      y += 14;

      // Contact bar
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
      doc.text('Email: uiai.studio@gmail.com   |   Location: Nigeria (Open to Global Remote)   |   GitHub: https://github.com/uiai-studio', leftMargin, y);
      y += 8;

      // Divider
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(1.5);
      doc.line(leftMargin, y, rightMargin, y);
      y += 16;

      // Helper function to draw Section Title
      const drawSectionTitle = (title: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(title.toUpperCase(), leftMargin, y);
        y += 4;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.8);
        doc.line(leftMargin, y, rightMargin, y);
        y += 11;
      };

      // SECTION 1: PROFESSIONAL SUMMARY
      drawSectionTitle('Professional Summary');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
      const summaryText = 'High-velocity, self-taught Full-Stack and Web3 Software Engineer specializing in modern TypeScript, React 18, Node.js, and decentralized application architecture. Proven track record of building, shipping, and maintaining responsive web applications, real-time trading interfaces, and RESTful API backends. Driven by clean code, intuitive UI/UX, robust error-handling, and rapid execution without institutional bureaucracy.';
      const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
      doc.text(splitSummary, leftMargin, y);
      y += splitSummary.length * 11 + 6;

      // SECTION 2: CORE TECHNICAL COMPETENCIES
      drawSectionTitle('Core Technical Competencies (100% Verified Hands-On)');
      
      const skills = [
        { category: 'Frontend Engineering:', desc: 'TypeScript, JavaScript (ES6+), React 18, Vite, Tailwind CSS, Lucide Icons, HTML5/CSS3, Component Architecture, React Hooks & Context API.' },
        { category: 'Backend & Systems:', desc: 'Node.js, Express.js, RESTful APIs, JSON Middleware, WebSocket Streams, Rate-Limiting, Server-Side Caching, Google Cloud Run.' },
        { category: 'Web3 & DeFi Integration:', desc: 'Solana Web3.js, Wallet Adapters (Phantom, Solflare), EVM Ethers/Viem, Smart Contract ABIs, Token Metadata, Bonding Curve Math.' },
        { category: 'Developer Workflow:', desc: 'Git, GitHub, Linux Shell, NPM/Yarn, Postman, TypeScript Compiler (TSC), ESLint, CI/CD Deployments, Automated Testing.' },
      ];

      skills.forEach((s) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(s.category, leftMargin, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
        const splitDesc = doc.splitTextToSize(s.desc, contentWidth - 125);
        doc.text(splitDesc, leftMargin + 125, y);
        y += Math.max(splitDesc.length * 10.5, 12);
      });
      y += 5;

      // SECTION 3: FEATURED SHIPPED PROJECTS
      drawSectionTitle('Featured Shipped Projects');

      // Project 1
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('1. MemeTrench Protocol & TrenchScreen Terminal (Lead Architect & Developer)', leftMargin, y);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
      doc.text('GitHub: https://github.com/uiai-studio', rightMargin - 150, y);
      y += 11;

      const p1Bullets = [
        'Engineered a full-stack Web3 trading and security platform with a high-frequency React/TypeScript frontend and an Express/Node.js backend proxy.',
        'Built interactive bonding-curve swap simulators, real-time market risk gauges, and dynamic fee-distribution logic (creator salary streams + holder dividends).',
        'Implemented contract risk screening modules that parse on-chain parameters to flag malicious honeypots, mint privileges, and liquidity freezes in sub-second response times.',
        'Optimized UI rendering and layout math to ensure zero layout-shift across all desktop and mobile screens.'
      ];

      p1Bullets.forEach((bullet) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
        doc.text('•', leftMargin + 6, y);
        const splitBullet = doc.splitTextToSize(bullet, contentWidth - 18);
        doc.text(splitBullet, leftMargin + 16, y);
        y += splitBullet.length * 10 + 1.5;
      });
      y += 4;

      // Project 2
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('2. Real-Time Web3 Security & Asset Dashboard', leftMargin, y);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
      doc.text('GitHub: https://github.com/uiai-studio', rightMargin - 150, y);
      y += 11;

      const p2Bullets = [
        'Developed a modular multi-chain token analytics dashboard utilizing asynchronous API fetching, custom filtering, and responsive Tailwind styling.',
        'Integrated non-custodial wallet connection adapters with auto-reconnect and transaction status modals.',
        'Designed clean data visualizations and status badges for fast, digestible risk interpretation.'
      ];

      p2Bullets.forEach((bullet) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
        doc.text('•', leftMargin + 6, y);
        const splitBullet = doc.splitTextToSize(bullet, contentWidth - 18);
        doc.text(splitBullet, leftMargin + 16, y);
        y += splitBullet.length * 10 + 1.5;
      });
      y += 5;

      // SECTION 4: PRACTICAL EXPERIENCE
      drawSectionTitle('Practical Experience');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Full-Stack & Web3 Developer (Independent / Project-Based)', leftMargin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
      doc.text('2023 – Present  |  Remote', rightMargin - 95, y);
      y += 11;

      const expBullets = [
        'Shipped and deployed responsive single-page applications (SPAs) and full-stack web applications to cloud containers.',
        'Built secure server-side API proxy routes to protect sensitive credentials and manage rate-limits.',
        'Refactored legacy frontend code into modular, reusable React components, reducing bundle sizes and eliminating redundant re-renders.',
        'Debugged cross-browser rendering bugs and async data race conditions across production builds.'
      ];

      expBullets.forEach((bullet) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
        doc.text('•', leftMargin + 6, y);
        const splitBullet = doc.splitTextToSize(bullet, contentWidth - 18);
        doc.text(splitBullet, leftMargin + 16, y);
        y += splitBullet.length * 10 + 1.5;
      });
      y += 5;

      // SECTION 5: EDUCATION & LEARNING ETHOS
      drawSectionTitle('Education & Learning Ethos');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Independent & Self-Taught Engineer', leftMargin, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
      const eduText = 'Continuous, rigorous project-based mastery in Software Engineering, Modern Web Architecture, and Blockchain Development. Committed to practical proof-of-work, clear architecture, and high-velocity shipping.';
      const splitEdu = doc.splitTextToSize(eduText, contentWidth);
      doc.text(splitEdu, leftMargin, y);

      // SAVE DIRECT PDF TO DISK
      doc.save('Muhammad_Idris_Umar_Resume.pdf');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = () => {
    const resumeText = `MUHAMMAD IDRIS UMAR
Full-Stack & Web3 Software Engineer
Email: uiai.studio@gmail.com | Location: Nigeria (Open to Global Remote)
GitHub: https://github.com/uiai-studio

================================================================================
PROFESSIONAL SUMMARY
High-velocity, self-taught Full-Stack and Web3 Software Engineer specializing in modern TypeScript, React 18, Node.js, and decentralized application architecture. Proven track record of building, shipping, and maintaining responsive web applications, real-time trading interfaces, and RESTful API backends. Driven by clean code, intuitive UI/UX, robust error-handling, and rapid execution without institutional bureaucracy.

================================================================================
CORE TECHNICAL COMPETENCIES
- Frontend Engineering: TypeScript, JavaScript (ES6+), React 18, Vite, Tailwind CSS, Lucide Icons, HTML5/CSS3, Responsive UI/UX, Component Architecture, React Hooks & Context API.
- Backend & Systems: Node.js, Express.js, RESTful APIs, JSON Middleware, WebSocket Streams, Rate-Limiting, Server-Side Caching, Google Cloud Run, Containerized Microservices.
- Web3 & DeFi Integration: Solana Web3.js, Wallet Adapters (Phantom, Solflare), EVM Ethers/Viem, Smart Contract ABIs & Program Interaction, Token Metadata, Bonding Curve Simulation.
- Developer Workflow: Git, GitHub, Linux Shell, NPM/Yarn, Postman, TypeScript Compiler (TSC), ESLint, CI/CD Deployments, Automated Invariant Testing.

================================================================================
FEATURED SHIPPED PROJECTS

1. MemeTrench Protocol & TrenchScreen Terminal (Lead Architect & Developer)
   Live App: https://ais-pre-aq5jcyrpikvf4s7wo4cvxo-517768755508.europe-west2.run.app
   GitHub: https://github.com/uiai-studio
   • Engineered a full-stack Web3 trading and security platform with a high-frequency React/TypeScript frontend and an Express/Node.js backend proxy.
   • Built interactive bonding-curve swap simulators, real-time market risk gauges, and dynamic fee-distribution logic (creator salary streams + holder dividends).
   • Implemented contract risk screening modules that parse on-chain parameters to flag malicious honeypots, mint privileges, and liquidity freezes in sub-second response times.
   • Optimized UI rendering and layout math to ensure zero layout-shift across all desktop and mobile screens.

2. Real-Time Web3 Security & Asset Dashboard
   GitHub: https://github.com/uiai-studio
   • Developed a modular multi-chain token analytics dashboard utilizing asynchronous API fetching, custom filtering, and responsive Tailwind styling.
   • Integrated non-custodial wallet connection adapters with auto-reconnect and transaction status modals.
   • Designed clean data visualizations and status badges for fast, digestible risk interpretation.

================================================================================
PRACTICAL EXPERIENCE

Full-Stack & Web3 Developer (Independent / Project-Based) | Remote (2023 – Present)
• Shipped and deployed responsive single-page applications (SPAs) and full-stack web applications to cloud containers.
• Built secure server-side API proxy routes to protect sensitive credentials and manage rate-limits.
• Refactored legacy frontend code into modular, reusable React components, reducing bundle sizes and eliminating redundant re-renders.
• Debugged cross-browser rendering bugs and async data race conditions across production builds.

================================================================================
EDUCATION & LEARNING ETHOS
Independent & Self-Taught Engineer
• Continuous, rigorous project-based mastery in Software Engineering, Modern Web Architecture, and Blockchain Development. Committed to practical proof-of-work and high-velocity iteration.`;

    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md">
      <div className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl sm:rounded-3xl border border-neutral-750 bg-neutral-950 p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6">
        
        {/* Modal Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500/10 p-2 sm:p-2.5 text-amber-400 border border-amber-500/20 flex-shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Muhammad Idris Umar — Official Resume
                </h2>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  1-Page Verified PDF
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                Full-Stack & Web3 Software Engineer • Direct 1-Click PDF Download or Copy Clean Text
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold transition"
              title="Copy Resume Plaintext"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            {/* Direct 1-Click Download PDF */}
            <button
              onClick={handleDirectDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
              title="Direct Download PDF File"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold transition"
              title="Print via Browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition cursor-pointer"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Resume Paper Sheet */}
        <div id="resume-sheet" className="bg-white text-slate-900 rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 shadow-xl border border-neutral-200 text-xs sm:text-sm font-sans space-y-5 sm:space-y-6">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-950">
                Muhammad Idris Umar
              </h1>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">
                Full-Stack & Web3 Software Engineer
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-sky-600" />
                <a href="mailto:uiai.studio@gmail.com" className="text-sky-700 hover:underline">uiai.studio@gmail.com</a>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                Nigeria (Open to Global Remote)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Code className="w-3.5 h-3.5 text-sky-600" />
                <a href="https://github.com/uiai-studio" target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline font-semibold">
                  github.com/uiai-studio ↗
                </a>
              </span>
            </div>
          </div>

          {/* Professional Summary */}
          <section className="space-y-1.5">
            <h2 className="text-xs font-extrabold tracking-wider uppercase text-slate-950 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-600" />
              Professional Summary
            </h2>
            <p className="text-slate-700 leading-relaxed">
              High-velocity, self-taught Full-Stack and Web3 Software Engineer specializing in modern TypeScript, React 18, Node.js, and decentralized application architecture. Proven track record of building, shipping, and maintaining responsive web applications, real-time trading interfaces, and RESTful API backends. Driven by clean code, intuitive UI/UX, robust error-handling, and rapid execution without institutional bureaucracy.
            </p>
          </section>

          {/* Core Technical Competencies */}
          <section className="space-y-2">
            <h2 className="text-xs font-extrabold tracking-wider uppercase text-slate-950 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-sky-600" />
              Core Technical Competencies (100% Verified Hands-On)
            </h2>
            <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <strong className="text-slate-950 min-w-[170px]">Frontend Engineering:</strong>
                <span>TypeScript, JavaScript (ES6+), React 18, Vite, Tailwind CSS, Lucide Icons, HTML5/CSS3, Component Architecture, React Hooks & Context API.</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <strong className="text-slate-950 min-w-[170px]">Backend & Systems:</strong>
                <span>Node.js, Express.js, RESTful APIs, JSON Middleware, WebSocket Streams, Rate-Limiting, Server-Side Caching, Google Cloud Run.</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <strong className="text-slate-950 min-w-[170px]">Web3 & DeFi Integration:</strong>
                <span>Solana Web3.js, Wallet Adapters (Phantom, Solflare), EVM Ethers/Viem, Smart Contract ABIs, Token Metadata, Bonding Curve Math.</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <strong className="text-slate-950 min-w-[170px]">Developer Workflow:</strong>
                <span>Git, GitHub, Linux Shell, NPM/Yarn, Postman, TypeScript Compiler (TSC), ESLint, CI/CD Deployments, Automated Testing.</span>
              </div>
            </div>
          </section>

          {/* Featured Shipped Projects */}
          <section className="space-y-3">
            <h2 className="text-xs font-extrabold tracking-wider uppercase text-slate-950 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-sky-600" />
              Featured Shipped Projects
            </h2>

            {/* Project 1 */}
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                <h3 className="font-bold text-slate-950 text-xs sm:text-sm">
                  1. MemeTrench Protocol & TrenchScreen Terminal (Lead Architect & Developer)
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <a href="https://ais-pre-aq5jcyrpikvf4s7wo4cvxo-517768755508.europe-west2.run.app" target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">
                    Live Demo ↗
                  </a>
                  <span>•</span>
                  <a href="https://github.com/uiai-studio" target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">
                    GitHub Repo ↗
                  </a>
                </div>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 text-xs leading-relaxed">
                <li>Engineered a full-stack Web3 trading and security platform with a high-frequency React/TypeScript frontend and an Express/Node.js backend proxy.</li>
                <li>Built interactive bonding-curve swap simulators, real-time market risk gauges, and dynamic fee-distribution logic (creator salary streams + holder dividends).</li>
                <li>Implemented contract risk screening modules that parse on-chain parameters to flag malicious honeypots, mint privileges, and liquidity freezes in sub-second response times.</li>
                <li>Optimized UI rendering and layout math to ensure zero layout-shift across all desktop and mobile screens.</li>
              </ul>
            </div>

            {/* Project 2 */}
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                <h3 className="font-bold text-slate-950 text-xs sm:text-sm">
                  2. Real-Time Web3 Security & Asset Dashboard
                </h3>
                <a href="https://github.com/uiai-studio" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-sky-700 hover:underline">
                  GitHub: github.com/uiai-studio ↗
                </a>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 text-xs leading-relaxed">
                <li>Developed a modular multi-chain token analytics dashboard utilizing asynchronous API fetching, custom filtering, and responsive Tailwind styling.</li>
                <li>Integrated non-custodial wallet connection adapters with auto-reconnect and transaction status modals.</li>
                <li>Designed clean data visualizations and status badges for fast, digestible risk interpretation.</li>
              </ul>
            </div>
          </section>

          {/* Practical Experience */}
          <section className="space-y-1.5">
            <h2 className="text-xs font-extrabold tracking-wider uppercase text-slate-950 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-sky-600" />
              Practical Experience
            </h2>
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-slate-950">Full-Stack & Web3 Developer (Independent / Project-Based)</span>
              <span className="text-slate-500 font-medium">2023 – Present • Remote</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 text-xs leading-relaxed">
              <li>Shipped and deployed responsive single-page applications (SPAs) and full-stack web applications to cloud containers.</li>
              <li>Built secure server-side API proxy routes to protect sensitive credentials and manage rate-limits.</li>
              <li>Refactored legacy frontend code into modular, reusable React components, reducing bundle sizes and eliminating redundant re-renders.</li>
              <li>Debugged cross-browser rendering bugs and async data race conditions across production builds.</li>
            </ul>
          </section>

          {/* Education & Learning Ethos */}
          <section className="space-y-1">
            <h2 className="text-xs font-extrabold tracking-wider uppercase text-slate-950 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
              Education & Learning Ethos
            </h2>
            <div className="text-xs font-bold text-slate-950">Independent & Self-Taught Engineer</div>
            <p className="text-slate-700 text-xs leading-relaxed">
              Continuous, rigorous project-based mastery in Software Engineering, Modern Web Architecture, and Blockchain Development. Committed to practical proof-of-work, clear architecture, and high-velocity shipping.
            </p>
          </section>

        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Ready for 1517 Fund, Superteam, and Global Remote Roles</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};

import { useState, useRef, useEffect } from 'react';

interface ContactOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onHoverButton?: (hovering: boolean) => void;
}

export function ContactOverlay({ isOpen, onClose, onHoverButton }: ContactOverlayProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      // Longer delay to prevent immediate closing from trigger click
      const timeoutId = setTimeout(() => {
        window.addEventListener('click', handleClickOutside);
      }, 300);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('click', handleClickOutside);
      };
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus('sending');

    // Simulate sending (in real app, would send to backend)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStatus('sent');

    // Reset after delay
    setTimeout(() => {
      setStatus('idle');
      setName('');
      setEmail('');
      setMessage('');
    }, 3000);
  };

  const handleButtonHover = (hovering: boolean) => {
    onHoverButton?.(hovering);
  };

  if (!isOpen) return null;

  return (
    <div data-ev-id="ev_17c54b487d" className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div data-ev-id="ev_d1fc97f05c" className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Contact Container */}
      <div data-ev-id="ev_1807a352d5"
      ref={overlayRef}
      className="relative z-10 flex flex-col items-center">

        {/* Title */}
        <h2 data-ev-id="ev_d3c06ce4f8"
        className="font-mono text-[13px] tracking-[0.5em] text-white/90 mb-6"
        style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>

          CONTACT
        </h2>
        
        {/* Email */}
        <a data-ev-id="ev_fdbd86ef05"
        href="mailto:medullart@gmail.com"
        className="font-mono text-[11px] tracking-wider text-white/40 hover:text-violet-400/80 transition-colors mb-10">

          medullart@gmail.com
        </a>

        {/* Circular Form Container */}
        <div data-ev-id="ev_927b54f542"
        className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px] rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
          boxShadow: 'inset 0 0 60px rgba(139, 92, 246, 0.1), 0 0 80px rgba(139, 92, 246, 0.05)',
          border: '1px solid rgba(139, 92, 246, 0.15)'
        }}>

          {/* Inner glow accent */}
          <div data-ev-id="ev_8a1714444b"
          className="absolute inset-4 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 70% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)'
          }} />

          
          {/* Form */}
          <form data-ev-id="ev_df03e41765"
          onSubmit={handleSubmit}
          className="relative z-10 flex flex-col items-center gap-5 w-[200px] md:w-[260px]">

            {/* Name Field */}
            <div data-ev-id="ev_6c59fb261d" className="w-full">
              <label data-ev-id="ev_c69b607c1c" className="font-mono text-[9px] tracking-[0.3em] text-white/30 mb-1 block">
                NAME
              </label>
              <input data-ev-id="ev_cc1165b9aa"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-white/10 focus:border-violet-400/50 outline-none font-mono text-[11px] text-white/80 py-2 transition-colors placeholder:text-white/20"
              placeholder="_" />

            </div>

            {/* Email Field */}
            <div data-ev-id="ev_94ac5add3b" className="w-full">
              <label data-ev-id="ev_03ce7bacb2" className="font-mono text-[9px] tracking-[0.3em] text-white/30 mb-1 block">
                EMAIL
              </label>
              <input data-ev-id="ev_5f1fd2aeb0"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-white/10 focus:border-violet-400/50 outline-none font-mono text-[11px] text-white/80 py-2 transition-colors placeholder:text-white/20"
              placeholder="_" />

            </div>

            {/* Message Field */}
            <div data-ev-id="ev_4d9231fcc6" className="w-full">
              <label data-ev-id="ev_ceedb1b57b" className="font-mono text-[9px] tracking-[0.3em] text-white/30 mb-1 block">
                MESSAGE
              </label>
              <textarea data-ev-id="ev_3f7e50b0b4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full bg-transparent border-b border-white/10 focus:border-violet-400/50 outline-none font-mono text-[10px] text-white/80 py-2 transition-colors resize-none placeholder:text-white/20"
              placeholder="_" />

            </div>

            {/* Submit Button */}
            <button data-ev-id="ev_4883e30253"
            type="submit"
            disabled={status === 'sending' || status === 'sent'}
            onMouseEnter={() => handleButtonHover(true)}
            onMouseLeave={() => handleButtonHover(false)}
            className={`font-mono text-[10px] tracking-[0.3em] px-6 py-3 mt-2 transition-all duration-500 ${
            status === 'sent' ?
            'text-violet-300 border border-violet-400/50 bg-violet-400/10' :
            status === 'sending' ?
            'text-white/50 border border-white/20 animate-pulse' :
            'text-white/60 border border-white/20 hover:text-violet-300 hover:border-violet-400/50 hover:bg-violet-400/5 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]'}`
            }
            style={{ borderRadius: '2px' }}>

              {status === 'sent' ? 'RECEIVED' : status === 'sending' ? 'TRANSMITTING...' : 'SEND TRANSMISSION'}
            </button>
          </form>
        </div>

        {/* Close hint */}
        <p data-ev-id="ev_d7f7f66287" className="font-mono text-[9px] text-white/20 tracking-wider mt-8">
          [ ESC TO CLOSE ]
        </p>
      </div>
    </div>);

}
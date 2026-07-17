import { useEffect, useRef } from 'react';
import artwork01 from '@/assets/uploads/artwork-01.png';
import artwork02 from '@/assets/uploads/artwork-02.png';
import artwork03 from '@/assets/uploads/artwork-03.png';
import artwork04 from '@/assets/uploads/artwork-04.png';
import artwork05 from '@/assets/uploads/artwork-05.png';
import artwork06 from '@/assets/uploads/artwork-06.png';
import artwork07 from '@/assets/uploads/artwork-07.png';

const artworks = [
{ src: artwork01, alt: '3D surreal artwork with humanoid figures and abstract chrome structures' },
{ src: artwork02, alt: 'Aerial view surreal scene with green and blue humanoid figures on cracked earth' },
{ src: artwork03, alt: 'Surreal desert landscape with multiple humanoid sculptures and abstract forms' },
{ src: artwork04, alt: 'Ethereal cloud scene with organic winged structures and golden rings' },
{ src: artwork05, alt: 'Green figure in ornate golden room with eyes and organic tendrils' },
{ src: artwork06, alt: 'Chrome faces and abstract forms against blue sky with spiral pattern' },
{ src: artwork07, alt: 'Medullart artwork - surreal humanoid digital art' }];


interface ArtworksGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArtworksGallery({ isOpen, onClose }: ArtworksGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLElement | null)[]>([]);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll-based fade-in animation
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-20');
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div data-ev-id="ev_d60c3f349e"
    className="fixed inset-0 z-50 overflow-hidden"
    style={{ backgroundColor: '#0b0c10' }}>

      {/* Close button */}
      <button data-ev-id="ev_a23405733a"
      onClick={onClose}
      className="fixed top-6 right-6 z-50 text-white/50 hover:text-white text-sm tracking-widest transition-colors">

        [ X ]
      </button>

      {/* Scrollable container */}
      <div data-ev-id="ev_fd7d9ddef2"
      ref={containerRef}
      className="h-full overflow-y-auto overflow-x-hidden scroll-smooth"
      style={{ scrollBehavior: 'smooth' }}>

        {/* Top padding */}
        <div data-ev-id="ev_9413f08780" className="h-24" />

        {/* Artworks */}
        <div data-ev-id="ev_2815f423ff" className="flex flex-col items-center gap-16 px-8 pb-32">
          {artworks.map((artwork, index) =>
          <div data-ev-id="ev_270802e0b8"
          key={index}
          ref={(el) => {imageRefs.current[index] = el;}}
          className="w-full max-w-4xl opacity-0 translate-y-20 transition-all duration-1000 ease-out">

              <img data-ev-id="ev_d32410632f"
            src={artwork.src}
            alt={artwork.alt}
            className="w-full h-auto object-contain"
            loading="lazy" />

            </div>
          )}

          {/* SoundCloud link */}
          <a data-ev-id="ev_ecdfdc51a5"
          href="https://soundcloud.com/medullart"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 opacity-0 translate-y-20 transition-all duration-1000 ease-out group"
          ref={(el) => {imageRefs.current[artworks.length] = el as HTMLElement;}}>

            <svg data-ev-id="ev_cdf77cd207"
            viewBox="0 0 24 24"
            className="w-12 h-12 fill-white/40 group-hover:fill-[#ff5500] transition-colors">

              <path data-ev-id="ev_a2aad665f7" d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.01-.057-.05-.1-.1-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c.014.057.045.094.09.094s.089-.037.099-.094l.21-1.308-.21-1.334c-.01-.057-.044-.09-.09-.09m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.104.106.104.061 0 .12-.044.12-.104l.24-2.458-.24-2.563c0-.06-.059-.104-.12-.104m.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.138l.24-2.544-.24-2.64c-.015-.075-.074-.135-.149-.135l-.017-.001m1.155.36c-.005-.09-.075-.149-.159-.149-.09 0-.158.06-.164.149l-.217 2.43.2 2.563c.005.09.075.157.163.157.074 0 .148-.068.148-.158l.227-2.563-.18-2.43m.809-1.709c-.101 0-.18.09-.18.18l-.21 3.957.187 2.563c0 .09.08.164.18.164.094 0 .174-.09.18-.18l.209-2.563-.21-3.972c-.008-.09-.086-.149-.18-.149m.961-.39c-.105 0-.195.09-.21.195l-.165 4.157.18 2.563c.015.09.09.18.195.18.09 0 .18-.09.18-.18l.195-2.563-.21-4.157c-.015-.105-.09-.195-.18-.195m1.155.69c-.015-.105-.105-.195-.21-.21-.12 0-.21.105-.21.21l-.165 3.653.165 2.564c0 .12.09.209.21.209.105 0 .195-.089.195-.209l.18-2.564-.18-3.653m.749-1.515c-.12 0-.225.105-.225.225l-.135 4.857.135 2.549c0 .135.105.24.24.24.12 0 .209-.105.225-.24l.165-2.549-.165-4.857c-.015-.12-.105-.225-.225-.225m1.005.105c-.135 0-.24.105-.255.24l-.15 4.635.15 2.52c.015.15.12.255.255.255.12 0 .24-.105.24-.255l.165-2.52-.15-4.62c-.015-.15-.12-.255-.255-.255m.987-.93c-.029 0-.061.016-.09.016-.029 0-.045-.016-.075-.016-.15 0-.27.12-.27.27l-.134 5.444.135 2.493c0 .15.12.271.27.271.135 0 .255-.12.255-.271l.15-2.493-.15-5.443c-.016-.15-.12-.271-.271-.271m1.064.18c-.165 0-.3.135-.3.3l-.12 5.093.12 2.463c0 .165.135.3.3.3.15 0 .3-.135.3-.3l.135-2.463-.135-5.108c0-.165-.135-.3-.3-.285m1.064-.555c-.18 0-.314.135-.314.315l-.12 5.317.12 2.43c0 .18.135.315.315.315.165 0 .315-.135.315-.315l.12-2.43-.135-5.317c0-.18-.135-.315-.315-.315m3.18 2.79c-.21 0-.42.016-.614.045-.09-1.95-1.725-3.492-3.72-3.492-.48 0-.945.09-1.38.254-.165.06-.21.12-.21.24v6.93c0 .135.09.24.21.255h5.699c1.2 0 2.176-.976 2.176-2.176 0-1.185-.96-2.161-2.161-2.056" />
            </svg>
            <span data-ev-id="ev_c4c07c280e" className="text-white/30 text-[10px] tracking-widest group-hover:text-white/60 transition-colors">
              SOUNDCLOUD
            </span>
          </a>
        </div>
      </div>
    </div>);

}
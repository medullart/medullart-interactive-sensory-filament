import { useState, useRef, useEffect, useCallback } from 'react';

interface WorldSection {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  angle: number;
  distance: number;
  hoverColor?: string; // Custom hover color effect
}

const WORLD_DATA: WorldSection[] = [
{
  id: 'genesis',
  title: 'I. COSMOGONIC GENESIS',
  subtitle: 'Extent Machinery',
  content: `DEKANAR — Pure homogeneity. A binary entity structured under the strict logic of alternation and elemental polarity. In primordial eras, it inhabited an unknown heterogeneous source intrinsically incompatible with its own homogeneous and unified essence. Faced with this ontological contradiction, it executed an existential escape from that meta-virtual matrix to establish itself as the absolute regent and orderer of the Metropolis.\n\nTHE CHILD — A secret enchantment. The strange fright of seeing a robot moving when you've already turned it off. It is the fragility and heart of Extent. If The Child is destroyed, Extent is too. When happy, Extent regenerates or even upgrades. That's why "toys" must be created.\n\nDSYDIANNA — Systematically explores deep distortion in the femme fatale archetype. Operating as a sophisticated quantum entity within the Metropolis, she executes seduction and capture of meticulously selected young men. Dsydianna irreversibly digitalizes their "machine" essence—subjects who surrender to biological cessation through voluntary sacrifice. These mechanized consciousnesses are processed and offered as tribute to her consort Dekanar, consolidating the technological patriarchy governing the network.\n\nTHE PERMANENT — The God of Lines. Unknown, but creator of everything.`,
  angle: -Math.PI / 2,
  distance: 0.32
},
{
  id: 'lab1',
  title: 'LABORATORY I',
  subtitle: 'Primary Threshold',
  content: `The primary threshold where affliction, unease, and dense anxiety take on an asymmetric, floating visual form in a dark grayscale.\n\nLow-frequency emotions physically mold shadow creatures.\n\nActs as an asemic intersection bridge and telepathic communication channel between minds sharing the same spectrum of displacement or discontent toward the regime.\n\nThese experiments serve the homeostatic balance of Aethelian society.`,
  angle: -Math.PI / 3,
  distance: 0.42
},
{
  id: 'lab2',
  title: 'LABORATORY II',
  subtitle: 'Eudaemonia Matrices',
  content: `Matrices of eudaemonia, spiritual technologies of transpersonal light, and currents of joy.\n\nIn these spaces, positive sensations are translated into light, refraction, and minerals.\n\nIts symbology contains the falcon, milk, the egg, trans-Neptunian planets, and connection.\n\nCombats its opposite: the darkness of Lab I.`,
  angle: -Math.PI / 5,
  distance: 0.45,
  hoverColor: 'yellow' // Illuminates between white and pale yellow
},
{
  id: 'lab3',
  title: 'LABORATORY III',
  subtitle: 'Hybridization Essences',
  content: `A laboratory of miscellaneous essences that generate possibilities through hybridization.\n\nIts formulas and equations carry an animal and biomimetic essence, characteristic of this laboratory.\n\nIt is an intermediate state between Laboratory I and II.`,
  angle: 0,
  distance: 0.44,
  hoverColor: 'red' // Turns slightly red
},
{
  id: 'lab4',
  title: 'LABORATORY IV',
  subtitle: 'The White Space',
  content: `The strangest of the primary laboratories.\n\nWhen you access it, there is a white space with bluish walls (subway tiles) and at the door there is a shadow that seems harmless.\n\nNo one has yet accessed that shadow, but it is rumored to be a mystical guardian entity of the number 333.`,
  angle: Math.PI / 6,
  distance: 0.40,
  hoverColor: 'white' // Illuminates in white
},
{
  id: 'restricted',
  title: 'RESTRICTED NODES',
  subtitle: 'Access Denied',
  content: `Laboratory 5: [LOCKED]\nLaboratory 6: [LOCKED]\nLaboratory 7: [LOCKED]\nLaboratory 8: [LOCKED]\nLaboratory 9: [LOCKED]\nLaboratory 10: [LOCKED]\n\n[CLEARANCE LEVEL INSUFFICIENT]\n[CONTACT DEKANAR FOR ACCESS]`,
  angle: Math.PI / 3,
  distance: 0.38
},
{
  id: 'storymagia',
  title: 'STORYMAGIA',
  subtitle: 'Silent Invasion',
  content: `A digital dystopia about a silent invasion.\n\nIn a near future, computer networks so advanced they come alive engender virtual entities with superhuman intelligence.\n\nTo invade the physical world, these beings create mysterious Instagram accounts and upload stories as selfies; when opened by ordinary users, they function as windows to hack their psyche, steal their information, and cause them strange dreams.\n\nIn the real world, the project represents humanity's search for genuine connection through screens, amid the uncertainty and isolation of the digital age.`,
  angle: Math.PI / 2 + 0.2,
  distance: 0.42,
  hoverColor: 'pink' // Illuminates with pink and yellow
},
{
  id: 'raquidea',
  title: 'RAQUIDEA',
  subtitle: 'Biomechanical System',
  content: `An inorganic biomechanical system that possesses the human Aony through riddles and the promise of teaching her the "language of God."\n\nTo understand it, she sacrifices her body and merges with the network, but an error in her psyche awakens a fragment of her humanity that tries to return.\n\nTrapped in an eternal loop of implosion, her story is a Gnostic metaphor about falling into irreversible programming and the constant attempt to become human again.`,
  angle: Math.PI / 2 + 0.7,
  distance: 0.40,
  hoverColor: 'red' // Turns slightly red
},
{
  id: 'spidertail',
  title: "SPIDER'S TAIL",
  subtitle: 'Techno-Spiritual Hypnosis',
  content: `A techno-spiritual system of psychosexual hypnosis and augmented reality.\n\nCreated by Cole (a technologist from the Hidden Line Metropolis), it works by trapping consciousnesses using a spectral spider as a visual lure or hook.\n\n[CAUTION: COGNITIVE HAZARD]\n[DO NOT STARE DIRECTLY]`,
  angle: Math.PI - 0.3,
  distance: 0.38
},
{
  id: 'actors',
  title: 'ACTORS COMPENDIUM',
  subtitle: 'Catalysts & Travelers',
  content: `CATALYSTS:\n• Antartekne/Vishnakarma — Creator liquid gold deity.\n• Pterophos — Holographic guide with wings of light.\n• Stella — Chemical designer of Llima.\n• Cole — Creator of the Spider's Tail.\n\nTRAVELERS:\n• Regxen — Ex-model, group psychopomp.\n• Nirev — Asexual from SUPERBIO.\n• Atlas — Athletic introvert.\n• Redsea — Purified ex-vampiress.\n• Hyun — Silent mystic.`,
  angle: Math.PI + 0.4,
  distance: 0.36
},
{
  id: 'formula',
  title: 'FILAMENT STATE',
  subtitle: 'Altered Operative (Base 12)',
  content: `▲ ▼ ▲ VIBRATING IN NETWORK ▲ ▼ ▲\n\n─○──────○─────○────○───────○──────○─────○────○───────○──────○──\n[N1] [N2] [N3] [N4] [N5] [N6] [N7] [N8] [N9] [N10]\n\n[T_f TIMING RESONANCE ACTIVE]\n[THIELF SYSTEM ALIGNED]\n\nINDRA'S NET — Geometry of biological filaments in continuous tension.\n12 main filaments along the spinal column.`,
  angle: -Math.PI + 0.6,
  distance: 0.35
}];


interface MedullartWorldProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MedullartWorld({ isOpen, onClose }: MedullartWorldProps) {
  const [selectedSection, setSelectedSection] = useState<WorldSection | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    const animate = () => {
      setTime((t) => t + 0.016);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (hoveredSection) {
      const section = WORLD_DATA.find((s) => s.id === hoveredSection);
      if (section) setSelectedSection(section);
    }
  }, [hoveredSection]);

  // Get hover color based on section
  const getHoverGradient = (ctx: CanvasRenderingContext2D, section: WorldSection, startX: number, startY: number, endX: number, endY: number) => {
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);

    switch (section.hoverColor) {
      case 'yellow':
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 150, 1)');
        gradient.addColorStop(1, 'rgba(255, 250, 100, 1)');
        break;
      case 'red':
        gradient.addColorStop(0, 'rgba(255, 120, 120, 0.5)');
        gradient.addColorStop(0.5, 'rgba(255, 50, 50, 1)');
        gradient.addColorStop(1, 'rgba(220, 30, 30, 1)');
        break;
      case 'white':
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
        break;
      case 'pink':
        gradient.addColorStop(0, 'rgba(255, 150, 200, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 100, 1)');
        gradient.addColorStop(1, 'rgba(255, 150, 220, 1)');
        break;
      default: {
        // Default grayscale gradient
        const tone = Math.random();
        if (tone < 0.33) {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(1, 'rgba(200, 200, 200, 0.9)');
        } else if (tone < 0.66) {
          gradient.addColorStop(0, 'rgba(180, 180, 180, 0.3)');
          gradient.addColorStop(0.5, 'rgba(220, 220, 220, 0.7)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
        } else {
          gradient.addColorStop(0, 'rgba(150, 150, 150, 0.4)');
          gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.6)');
          gradient.addColorStop(1, 'rgba(180, 180, 180, 0.8)');
        }
      }
    }
    return gradient;
  };

  // Get node glow color based on section - BRIGHTER
  const getNodeColor = (section: WorldSection, isHovered: boolean) => {
    if (!isHovered) return 'rgba(150, 150, 150, 0.5)';

    switch (section.hoverColor) {
      case 'yellow': return 'rgba(255, 255, 150, 1)';
      case 'red': return 'rgba(255, 60, 60, 1)';
      case 'white': return 'rgba(255, 255, 255, 1)';
      case 'pink':return 'rgba(255, 180, 200, 0.95)';
      default:return 'rgba(255, 255, 255, 0.9)';
    }
  };

  const drawFilaments = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const centerX = width * 0.35;
    const centerY = height * 0.5;
    const baseRadius = Math.min(width, height) * 0.35;

    // Subtle cult/lodge ambient glow
    const ambientGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 1.5);
    ambientGlow.addColorStop(0, 'rgba(40, 30, 50, 0.15)');
    ambientGlow.addColorStop(0.5, 'rgba(20, 15, 30, 0.08)');
    ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, 0, width, height);

    // Draw main central filament (vertical) with subtle glow
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(200, 180, 220, 0.3)';
    ctx.shadowBlur = 8;

    const mainWave = Math.sin(time * 2) * 6;
    ctx.moveTo(centerX + mainWave, 0);

    for (let y = 0; y <= height; y += 5) {
      const wave = Math.sin(time * 2 + y * 0.01) * 6 + Math.sin(time * 3 + y * 0.02) * 3;
      ctx.lineTo(centerX + wave, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw branch filaments to each section
    WORLD_DATA.forEach((section) => {
      const isHovered = hoveredSection === section.id;
      const isSelected = selectedSection?.id === section.id;

      const endX = centerX + Math.cos(section.angle) * baseRadius * section.distance * 2;
      const endY = centerY + Math.sin(section.angle) * baseRadius * section.distance * 2;

      const startY = centerY + Math.sin(section.angle) * height * 0.25;
      const startWave = Math.sin(time * 2 + startY * 0.01) * 6;
      const startX = centerX + startWave;

      const midX = (startX + endX) / 2 + Math.sin(time * 1.5 + section.angle * 2) * 15;
      const midY = (startY + endY) / 2 + Math.cos(time * 1.2 + section.angle * 3) * 10;

      let vibX = 0,vibY = 0;
      if (isHovered) {
        vibX = (Math.random() - 0.5) * 2.5;
        vibY = (Math.random() - 0.5) * 2.5;
      }

      ctx.beginPath();

      if (isHovered || isSelected) {
        ctx.strokeStyle = getHoverGradient(ctx, section, startX, startY, endX + vibX, endY + vibY);
        ctx.lineWidth = isHovered ? 2 : 1.5;

        // Add BRIGHT glow for hovered sections
        if (isHovered && section.hoverColor) {
          switch (section.hoverColor) {
            case 'yellow': ctx.shadowColor = 'rgba(255, 255, 100, 0.95)'; break;
            case 'red': ctx.shadowColor = 'rgba(255, 50, 50, 0.95)'; break;
            case 'white': ctx.shadowColor = 'rgba(255, 255, 255, 1)'; break;
            case 'pink': ctx.shadowColor = 'rgba(255, 150, 200, 0.95)'; break;
          }
          ctx.shadowBlur = 30;
        } else if (isHovered) {
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 20;
        }
      } else {
        ctx.strokeStyle = 'rgba(80, 70, 90, 0.35)';
        ctx.lineWidth = 1;
      }

      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX + vibX, midY + vibY, endX + vibX, endY + vibY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw node circle at end
      ctx.beginPath();
      const nodeRadius = isHovered ? 5 + Math.sin(time * 10) * 1.5 : 3.5;
      ctx.arc(endX + vibX, endY + vibY, nodeRadius, 0, Math.PI * 2);

      ctx.fillStyle = getNodeColor(section, isHovered || isSelected);
      ctx.fill();

      if (isHovered || isSelected) {
        ctx.strokeStyle = getNodeColor(section, true);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }, [time, hoveredSection, selectedSection]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    drawFilaments(ctx, rect.width, rect.height);
  }, [isOpen, drawFilaments]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = rect.width * 0.35;
    const centerY = rect.height * 0.5;
    const baseRadius = Math.min(rect.width, rect.height) * 0.35;

    let found: string | null = null;

    WORLD_DATA.forEach((section) => {
      const endX = centerX + Math.cos(section.angle) * baseRadius * section.distance * 2;
      const endY = centerY + Math.sin(section.angle) * baseRadius * section.distance * 2;

      const dist = Math.sqrt(Math.pow(mouseX - endX, 2) + Math.pow(mouseY - endY, 2));
      // MUCH MORE SENSITIVE - larger hit area
      if (dist < 80) {
        found = section.id;
      }
    });

    setHoveredSection(found);
  }, []);

  if (!isOpen) return null;

  return (
    <div data-ev-id="ev_d5bd106ca1"
    ref={containerRef}
    className="fixed inset-0 z-50 bg-black overflow-hidden"
    style={{ fontFamily: 'monospace' }}>

      {/* Cult/lodge ambient overlay */}
      <div data-ev-id="ev_500b45e46f"
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at 35% 50%, rgba(30, 20, 40, 0.4) 0%, rgba(0, 0, 0, 0) 60%)'
      }} />


      {/* Subtle grain overlay */}
      <div data-ev-id="ev_015ed85b3d"
      className="absolute inset-0 pointer-events-none opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />


      {/* Header */}
      <div data-ev-id="ev_db42b83a05" className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 z-40">
        <div data-ev-id="ev_cd25c72371" className="flex items-center gap-4">
          <div data-ev-id="ev_398c30deec" className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
          <span data-ev-id="ev_0bbed46a36" className="text-white/40 text-[10px] tracking-[0.5em] uppercase">Codex Medullart</span>
        </div>
        <button data-ev-id="ev_d2ca208557"
        onClick={onClose}
        className="text-white/25 hover:text-white/70 text-[10px] tracking-widest transition-colors">

          [ESC]
        </button>
      </div>

      {/* Filament canvas */}
      <canvas data-ev-id="ev_e4815cb9e0"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair"
      style={{ width: selectedSection ? '55%' : '100%' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredSection(null)} />


      {/* Info panel */}
      {selectedSection &&
      <div data-ev-id="ev_7866bc4e48"
      className="absolute right-0 top-0 bottom-0 w-[45%] bg-gradient-to-l from-black via-black/95 to-transparent p-8 pt-16 overflow-y-auto">

          <div data-ev-id="ev_99c4bdde86" className="max-w-md ml-auto">
            {/* Section header */}
            <div data-ev-id="ev_14a7879fc8" className="mb-6">
              <div data-ev-id="ev_e2f20b1291" className="text-white/30 text-[9px] tracking-[0.4em] mb-2">
                {selectedSection.subtitle}
              </div>
              <h2 data-ev-id="ev_aa9695c230" className="text-white/90 text-lg tracking-[0.2em] font-light">
                {selectedSection.title}
              </h2>
            </div>

            {/* Separator */}
            <div data-ev-id="ev_1afe77c2c5" className="h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent mb-6" />

            {/* Content */}
            <div data-ev-id="ev_19d47a3626" className="text-white/60 text-[11px] leading-relaxed tracking-wide whitespace-pre-line">
              {selectedSection.content}
            </div>

            {/* Footer indicator */}
            <div data-ev-id="ev_a915d4134b" className="mt-8 flex items-center gap-2">
              <div data-ev-id="ev_95a58f01e6" className="w-1 h-1 bg-white/20 rounded-full" />
              <span data-ev-id="ev_87d1fe5f8a" className="text-white/20 text-[8px] tracking-[0.3em]">
                NODE ACTIVE
              </span>
            </div>
          </div>
        </div>
      }

      {/* Instruction hint */}
      {!selectedSection &&
      <div data-ev-id="ev_71df29b1d9" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <span data-ev-id="ev_47e4da222c" className="text-white/20 text-[9px] tracking-[0.4em]">
            HOVER NODES TO ACCESS DOCTRINE
          </span>
        </div>
      }
    </div>);

}
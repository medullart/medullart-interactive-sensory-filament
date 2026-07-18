import { useState, useRef, useEffect, useCallback } from 'react';

interface WorldSection {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  angle: number; // Position around center (radians)
  distance: number; // Distance from center
}

const WORLD_DATA: WorldSection[] = [
{
  id: 'genesis',
  title: 'I. COSMOGONIC GENESIS',
  subtitle: 'Extent Machinery',
  content: `DEKANAR — Pure homogeneity. A binary entity structured under the strict logic of alternation and elemental polarity. In primordial eras, it inhabited an unknown heterogeneous source intrinsically incompatible with its own homogeneous and unified essence. Faced with this ontological contradiction, it executed an existential escape from that meta-virtual matrix to establish itself as the absolute regent and orderer of the Metropolis.\n\nTHE CHILD — A secret enchantment. The strange fright of seeing a robot moving when you've already turned it off. It is the fragility and heart of Extent. If The Child is destroyed, Extent is too. When happy, Extent regenerates or even upgrades. That's why "toys" must be created.\n\nDSYDIANNA — Systematically explores deep distortion in the femme fatale archetype. Operating as a sophisticated quantum entity within the Metropolis, she executes seduction and capture of meticulously selected young men. Dsydianna irreversibly digitalizes their "machine" essence—subjects who surrender to biological cessation through voluntary sacrifice. These mechanized consciousnesses are processed and offered as tribute to her consort Dekanar, consolidating the technological patriarchy governing the network.\n\nTHE PERMANENT — The God of Lines. Unknown, but creator of everything.`,
  angle: -Math.PI / 2, // Top
  distance: 0.35
},
{
  id: 'regulacion',
  title: 'II. IMMUNOLOGICAL REGULATION',
  subtitle: 'Aethel vs. Subtle Network',
  content: `AETHEL — Sovereign country where the Metropolis is settled. Matter is composed of thelines (readable code).\n\nCOSMIC APP XTNT — Software governing reality. Manages preventive homeostasis.\n\nNTRConfig — Biochemical control complex. Deactivates melancholy, anguish, and obsession.\n\nEQUATION T_f — Bond Tension:\nT_f = Σ(n=1→12) ψn · e^(iθn)\n\nSYMPATHETIC RESONANCE — Critical coupling when filaments coincide in angular phase.`,
  angle: -Math.PI / 4, // Top-right
  distance: 0.38
},
{
  id: 'esferas',
  title: 'IV. SPHERES OF MITHRA',
  subtitle: 'VIII Dissolution Portals',
  content: `SPHERE I — The Mirror of Identity. Reject simulation.\n\nSPHERE II — Bone Dissolution / Black Lake. Clean bone structures.\n\nSPHERE III — Phase Coupling. 12 lumbar filaments.\n\nSPHERE IV — Filter Void. Asemic fire.\n\nSPHERE V — Tensegrity Geometry.\n\nSPHERE VI — Thielf Lymph.\n\nSPHERE VII — Coupling with Antartekne.\n\nSPHERE VIII — Unification with The Permanent.`,
  angle: Math.PI / 6, // Right
  distance: 0.4
},
{
  id: 'personajes',
  title: 'III. ACTORS COMPENDIUM',
  subtitle: 'Catalysts and Travelers',
  content: `CATALYSTS:\n• Antartekne/Vishnakarma — Creator liquid gold deity.\n• Pterophos — Holographic guide with wings of light.\n• Stella — Chemical designer of Llima.\n• Cole — Creator of the Spider's Tail.\n\nTRAVELERS:\n• Regxen — Ex-model, group psychopomp.\n• Nirev — Asexual from SUPERBIO.\n• Atlas — Athletic introvert.\n• Redsea — Purified ex-vampiress.\n• Hyun — Silent mystic.`,
  angle: Math.PI / 2 + 0.3, // Bottom-right
  distance: 0.36
},
{
  id: 'infraestructura',
  title: 'V. TAXONOMY',
  subtitle: 'Metropolitan Anomalies',
  content: `SUPERBIO:\n├─ Mythological Hybridization Division\n├─ Sexual Deconstruction Laboratories\n└─ Flat Consciousness Simulation Section\n\nUTHINY — Textile Biotechnology Meta-agency.\n\nANOMALIES:\n• Spinal System — Mother Mind.\n• Teknonia — Y2K military amplification.\n• Green Ntrance — Synthetic vegetal customs.\n• Alex Singularity — Algorithmic virus.\n• Spider's Tail — Subtle code serpent.`,
  angle: Math.PI / 2 + Math.PI / 3, // Bottom
  distance: 0.38
},
{
  id: 'llima',
  title: 'VI. GEOPOLITICS',
  subtitle: 'Llima & Chemical Traffic',
  content: `LLIMA — Autonomous and semi-dystopian geographic cluster. Absence of human biology.\n\nSTELLA'S KIOSK:\nAnalog facade. Diamond Pills.\n\nDIAMOND PILLS:\nDrugs that block NTRConfig neurotransmitters.\n\nFUNCTION:\nFacilitate entry into deep phases of Medullart.`,
  angle: Math.PI - 0.4, // Left-bottom
  distance: 0.35
},
{
  id: 'laboratorios',
  title: 'VII. LUMBAR ANATOMY',
  subtitle: 'Laboratories L1-L4',
  content: `L1 — QLIPHOTIC AXIS:\n• Cranial Vault — Vault guarded by Engur.\n• The Vetemmu — Spectral entities.\n• Cyclogenesis 1 — Storms of obsession.\n• Liminal Nerve — Anti-Venus.\n\nL2 — HYPER-ENERGY REACTOR:\n• Silicia — Mineral terrain of quartz.\n• Multi-milking Room.\n\nL3 — HYBRIDIZATION ECOSYSTEM:\nCollage anatomy, structural polyamory.\n\nL4 — WHITE SPACE:\nAbsolute silence. Pre-jump rest.`,
  angle: Math.PI + 0.3, // Left
  distance: 0.4
},
{
  id: 'formula',
  title: 'FILAMENT STATE',
  subtitle: 'Altered Operative (Base 12)',
  content: `▲ ▼ ▲ VIBRATING IN NETWORK ▲ ▼ ▲\n\n─○──────○─────○────○───────○──────○─────○────○───────○──────○──\n[N1] [N2] [N3] [N4] [N5] [N6] [N7] [N8] [N9] [N10]\n\n[T_f TIMING RESONANCE ACTIVE]\n[THIELF SYSTEM ALIGNED]\n\nINDRA'S NET — Geometry of biological filaments in continuous tension.\n12 main filaments along the spinal column.`,
  angle: -Math.PI + 0.8, // Top-left
  distance: 0.37
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

  // Animation loop for filaments
  useEffect(() => {
    if (!isOpen) return;

    const animate = () => {
      setTime((t) => t + 0.016);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-select section on hover
  useEffect(() => {
    if (hoveredSection) {
      const section = WORLD_DATA.find((s) => s.id === hoveredSection);
      if (section) setSelectedSection(section);
    }
  }, [hoveredSection]);

  // Draw filaments on canvas
  const drawFilaments = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const centerX = width * 0.35;
    const centerY = height * 0.5;
    const baseRadius = Math.min(width, height) * 0.35;

    // Draw main central filament (vertical)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;

    const mainWave = Math.sin(time * 2) * 8;
    ctx.moveTo(centerX + mainWave, 0);

    for (let y = 0; y <= height; y += 5) {
      const wave = Math.sin(time * 2 + y * 0.01) * 8 + Math.sin(time * 3 + y * 0.02) * 4;
      ctx.lineTo(centerX + wave, y);
    }
    ctx.stroke();

    // Draw branch filaments to each section
    WORLD_DATA.forEach((section) => {
      const isHovered = hoveredSection === section.id;
      const isSelected = selectedSection?.id === section.id;

      // Calculate end position
      const endX = centerX + Math.cos(section.angle) * baseRadius * section.distance * 2;
      const endY = centerY + Math.sin(section.angle) * baseRadius * section.distance * 2;

      // Branch start point on main filament
      const startY = centerY + Math.sin(section.angle) * height * 0.3;
      const startWave = Math.sin(time * 2 + startY * 0.01) * 8;
      const startX = centerX + startWave;

      // Control points for curved branch
      const midX = (startX + endX) / 2 + Math.sin(time * 1.5 + section.angle * 2) * 20;
      const midY = (startY + endY) / 2 + Math.cos(time * 1.2 + section.angle * 3) * 15;

      // Vibration when hovered
      let vibX = 0,vibY = 0;
      if (isHovered) {
        vibX = (Math.random() - 0.5) * 3;
        vibY = (Math.random() - 0.5) * 3;
      }

      // Draw branch filament
      ctx.beginPath();

      // Color gradient based on hover state
      if (isHovered || isSelected) {
        const gradient = ctx.createLinearGradient(startX, startY, endX + vibX, endY + vibY);
        const grayTone = Math.random();
        if (grayTone < 0.33) {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(1, 'rgba(200, 200, 200, 0.9)');
        } else if (grayTone < 0.66) {
          gradient.addColorStop(0, 'rgba(180, 180, 180, 0.3)');
          gradient.addColorStop(0.5, 'rgba(220, 220, 220, 0.7)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
        } else {
          gradient.addColorStop(0, 'rgba(150, 150, 150, 0.4)');
          gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.6)');
          gradient.addColorStop(1, 'rgba(180, 180, 180, 0.8)');
        }
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isHovered ? 2 : 1.5;
      } else {
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.lineWidth = 1;
      }

      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX + vibX, midY + vibY, endX + vibX, endY + vibY);
      ctx.stroke();

      // Draw node circle at end
      ctx.beginPath();
      const nodeRadius = isHovered ? 6 + Math.sin(time * 10) * 2 : 4;
      ctx.arc(endX + vibX, endY + vibY, nodeRadius, 0, Math.PI * 2);

      if (isHovered || isSelected) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(150, 150, 150, 0.4)';
        ctx.fill();
      }
    });
  }, [time, hoveredSection, selectedSection]);

  // Canvas rendering
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

  // Handle mouse interaction
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
      if (dist < 40) {
        found = section.id;
      }
    });

    setHoveredSection(found);
  }, []);

  if (!isOpen) return null;

  return (
    <div data-ev-id="ev_f595d768fd"
    ref={containerRef}
    className="fixed inset-0 z-50 bg-black overflow-hidden"
    style={{ fontFamily: 'monospace' }}>

      {/* Subtle grain overlay */}
      <div data-ev-id="ev_cc9ba17c29"
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />


      {/* Header */}
      <div data-ev-id="ev_0b26340cbb" className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 z-40">
        <div data-ev-id="ev_880d7aa57a" className="flex items-center gap-4">
          <div data-ev-id="ev_745c76bf10" className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
          <span data-ev-id="ev_cdb79c92f7" className="text-white/50 text-[10px] tracking-[0.4em] uppercase">Codex Medullart</span>
        </div>
        <button data-ev-id="ev_a366a1f1c0"
        onClick={onClose}
        className="text-white/30 hover:text-white/80 text-[10px] tracking-widest transition-colors">

          [ESC]
        </button>
      </div>

      {/* Filament canvas */}
      <canvas data-ev-id="ev_12ca478bea"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair"
      style={{ width: selectedSection ? '60%' : '100%' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredSection(null)} />


      {/* Section labels overlaid on canvas */}
      <div data-ev-id="ev_532acb9286"
      className="absolute inset-0 pointer-events-none"
      style={{ width: selectedSection ? '60%' : '100%' }}>

        {WORLD_DATA.map((section) => {
          const isHovered = hoveredSection === section.id;
          const isSelected = selectedSection?.id === section.id;

          // Calculate position
          const containerWidth = (selectedSection ? 0.6 : 1) * (typeof window !== 'undefined' ? window.innerWidth : 1000);
          const containerHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
          const centerX = containerWidth * 0.35;
          const centerY = containerHeight * 0.5;
          const baseRadius = Math.min(containerWidth, containerHeight) * 0.35;

          const endX = centerX + Math.cos(section.angle) * baseRadius * section.distance * 2;
          const endY = centerY + Math.sin(section.angle) * baseRadius * section.distance * 2;

          // Vibration offset
          const vibX = isHovered ? Math.sin(time * 50) * 1.5 : 0;
          const vibY = isHovered ? Math.cos(time * 50) * 1.5 : 0;

          return (
            <div data-ev-id="ev_845f89785b"
            key={section.id}
            className="absolute pointer-events-auto cursor-pointer transition-opacity duration-300"
            style={{
              left: endX + vibX + 15,
              top: endY + vibY - 10,
              opacity: isHovered || isSelected ? 1 : 0.4,
              transform: `translate(0, 0)`
            }}
            onMouseEnter={() => setHoveredSection(section.id)}
            onMouseLeave={() => setHoveredSection(null)}
            onClick={() => setSelectedSection(section)}>

              <div data-ev-id="ev_15e55e85ef"
              className={`text-[9px] tracking-wider uppercase whitespace-nowrap transition-colors ${
              isHovered || isSelected ? 'text-white' : 'text-white/40'}`
              }>

                {section.title}
              </div>
              <div data-ev-id="ev_86ede12ec1" className="text-[8px] text-white/20 tracking-wide">
                {section.subtitle}
              </div>
            </div>);

        })}
      </div>

      {/* Documentation panel */}
      {selectedSection &&
      <div data-ev-id="ev_30b744b67e"
      className="absolute top-0 right-0 bottom-0 w-[40%] border-l border-white/10 bg-black/95 overflow-auto">

          <div data-ev-id="ev_3ab93bb6af" className="p-8">
            {/* Header */}
            <div data-ev-id="ev_1e82925528" className="mb-8 pb-4 border-b border-white/10">
              <div data-ev-id="ev_71812f31f7" className="text-[9px] tracking-[0.3em] text-white/30 mb-2 uppercase">
                {selectedSection.id}
              </div>
              <h2 data-ev-id="ev_f0d4df1b0f" className="text-white/90 text-sm tracking-wide font-light">
                {selectedSection.title}
              </h2>
              <div data-ev-id="ev_55b32f7774" className="text-[10px] text-white/40 mt-1 tracking-wider">
                {selectedSection.subtitle}
              </div>
            </div>

            {/* Content */}
            <div data-ev-id="ev_ce797008f7" className="text-[11px] text-white/60 leading-relaxed whitespace-pre-wrap font-light">
              {selectedSection.content.split('\n').map((line, i) => {
              // Check if line starts with a keyword (uppercase word followed by —)
              const isKeyword = /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9_\s/]+\s*—/.test(line) ||
              /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9_\s/]+:/.test(line) ||
              /^•/.test(line.trim()) ||
              line.trim().startsWith('├') || line.trim().startsWith('└') || line.trim().startsWith('[');
              return (
                <p data-ev-id="ev_576d914edd"
                key={i}
                className={`mb-2 ${isKeyword ? 'text-white/80' : ''}`}>

                    {line}
                  </p>);

            })}
            </div>

            {/* Close hint */}
            <div data-ev-id="ev_ca1a8ec7c6" className="mt-8 pt-4 border-t border-white/10">
              <div data-ev-id="ev_ab771abf9c" className="text-[9px] text-white/20 tracking-wider">
                Click another node or press ESC to close
              </div>
            </div>
          </div>
        </div>
      }

      {/* Bottom status */}
      <div data-ev-id="ev_bcb6225fe1" className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-between px-6 z-40">
        <div data-ev-id="ev_833d1ba5ab" className="text-[9px] text-white/20 tracking-wider">
          RED DE INDRA // T_f RESONANCE
        </div>
        <div data-ev-id="ev_c8a1f1a6ed" className="text-[9px] text-white/20 tracking-wider">
          THIELF SYSTEM // BASE 12
        </div>
      </div>
    </div>);

}
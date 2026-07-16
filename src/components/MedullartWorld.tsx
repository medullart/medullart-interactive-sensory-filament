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
  title: 'I. GÉNESIS COSMOGÓNICA',
  subtitle: 'Maquinaria de Extent',
  content: `DEKANAR — Gobernante de la Metrópolis. Proyecta pureza asexual absoluta mientras reprime su deseo homosexual. Progenitor gestacional de The Child mediante mutación de thelines.\n\nTHE CHILD — Espécimen posthumano de inmovilidad perpetua. Núcleo biológico que procesa y estabiliza la homeostasis de Extent. Pureza formal + aura fétida.\n\nDSYDIANNA — Consorte de Dekanar. Femme fatale cuántica que digitaliza la esencia "máquina" de jóvenes sacrificados.\n\nDOBLE L (LL) — Divinidad asexual oculta, receptora del tributo de hombres-máquina.\n\nEL PERMANENTE — El Dios de Líneas. Creador absoluto del multiverso.`,
  angle: -Math.PI / 2, // Top
  distance: 0.35
},
{
  id: 'regulacion',
  title: 'II. REGULACIÓN INMUNOLÓGICA',
  subtitle: 'Aethel vs. Red Sutil',
  content: `AETHEL — País soberano donde se asienta la Metrópolis. La materia se compone de thelines (código legible).\n\nAPP CÓSMICA XTNT — Software rector de la realidad. Administra homeostasis preventiva.\n\nNTRConfig — Complejo de control bioquímico. Desactiva melancolía, angustia y obsesión.\n\nECUACIÓN T_f — Tensión de Enlace:\nT_f = Σ(n=1→12) ψn · e^(iθn)\n\nRESONANCIA SIMPÁTICA — Acoplamiento crítico cuando filamentos coinciden en fase angular.`,
  angle: -Math.PI / 4, // Top-right
  distance: 0.38
},
{
  id: 'esferas',
  title: 'IV. ESFERAS DE MITHRA',
  subtitle: 'VIII Portales de Disolución',
  content: `ESFERA I — El Espejo de Identidad. Rechazar simulación.\n\nESFERA II — Disolución Ósea / Lago Negro. Estructuras óseas limpias.\n\nESFERA III — Acoplamiento de Fase. 12 filamentos lumbares.\n\nESFERA IV — Vacío del Filtro. Fuego asémico.\n\nESFERA V — Geometría de Tensegridad.\n\nESFERA VI — Linfa de Thielf.\n\nESFERA VII — Acoplamiento con Antartekne.\n\nESFERA VIII — Unificación con El Permanente.`,
  angle: Math.PI / 6, // Right
  distance: 0.4
},
{
  id: 'personajes',
  title: 'III. COMPENDIO DE ACTORES',
  subtitle: 'Catalizadores y Viajeros',
  content: `CATALIZADORES:\n• Antartekne/Vishnakarma — Deidad de oro líquido creador.\n• Pterophos — Guía holográfico con alas de luz.\n• Stella — Diseñadora química de Llima.\n• Cole — Creador de la Cola de Araña.\n\nVIAJEROS:\n• Regxen — Exmodelo, psicopompo del grupo.\n• Nirev — Asexual de SUPERBIO.\n• Atlas — Introvertido atlético.\n• Redsea — Ex-vampiresa purificada.\n• Hyun — Místico silencioso.`,
  angle: Math.PI / 2 + 0.3, // Bottom-right
  distance: 0.36
},
{
  id: 'infraestructura',
  title: 'V. TAXONOMÍA',
  subtitle: 'Anomalías Metropolitanas',
  content: `SUPERBIO:\n├─ División de Hibridación Mitológica\n├─ Laboratorios de Deconstrucción Sexual\n└─ Sección de Simulación de Conciencia Plana\n\nUTHINY — Metaagencia de Biotecnología Textil.\n\nANOMALÍAS:\n• Sistema Raquídea — Mente Madre.\n• Teknonia — Amplificación militar Y2K.\n• Green Ntrance — Aduana vegetal sintética.\n• Singularidad de Alex — Virus algorítmico.\n• Cola de Araña — Serpiente de código sutil.`,
  angle: Math.PI / 2 + Math.PI / 3, // Bottom
  distance: 0.38
},
{
  id: 'llima',
  title: 'VI. GEOPOLÍTICA',
  subtitle: 'Llima & Tráfico Químico',
  content: `LLIMA — Clúster geográfico autónomo y semidistópico. Ausencia de biología humana.\n\nKIOSKO DE STELLA:\nFachada analógica. Píldoras Diamante.\n\nPÍLDORAS DIAMANTE:\nFármacos que bloquean neurotransmisores de NTRConfig.\n\nFUNCIÓN:\nFacilitar entrada a fases profundas de Medullart.`,
  angle: Math.PI - 0.4, // Left-bottom
  distance: 0.35
},
{
  id: 'laboratorios',
  title: 'VII. ANATOMÍA LUMBAR',
  subtitle: 'Laboratorios L1-L4',
  content: `L1 — EJE QLIPHÓTICO:\n• Cranial Vault — Bóveda custodiada por Engur.\n• Los Vetemmu — Entidades espectrales.\n• Ciclogénesis 1 — Tormentas de obsesión.\n• Nervio Limítrofe — Anti-Venus.\n\nL2 — REACTOR HIPER-ENERGÍA:\n• Silicia — Terreno mineral de cuarzos.\n• Sala de Multiordeñamiento.\n\nL3 — ECOSISTEMA HIBRIDACIÓN:\nAnatomía collage, poliamor estructural.\n\nL4 — ESPACIO BLANCO:\nSilencio absoluto. Reposo pre-salto.`,
  angle: Math.PI + 0.3, // Left
  distance: 0.4
},
{
  id: 'formula',
  title: 'ESTADO DE FILAMENTO',
  subtitle: 'Alterado Operativo (Base 12)',
  content: `▲ ▼ ▲ VIBRANDO EN RED ▲ ▼ ▲\n\n─○──────○─────○────○───────○──────○─────○────○───────○──────○──\n[N1] [N2] [N3] [N4] [N5] [N6] [N7] [N8] [N9] [N10]\n\n[T_f TIMING RESONANCE ACTIVE]\n[THIELF SYSTEM ALIGNED]\n\nRED DE INDRA — Geometría de filamentos biológicos en tensión continua.\n12 filamentos principales a lo largo de la columna vertebral.`,
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
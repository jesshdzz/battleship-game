import { type JSX } from 'react';
import { type ShipType } from '../types';

// --- CONFIGURACIÓN DE COLORES ---
export const colors = {
    ally: {
        primary: '#3B82F6', // Blue 500
        secondary: '#1E40AF', // Blue 800
        accent: '#60A5FA', // Blue 400
        light: '#DBEAFE', // Blue 100
        glow: 'rgba(59, 130, 246, 0.5)',
        bg: 'bg-slate-900',
        text: 'text-blue-100',
        panel: 'bg-slate-800/50 border-blue-500/30'
    },
    enemy: {
        primary: '#EF4444', // Red 500
        secondary: '#991B1B', // Red 800
        accent: '#F87171', // Red 400
        light: '#FEE2E2', // Red 100
        glow: 'rgba(239, 68, 68, 0.5)',
        bg: 'bg-neutral-900',
        text: 'text-red-100',
        panel: 'bg-neutral-800/50 border-red-500/30'
    }
};

export type ColorPalette = typeof colors.ally;

export const SHIPS: { id: ShipType; name: string; size: number; desc: string; viewBox?: string; renderTop: (c: ColorPalette) => JSX.Element; renderProfile: (c: ColorPalette) => JSX.Element }[] = [
    {
        id: 'carrier',
        name: "Portaaviones Clase Titán",
        size: 5,
        desc: "Plataforma de despliegue aéreo masivo. Lento pero estratégico.",
        viewBox: '0 0 300 80',
        renderTop: (c) => (
            <g>
                {/* Hull */}
                <path d="M 10,25 L 20,5 L 280,5 L 290,25 L 290,55 L 280,75 L 20,75 L 10,55 Z" fill={c.secondary} stroke={c.light} strokeWidth="2" />
                <rect x="25" y="15" width="250" height="50" rx="2" fill="#334155" stroke={c.primary} strokeWidth="1" />

                {/* Runway Markings */}
                <line x1="40" y1="40" x2="260" y2="40" stroke="white" strokeWidth="2" strokeDasharray="10,10" opacity="0.8" />
                <path d="M 30,25 L 60,55 M 30,55 L 60,25" stroke={c.accent} strokeWidth="2" opacity="0.5" />

                {/* Control Tower */}
                <rect x="180" y="8" width="40" height="12" rx="2" fill={c.primary} stroke={c.light} />
                <circle cx="190" cy="14" r="3" fill={c.accent} />

                {/* Details */}
                <rect x="260" y="20" width="15" height="40" fill={c.secondary} opacity="0.5" />
                <rect x="40" y="20" width="10" height="40" fill={c.secondary} opacity="0.5" />
            </g>
        ),
        renderProfile: (c) => (
            <g>
                {/* Hull */}
                <path d="M 10,40 L 30,60 L 270,60 L 290,40 Z" fill={c.secondary} stroke={c.primary} strokeWidth="2" />
                {/* Deck */}
                <rect x="5" y="30" width="290" height="10" fill="#334155" stroke={c.light} strokeWidth="1" />
                {/* Tower */}
                <path d="M 180,30 L 180,10 L 210,10 L 215,30 Z" fill={c.primary} stroke={c.light} />
                {/* Antennas */}
                <line x1="190" y1="10" x2="190" y2="0" stroke={c.accent} strokeWidth="2" />
                <line x1="200" y1="10" x2="205" y2="2" stroke={c.accent} strokeWidth="2" />
            </g>
        )
    },
    {
        id: 'battleship',
        name: "Acorazado MK-IV",
        size: 4,
        desc: "Blindaje pesado y artillería de largo alcance.",
        viewBox: '20 10 220 60',
        renderTop: (c) => (
            <g>
                {/* Hull */}
                <path d="M 20,40 L 60,10 L 230,10 L 240,40 L 230,70 L 60,70 Z" fill={c.secondary} stroke={c.light} strokeWidth="2" />
                {/* Deck structure */}
                <rect x="80" y="20" width="120" height="40" rx="5" fill={c.primary} opacity="0.8" />

                {/* Turrets Front */}
                <circle cx="70" cy="40" r="12" fill="#334155" stroke={c.light} />
                <rect x="45" y="36" width="25" height="3" fill="#94A3B8" /> {/* Barrel */}
                <rect x="45" y="41" width="25" height="3" fill="#94A3B8" /> {/* Barrel */}

                {/* Turrets Back */}
                <circle cx="210" cy="40" r="12" fill="#334155" stroke={c.light} />
                <rect x="222" y="36" width="25" height="3" fill="#94A3B8" />
                <rect x="222" y="41" width="25" height="3" fill="#94A3B8" />

                {/* Center */}
                <rect x="120" y="30" width="40" height="20" fill={c.accent} />
            </g>
        ),
        renderProfile: (c) => (
            <g>
                {/* Hull */}
                <path d="M 10,45 L 50,65 L 220,65 L 240,50 L 240,45 Z" fill={c.secondary} stroke={c.primary} strokeWidth="2" />
                {/* Superstructure */}
                <path d="M 100,45 L 100,20 L 160,20 L 170,45 Z" fill={c.primary} stroke={c.light} />
                <rect x="110" y="10" width="40" height="10" fill={c.accent} />
                {/* Guns Side View */}
                <path d="M 60,45 L 70,35 L 90,35 L 90,45 Z" fill="#334155" />
                <rect x="40" y="38" width="30" height="4" fill="#94A3B8" />
            </g>
        )
    },
    {
        id: 'submarine',
        name: "Submarino Fantasma",
        size: 3,
        desc: "Sigiloso. Diseñado para ataques sorpresa bajo el agua.",
        viewBox: '30 15 200 50',
        renderTop: (c) => (
            <g>
                {/* Hull (Cigar shape) */}
                <path d="M 30,40 Q 30,15 80,15 L 200,20 Q 230,22 230,40 Q 230,58 200,60 L 80,65 Q 30,65 30,40 Z" fill={c.secondary} stroke={c.light} strokeWidth="2" />

                {/* Conning Tower */}
                <rect x="110" y="30" width="40" height="20" rx="5" fill={c.primary} stroke={c.accent} />
                <circle cx="130" cy="40" r="6" fill={c.bg} /> {/* Hatch */}

                {/* Propeller/Fins */}
                <path d="M 220,40 L 235,25 M 220,40 L 235,55" stroke={c.accent} strokeWidth="3" />
            </g>
        ),
        renderProfile: (c) => (
            <g>
                {/* Main Body */}
                <path d="M 20,40 Q 20,25 60,25 L 200,25 Q 240,25 240,40 Q 240,55 200,55 L 60,55 Q 20,55 20,40 Z" fill={c.secondary} stroke={c.primary} strokeWidth="2" />

                {/* Tower */}
                <path d="M 110,25 L 115,10 L 140,10 L 145,25 Z" fill={c.primary} stroke={c.light} />

                {/* Periscope */}
                <line x1="125" y1="10" x2="125" y2="2" stroke={c.accent} strokeWidth="3" />
                <line x1="125" y1="2" x2="135" y2="2" stroke={c.accent} strokeWidth="3" />

                {/* Tail fins */}
                <path d="M 220,40 L 235,30 L 235,50 Z" fill={c.accent} />
            </g>
        )
    },
    {
        id: 'cruiser',
        name: "Crucero Interceptor",
        size: 3,
        desc: "Equilibrio perfecto entre velocidad y potencia de fuego.",
        viewBox: '15 15 175 50',
        renderTop: (c) => (
            <g>
                {/* Hull */}
                <path d="M 15,40 L 50,15 L 180,15 L 190,40 L 180,65 L 50,65 Z" fill={c.secondary} stroke={c.light} strokeWidth="2" />

                {/* Deck Detail */}
                <path d="M 60,25 L 160,25 L 160,55 L 60,55 Z" fill="none" stroke={c.primary} strokeWidth="1" />

                {/* Radar Dish */}
                <circle cx="120" cy="40" r="10" fill="none" stroke={c.accent} strokeWidth="2" />
                <line x1="120" y1="30" x2="120" y2="50" stroke={c.accent} />
                <line x1="110" y1="40" x2="130" y2="40" stroke={c.accent} />

                {/* Small turrets */}
                <circle cx="50" cy="40" r="6" fill={c.primary} />
                <circle cx="170" cy="40" r="6" fill={c.primary} />
            </g>
        ),
        renderProfile: (c) => (
            <g>
                {/* Hull */}
                <path d="M 10,45 L 40,60 L 180,60 L 195,45 Z" fill={c.secondary} stroke={c.primary} strokeWidth="2" />

                {/* Structures */}
                <rect x="70" y="25" width="30" height="20" fill={c.primary} stroke={c.light} />
                <rect x="110" y="30" width="40" height="15" fill={c.primary} stroke={c.light} />

                {/* Radar */}
                <circle cx="90" cy="20" r="8" fill="none" stroke={c.accent} strokeWidth="2" />

                {/* Antenna */}
                <line x1="130" y1="30" x2="140" y2="10" stroke={c.accent} strokeWidth="1" />
            </g>
        )
    },
    {
        id: 'destroyer',
        name: "Destructor Veloz",
        size: 2,
        desc: "Unidad de reconocimiento rápida y maniobrable.",
        viewBox: '10 30 140 25', // Using the updated viewBox from user's last edit
        renderTop: (c) => (
            <g>
                {/* Hull */}
                <path d="M 20,30 L 130,30 L 140,40 L 130,50 L 20,50 L 10,40 Z" fill={c.secondary} stroke={c.light} strokeWidth="2" />

                {/* Engine vents */}
                <rect x="30" y="35" width="10" height="10" fill={c.accent} />
                <rect x="50" y="35" width="10" height="10" fill={c.accent} />

                {/* Bridge */}
                <rect x="80" y="32" width="20" height="16" fill={c.primary} stroke={c.light} />
            </g>
        ),
        renderProfile: (c) => (
            <g>
                {/* Hull */}
                <path d="M 5,45 L 20,55 L 130,55 L 140,45 Z" fill={c.secondary} stroke={c.primary} strokeWidth="2" />

                {/* Top structure */}
                <path d="M 70,45 L 75,30 L 100,30 L 105,45 Z" fill={c.primary} stroke={c.light} />

                {/* Antenna */}
                <line x1="90" y1="30" x2="80" y2="15" stroke={c.accent} strokeWidth="2" />
            </g>
        )
    }
];

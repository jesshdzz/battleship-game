import React from 'react';
import { Modal } from './Modal';

interface InstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Instrucciones de Misión">
            <div className="space-y-6 font-mono">
                <section>
                    <h3 className="text-yellow-400 font-bold text-lg mb-2">OBJETIVO</h3>
                    <p className="text-sm leading-relaxed">
                        Hunde la flota enemiga antes de que ellos hundan la tuya.
                        El primer comandante en destruir los 5 barcos rivales será declarado vencedor.
                    </p>
                </section>

                <section>
                    <h3 className="text-green-400 font-bold text-lg mb-2">FASE 1: DESPLIEGUE</h3>
                    <ul className="list-disc list-inside text-sm space-y-2 text-slate-400 pl-2">
                        <li>Arrastra y suelta tus barcos en el radar aliado.</li>
                        <li>Pulsa el botón "Orientación" para rotar el barco antes de arrastrarlo.</li>
                        <li>No puedes superponer barcos ni salirte de la cuadrícula.</li>
                        <li>Confirma tu posición cuando estés listo.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-red-400 font-bold text-lg mb-2">FASE 2: COMBATE</h3>
                    <ul className="list-disc list-inside text-sm space-y-2 text-slate-400 pl-2">
                        <li>Dispara a las coordenadas del radar enemigo haciendo clic en las celdas.</li>
                        <li>Si aciertas (<span className="text-red-500 font-bold">HIT</span>), verás una explosión y podrás celebrar.</li>
                        <li>Si fallas (<span className="text-blue-500 font-bold">MISS</span>), el turno pasa al enemigo.</li>
                        <li>¡Mantente alerta y adivina la estrategia rival!</li>
                    </ul>
                </section>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-xs text-center text-slate-500">
                    "La victoria favorece a los que se preparan"
                </div>
            </div>
        </Modal>
    );
};

import React from 'react';
import { Modal } from './Modal';

interface AboutUsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sobre Nosotros">
            <div className="text-center space-y-8 font-mono">
                <p className="text-slate-400">
                    Este proyecto fue desarrollado para la materia de Redes de Computadoras II.
                    <br />
                    <br />
                    Fue creado con el objetivo de practicar y mejorar nuestras habilidades en el desarrollo de aplicaciones web,
                    así como también aprender sobre la implementación de sockets en aplicaciones web.
                </p>

                <div className="space-y-4">
                    <h3 className="text-white font-bold uppercase tracking-widest border-b border-slate-800 pb-2">Créditos</h3>

                    <div className="flex flex-col gap-4">
                        <a href="https://github.com/quintanarisabel" target="_blank" rel="noreferrer">
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
                                <div className="text-blue-400 font-bold mb-1 group-hover:text-blue-300">Isabel Quintanar José</div>
                                <div className="text-xs text-slate-500">Desarrollador Front-end</div>
                            </div>
                        </a>

                        <a href="https://github.com/jesshdzz" target="_blank" rel="noreferrer">
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
                                <div className="text-blue-400 font-bold mb-1 group-hover:text-blue-300">Jesús Antonio Rosario Hernández</div>
                                <div className="text-xs text-slate-500">Desarrollador Back-end</div>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="pt-4">
                    <a
                        href="https://github.com/jesshdzz/battleship-game"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
                    >
                        <span>⭐ Star on GitHub</span>
                    </a>
                </div>
            </div>
        </Modal>
    );
};

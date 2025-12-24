
import React, { useContext, useMemo, useEffect, useRef, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Patient, QueueStatus } from '../../services/types';
import { ExitIcon } from '../../constants';

// A valid, short WAV file for a ping sound. This replaces the previous corrupted base64 string.
const PING_SOUND_BASE64 = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

interface PatientQueueProps {
    setActiveSection: (section: string) => void;
}

const PatientQueue: React.FC<PatientQueueProps> = ({ setActiveSection }) => {
    const { patients } = useContext(AppContext);
    const today = new Date().toISOString().split('T')[0];
    const audioRef = useRef<HTMLAudioElement>(null);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const todaysPatients = useMemo(() => {
        return patients
            .filter(p => p.date === today)
            .sort((a, b) => a.tokenNumber - b.tokenNumber);
    }, [patients, today]);

    const nowServing = useMemo(() => {
        return todaysPatients.filter(p => p.queueStatus === QueueStatus.InProgress);
    }, [todaysPatients]);

    const waiting = useMemo(() => {
        return todaysPatients.filter(p => p.queueStatus === QueueStatus.Waiting);
    }, [todaysPatients]);
    
    const prevNowServingRef = useRef<Patient[]>([]);

    useEffect(() => {
        const hasNewPatient = nowServing.length > 0 && nowServing.some(p => !prevNowServingRef.current.find(prevP => prevP.id === p.id));
        if (hasNewPatient) {
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        }
        prevNowServingRef.current = nowServing;
    }, [nowServing]);

    return (
        <div className="h-full w-full bg-gradient-to-br from-slate-900 via-black to-slate-800 text-white p-6 md:p-8 flex flex-col font-sans">
            <header className="flex justify-between items-center pb-4 border-b border-slate-700">
                <div className="text-left">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-300">
                        Bhopal Sonography Center
                    </h1>
                    <p className="text-xl text-slate-400">Patient Queue</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-4xl font-mono font-bold text-slate-200">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-lg text-slate-400">{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                     <button
                        onClick={() => setActiveSection('Billing')}
                        title="Exit Queue View"
                        aria-label="Exit Queue View"
                        className="p-3 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-300"
                    >
                        <ExitIcon className="w-8 h-8"/>
                    </button>
                </div>
            </header>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-1 bg-slate-800/50 rounded-2xl p-6 shadow-2xl border border-slate-700 flex flex-col backdrop-blur-sm">
                    <h2 className="text-4xl font-bold text-center text-green-400 uppercase tracking-widest border-b-2 border-green-400/50 pb-4 mb-4">Now Serving</h2>
                    <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-fade-in">
                        {nowServing.length > 0 ? nowServing.map(p => (
                             <div key={p.id} className="text-center w-full bg-gradient-to-br from-green-500/20 to-slate-800/10 p-6 rounded-2xl animate-pulse-glow" style={{'--color-primary-rgb': '110, 231, 183'} as React.CSSProperties}>
                                <p className="text-9xl lg:text-[10rem] font-mono font-extrabold tracking-tighter">{String(p.tokenNumber).padStart(2, '0')}</p>
                                <p className="text-3xl lg:text-4xl text-slate-200 capitalize truncate w-full">{p.name.toLowerCase()}</p>
                            </div>
                        )) : (
                             <div className="flex-1 flex items-center justify-center">
                                <p className="text-6xl font-bold text-slate-600">-</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl p-6 shadow-2xl border border-slate-700 flex flex-col backdrop-blur-sm">
                    <h2 className="text-4xl font-bold text-center text-yellow-400 uppercase tracking-widest border-b-2 border-yellow-400/50 pb-4 mb-4">Waiting</h2>
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-y-auto pr-2">
                        {waiting.length > 0 ? waiting.map((p, index) => (
                            <div key={p.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in-up text-center bg-slate-700/50 rounded-lg p-4 flex flex-col items-center justify-center aspect-square transform transition-all duration-300 hover:scale-105 hover:bg-slate-700/80">
                                <p className="text-5xl lg:text-6xl font-mono font-bold text-slate-300">{String(p.tokenNumber).padStart(2, '0')}</p>
                                <p className="text-base lg:text-lg text-slate-400 capitalize truncate w-full mt-2">{p.name.toLowerCase()}</p>
                            </div>
                        )) : (
                            <div className="col-span-full flex items-center justify-center h-full">
                                <p className="text-2xl text-slate-500">No patients waiting.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <audio ref={audioRef} src={PING_SOUND_BASE64} preload="auto"></audio>
        </div>
    );
};

export default PatientQueue;

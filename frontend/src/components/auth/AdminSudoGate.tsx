'use client';

import { useState, useEffect, ReactNode } from 'react';
import { SudoModal } from './SudoModal';

interface AdminSudoGateProps {
    children: ReactNode;
}

export default function AdminSudoGate({ children }: AdminSudoGateProps) {
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check session storage on mount
        const sudoSession = sessionStorage.getItem('admin_sudo_mode');
        if (sudoSession === 'true') {
            setIsAuthorized(true);
        }
        setIsLoading(false);
    }, []);

    const handleVerified = () => {
        sessionStorage.setItem('admin_sudo_mode', 'true');
        setIsAuthorized(true);
    };

    if (isLoading) {
        return null; // Or a spinner
    }

    if (!isAuthorized) {
        return (
            <>
                {/* Render a placeholder while modal is open */}
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="p-8 text-center text-gray-500">
                        <p>Requiere verificación de seguridad...</p>
                    </div>
                </div>
                <SudoModal isOpen={true} onVerified={handleVerified} />
            </>
        );
    }

    return <>{children}</>;
}

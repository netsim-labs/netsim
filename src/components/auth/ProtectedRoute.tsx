import { ReactNode } from 'react';

// Open Source Community Edition: Everything is public by default.
// This component now simply passes children through.
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    return <>{children}</>;
};

import type { ReactNode } from "react";

export const Icon = ({ className, name, size = 5 }: { className?: string, name?: string, size?: number }): ReactNode => {
    switch (name) {
        case 'repeat':
            return <svg className={`h-${size} w-${size} ${className}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12V9a3 3 0 0 1 3-3h13m-3-3 3 3-3 3m3 3v3a3 3 0 0 1-3 3H4m3 3-3-3 3-3"/>
            </svg>;
        case 'star':
            return <svg className={`h-${size} w-${size} ${className}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21.947 9.179a1 1 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065"/>
            </svg>;
        case 'drop':
        default:
            return <svg className={`h-${size} w-${size} ${className}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                <path fill="currentColor" d="M23 20c0 3.866-3.582 7-8 7s-8-3.134-8-7 8-17 8-17 8 13.134 8 17"/>
            </svg>;
    }
};

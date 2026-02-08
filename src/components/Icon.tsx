import type { ReactNode } from "react";

export const Icon = ({ className, name, sizeClass = `size-5` }: { className?: string, name?: string, sizeClass?: string }): ReactNode => {
    switch (name) {
        case 'arrow-down':
            return <svg className={`${className} ${sizeClass}`} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M8.12 9.29L12 13.17l3.88-3.88a.996.996 0 1 1 1.41 1.41l-4.59 4.59a.996.996 0 0 1-1.41 0L6.7 10.7a.996.996 0 0 1 0-1.41c.39-.38 1.03-.39 1.42 0"></path></svg>;
        case 'arrow-left':
            return <svg className={`${className} ${sizeClass}`} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img"  preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M14.71 15.88L10.83 12l3.88-3.88a.996.996 0 1 0-1.41-1.41L8.71 11.3a.996.996 0 0 0 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0c.38-.39.39-1.03 0-1.42"></path></svg>;
        case 'arrow-right':
            return <svg className={`${className} ${sizeClass}`} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img"  preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M9.29 15.88L13.17 12L9.29 8.12a.996.996 0 1 1 1.41-1.41l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3a.996.996 0 0 1-1.41 0c-.38-.39-.39-1.03 0-1.42"></path></svg>;
        case 'arrow-up':
            return <svg className={`${className} ${sizeClass}`} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M8.12 14.71L12 10.83l3.88 3.88a.996.996 0 1 0 1.41-1.41L12.7 8.71a.996.996 0 0 0-1.41 0L6.7 13.3a.996.996 0 0 0 0 1.41c.39.38 1.03.39 1.42 0"></path></svg>;
        case 'double-arrow-down':
            return <svg className={`${className} ${sizeClass}`} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M17.29 5.71a.996.996 0 0 0-1.41 0L12 9.58L8.11 5.7A.996.996 0 1 0 6.7 7.11l4.59 4.59c.39.39 1.02.39 1.41 0l4.59-4.59a.984.984 0 0 0 0-1.4"></path><path fill="currentColor" d="M17.29 12.3a.996.996 0 0 0-1.41 0L12 16.17l-3.88-3.88a.996.996 0 1 0-1.41 1.41l4.59 4.59c.39.39 1.02.39 1.41 0l4.59-4.59a.993.993 0 0 0-.01-1.4"></path></svg>;
        case 'double-arrow-left':
            return <svg className={`${className} ${sizeClass}`} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M18.29 17.29a.996.996 0 0 0 0-1.41L14.42 12l3.88-3.88a.996.996 0 1 0-1.41-1.41L12.3 11.3a.996.996 0 0 0 0 1.41l4.59 4.59c.38.38 1.01.38 1.4-.01"></path><path fill="currentColor" d="M11.7 17.29a.996.996 0 0 0 0-1.41L7.83 12l3.88-3.88a.996.996 0 1 0-1.41-1.41L5.71 11.3a.996.996 0 0 0 0 1.41l4.59 4.59c.38.38 1.01.38 1.4-.01"></path></svg>;
        case 'double-arrow-right':
            return <svg className={`${className} ${sizeClass}`} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M5.7 6.71a.996.996 0 0 0 0 1.41L9.58 12L5.7 15.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L7.12 6.71c-.39-.39-1.03-.39-1.42 0"></path><path fill="currentColor" d="M12.29 6.71a.996.996 0 0 0 0 1.41L16.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L13.7 6.7c-.38-.38-1.02-.38-1.41.01"></path></svg>;
        case 'double-arrow-up':
            return <svg className={`${className} ${sizeClass}`} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M6.7 18.29c.39.39 1.02.39 1.41 0L12 14.42l3.88 3.88a.996.996 0 1 0 1.41-1.41L12.7 12.3a.996.996 0 0 0-1.41 0L6.7 16.88a.996.996 0 0 0 0 1.41"></path><path fill="currentColor" d="M6.7 11.7c.39.39 1.02.39 1.41 0L12 7.83l3.88 3.88a.996.996 0 1 0 1.41-1.41L12.7 5.71a.996.996 0 0 0-1.41 0L6.7 10.29a.996.996 0 0 0 0 1.41"></path></svg>;
        case 'repeat':
            return <svg className={`${className} ${sizeClass}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12V9a3 3 0 0 1 3-3h13m-3-3 3 3-3 3m3 3v3a3 3 0 0 1-3 3H4m3 3-3-3 3-3"/>
            </svg>;
        case 'star':
            return <svg className={`${className} ${sizeClass}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21.947 9.179a1 1 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065"/>
            </svg>;
        case 'drop':
        default:
            return <svg className={`${className} ${sizeClass}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                <path fill="currentColor" d="M23 20c0 3.866-3.582 7-8 7s-8-3.134-8-7 8-17 8-17 8 13.134 8 17"/>
            </svg>;
    }
};

import { type ReactNode } from "react";

export const Button = ({
    active = false,
    children,
    onClick,
    title,
    type = 'button',
}: {
    active?: boolean,
    children?: string | ReactNode,
    onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>['onClick'],
    title?: string,
    type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'],
}): ReactNode => {
    return (
        <button className={`text-sm cursor-pointer flex items-center justify-center min-w-6 px-1 ${active ? `bg-cyan-500` : `bg-cyan-600`} hover:bg-cyan-500 border border-cyan-700 shadow shadow-neutral-800/50 rounded-md`} onClick={onClick} title={title} type={type}>{children}</button>
    );
};

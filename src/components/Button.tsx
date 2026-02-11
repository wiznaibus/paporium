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
        <button className={`button flex items-center justify-center min-w-6 px-1 ${active ? `active` : undefined} shadow-stone-800/50`} onClick={onClick} title={title} type={type}>{children}</button>
    );
};

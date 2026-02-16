import type { ReactNode } from "react";

export const ItemImage = ({
    className = "w-18.75 h-25",
    id = 0,
    name = "Unavailable"
}: {
    className?: string,
    id: number,
    name?: string,
}): ReactNode => {
    return <div className={`flex items-center justify-center bg-white rounded-lg ${className}`}>
        <img className="rounded-lg" alt={name} onError={(event) => {
            event.currentTarget.src = "./assets/images/item/0.png";
        }} src={`./assets/images/collection/${id}.png`} title={name} />
    </div>;
};

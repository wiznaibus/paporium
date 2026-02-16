import type { ReactNode } from "react";

export const ItemIcon = ({
    id = 0,
    name = "Unavailable"
}: {
    id: number,
    name?: string,
}): ReactNode => {
    return <div className="flex shrink-0 items-center justify-center h-8 w-8 m-1 mr-0 bg-sakura-50 inset-shadow-xs inset-shadow-sakura-950 rounded-full">
        <img alt={name} onError={(event) => {
            event.currentTarget.src = "./assets/images/item/0.png";
        }} src={`./assets/images/item/${id}.png`} title={name} />
    </div>;
};

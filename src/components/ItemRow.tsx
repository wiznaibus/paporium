import { useState, type ReactNode } from "react";
import { ItemDetails } from "./ItemDetails";
import { Icon } from "./Icon";

const getBadgeStyles = (itemTypeId: number) => {
    switch (itemTypeId) {
        case 1:
            return `bg-yellow-200 border border-yellow-300`;
        case 2:
            return `bg-sky-200 border border-sky-300`;
        case 3:
            return `bg-red-200 border border-red-300`;
        case 4:
            return `bg-lime-200 border border-lime-300`;
        case 5:
            return `bg-teal-200 border border-teal-300`;
        case 6:
            return `bg-amber-200 border border-amber-300`;
        case 7:
            return `bg-green-200 border border-green-300`;
        case 8:
            return `bg-indigo-200 border border-indigo-300`;
        case 9:
            return `bg-violet-200 border border-violet-300`;
        case 10:
            return `bg-cyan-200 border border-cyan-300`;
        case 11:
            return `bg-orange-200 border border-orange-300`;
        case 12:
            return `bg-fuchsia-200 border border-fuchsia-300`;
        case 0:
        default:
            return `bg-neutral-200 border border-neutral-300`;
    }
}

export const ItemRow = ({
    id,
    name,
    itemType,
    itemTypeId = 0,
    buy,
    sell,
    weight,
    mobCount,
    ingredientSum,
    repeatableIngredientSum,
    productSum,
    repeatableProductSum
}: any): ReactNode => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    console.log(itemTypeId, sell, mobCount, ingredientSum, repeatableIngredientSum);
    const overchargeable = (
        itemTypeId === 6 // etc
        && sell > 0
        && mobCount > 0
        && (!ingredientSum || ingredientSum === 0)
        && (!repeatableIngredientSum || repeatableIngredientSum === 0)
    );
    console.log(overchargeable);

    const handleToggle = (event: React.ToggleEvent<HTMLDetailsElement>) => {
        setIsOpen(event.newState === "open");
    };

    return (
        <>
            <div className="relative flex gap-2 max-w-5xl text-sm text-white bg-pink-600 shadow shadow-neutral-800/50 mx-2 my-2.5  rounded-lg">
                <div className="shrink-0 flex items-center justify-center h-8 w-8 m-1 mr-0 bg-pink-50 inset-shadow-xs inset-shadow-pink-800 rounded-full">
                    <img onError={(event) => {
                        event.currentTarget.src = "./assets/images/item/0.png";
                    }} src={`./assets/images/item/${id}.png`} />
                </div>
                <div className="grow grid grid-cols-8">
                    <div className="px-2 col-span-3 flex flex-row items-center gap-1">
                        <div className="basis-10 text-lg text-amber-300">{id}</div>
                        <div className="grow text-lg font-semibold">{name}</div>
                        <div className={`px-1 text-xs text-neutral-700 shadow-xs shadow-neutral-700/25 rounded-sm ${getBadgeStyles(itemTypeId)}`}>
                            {itemType}
                        </div>
                    </div>
                    <div className="px-2 border-l border-pink-200 col-span-3 flex items-center text-base font-semibold">How to obtain</div>
                    <div className="px-2 border-l border-pink-200 col-span-2 flex items-center text-base font-semibold">Used for</div>
                    <div className="px-2 pb-0.5 text-sm text-amber-100">Buy</div>
                    <div className="px-2 pb-0.5 text-sm text-amber-100">Sell</div>
                    <div className="px-2 pb-0.5 text-sm text-amber-100">Weight</div>
                    <div className="px-2 pb-0.5 border-l border-pink-200 text-sm text-amber-100">Drop</div>
                    <div className="px-2 pb-0.5 text-sm text-amber-100">One-time</div>
                    <div className="px-2 pb-0.5 text-sm text-amber-100">Repeat</div>
                    <div className="px-2 pb-0.5 border-l border-pink-200 text-sm text-amber-100">One-time</div>
                    <div className="px-2 pb-0.5 text-sm text-amber-100">Repeat</div>

                    <div className="rounded-tl-lg px-2 py-1 bg-pink-400">{buy?.toLocaleString()}z</div>
                    <div className="px-2 py-1 bg-pink-400 border-l border-pink-700">{sell?.toLocaleString()}z</div>
                    <div className="px-2 py-1 bg-pink-400 border-l border-pink-700">{weight?.toLocaleString()}</div>
                    <div className="px-2 py-1 bg-pink-400 border-l border-pink-200 ">
                        {mobCount && <div className="flex items-center">
                            <Icon className="text-amber-100" name="drop" />
                            {mobCount?.toLocaleString()}
                        </div>}
                    </div>
                    <div className="px-2 py-1 bg-pink-400 border-l border-pink-700">
                        {productSum && <div className="flex items-center">
                            <Icon className="text-amber-100" name="star" />
                            x{productSum?.toLocaleString()}
                        </div>}
                    </div>
                    <div className="px-2 py-1 bg-pink-400 border-l border-pink-700">
                        {repeatableProductSum && <div className="flex items-center">
                            <Icon className="text-amber-100" name="repeat" />
                            x{repeatableProductSum?.toLocaleString()}
                        </div>}
                    </div>
                    <div className="px-2 py-1 bg-pink-400 border-l border-pink-200 ">
                        {ingredientSum && <div className="flex items-center">
                            <Icon className="text-amber-100" name="star" />
                            x{ingredientSum?.toLocaleString()}
                        </div>}
                    </div>
                    <div className="rounded-br-lg px-2 py-1 bg-pink-400 border-l border-pink-700">
                        {repeatableIngredientSum && <div className="flex items-center">
                            <Icon className="text-amber-100" name="repeat" />
                            x{repeatableIngredientSum?.toLocaleString()}
                        </div>}
                    </div>
                </div>
                {overchargeable && <div className="absolute -top-1.5 -right-1.5">
                    <img src="./assets/icons/overcharge.png" />
                </div>}
            </div>
            {/* <tr>
            <td colSpan={8}>
                <details onToggle={handleToggle}>
                    <summary>Details</summary>
                    {
                        isOpen && <ItemDetails
                            key={`${id}-${name}`}
                            id={id}
                        />
                    }
                </details>
            </td>
        </tr> */}
        </>
    );
};
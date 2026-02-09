import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import { getItemBadgeStyles } from "../utilities/BadgeStyles";
import type { Item } from "../Items";

export const ItemRow = ({
    id,
    name,
    itemType,
    itemTypeId = 0,
    buy,
    sell,
    weight,
    mobDropCount,
    mobMvpDropCount,
    ingredientSum,
    repeatableIngredientSum,
    productSum,
    repeatableProductSum,
    overcharge,
    selectedItem = 0,
    setSelectedItem,
}: Item & {
    selectedItem?: number,
    setSelectedItem?: (item: number) => void,
}): ReactNode => {
    const [hasDetails, setHasDetails] = useState<boolean>(false);

    useEffect(() => {
        setHasDetails(
            (mobDropCount !== undefined && mobDropCount > 0)
            || (mobMvpDropCount !== undefined && mobMvpDropCount > 0)
            || (ingredientSum !== undefined && ingredientSum > 0)
            || (repeatableIngredientSum !== undefined && repeatableIngredientSum > 0)
            || (productSum !== undefined && productSum > 0)
            || (repeatableProductSum !== undefined && repeatableProductSum> 0)
        )
    }, [mobDropCount, mobMvpDropCount, ingredientSum, repeatableIngredientSum, productSum, repeatableProductSum]);

    return (
        <div className="flex">
            <div className="grow relative flex text-sm text-white bg-pink-600 border border-pink-600 shadow shadow-neutral-800/50 rounded-lg">
                <div className="hidden md:flex shrink-0 items-center justify-center h-8 w-8 m-1 mr-0 bg-pink-50 inset-shadow-xs inset-shadow-pink-800 rounded-full">
                    <img alt={name} onError={(event) => {
                        event.currentTarget.src = "./assets/images/item/0.png";
                    }} src={`./assets/images/item/${id}.png`} title={name} />
                </div>
                <div className="grow grid grid-cols-3 grid-rows-3 gap-2 md:grid-cols-8 md:grid-rows-1 md:gap-0">
                    <div className="col-span-3 grid grid-cols-3 grid-rows-[1fr_min-content_1fr]">
                        <div className="px-2 col-span-3 flex flex-row items-center gap-1 truncate">
                            <div className="basis-10 text-lg text-amber-300">{id}</div>
                            <div className="grow text-lg font-semibold overflow-hidden text-ellipsis" title={name}>{name}</div>
                            <div className={`px-1 text-xs text-neutral-700 shadow-xs shadow-neutral-700/25 rounded-sm ${getItemBadgeStyles(itemTypeId)}`}>
                                {itemType}
                            </div>
                        </div>
                        <div className="px-2 md:pb-0.5 text-sm text-amber-100">Buy</div>
                        <div className="px-2 md:pb-0.5 text-sm text-amber-100">Sell</div>
                        <div className="px-2 md:pb-0.5 text-sm text-amber-100">Weight</div>
                        <div className="flex items-center md:rounded-tl-lg px-2 md:py-1 bg-pink-400" title={`${buy?.toLocaleString()}z`}>{buy?.toLocaleString()}z</div>
                        <div className="flex items-center px-2 md:py-1 bg-pink-400 border-l border-pink-700" title={`${sell?.toLocaleString()}z`}>{sell?.toLocaleString()}z</div>
                        <div className="flex items-center px-2 md:py-1 bg-pink-400 border-l border-pink-700" title={weight?.toLocaleString()}>{weight?.toLocaleString()}</div>
                    </div>
                    <div className="col-span-3 grid grid-cols-3 grid-rows-[1fr_min-content_1fr]">
                        <div className="px-2 md:border-l md:border-pink-200 col-span-3 flex items-center text-base font-semibold">How to obtain</div>
                        <div className="px-2 md:pb-0.5 md:border-l md:border-pink-200 text-sm text-amber-100">Drop</div>
                        <div className="px-2 md:pb-0.5 text-sm text-amber-100">One-time</div>
                        <div className="px-2 md:pb-0.5 text-sm text-amber-100">Repeat</div>
                        <div className="flex items-center px-2 md:py-1 bg-pink-400 md:border-l md:border-pink-200 ">
                            {(mobDropCount || mobMvpDropCount) && <div className="flex items-center">
                                <Icon className="shrink-0 text-amber-100" name="drop" />
                                <span className="overflow-hidden text-ellipsis" title={`${((mobDropCount ?? 0) + (mobMvpDropCount ?? 0)).toLocaleString()} drops`}>
                                    {((mobDropCount ?? 0) + (mobMvpDropCount ?? 0)).toLocaleString()}
                                </span>
                            </div>}
                        </div>
                        <div className="flex items-center px-2 md:py-1 bg-pink-400 border-l border-pink-700">
                            {productSum && <div className="flex items-center">
                                <Icon className="shrink-0 text-amber-100" name="star" />
                                <span className="overflow-hidden text-ellipsis" title={`x${productSum?.toLocaleString()}`}>x{productSum?.toLocaleString()}</span>
                            </div>}
                        </div>
                        <div className="flex items-center px-2 md:py-1 bg-pink-400 border-l border-pink-700">
                            {repeatableProductSum && <div className="flex items-center">
                                <Icon className="shrink-0 text-amber-100" name="repeat" />
                                <span className="overflow-hidden text-ellipsis" title={`x${repeatableProductSum?.toLocaleString()}`}>x{repeatableProductSum?.toLocaleString()}</span>
                            </div>}
                        </div>
                    </div>
                    <div className="col-span-2 grid grid-cols-2  grid-rows-[1fr_min-content_1fr]">
                        <div className="px-2 md:border-l md:border-pink-200 col-span-2 flex items-center text-base font-semibold">Used for</div>
                        <div className="px-2 md:pb-0.5 md:border-l md:border-pink-200 text-sm text-amber-100">One-time</div>
                        <div className="px-2 md:pb-0.5 text-sm text-amber-100">Repeat</div>
                        <div className="flex rounded-bl-lg md:rounded-none items-center px-2 md:py-1 bg-pink-400 md:border-l md:border-pink-200 ">
                            {ingredientSum && <div className="flex items-center">
                                <Icon className="shrink-0 text-amber-100" name="star" />
                                <span className="overflow-hidden text-ellipsis" title={`x${ingredientSum?.toLocaleString()}`}>x{ingredientSum?.toLocaleString()}</span>
                            </div>}
                        </div>
                        <div className="flex items-center md:rounded-br-lg px-2 md:py-1 bg-pink-400 border-l border-pink-700">
                            {repeatableIngredientSum && <div className="flex items-center overflow-hidden">
                                <Icon className="shrink-0 text-amber-100" name="repeat" />
                                <span className="overflow-hidden text-ellipsis" title={`x${repeatableIngredientSum?.toLocaleString()}`}>x{repeatableIngredientSum?.toLocaleString()}</span>
                            </div>}
                        </div>
                    </div>
                    <div className="md:hidden flex items-center">
                        <img className="h-15" alt={name} onError={(event) => {
                            event.currentTarget.src = "./assets/images/item/0.png";
                        }} src={`./assets/images/collection/${id}.png`} title={name} />
                    </div>
                </div>
                {overcharge && <div className="absolute -bottom-1.5 md:-top-1.5 -right-1.5">
                    <img alt="overcharge" src="./assets/icons/overcharge.png" title="Overcharge" />
                </div>}
            </div>
            <div className="shrink-0 hidden xl:flex items-center -ml-1 w-7.5">
                {hasDetails && (
                    <button className={`cursor-pointer flex items-center ${selectedItem === id ? `pl-1.5 bg-cyan-500` : `pl-1 bg-cyan-600`} pr-1 hover:pl-1.5  hover:bg-cyan-500 border border-cyan-700 shadow shadow-neutral-800/50 rounded-md`} onClick={() => setSelectedItem?.(id)} type="button">
                        <div className="flex items-center justify-center text-sm rotate-text-90 rotate-180">
                            <Icon className="shrink-0 text-amber-100" name={selectedItem === id ? `double-arrow-right` : `double-arrow-left`} sizeClass="size-4" />
                            Details
                            <Icon className="shrink-0 text-amber-100" name={selectedItem === id ? `double-arrow-right` : `double-arrow-left`} sizeClass="size-4" />
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
};
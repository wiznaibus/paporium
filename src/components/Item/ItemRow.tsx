import { useEffect, useState, type ReactNode } from "react";
import type { Item } from "../../Items";
import { Badge } from "../Badge";
import { Icon } from "../Icon";
import { ItemIcon } from "../Item/ItemIcon";
import { ItemImage } from "../Item/ItemImage";

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
            <div className="item grow relative flex">
                <div className="hidden md:flex shrink-0">
                    <ItemIcon id={id} name={name} />
                </div>
                <div className="grow grid grid-cols-3 grid-rows-3 gap-2 md:grid-cols-8 md:grid-rows-1 md:gap-0">
                    <div className="col-span-3 grid grid-cols-3 grid-rows-[1fr_min-content_1fr]">
                        <div className="px-2 col-span-3 flex flex-row items-center gap-1 truncate">
                            <div className="emphasis basis-10 text-lg">{id}</div>
                            <div className="grow text-lg font-semibold truncate" title={name}>{name}</div>
                            <Badge id={itemTypeId} name={itemType} type="item" />
                        </div>
                        <div className="px-2 md:pb-0.5 text-sm header">Buy</div>
                        <div className="px-2 md:pb-0.5 text-sm header">Sell</div>
                        <div className="px-2 md:pb-0.5 text-sm header">Weight</div>
                        <div className="item-data flex items-center md:rounded-tl-lg px-2 md:py-1" title={`Buy for ${buy?.toLocaleString()} zeny`}>{buy?.toLocaleString()}z</div>
                        <div className="item-data flex items-center px-2 md:py-1 border-l" title={`Sell for ${sell?.toLocaleString()} zeny`}>{sell?.toLocaleString()}z</div>
                        <div className="item-data flex items-center px-2 md:py-1 border-l" title={`Weighs ${weight?.toLocaleString()}`}>{weight?.toLocaleString()}</div>
                    </div>
                    <div className="col-span-3 grid grid-cols-3 grid-rows-[1fr_min-content_1fr]">
                        <div className="item-separator px-2 md:border-l col-span-3 flex items-center text-base font-semibold">How to obtain</div>
                        <div className="item-separator px-2 md:pb-0.5 md:border-l text-sm header">Drop</div>
                        <div className="px-2 md:pb-0.5 text-sm header">One-time</div>
                        <div className="px-2 md:pb-0.5 text-sm header">Repeat</div>
                        <div className="item-data item-separator flex items-center px-2 md:py-1 md:border-l">
                            {((mobDropCount ?? 0) > 0 || (mobMvpDropCount ?? 0) > 0) && <div className="flex items-center" title={`Dropped by ${((mobDropCount ?? 0) + (mobMvpDropCount ?? 0)).toLocaleString()} mobs`}>
                                <Icon className="shrink-0 emphasis" name="drop" />
                                <span className="truncate">
                                    {((mobDropCount ?? 0) + (mobMvpDropCount ?? 0)).toLocaleString()}
                                </span>
                            </div>}
                        </div>
                        <div className="item-data flex items-center px-2 md:py-1 border-l">
                            {((productSum ?? 0) > 0) && <div className="flex items-center" title={`One-time recipes produce x${productSum?.toLocaleString()}`}>
                                <Icon className="shrink-0 emphasis" name="star" />
                                <span className="truncate">x{productSum?.toLocaleString()}</span>
                            </div>}
                        </div>
                        <div className="item-data flex items-center px-2 md:py-1 border-l">
                            {((repeatableProductSum ?? 0) > 0) && <div className="flex items-center" title={`Repeatable recipes produce x${repeatableProductSum?.toLocaleString()}`}>
                                <Icon className="shrink-0 emphasis" name="repeat" />
                                <span className="truncate">x{repeatableProductSum?.toLocaleString()}</span>
                            </div>}
                        </div>
                    </div>
                    <div className="col-span-2 grid grid-cols-2  grid-rows-[1fr_min-content_1fr]">
                        <div className="item-separator px-2 md:border-l col-span-2 flex items-center text-base font-semibold">Used for</div>
                        <div className="item-separator px-2 md:pb-0.5 md:border-l text-sm header">One-time</div>
                        <div className="px-2 md:pb-0.5 text-sm header">Repeat</div>
                        <div className="item-data item-separator flex rounded-bl-lg md:rounded-none items-center px-2 md:py-1 md:border-l">
                            {((ingredientSum ?? 0) > 0) && <div className="flex items-center" title={`One-time recipes use x${ingredientSum?.toLocaleString()}`}>
                                <Icon className="shrink-0 emphasis" name="star" />
                                <span className="truncate">x{ingredientSum?.toLocaleString()}</span>
                            </div>}
                        </div>
                        <div className="item-data flex items-center rounded-tr-lg md:rounded-tr-none md:rounded-br-lg px-2 md:py-1 border-l">
                            {((repeatableIngredientSum ?? 0) > 0) && <div className="flex items-center overflow-hidden" title={`Repeatable recipes use x${repeatableIngredientSum?.toLocaleString()}`}>
                                <Icon className="shrink-0 emphasis" name="repeat" />
                                <span className="truncate">x{repeatableIngredientSum?.toLocaleString()}</span>
                            </div>}
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 md:hidden flex items-center">
                        <ItemImage className="h-20 w-15" id={id} name={name} />
                    </div>
                </div>
                {overcharge && <div className="absolute -bottom-1.5 md:-top-1.5 -right-1.5">
                    <img alt="overcharge" src="./assets/icons/overcharge.png" title="Can be safely sold" />
                </div>}
            </div>
            <div className="shrink-0 flex items-start mt-1 lg:items-center lg:mt-0 -ml-1 w-7.5">
                {hasDetails && (
                    <button className={`button flex items-center ${selectedItem === id ? `active pl-1.5 hover:pl-1` : `pl-1 hover:pl-1.5`} pr-1 shadow-stone-800/50 rounded-md`} onClick={() => setSelectedItem?.(id)} type="button">
                        <div className="flex items-center justify-center text-sm rotate-text-90 rotate-180">
                            <Icon className="shrink-0" name={selectedItem === id ? `double-arrow-right` : `double-arrow-left`} sizeClass="size-4" />
                            {selectedItem === id ? `Close` : `Details`}
                            <Icon className="shrink-0" name={selectedItem === id ? `double-arrow-right` : `double-arrow-left`} sizeClass="size-4" />
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
};
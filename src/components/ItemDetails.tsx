import { useState, useEffect } from "react";
import initSqlJs, { type Database } from "sql.js";
import { RecipeDetails } from "./RecipeDetails";
import { formatSearchParams, type SearchFilter } from "../utilities/SearchFilter";
import { Icon } from "./Icon";
import { DropDetails, type Drop } from "./DropDetails";
import { getItemBadgeStyles } from "../utilities/BadgeStyles";

interface Item {
    id?: number;
    name?: string;
    itemType?: string;
    itemTypeId?: number;
    buy?: number;
    sell?: number;
    weight?: number;
}

export const ItemDetails = ({
    id,
    filter,
    setSelectedItem
}: {
    id: number,
    filter: SearchFilter,
    setSelectedItem?: (item: number) => void,
}) => {
    const [db, setDb] = useState<Database | null>(null);
    const [item, setItem] = useState<Item>();
    const [drops, setDrops] = useState<Drop[]>([]);
    const [mvpDrops, setMvpDrops] = useState<Drop[]>([]);

    const [recipes, setRecipes] = useState<number[]>([]);

    useEffect(() => {
        const loadDb = async () => {
            try {
                const response = await fetch(`./db/items.sqlite`);
                const buffer = await response.arrayBuffer();

                const SQL = await initSqlJs({
                    locateFile: file => `https://sql.js.org/dist/${file}`
                });

                const loadDb = new SQL.Database(new Uint8Array(buffer));

                setDb(loadDb);
            } catch (error) {
                console.error(error);
            }
        };

        loadDb();
    }, []);

    useEffect(() => {
        if (db) {
            const {
                jobs,
                recipeItemTypes,
                recipeTypes,
            } = formatSearchParams(filter);

            setItem(db.exec(`
                SELECT
                Item.Id,
                Item.Name,
                Item.ItemTypeId,
                ItemType.Name AS ItemType,
                Item.Buy,
                Item.Sell,
                Item.Weight
                FROM Item
                JOIN ItemType ON Item.ItemtypeId = ItemType.Id
                WHERE Item.Id = ${id}
                LIMIT 1
            `).map(({ values }) => (
                values.map((value) => ({
                    id: Number(value[0]),
                    name: value[1]?.toString(),
                    itemTypeId: Number(value[2]),
                    itemType: value[3]?.toString(),
                    buy: Number(value[4]),
                    sell: Number(value[5]),
                    weight: Number(value[6]),
                }))
            ))[0][0]);

            let recipeFilter = ``;

            recipeFilter += recipeItemTypes ? `
                AND (RecipeItem.RecipeItemTypeId IN (${recipeItemTypes}))
            ` : ``;

            recipeFilter += jobs ? `
                AND (Recipe.JobId IN (${jobs}))
            ` : ``;
            recipeFilter += recipeTypes ? `
                AND Recipe.RecipeTypeId IN (${recipeTypes})
            ` : ``;

            setRecipes(db.exec(`
                SELECT
                DISTINCT RecipeId AS Id
                FROM RecipeItem
				JOIN Recipe ON RecipeItem.RecipeId = Recipe.Id
                WHERE ItemId = ${id}
                ${recipeFilter}
                ORDER BY RecipeTypeId, RecipeId
            `).map(({ values }) => (
                values.map((value): number => (Number(value[0])))
            ))[0]);

            setDrops(db.exec(`
                SELECT
                MobDrop.MobId AS Id,
                Mob.Name AS Mob,
                MobDrop.Slot AS Slot,
                MobDrop.Rate,
                MobDrop.StealProtected
                FROM MobDrop
                JOIN Mob ON MobDrop.MobId = Mob.Id
                JOIN Item ON MobDrop.ItemId = Item.Id
                WHERE MobDrop.ItemId = ${id}
                ORDER BY MobDrop.Rate DESC, MobDrop.MobId ASC
            `).map(({ values }) => (
                values.map((value) => ({
                    mobId: Number(value[0]),
                    mob: value[1]?.toString(),
                    slot: Number(value[2]),
                    rate: Number(value[3]),
                    stealProtected: Boolean(value[4]),
                }))
            ))[0]);

            setMvpDrops(db.exec(`
                SELECT
                MobMvpDrop.MobId AS Id,
                Mob.Name AS Mob,
                MobMvpDrop.Slot AS Slot,
                MobMvpDrop.Rate
                FROM MobMvpDrop
                JOIN Mob ON MobMvpDrop.MobId = Mob.Id
                JOIN Item ON MobMvpDrop.ItemId = Item.Id
                WHERE MobMvpDrop.ItemId = ${id}
                ORDER BY MobMvpDrop.Rate DESC, MobMvpDrop.MobId ASC
            `).map(({ values }) => (
                values.map((value) => ({
                    mobId: Number(value[0]),
                    mob: value[1]?.toString(),
                    slot: Number(value[2]),
                    rate: Number(value[3]),
                }))
            ))[0]);
        }
    }, [db, id, filter]);

    return item && (
        <div className="sticky top-0 h-screen flex flex-col gap-2 py-2">
            <div className="flex flex-col mb-2">
                <div className="relative flex bg-pink-600 border border-pink-600 shadow shadow-neutral-800/50 rounded-lg">
                    <div className="flex flex-col grow">
                        <div className="grow flex flex-row items-center gap-1 pl-2 pr-24">
                            <div className="basis-10 text-xl text-amber-300">{id}</div>
                            <div className="grow text-xl font-semibold" title={item.name}>{item.name}</div>
                            <div className={`px-1 text-xs text-neutral-700 shadow-xs shadow-neutral-700/25 rounded-sm ${getItemBadgeStyles(item.itemTypeId ?? 0)}`}>
                                {item.itemType}
                            </div>
                        </div>
                        <div className={`
                                grid
                                grid-cols-2 grid-rows-[min-content_1fr_min-content_1fr_min-content_1fr]
                                2xl:grid-cols-5 2xl:grid-rows-[min-content_1fr] grid-flow-col
                                2xl:pr-18
                            `}>
                            <div className="col-span-2 2xl:col-span-1 px-2 pb-0.5 text-sm text-amber-100">Buy</div>
                            <div className="col-span-2 2xl:col-span-1 flex items-center 2xl:rounded-bl-lg px-2 py-1 bg-pink-400" title={`${item.buy?.toString()}z`}>
                                {item.buy?.toString()}z
                            </div>
                            <div className="px-2 pb-0.5 text-sm text-amber-100">Sell</div>
                            <div className="flex items-center px-2 py-1 bg-pink-400 border-l-0 2xl:border-l border-pink-700" title={`${item.sell?.toString()}z`}>
                                {item.sell?.toString()}z
                            </div>
                            <div className="px-2 pb-0.5 text-sm text-amber-100">Weight</div>
                            <div className="flex items-center rounded-bl-lg 2xl:rounded-bl-none px-2 py-1 bg-pink-400 border-l-0 2xl:border-l border-pink-700" title={item.weight?.toString()}>
                                {item.weight?.toString()}
                            </div>
                            <div className="px-2 pb-0.5 text-sm text-amber-100">Drops</div>
                            <div className="flex items-center px-2 py-1 bg-pink-400 border-l border-pink-700" title={((drops?.length ?? 0) + (mvpDrops?.length ?? 0)).toString()}>
                                {(drops?.length ?? 0) + (mvpDrops?.length ?? 0) > 0 && (
                                    <>
                                        <Icon className="shrink-0 text-amber-100" name="drop" />
                                        {((drops?.length ?? 0) + (mvpDrops?.length ?? 0)).toString()}
                                    </>
                                )}
                            </div>
                            <div className="px-2 pb-0.5 text-sm text-amber-100">Recipes</div>
                            <div className="flex items-center rounded-br-lg 2xl:rounded-br-none px-2 py-1 bg-pink-400 border-l border-pink-700" title={(recipes?.length ?? 0).toString()}>
                                {(recipes?.length ?? 0) > 0 && (
                                    <>
                                        <Icon className="shrink-0 text-amber-100" name="star" />
                                        {((recipes?.length ?? 0)).toString()}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-18.75 h-25 flex items-center justify-center bg-white inset-shadow-xs inset-shadow-pink-800 rounded-lg">
                        <img className="rounded-lg" alt={item.name} onError={(event) => {
                            event.currentTarget.src = "./assets/images/item/0.png";
                        }} src={`./assets/images/collection/${id}.png`} title={item.name} />
                    </div>
                </div>
                <div className="flex items-center -mt-1 ml-1 w-7.5">
                    <button className={`cursor-pointer flex items-center hover:pt-1 pb-1 hover:mb-0.5 pt-1.5 mb-0 bg-cyan-600 hover:bg-cyan-500 border border-cyan-700 shadow shadow-neutral-800/50 rounded-md`} onClick={() => setSelectedItem?.(0)} type="button">
                        <div className="flex items-center justify-center text-sm">
                            <Icon className="shrink-0 text-amber-100" name="double-arrow-up" sizeClass="size-4" />
                            Close
                            <Icon className="shrink-0 text-amber-100" name="double-arrow-up" sizeClass="size-4" />
                        </div>
                    </button>
                </div>
            </div>

            {(drops || mvpDrops || recipes) && (
                <div className="grow rounded-lg overflow-hidden">
                    <div className="max-h-full overflow-y-auto flex flex-col gap-2">
                        {(drops || mvpDrops) && <DropDetails drops={drops} mvpDrops={mvpDrops} />}

                        {recipes && (
                            <div className="flex flex-col gap-2">
                                {recipes.map(recipe =>
                                    <RecipeDetails key={recipe} id={recipe} selectedItemId={id} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
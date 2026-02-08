import { useState, useEffect } from "react";
import initSqlJs, { type Database } from "sql.js";
import { useSearchParams } from 'react-router-dom';
import { Icon } from "./Icon";

interface RecipeItem {
    id?: number;
    name?: string;
    typeId?: number;
    type?: string;
    quantity?: number;
}

interface Recipe {
    id: number,
    name?: string,
    typeId: number,
    type?: string,
    jobId?: number,
    job?: string,
    repeatable?: boolean,
    custom?: boolean,
    ingredients?: RecipeItem[],
    products?: RecipeItem[],
}

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

export const RecipeDetails = ({
    id,
    selectedItemId
}: {
    id: number,
    selectedItemId?: number
}) => {
    const [searchParams] = useSearchParams();
    const [db, setDb] = useState<Database | null>(null);
    const [recipe, setRecipe] = useState<Recipe>();

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
            const recipe: Recipe = db.exec(`
                SELECT
                Recipe.Name,
                Recipe.RecipeTypeId,
                RecipeType.Name AS RecipeName,
                Recipe.JobId,
                Job.Name AS JobName,
                Recipe.Repeatable,
                Recipe.Custom

                FROM Recipe
                JOIN RecipeType ON Recipe.RecipeTypeId = RecipeType.Id
                JOIN Job ON Recipe.JobId = Job.Id

                WHERE Recipe.Id = ${id}
                LIMIT 1;
            `).map(({ values }) => (
                values.map((value): Recipe => ({
                    id: id,
                    name: value[0]?.toString(),
                    typeId: Number(value[1]),
                    type: value[2]?.toString(),
                    jobId: Number(value[3]),
                    job: value[4]?.toString(),
                    repeatable: Boolean(value[5]),
                    custom: Boolean(value[6]),
                }))
            ))[0][0];

            const ingredients: RecipeItem[] = db.exec(`
                SELECT
                RecipeItem.ItemId,
                Item.Name AS ItemName,
                RecipeItem.RecipeItemTypeId,
                RecipeItemType.Name AS RecipeItemTypeName,
                RecipeItem.Quantity

				FROM RecipeItem
                JOIN Item ON RecipeItem.ItemId = Item.Id
                JOIN RecipeItemType ON RecipeItem.RecipeItemTypeId = RecipeItemType.Id

                WHERE RecipeItem.RecipeId = ${id}
                AND RecipeItemTypeId = 1
                ORDER BY Item.Id
            `).map(({ values }) => (
                values.map((value): RecipeItem => ({
                    id: Number(value[0]),
                    name: value[1]?.toString(),
                    typeId: Number(value[2]),
                    type: value[3]?.toString(),
                    quantity: Number(value[4]),
                }))
            ))[0];

            const products: RecipeItem[] = db.exec(`
                SELECT
                RecipeItem.ItemId,
                Item.Name AS ItemName,
                RecipeItem.RecipeItemTypeId,
                RecipeItemType.Name AS RecipeItemTypeName,
                RecipeItem.Quantity

				FROM RecipeItem
                JOIN Item ON RecipeItem.ItemId = Item.Id
                JOIN RecipeItemType ON RecipeItem.RecipeItemTypeId = RecipeItemType.Id

                WHERE RecipeItem.RecipeId = ${id}
                AND RecipeItemTypeId = 2
                ORDER BY Item.Id
            `).map(({ values }) => (
                values.map((value): RecipeItem => ({
                    id: Number(value[0]),
                    name: value[1]?.toString(),
                    typeId: Number(value[2]),
                    type: value[3]?.toString(),
                    quantity: Number(value[4]),
                }))
            ))[0];

            setRecipe({
                ...recipe,
                ingredients,
                products
            });
        }
    }, [db, id, searchParams]);

    return recipe && (
        <div className="results flex flex-col px-1.5 pt-1 pb-2 bg-cyan-600 rounded-lg overflow-hidden">
            <div className="flex items-center gap-1">
                <div className="hidden md:flex shrink-0 items-center justify-center h-8 w-8 m-1 bg-pink-50 inset-shadow-xs inset-shadow-pink-800 rounded-full">
                    <img alt={recipe?.products?.[0].name ?? "No image"} onError={(event) => {
                        event.currentTarget.src = "./assets/images/item/0.png";
                    }} src={`./assets/images/item/${recipe?.products?.[0].id ?? 0}.png`} title={recipe?.products?.[0].name ?? "No image"} />
                </div>
                <div className="grow text-md font-semibold">{recipe.name}</div>
                <div className="shrink-0 flex gap-1">
                    {(recipe.typeId ?? 0) > 0 && <div className={`px-1 text-xs text-neutral-700 shadow-xs shadow-neutral-700/25 rounded-sm ${getBadgeStyles(recipe.typeId ?? 0)}`}>
                        {recipe.type}
                    </div>}
                    {(recipe.jobId ?? 0) > 0 && <div className={`px-1 text-xs text-neutral-700 shadow-xs shadow-neutral-700/25 rounded-sm ${getBadgeStyles(recipe.jobId ?? 0)}`}>
                        {recipe.job}
                    </div>}
                </div>
                <div className="shrink-0 flex">
                    {recipe.repeatable && <Icon className="shrink-0 text-amber-100" name="repeat" />}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 truncate text-sm">
                <div className="grid grid-cols-1 auto-rows-min">
                    <div className="text-amber-100">Ingredients</div>
                    {recipe.ingredients?.map(ingredient =>
                        <div key={ingredient.id} className="flex border-t border-cyan-700">
                            <div className={`px-0.5 basis-10 text-amber-200 ${ingredient.id === selectedItemId && `font-semibold text-amber-50 bg-amber-600`}`}>{ingredient.id}</div>
                            <div className={`px-0.5 grow overflow-hidden text-ellipsis ${ingredient.id === selectedItemId && `font-semibold bg-amber-600`}`} title={ingredient.name}>{ingredient.name}</div>
                            <div className={`px-0.5 ${ingredient.id === selectedItemId && `font-semibold bg-amber-600`}`}>x{ingredient.quantity}</div>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 auto-rows-min">
                    <div className="text-amber-100">Products</div>
                    {recipe.products?.map(product =>
                        <div key={product.id} className="flex border-t border-cyan-700">
                            <div className={`px-0.5 basis-10 text-amber-200 ${product.id === selectedItemId && `font-semibold text-amber-50 bg-amber-600`}`}>{product.id}</div>
                            <div className={`px-0.5 grow overflow-hidden text-ellipsis ${product.id === selectedItemId && `font-semibold bg-amber-600`}`} title={product.name}>{product.name}</div>
                            <div className={`px-0.5 ${product.id === selectedItemId && `font-semibold bg-amber-600`}`}>x{product.quantity}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
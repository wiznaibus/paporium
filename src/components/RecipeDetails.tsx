import { useState, useEffect } from "react";
import initSqlJs, { type Database } from "sql.js";
import { useSearchParams } from 'react-router-dom';
import { Badge } from "./Badge";
import { Icon } from "./Icon";
import { ItemIcon } from "./ItemIcon";

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
        <div className="recipe flex flex-col px-1.5 pt-1 pb-2 overflow-hidden">
            <div className="flex items-center gap-1">
                <div className="hidden md:flex shrink-0">
                    <ItemIcon id={recipe?.products?.[0].id ?? 0} name={recipe?.products?.[0].name} />
                </div>

                <div className="grow text-md font-semibold" title={recipe.name}>{recipe.name}</div>
                <div className="shrink-0 flex gap-1">
                    {(recipe.typeId ?? 0) > 0 && <Badge id={recipe.typeId} name={recipe.type} type="recipe" />}
                    {(recipe.jobId ?? 0) > 0 && <Badge id={recipe.jobId} name={recipe.job} type="job" />}

                </div>
                {recipe.repeatable ? (
                    <div className="shrink-0 flex" title="Repeatable">
                        <Icon className="shrink-0 emphasis" name="repeat" />
                    </div>
                ) : (
                    <div className="shrink-0 flex" title="One-time">
                        <Icon className="shrink-0 emphasis" name="star" />
                    </div>
                )}

            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="grid grid-cols-1 auto-rows-min">
                    <div className="header">Ingredients</div>
                    {recipe.ingredients?.map(ingredient =>
                        <div key={ingredient.id} className="recipe-data flex border-t">
                            <div className={`px-0.5 basis-10 emphasis ${ingredient.id === selectedItemId && `recipe-data-emphasis`}`}>{ingredient.id}</div>
                            <div className={`px-0.5 grow truncate ${ingredient.id === selectedItemId && `recipe-data-emphasis`}`} title={ingredient.name}>{ingredient.name}</div>
                            <div className={`px-0.5 ${ingredient.id === selectedItemId && `recipe-data-emphasis`}`}>x{ingredient.quantity}</div>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 auto-rows-min">
                     <div className="header">Products</div>
                    {recipe.products?.map(product =>
                        <div key={product.id} className="recipe-data flex border-t">
                            <div className={`px-0.5 basis-10 emphasis ${product.id === selectedItemId && `recipe-data-emphasis`}`}>{product.id}</div>
                            <div className={`px-0.5 grow truncate ${product.id === selectedItemId && `recipe-data-emphasis`}`} title={product.name}>{product.name}</div>
                            <div className={`px-0.5 ${product.id === selectedItemId && `recipe-data-emphasis`}`}>x{product.quantity}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
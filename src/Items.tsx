import React, { useState, useEffect } from "react";
import initSqlJs from "sql.js";
import type { Database, QueryExecResult } from "sql.js";
import { useSearchParams } from 'react-router-dom';
import { ItemTable } from "./components/ItemTable";

interface FilterItem {
    id: any,
    name: any
}

export const Items = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [db, setDb] = useState<Database | null>(null);
    const [data, setData] = useState<QueryExecResult[]>([]);
    const [itemTypes, setItemTypes] = useState<FilterItem[]>([]);
    const [jobs, setJobs] = useState<FilterItem[]>([]);
    const [recipeTypes, setRecipeTypes] = useState<FilterItem[]>([]);
    const [recipeItemTypes, setRecipeItemTypes] = useState<FilterItem[]>([]);

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        setSearchParams({ 
            item: formData.get("item")?.toString() ?? "",
            itemType: formData.getAll("itemType").join(","),
            job: formData.getAll("job").join(","),
            recipeType: formData.getAll("recipeType").join(","),
            recipeItemType: formData.getAll("recipeItemType").join(","),
        });
    };

    useEffect(() => {
        const loadDb = async () => {
            try {
                const response = await fetch(`/db/items.sqlite`);
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
            setItemTypes(db.exec(`
                SELECT * FROM ItemType
            `).map(({ values }) => (values.map((value) => ({ id: value[0], name: value[1] }))))[0]);

            setJobs(db.exec(`
                SELECT * FROM Job
            `).map(({ values }) => (values.map((value) => ({ id: value[0], name: value[1] }))))[0]);

            setRecipeTypes(db.exec(`
                SELECT * FROM RecipeType
            `).map(({ values }) => (values.map((value) => ({ id: value[0], name: value[1] }))))[0]);

            setRecipeItemTypes(db.exec(`
                SELECT * FROM RecipeItemType
            `).map(({ values }) => (values.map((value) => ({ id: value[0], name: value[1] }))))[0]);
        }
    }, [db]);

    useEffect(() => {
        if (db) {
            const item = searchParams.get("item");
            const itemType = searchParams.get("itemType");
            const job = searchParams.get("job");
            const recipeType = searchParams.get("recipeType");
            const recipeItemType = searchParams.get("recipeItemType")?.split(",") ?? [];

            let recipeFilter = ``;
            recipeFilter += job ? `
                AND (Recipe.JobId IN (${job}) OR Recipe.JobId IS NULL)
            ` : ``;
            recipeFilter += recipeType ? `
                AND Recipe.RecipeTypeId IN (${recipeType})
            ` : ``;

            let filter = ``;
            filter += item ? `
                AND Item.Name LIKE '%${item}%'
            ` : ``;
            filter += itemType ? `
                AND Item.ItemTypeId IN (${itemType})
            ` : ``;

            let ingredientColumns = recipeItemType.includes("1") ? `
                IngredientItem.IngredientCount AS IngredientCount,
                IngredientItem.IngredientSum AS IngredientSum,
                RepeatableIngredientItem.RepeatableIngredientCount AS RepeatableIngredientCount,
                RepeatableIngredientItem.RepeatableIngredientSum AS RepeatableIngredientSum,
            ` : `
                NULL AS IngredientCount,
                NULL AS IngredientSum,
                NULL AS RepeatableIngredientCount,
                NULL AS RepeatableIngredientSum,
            `;
            let ingredientFilter = recipeItemType.includes("1") ? `
                LEFT JOIN (
                    SELECT ItemId, 
                    COUNT(RecipeItem.Quantity) AS "IngredientCount", 
                    SUM(RecipeItem.Quantity) AS "IngredientSum" 
                    FROM RecipeItem
                    JOIN Recipe ON RecipeItem.RecipeId = Recipe.Id
                    WHERE RecipeItem.RecipeItemTypeId = 1
                    AND Recipe.Repeatable = 0
                    ${recipeFilter}
                    GROUP BY ItemId
                ) AS IngredientItem ON Item.Id = IngredientItem.ItemId

                LEFT JOIN (
                    SELECT ItemId, 
                    COUNT(RecipeItem.Quantity) AS "RepeatableIngredientCount", 
                    SUM(RecipeItem.Quantity) AS "RepeatableIngredientSum" 
                    FROM RecipeItem
                    JOIN Recipe ON RecipeItem.RecipeId = Recipe.Id
                    WHERE RecipeItem.RecipeItemTypeId = 1
                    AND Recipe.Repeatable = 1
                    ${recipeFilter}
                    GROUP BY ItemId
                ) AS RepeatableIngredientItem ON Item.Id = RepeatableIngredientItem.ItemId
            ` : ``;
            let productColumns = recipeItemType.includes("2") ? `
                ProductItem.ProductCount AS ProductCount,
                ProductItem.ProductSum AS ProductSum,
                RepeatableProductItem.RepeatableProductCount AS RepeatableProductCount,
                RepeatableProductItem.RepeatableProductSum AS RepeatableProductSum
            ` : `
                NULL AS ProductCount,
                NULL AS ProductSum,
                NULL AS RepeatableProductCount,
                NULL AS RepeatableProductSum
            `;
            let productFilter = recipeItemType.includes("2") ? `
                LEFT JOIN (
                    SELECT ItemId, 
                    COUNT(RecipeItem.Quantity) AS "ProductCount", 
                    SUM(RecipeItem.Quantity) AS "ProductSum" 
                    FROM RecipeItem
                    JOIN Recipe ON RecipeItem.RecipeId = Recipe.Id
                    WHERE RecipeItem.RecipeItemTypeId = 2
                    AND Recipe.Repeatable = 0
                    ${recipeFilter}
                    GROUP BY ItemId
                ) AS ProductItem ON Item.Id = ProductItem.ItemId

                LEFT JOIN (
                    SELECT ItemId, 
                    COUNT(RecipeItem.Quantity) AS "RepeatableProductCount", 
                    SUM(RecipeItem.Quantity) AS "RepeatableProductSum" 
                    FROM RecipeItem
                    JOIN Recipe ON RecipeItem.RecipeId = Recipe.Id
                    WHERE RecipeItem.RecipeItemTypeId = 2
                    AND Recipe.Repeatable = 1
                    ${recipeFilter}
                    GROUP BY ItemId
                ) AS RepeatableProductItem ON Item.Id = RepeatableProductItem.ItemId
            ` : ``;

            const query = `
                SELECT
                Item.Id,
                Item.Name,
                ItemType.Name AS ItemType,
                Item.Buy,
                Item.Sell,
                Item.Weight,
                SUM(MobDrop.MobCount) AS MobCount,
                ${ingredientColumns}
                ${productColumns}
                FROM Item
                LEFT JOIN ItemType ON Item.ItemTypeId = ItemType.Id

                LEFT JOIN (
                    SELECT ItemId,
                    1 AS MobCount
                    FROM MobDrop
                    UNION ALL
                    SELECT ItemId,
                    1 AS MobCount
                    FROM MobMvpDrop
                ) AS MobDrop ON Item.Id = MobDrop.ItemId

                ${ingredientFilter}

                ${productFilter}

                WHERE (
                    MobCount IS NOT NULL
                    OR IngredientCount IS NOT NULL
                    OR RepeatableIngredientCount IS NOT NULL
                    OR ProductCount IS NOT NULL
                    OR RepeatableProductCount IS NOT NULL
                    -- OR Buy > 0
                )
                ${filter}
                GROUP BY Item.Id
                LIMIT 100;
            `;

            //console.log(query);

            setData(db.exec(query));
        }
    }, [db, searchParams]);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Search 
                    <input name="item" type="text" />
                </label>

                <fieldset>
                    <legend>Item type</legend>
                    {itemTypes.map(({ id, name }, i) => (
                        <label key={i}><input defaultChecked name="itemType" type="checkbox" value={id} />{name}</label>
                    ))}
                </fieldset>

                <fieldset>
                    <legend>Component type</legend>
                    {recipeItemTypes.map(({ id, name }, i) => (
                        <label key={i}><input defaultChecked name="recipeItemType" type="checkbox" value={id} />{name}</label>
                    ))}
                </fieldset>

                <fieldset>
                    <legend>Jobs</legend>
                    {jobs.map(({ id, name }, i) => (
                        <label key={i}><input defaultChecked name="job" type="checkbox" value={id} />{name}</label>
                    ))}
                </fieldset>

                <fieldset>
                    <legend>Recipe type</legend>
                    {recipeTypes.map(({ id, name }, i) => (
                        <label key={i}><input defaultChecked name="recipeType" type="checkbox" value={id} />{name}</label>
                    ))}
                </fieldset>
                <button type="submit">Search</button>
                <button type="reset">Reset</button>
            </form>

            {data.map(({ columns, values }, i) => (
                <ItemTable key={i} columns={columns} values={values} />
            ))}
        </div>
    );
};
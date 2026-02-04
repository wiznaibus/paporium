import React, { useState, useEffect } from "react";
import initSqlJs from "sql.js";
import type { Database, QueryExecResult } from "sql.js";
import { useSearchParams } from 'react-router-dom';
import { ItemTable } from "./components/ItemTable";
import { mergeSearchFilter, parseSearchParams, type FilterItem, type SearchFilter } from "./utilities/SearchFilter";

export const Items = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [db, setDb] = useState<Database | null>(null);
    const [data, setData] = useState<QueryExecResult[]>([]);
    const [filter, setFilter] = useState<SearchFilter>({
        item: "",
        itemTypes: new Map<number, FilterItem>(),
        jobs: new Map<number, FilterItem>(),
        recipeItemTypes: new Map<number, FilterItem>(),
        recipeTypes: new Map<number, FilterItem>(),
    });

    // load the database
    useEffect(() => {
        // load the database
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

    // load the filter data from the database and update based on searchParams
    useEffect(() => {
        if (db) {
            // load filter data from database
            const itemTypes = db.exec(`
                SELECT * FROM ItemType
            `).map(({ values }) => (values.map((value) => ({ id: value[0], name: value[1]?.toString() ?? "", checked: false }))))[0];

            const jobs = db.exec(`
                SELECT * FROM Job
            `).map(({ values }) => (values.map((value) => ({ id: value[0], name: value[1]?.toString() ?? "", checked: false }))))[0];
            
            const recipeTypes = db.exec(`
                SELECT * FROM RecipeType
            `).map(({ values }) => (values.map((value) => ({ id: value[0], name: value[1]?.toString() ?? "", checked: false }))))[0];
            
            const recipeItemTypes = db.exec(`
                SELECT * FROM RecipeItemType
            `).map(({ values }) => (values.map((value) => ({ id: value[0], name: value[1]?.toString() ?? "", checked: false }))))[0];

            const databaseFilterItems = {
                item: "",
                itemTypes: new Map<number, FilterItem>(itemTypes.map((value) => [Number(value.id) ?? 0, value])),
                jobs: new Map<number, FilterItem>(jobs.map((value) => [Number(value.id) ?? 0, value])),
                recipeItemTypes: new Map<number, FilterItem>(recipeItemTypes.map((value) => [Number(value.id) ?? 0, value])),
                recipeTypes: new Map<number, FilterItem>(recipeTypes.map((value) => [Number(value.id) ?? 0, value])),
            };

            // load filter data from searchParams
            const parsedSearchParams = parseSearchParams(searchParams);
            const searchParamsFilterItems = {
                item: parsedSearchParams.item,
                itemTypes: new Map<number, FilterItem>(parsedSearchParams.itemTypes.map(
                    (value) => [Number(value.id) ?? 0, { checked: value.checked }])
                ),
                jobs: new Map<number, FilterItem>(parsedSearchParams.jobs.map(
                    (value) => [Number(value.id) ?? 0, { checked: value.checked }])
                ),
                recipeItemTypes: new Map<number, FilterItem>(parsedSearchParams.recipeItemTypes.map(
                    (value) => [Number(value.id) ?? 0, { checked: value.checked }])
                ),
                recipeTypes: new Map<number, FilterItem>(parsedSearchParams.recipeTypes.map(
                    (value) => [Number(value.id) ?? 0, { checked: value.checked }])
                ),
            };
            
            // merge the searchParams into the database filter data
            setFilter({
                ...mergeSearchFilter(databaseFilterItems, searchParamsFilterItems)
            });
        }
    }, [db]);


    // load items with the applied filter
    useEffect(() => {
        if (db) {
            const item = searchParams.get("item") || null;
            const itemType = searchParams.get("itemType") || null;
            const job = searchParams.get("job") || null;
            const recipeType = searchParams.get("recipeType") || null;
            const recipeItemType = searchParams.get("recipeItemType") || null;

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

            let ingredientColumns = recipeItemType === null || recipeItemType.includes("1") ? `
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
            let ingredientFilter = recipeItemType === null || recipeItemType.includes("1") ? `
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
            let productColumns = recipeItemType === null || recipeItemType.includes("2") ? `
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
            let productFilter = recipeItemType === null || recipeItemType.includes("2") ? `
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
                -- LIMIT 100;
            `;

            setData(db.exec(query));
        }
    }, [db, searchParams]);

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

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Search 
                    <input name="item" type="text" />
                </label>

                <fieldset>
                    <legend>Item type</legend>
                    {Array.from(filter.itemTypes.entries()).map(([ key, value ], i) => (
                        <label key={i}>
                            <input defaultChecked={value.checked ?? false} name="itemType" type="checkbox" value={key.toString()} />
                            {value.name}
                        </label>
                    ))}
                </fieldset>

                <fieldset>
                    <legend>Component type</legend>
                    {Array.from(filter.recipeItemTypes.entries()).map(([ key, value ], i) => (
                        <label key={i}>
                            <input defaultChecked={value.checked ?? false} name="recipeItemType" type="checkbox" value={key.toString()} />
                            {value.name}
                        </label>
                    ))}
                </fieldset>

                <fieldset>
                    <legend>Jobs</legend>
                    {Array.from(filter.jobs.entries()).map(([ key, value ], i) => (
                        <label key={i}>
                            <input defaultChecked={value.checked ?? false} name="job" type="checkbox" value={key.toString()} />
                            {value.name}
                        </label>
                    ))}
                </fieldset>

                <fieldset>
                    <legend>Recipe type</legend>
                    {Array.from(filter.recipeTypes.entries()).map(([ key, value ], i) => (
                        <label key={i}>
                            <input defaultChecked={value.checked ?? false} name="recipeType" type="checkbox" value={key.toString()} />
                            {value.name}
                        </label>
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
import React, { useState, useEffect } from "react";
import initSqlJs, { type Database, type QueryExecResult } from "sql.js";
import { useSearchParams } from 'react-router-dom';
import { mergeSearchFilter, formatSearchParams, parseSearchParams, type SearchFilter } from "./utilities/SearchFilter";
import { ItemTable } from "./components/ItemTable";

export const Items = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [db, setDb] = useState<Database | null>(null);
    const [data, setData] = useState<QueryExecResult[]>([]);
    const [itemInputValue, setItemInputValue] = useState<string>("");
    const [filter, setFilter] = useState<SearchFilter>({
        item: "",
        itemTypes: [],
        jobs: [],
        recipeItemTypes: [],
        recipeTypes: [],
    });
    const [filterDataLoaded, setFilterDataLoaded] = useState<boolean>(false);

    // load the database
    useEffect(() => {
        // load the database
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

    // load the filter data from the database and update based on searchParams
    useEffect(() => {
        if (db) {
            // load filter data from database
            const itemTypes = db.exec(`
                SELECT * FROM ItemType
            `).map(({ values }) => (values.map((value) => ({ id: Number(value[0]) ?? 0, name: value[1]?.toString() ?? "", checked: false }))))[0];

            const jobs = db.exec(`
                SELECT * FROM Job
            `).map(({ values }) => (values.map((value) => ({ id: Number(value[0]) ?? 0, name: value[1]?.toString() ?? "", checked: false }))))[0];

            const recipeTypes = db.exec(`
                SELECT * FROM RecipeType
            `).map(({ values }) => (values.map((value) => ({ id: Number(value[0]) ?? 0, name: value[1]?.toString() ?? "", checked: false }))))[0];

            const recipeItemTypes = db.exec(`
                SELECT * FROM RecipeItemType
            `).map(({ values }) => (values.map((value) => ({ id: Number(value[0]) ?? 0, name: value[1]?.toString() ?? "", checked: false }))))[0];

            const databaseFilterItems: SearchFilter = {
                item: "",
                itemTypes,
                jobs,
                recipeItemTypes,
                recipeTypes,
            };

            // load filter data from searchParams
            const parsedSearchParams = parseSearchParams(searchParams);

            setItemInputValue(parsedSearchParams.item ?? "");
            const searchParamsFilterItems: SearchFilter = {
                item: parsedSearchParams.item,
                itemTypes: parsedSearchParams.itemTypes?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                jobs: parsedSearchParams.jobs?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                recipeItemTypes: parsedSearchParams.recipeItemTypes?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                recipeTypes: parsedSearchParams.recipeTypes?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
            };

            // merge the searchParams into the database filter data
            setFilter({
                ...mergeSearchFilter(databaseFilterItems, searchParamsFilterItems)
            });

            setFilterDataLoaded(true);
        }
    }, [db]);


    // load items with the applied filter
    useEffect(() => {
        if (db) {
            const item = searchParams.get("item") || null;
            const itemTypes = searchParams.get("itemTypes") || null;
            const jobs = searchParams.get("jobs") || null;
            const recipeTypes = searchParams.get("recipeTypes") || null;
            const recipeItemTypes = searchParams.get("recipeItemTypes") || null;

            let recipeFilter = ``;
            recipeFilter += jobs ? `
                AND (Recipe.JobId IN (${jobs}))
            ` : ``;
            recipeFilter += recipeTypes ? `
                AND Recipe.RecipeTypeId IN (${recipeTypes})
            ` : ``;

            // filter by items that are dropped by monsters
            // we can't check if it can be purchased at a store yet
            // if it can't be purchased at a store or dropped by a monster, it's unobtainable
            //let innerFilter = `MobCount IS NOT NULL`;
            
            let innerFilter = `TRUE`;
            
            if (jobs || recipeTypes || recipeItemTypes) {
                innerFilter = `
                    IngredientCount IS NOT NULL
                    OR RepeatableIngredientCount IS NOT NULL
                    OR ProductCount IS NOT NULL
                    OR RepeatableProductCount IS NOT NULL
                `;
            }
            /* else { // (!jobs && !recipeTypes)
                innerFilter += recipeItemTypes?.includes("1") ? `
                    OR IngredientCount IS NOT NULL
                    OR RepeatableIngredientCount IS NOT NULL
                ` : ``;
                innerFilter += recipeItemTypes?.includes("2") ? `
                    OR ProductCount IS NOT NULL
                    OR RepeatableProductCount IS NOT NULL
                ` : ``;
            } */

            let filter = ``;
            filter += item ? `
                AND (Item.Name LIKE '%${item}%' OR Item.Id LIKE '%${item}%')
            ` : ``;
            filter += itemTypes ? `
                AND Item.ItemTypeId IN (${itemTypes})
            ` : ``;

            let ingredientColumns = recipeItemTypes === null || recipeItemTypes.includes("1") ? `
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
            let ingredientFilter = recipeItemTypes === null || recipeItemTypes.includes("1") ? `
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
            let productColumns = recipeItemTypes === null || recipeItemTypes.includes("2") ? `
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
            let productFilter = recipeItemTypes === null || recipeItemTypes.includes("2") ? `
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
                    ${innerFilter}
                )

                ${filter}

                GROUP BY Item.Id;
            `;

            setData(db.exec(query));
        }
    }, [db, searchParams]);

    // debounced item input value update
    React.useEffect(() => {
        const delayInputTimeoutId = setTimeout(() => {
            if (filterDataLoaded) {
                const newFilter = {
                    ...filter,
                    item: itemInputValue,
                };

                setFilter(newFilter);
                setSearchParams(formatSearchParams(newFilter));
            }
        }, 500);
        return () => clearTimeout(delayInputTimeoutId);
    }, [itemInputValue, filterDataLoaded, 500]);

    // reset the form values and reload data
    const handleReset = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setItemInputValue("");
        setFilter({
            item: "",
            itemTypes: filter.itemTypes?.map(value => ({ id: value.id, name: value.name, checked: false })),
            jobs: filter.jobs?.map(value => ({ id: value.id, name: value.name, checked: false })),
            recipeTypes: filter.recipeTypes?.map(value => ({ id: value.id, name: value.name, checked: false })),
            recipeItemTypes: filter.recipeItemTypes?.map(value => ({ id: value.id, name: value.name, checked: false }))
        });
        setSearchParams();
    };

    const handleSelectAll = () => {
        const newFilter = {
            item: filter.item,
            itemTypes: filter.itemTypes?.map(value => ({ id: value.id, name: value.name, checked: true })),
            jobs: filter.jobs?.map(value => ({ id: value.id, name: value.name, checked: true })),
            recipeTypes: filter.recipeTypes?.map(value => ({ id: value.id, name: value.name, checked: true })),
            recipeItemTypes: filter.recipeItemTypes?.map(value => ({ id: value.id, name: value.name, checked: true }))
        };
        setFilter(newFilter);
        setSearchParams(formatSearchParams(newFilter));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setItemInputValue(event.currentTarget.value);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const changedFilter: SearchFilter = {
            [event.currentTarget.name]: [{
                id: Number(event.currentTarget.value) ?? 0,
                checked: event.currentTarget.checked
            }]
        };
        const newFilter = mergeSearchFilter(filter, changedFilter);
        setFilter(newFilter);
        setSearchParams(formatSearchParams(newFilter));
    };

    return (
        <div>
            <form id="filterForm" onReset={handleReset} onSubmit={(event) => event.preventDefault()}>
                <label>Search
                    <input name="item" onBlur={handleInputChange} onChange={handleInputChange} type="text" value={itemInputValue} />
                </label>

                <fieldset>
                    <legend>Item type</legend>
                    {filter.itemTypes?.map((value, i) => (
                        <label key={i}>
                            <input
                                checked={value?.checked}
                                name="itemTypes"
                                onChange={handleCheckboxChange}
                                type="checkbox"
                                value={value?.id}
                            />
                            {value.name}
                        </label>
                    ))}
                </fieldset>

                <fieldset>
                    <legend>Recipe type</legend>
                    {filter.recipeTypes?.map((value, i) => (
                        <label key={i}>
                            <input
                                checked={value?.checked}
                                name="recipeTypes"
                                onChange={handleCheckboxChange}
                                type="checkbox"
                                value={value?.id}
                            />
                            {value.name}
                        </label>
                    ))}
                </fieldset>

                <fieldset>
                    <legend>Jobs</legend>
                    {filter.jobs?.map((value, i) => (
                        <label key={i}>
                            <input
                                checked={value?.checked}
                                name="jobs"
                                onChange={handleCheckboxChange}
                                type="checkbox"
                                value={value?.id}
                            />
                            {value.name}
                        </label>
                    ))}
                </fieldset>

                <fieldset>
                    <legend>Component type</legend>
                    {filter.recipeItemTypes?.map((value, i) => (
                        <label key={i}>
                            <input
                                checked={value?.checked}
                                name="recipeItemTypes"
                                onChange={handleCheckboxChange}
                                type="checkbox"
                                value={value?.id}
                            />
                            {value.name}
                        </label>
                    ))}
                </fieldset>

                <button type="button" onClick={handleSelectAll}>Select All</button>
                <button type="reset">Select None</button>
            </form>

            
            {data.map(({ columns, values }, i) => (
                <ItemTable key={i} columns={columns} filter={filter} values={values} />
            ))}
        </div>
    );
};
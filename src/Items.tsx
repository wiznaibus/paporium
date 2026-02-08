import { useState, useEffect } from "react";
import initSqlJs, { type Database, type QueryExecResult } from "sql.js";
import { useSearchParams } from 'react-router-dom';
import { formatSearchParams, mergeSearchFilter, parseSearchParams, type SearchFilter } from "./utilities/SearchFilter";
import { ItemTable } from "./components/ItemTable";
import './index.css';
import { ItemFilter } from "./components/ItemFilter";
import { ItemDetails } from "./components/ItemDetails";

export const Items = () => {
    const [searchParams] = useSearchParams();
    const [db, setDb] = useState<Database | null>(null);
    const [data, setData] = useState<QueryExecResult[]>([]);
    const [filter, setFilter] = useState<SearchFilter>({
        item: "",
        itemTypes: [],
        jobs: [],
        recipeItemTypes: [],
        recipeTypes: [],
    });
    const [selectedItem, setSelectedItem] = useState<number>(0);
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
            const {
                item,
                itemTypes,
                jobs,
                recipeItemTypes,
                recipeTypes,
            } = formatSearchParams(filter);

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

            if (jobs || recipeTypes) {
                innerFilter = `
                    IngredientCount IS NOT NULL
                    OR RepeatableIngredientCount IS NOT NULL
                    OR ProductCount IS NOT NULL
                    OR RepeatableProductCount IS NOT NULL
                `;
            }

            if (recipeItemTypes) {
                const ingredientFilter = recipeItemTypes.includes("1") ? `
                    (IngredientCount IS NOT NULL
                    OR RepeatableIngredientCount IS NOT NULL)
                ` : null;

                const productFilter = recipeItemTypes.includes("2") ? `
                    (ProductCount IS NOT NULL
                    OR RepeatableProductCount IS NOT NULL)
                ` : null;

                innerFilter = [ingredientFilter, productFilter].filter(Boolean).join(" AND ");
            }

            let outerFilter = ``;
            outerFilter += item ? `
                AND (Item.Name LIKE '%${item}%' OR Item.Id LIKE '%${item}%')
            ` : ``;
            outerFilter += itemTypes ? `
                AND Item.ItemTypeId IN (${itemTypes})
            ` : ``;

            const query = `
                SELECT
                Item.Id,
                Item.Name,
                Item.ItemTypeId AS ItemTypeId,
                ItemType.Name AS ItemType,
                Item.Buy,
                Item.Sell,
                Item.Weight,
                SUM(MobDrop.MobCount) AS MobCount,
                IngredientItem.IngredientCount AS IngredientCount,
                IngredientItem.IngredientSum AS IngredientSum,
                RepeatableIngredientItem.RepeatableIngredientCount AS RepeatableIngredientCount,
                RepeatableIngredientItem.RepeatableIngredientSum AS RepeatableIngredientSum,
                ProductItem.ProductCount AS ProductCount,
                ProductItem.ProductSum AS ProductSum,
                RepeatableProductItem.RepeatableProductCount AS RepeatableProductCount,
                RepeatableProductItem.RepeatableProductSum AS RepeatableProductSum,
                CASE
					WHEN (
                        ItemTypeId = 6
                        AND Sell > 0
                        AND MobCount > 0
                        AND (IngredientCount IS NULL OR IngredientCount = 0)
                        AND (RepeatableIngredientCount IS NULL OR RepeatableIngredientCount = 0)
                    )
                    THEN TRUE
					ELSE FALSE
				END AS Overchargeable
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

                WHERE (
                    ${innerFilter}
                )

                ${outerFilter}

                GROUP BY Item.Id;
            `;

            setData(db.exec(query));
        }
    }, [db, filter]);

    return (
        <div className="flex xl:grid xl:grid-cols-3">
            <div className="xl:col-span-2">
                <ItemFilter filter={filter} filterDataLoaded={filterDataLoaded} setFilter={(newFilter: SearchFilter) => setFilter(newFilter)} />
                {data.map(({ values }, i) => (
                    <ItemTable key={i} filter={filter} selectedItem={selectedItem} setSelectedItem={setSelectedItem} values={values} />
                ))}
            </div>
            <div className="hidden xl:block">
                {selectedItem > 0 && (
                    <ItemDetails id={selectedItem} filter={filter} setSelectedItem={setSelectedItem} />
                )}
            </div>
        </div>
    );
};
import { useState, useEffect } from "react";
import initSqlJs, { type Database } from "sql.js";
import { Link, useSearchParams } from 'react-router-dom';
import './index.css';
import { formatSearchParams, mergeSearchFilter, parseSearchParams, type SearchFilter } from "./utilities/SearchFilter";
import { Icon } from "./components/Icon";
import { ItemDetails } from "./components/ItemDetails";
import { ItemFilter } from "./components/ItemFilter";
import { ItemTable } from "./components/ItemTable";

export interface Item {
    id: number;
    name?: string;
    itemTypeId?: number;
    itemType?: string;
    buy?: number;
    sell?: number;
    weight?: number;
    mobDropCount?: number;
    mobMvpDropCount?: number;
    ingredientCount?: number;
    ingredientSum?: number;
    repeatableIngredientCount?: number;
    repeatableIngredientSum?: number;
    productCount?: number;
    productSum?: number;
    repeatableProductCount?: number;
    repeatableProductSum?: number;
    overcharge?: boolean;
}

export const Items = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [db, setDb] = useState<Database | null>(null);
    const [data, setData] = useState<Item[]>([]);
    const [filteredData, setFilteredData] = useState<Item[]>([]);
    const [filter, setFilter] = useState<SearchFilter>({
        item: "",
        itemTypes: [],
        jobs: [],
        recipeItemTypes: [],
        recipeTypes: [],
    });
    const [selectedItem, setSelectedItem] = useState<number>(0);
    const [filterDataLoaded, setFilterDataLoaded] = useState<boolean>(false);

    const handleSetSelectedItem = (item: number) => {
        setSelectedItem(item === selectedItem ? 0 : item);
    }

    const handleSetFilter = (filter: SearchFilter, reset = false) => {
        setFilter(filter);
        setSearchParams(reset ? undefined : formatSearchParams(filter));
    }

    const getQuery = (
        recipeFilter = ``,
        innerFilter = `TRUE`,
        outerFilter = ``,
    ): string => (`
        SELECT
        Item.Id,
        Item.Name,
        Item.ItemTypeId AS ItemTypeId,
        ItemType.Name AS ItemType,
        Item.Buy,
        Item.Sell,
        Item.Weight,
        MobDropCount.MobCount AS MobCount,
        MobMvpDropCount.MobMvpCount AS MobMvpCount,
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
                AND (MobCount > 0 OR MobMvpCount > 0)
                AND (IngredientCount IS NULL OR IngredientCount = 0)
                AND (RepeatableIngredientCount IS NULL OR RepeatableIngredientCount = 0)
            )
            THEN TRUE
            ELSE FALSE
        END AS Overcharge

        FROM Item

        LEFT JOIN ItemType ON Item.ItemTypeId = ItemType.Id

        LEFT JOIN (
            SELECT ItemId,
            COUNT(MobId) AS "MobCount"
            FROM MobDrop
            GROUP BY ItemId
        ) AS MobDropCount ON Item.Id = MobDropCount.ItemId

        LEFT JOIN (
            SELECT ItemId,
            COUNT(MobId) AS "MobMvpCount"
            FROM MobMvpDrop
            GROUP BY ItemId
        ) AS MobMvpDropCount ON Item.Id = MobMvpDropCount.ItemId

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
    `);

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

    // load filter data from the database
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
                overcharge: parsedSearchParams.overcharge,
            };

            // merge the searchParams into the database filter data
            setFilter({
                ...mergeSearchFilter(databaseFilterItems, searchParamsFilterItems)
            });

            setFilterDataLoaded(true);
        }
    }, [db]);

    // load unfiltered data from the database
    useEffect(() => {
        if (db) {
            // load unfiltered data from the database
            const query = getQuery();

            const data = db.exec(query).map(({ values }) => (
                values.map((value) => ({
                    id: Number(value[0]),
                    name: value[1]?.toString(),
                    itemTypeId: Number(value[2]),
                    itemType: value[3]?.toString(),
                    buy: Number(value[4]),
                    sell: Number(value[5]),
                    weight: Number(value[6]),
                    mobDropCount: Number(value[7]),
                    mobMvpDropCount: Number(value[8]),
                    ingredientCount: Number(value[9]),
                    ingredientSum: Number(value[10]),
                    repeatableIngredientCount: Number(value[11]),
                    repeatableIngredientSum: Number(value[12]),
                    productCount: Number(value[13]),
                    productSum: Number(value[14]),
                    repeatableProductCount: Number(value[15]),
                    repeatableProductSum: Number(value[16]),
                    overcharge: Boolean(value[17]),
                }))
            ))[0];

            setData(data);
        }
    }, [db]);

    // update the filter with searchParams
    useEffect(() => {
        if (db && filterDataLoaded) {
            // load filter data from searchParams
            const parsedSearchParams = parseSearchParams(searchParams);

            const searchParamsFilterItems: SearchFilter = {
                item: parsedSearchParams.item,
                itemTypes: parsedSearchParams.itemTypes?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                jobs: parsedSearchParams.jobs?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                recipeItemTypes: parsedSearchParams.recipeItemTypes?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                recipeTypes: parsedSearchParams.recipeTypes?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                overcharge: parsedSearchParams.overcharge,
            };

            // merge the searchParams into the current filter
            setFilter({
                ...mergeSearchFilter(filter, searchParamsFilterItems)
            });
        }
    }, [db, searchParams]);

    // load items with the applied filter
    useEffect(() => {
        if (db) {
            const {
                item,
                itemTypes,
                jobs,
                recipeItemTypes,
                recipeTypes,
                overcharge,
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

            const query = getQuery(recipeFilter, innerFilter, outerFilter);

            const filteredData = db.exec(query).map(({ values }) => (
                values.map((value) => ({
                    id: Number(value[0]),
                    name: value[1]?.toString(),
                    itemTypeId: Number(value[2]),
                    itemType: value[3]?.toString(),
                    buy: Number(value[4]),
                    sell: Number(value[5]),
                    weight: Number(value[6]),
                    mobDropCount: Number(value[7]),
                    mobMvpDropCount: Number(value[8]),
                    ingredientCount: Number(value[9]),
                    ingredientSum: Number(value[10]),
                    repeatableIngredientCount: Number(value[11]),
                    repeatableIngredientSum: Number(value[12]),
                    productCount: Number(value[13]),
                    productSum: Number(value[14]),
                    repeatableProductCount: Number(value[15]),
                    repeatableProductSum: Number(value[16]),
                    // use the overcharge value from the unfiltered item
                    overcharge: data.find(datum => datum.id === Number(value[0]))?.overcharge ?? false,
                })).filter(item => (overcharge ? (overcharge === "true" ? item.overcharge : !item.overcharge): true)
                )
            ))[0];

            setFilteredData(filteredData);
        }
    }, [db, data, filter]);

    return (
        <div className="flex xl:grid xl:grid-cols-3 gap-4 mx-2 results">
            <div className="xl:col-span-2 my-2.5">
                <h1 className="flex items-center gap-1 text-lg font-bold">The Paporium <Icon className="text-sakura-500" name="arrow-right" /> Items</h1>
                <div className="text-stone-900 bg-yellow-400 border border-yellow-300 rounded-lg my-3 p-2">
                    <Icon className="inline-block -mt-1 mr-1" name="warning" />
                    This database is under active development and may contain missing or inaccurate data or buggy functionality. Please report issues to @wiznaibus on Discord or visit <Link className="underline hover:text-gray-700" target="_blank" to="https://github.com/wiznaibus/paporium">https://github.com/wiznaibus/paporium</Link>. Thanks for stopping by!
                </div>
                {filterDataLoaded && <ItemFilter filter={filter} filterDataLoaded={filterDataLoaded} setFilter={handleSetFilter} />}
                {(filterDataLoaded && filteredData) && <ItemTable filter={filter} items={filteredData} selectedItem={selectedItem} setSelectedItem={handleSetSelectedItem} />}
                <p className="text-center mb-1">for Ruby <span className="text-pink-400">❤</span> love Nata</p>
            </div>
            <div className={`
                panel fixed top-0 right-0 z-20 overflow-auto overscroll-contain shadow-md shadow-black
                xl:relative xl:overflow-clip xl:overscroll-auto xl:bg-transparent xl:border-l-0 xl:shadow-none
            `}>
                {selectedItem > 0 && (
                    <ItemDetails id={selectedItem} filter={filter} setSelectedItem={handleSetSelectedItem} />
                )}
            </div>
        </div>
    );
};
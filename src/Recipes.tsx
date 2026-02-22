import { useState, useEffect } from "react";
import initSqlJs, { type Database } from "sql.js";
import { Link, useSearchParams } from 'react-router-dom';
import './index.css';
import { formatSearchParams, mergeSearchFilter, parseSearchParams, type SearchFilter } from "./utilities/SearchFilter";
import { defaultFilter } from "./Items";
import { Breadcrumb } from "./components/Breadcrumb";
import { Filter } from "./components/Filter";
import { Icon } from "./components/Icon";
import { ItemDetails, type Recipe, type RecipeItem } from "./components/Item/ItemDetails";
import { Navbar } from "./components/Navbar";
import { RecipeTable } from "./components/Recipe/RecipeTable";

export const Recipes = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [db, setDb] = useState<Database | null>(null);
    const [filteredData, setFilteredData] = useState<Recipe[]>([]);
    const [filterItems, setFilterItems] = useState<SearchFilter>(defaultFilter);
    const [filter, setFilter] = useState<SearchFilter>(defaultFilter);
    const [filterItemIds, setFilterItemIds] = useState<number[]>([]);
    const [selectedItem, setSelectedItem] = useState<number>(0);
    const [filterDataLoaded, setFilterDataLoaded] = useState<boolean>(false);

    const handleSetSelectedItem = (item: number) => {
        setSelectedItem(item === selectedItem ? 0 : item);
    }

    const handleSetFilter = (filter: SearchFilter, reset = false) => {
        setFilter(filter);
        setSearchParams(reset ? undefined : formatSearchParams(filter));
    }

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
                repeatable: [{ id: 0, name: "One-time", checked: false }, { id: 1, name: "Repeatable", checked: false }],
            };

            // load filter data from searchParams
            const parsedSearchParams = parseSearchParams(searchParams);

            const searchParamsFilterItems: SearchFilter = {
                item: parsedSearchParams.item,
                itemTypes: parsedSearchParams.itemTypes?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                jobs: parsedSearchParams.jobs?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                overcharge: parsedSearchParams.overcharge,
                pricing: parsedSearchParams.pricing,
                recipeItemTypes: parsedSearchParams.recipeItemTypes?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                recipeTypes: parsedSearchParams.recipeTypes?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                repeatable: parsedSearchParams.repeatable,
            };

            // set the filter items
            setFilterItems(databaseFilterItems);

            // merge the searchParams into the database filter data
            setFilter({
                ...mergeSearchFilter(databaseFilterItems, searchParamsFilterItems)
            });

            setFilterDataLoaded(true);
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
                overcharge: parsedSearchParams.overcharge,
                pricing: parsedSearchParams.pricing,
                recipeItemTypes: parsedSearchParams.recipeItemTypes?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                recipeTypes: parsedSearchParams.recipeTypes?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
                repeatable: parsedSearchParams.repeatable?.map((value) => ({ id: Number(value.id) ?? 0, checked: value.checked })),
            };

            // merge the searchParams into the current filter
            setFilter({
                ...mergeSearchFilter(filterItems, searchParamsFilterItems)
            });
        }
    }, [db, searchParams]);

    // load recipes with the applied filter
    useEffect(() => {
        if (db) {
            const {
                item,
                itemTypes,
                jobs,
                recipe,
                recipeItemTypes,
                recipeTypes,
                repeatable,
            } = formatSearchParams(filter);

            let recipeFilter = ``;

            // change single ' to double '' for searching in the database; remove all new lines
            const sanitizedItem = item?.replaceAll("'", "''").replaceAll(/\r?\n|\r/g, "");

            // if a list of comma-separated ids is provided, search for all ids
            const idList = sanitizedItem?.includes(",") ? sanitizedItem?.replaceAll(/[^0-9,]/g, "").split(",").filter(Boolean) : null;
            recipeFilter += sanitizedItem ?
            (
                idList ? `
                    AND Item.Id IN (${idList?.join(",")})` : `AND (Item.Name LIKE '%${sanitizedItem}%' OR Item.Id LIKE '%${sanitizedItem}%')
                `
            ) : ``;

            const sanitizedRecipe = recipe?.replaceAll("'", "''").replaceAll(/\r?\n|\r/g, "");
            recipeFilter += sanitizedRecipe ? `
                AND Recipe.Name LIKE '%${sanitizedRecipe}%'
            ` : ``;

            recipeFilter += itemTypes ? `
                AND Item.ItemTypeId IN (${itemTypes})
            ` : ``;

            recipeFilter += recipeItemTypes ? `
                AND (RecipeItem.RecipeItemTypeId IN (${recipeItemTypes}))
            ` : ``;

            recipeFilter += jobs ? `
                AND (Recipe.JobId IN (${jobs}))
            ` : ``;

            recipeFilter += recipeTypes ? `
                AND Recipe.RecipeTypeId IN (${recipeTypes})
            ` : ``;

            recipeFilter += repeatable ? `
                AND Recipe.Repeatable IN (${repeatable})
            ` : ``;

            setFilterItemIds((sanitizedItem || itemTypes) ? db.exec(`
                SELECT
                Item.Id
                FROM Item
                WHERE (
                    TRUE
                )
                ${sanitizedItem ? (
                    idList ? `
                        AND Item.Id IN (${idList?.join(",")})` : `AND (Item.Name LIKE '%${sanitizedItem}%' OR Item.Id LIKE '%${sanitizedItem}%')
                `
                ) : ``}
                ${itemTypes ? `
                    AND Item.ItemTypeId IN (${itemTypes})
                ` : ``}
            `).map(({ values }) => (
                values.map((value): number => (Number(value[0])))
            ))[0] : []);

            const recipeIds = db.exec(`
                SELECT
                DISTINCT RecipeId AS Id
                FROM RecipeItem
                JOIN Item ON RecipeItem.ItemId = Item.Id
                JOIN Recipe ON RecipeItem.RecipeId = Recipe.Id
                WHERE (
                    TRUE
                )
                ${recipeFilter}
                ORDER BY RecipeTypeId, RecipeId
            `).map(({ values }) => (
                values.map((value): number => (Number(value[0])))
            ))[0];

            const recipeData: Recipe[] = [];

            recipeIds && recipeIds.forEach(recipeId => {
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

                    WHERE Recipe.Id = ${recipeId}
                    LIMIT 1;
                `).map(({ values }) => (
                    values.map((value): Recipe => ({
                        id: recipeId,
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

                    WHERE RecipeItem.RecipeId = ${recipeId}
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

                    WHERE RecipeItem.RecipeId = ${recipeId}
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

                recipeData.push({
                    ...recipe,
                    ingredients,
                    products
                });
            });

            setFilteredData(recipeData);
        }
    }, [db, filter, searchParams]);

    return (
        <>
            <Navbar active="recipes" />
            <div className="relative mt-14 flex xl:grid xl:grid-cols-3 gap-4 mx-2 results">
                <div className="xl:col-span-2 mb-2.5">
                    <Breadcrumb page="recipes" />
                    <div className="text-stone-900 bg-yellow-400 border border-yellow-300 rounded-lg my-3 p-2">
                        <Icon className="inline-block -mt-1 mr-1" name="warning" />
                        This database is under active development and may contain missing or inaccurate data or buggy functionality. Please report issues to @wiznaibus on Discord or visit <Link className="underline hover:text-gray-700" target="_blank" to="https://github.com/wiznaibus/paporium">https://github.com/wiznaibus/paporium</Link>. Thanks for stopping by!
                    </div>
                    {filterDataLoaded && <Filter filter={filter} filterDataLoaded={filterDataLoaded} setFilter={handleSetFilter} type="recipe" />}
                    {(filterDataLoaded && filteredData) && <RecipeTable filter={filter} recipes={filteredData} filteredItemIds={filterItemIds} selectedItem={selectedItem} setSelectedItem={handleSetSelectedItem} />}
                    <p className="text-center mb-1">for Ruby <span className="text-pink-400">❤</span> love Nata</p>
                </div>
                <div className={`
                    panel fixed top-0 right-0 z-20 overflow-auto overscroll-contain shadow-md shadow-black
                    xl:relative xl:overflow-clip xl:overscroll-auto xl:bg-transparent xl:border-l-0 xl:shadow-none
                `}>
                    {selectedItem > 0 && (
                        <ItemDetails id={selectedItem} setSelectedItem={handleSetSelectedItem} />
                    )}
                </div>
            </div>
        </>
    );
};

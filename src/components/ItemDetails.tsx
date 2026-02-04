import React, { useState, useEffect } from "react";
import initSqlJs from "sql.js";
import type { Database, QueryExecResult } from "sql.js";
import { type SearchFilter } from "../utilities/SearchFilter";

export const ItemDetails = ({
    id,
    filter
}: {
    id: number,
    filter: SearchFilter
}) => {
    const [db, setDb] = useState<Database | null>(null);
    const [drops, setDrops] = useState<any[]>([]);
    const [mvpDrops, setMvpDrops] = useState<any[]>([]);
    const [recipeIngredients, setRecipeIngredients] = useState<any>();
    const [repeatableRecipeIngredients, setRepeatableRecipeIngredients] = useState<any>();
    const [recipeProducts, setRecipeProducts] = useState<any>();
    const [repeatableRecipeProducts, setRepeatableRecipeProducts] = useState<any>();

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

            setDrops(db.exec(`
                SELECT
                Mob.Name AS Mob,
                MobDrop.Rate,
                MobDrop.StealProtected
                FROM MobDrop
                JOIN Mob ON MobDrop.MobId = Mob.Id
                JOIN Item ON MobDrop.ItemId = Item.Id
                WHERE MobDrop.ItemId = ${id}
                ORDER BY MobDrop.Rate DESC
            `).map(({ values }) => (
                values.map((value) => ({
                    mob: value[0],
                    rate: value[1],
                    stealProtected: value[2],
                }))
            ))[0]);
            
            setMvpDrops(db.exec(`
                SELECT
                Mob.Name AS Mob,
                MobMvpDrop.Rate
                FROM MobMvpDrop
                JOIN Mob ON MobMvpDrop.MobId = Mob.Id
                JOIN Item ON MobMvpDrop.ItemId = Item.Id
                WHERE MobMvpDrop.ItemId = ${id}
                ORDER BY MobMvpDrop.Rate DESC
            `).map(({ values }) => (
                values.map((value) => ({
                    mob: value[0],
                    rate: value[1],
                }))
            ))[0]);

            const baseQuery = `
                SELECT
                Recipe.Name AS Recipe,
                RecipeType.Name AS RecipeType,
                RecipeItem.Quantity
                FROM RecipeItem
                JOIN Item ON RecipeItem.ItemId = Item.Id
                JOIN Recipe ON RecipeItem.RecipeId = Recipe.Id
                JOIN RecipeType ON Recipe.RecipeTypeId = RecipeType.Id
                WHERE Item.Id = ${id}
            `;

            const jobs = Array.from(filter.jobs.entries()).filter(([ key, value ]) => value.checked).map(([ key, value ]) => key).join(",");
            const recipeTypes = Array.from(filter.recipeTypes.entries()).filter(([ key, value ]) => value.checked).map(([ key, value ]) => key).join(",");

            let recipeFilter = ``;
            recipeFilter += jobs ? `
                AND (Recipe.JobId IN (${jobs}) OR Recipe.JobId IS NULL)
            ` : ``;
            recipeFilter += recipeTypes ? `
                AND Recipe.RecipeTypeId IN (${recipeTypes})
            ` : ``;

            if (filter.recipeItemTypes?.get(1)?.checked || (!filter.recipeItemTypes?.get(1)?.checked && !filter.recipeItemTypes?.get(2)?.checked)) {
                    setRecipeIngredients(db.exec(`
                    ${baseQuery}
                    ${recipeFilter}
                    AND RecipeItem.RecipeItemTypeId = 1
                    AND Recipe.Repeatable = 0
                    ORDER BY Recipe.RecipeTypeId, Recipe.Id
                `).map(({ values }) => (
                    values.map((value) => ({
                        recipe: value[0],
                        recipeType: value[1],
                        quantity: value[2],
                    }))
                ))[0]);

                setRepeatableRecipeIngredients(db.exec(`
                    ${baseQuery}
                    ${recipeFilter}
                    AND RecipeItem.RecipeItemTypeId = 1
                    AND Recipe.Repeatable = 1
                    ORDER BY Recipe.RecipeTypeId, Recipe.Id
                `).map(({ values }) => (
                    values.map((value) => ({
                        recipe: value[0],
                        recipeType: value[1],
                        quantity: value[2],
                    }))
                ))[0]);
            }

            if (filter.recipeItemTypes?.get(2)?.checked || (!filter.recipeItemTypes?.get(1)?.checked && !filter.recipeItemTypes?.get(2)?.checked)) {
                    setRecipeProducts(db.exec(`
                    ${baseQuery}
                    ${recipeFilter}
                    AND RecipeItem.RecipeItemTypeId = 2
                    AND Recipe.Repeatable = 0
                    ORDER BY Recipe.RecipeTypeId, Recipe.Id
                `).map(({ values }) => (
                    values.map((value) => ({
                        recipe: value[0],
                        recipeType: value[1],
                        quantity: value[2],
                    }))
                ))[0]);

                setRepeatableRecipeProducts(db.exec(`
                    ${baseQuery}
                    ${recipeFilter}
                    AND RecipeItem.RecipeItemTypeId = 2
                    AND Recipe.Repeatable = 1
                    ORDER BY Recipe.RecipeTypeId, Recipe.Id
                `).map(({ values }) => (
                    values.map((value) => ({
                        recipe: value[0],
                        recipeType: value[1],
                        quantity: value[2],
                    }))
                ))[0]);
            }
        }
    }, [db, filter]);

    return (
        <div>
            {drops && 
                <table>
                    <caption>Monster drops</caption>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Monster</th>
                            <th>Drop rate</th>
                            <th>Steal protected?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drops.map(({
                            mob, rate, stealProtected
                        }: any, i: any) => 
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{mob}</td>
                                <td>{(rate/100).toFixed(2)}%</td>
                                <td>{stealProtected === 1 ? 'Yes' : ''}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            }

            {mvpDrops && 
                <table>
                    <caption>MVP drops</caption>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Monster</th>
                            <th>Drop rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mvpDrops.map(({
                            mob, rate
                        }: any, i: any) => 
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{mob}</td>
                                <td>{(rate/100).toFixed(2)}%</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            }

            {recipeIngredients && 
                <table>
                    <caption>One-time ingredients</caption>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Recipe</th>
                            <th>Recipe type</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipeIngredients.map(({
                            recipe, recipeType, quantity
                        }: any, i: any) => 
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{recipe}</td>
                                <td>{recipeType}</td>
                                <td>{quantity}</td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={2}></td>
                            <td>Total: </td>
                            <td>{recipeIngredients.reduce((a: any, b: any) => (a + b.quantity), 0)}</td>
                        </tr>
                    </tbody>
                </table>
            }

            {repeatableRecipeIngredients && 
                <table>
                    <caption>Repeatable ingredients</caption>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Recipe</th>
                            <th>Recipe type</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {repeatableRecipeIngredients.map(({
                            recipe, recipeType, quantity
                        }: any, i: any) => 
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{recipe}</td>
                                <td>{recipeType}</td>
                                <td>{quantity}</td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={2}></td>
                            <td>Total: </td>
                            <td>{repeatableRecipeIngredients.reduce((a: any, b: any) => (a + b.quantity), 0)}</td>
                        </tr>
                    </tbody>
                </table>
            }

            {recipeProducts && 
                <table>
                    <caption>One-time products</caption>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Recipe</th>
                            <th>Recipe type</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipeProducts.map(({
                            recipe, recipeType, quantity
                        }: any, i: any) => 
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{recipe}</td>
                                <td>{recipeType}</td>
                                <td>{quantity}</td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={2}></td>
                            <td>Total: </td>
                            <td>{recipeProducts.reduce((a: any, b: any) => (a + b.quantity), 0)}</td>
                        </tr>
                    </tbody>
                </table>
            }

            {repeatableRecipeProducts && 
                <table>
                    <caption>Repeatable products</caption>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Recipe</th>
                            <th>Recipe type</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {repeatableRecipeProducts.map(({
                            recipe, recipeType, quantity
                        }: any, i: any) => 
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{recipe}</td>
                                <td>{recipeType}</td>
                                <td>{quantity}</td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={2}></td>
                            <td>Total: </td>
                            <td>{repeatableRecipeProducts.reduce((a: any, b: any) => (a + b.quantity), 0)}</td>
                        </tr>
                    </tbody>
                </table>
            }
        </div>
    );
};
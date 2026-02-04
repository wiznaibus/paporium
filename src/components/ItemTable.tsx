import { useState, type ReactNode } from "react";
import type { SqlValue } from "sql.js";
import { type SearchFilter } from "../utilities/SearchFilter";
import { ItemRow } from "./ItemRow";

export const ItemTable = ({ filter, columns, values }: { filter: SearchFilter, columns: string[], values: SqlValue[][] }): ReactNode => {    
    return (
        <table>
            <thead>
                <tr>
                    <td colSpan={4}>Item</td>

                    <td colSpan={5}>Details</td>
                </tr>
                <tr>
                    <td>Id</td>
                    <td colSpan={3}>Name</td>

                    <td>Drop</td>
                    <td colSpan={2}>Ingredient</td>
                    <td colSpan={2}>Product</td>
                </tr>
                <tr>
                    <td></td>
                    <td>Buy</td>
                    <td>Sell</td>
                    <td>Weight</td>

                    <td></td>
                    <td>One-time</td>
                    <td>Repeatable</td>
                    <td>One-time</td>
                    <td>Repeatable</td>
                </tr>
            </thead>

            <tbody>
                {
                    values.map((row, i) => (
                        <ItemRow
                            key={`row-${i}-${row[1]}`}
                            filter={filter}
                            id={row[0]}
                            name={row[1]}
                            itemType={row[2]}
                            buy={row[3]}
                            sell={row[4]}
                            weight={row[5]}
                            mobCount={row[6]}
                            ingredientSum={row[8]}
                            repeatableIngredientSum={row[10]}
                            productSum={row[12]}
                            repeatableProductSum={row[14]}
                        />
                    ))
                }
            </tbody>
        </table>
    );
};

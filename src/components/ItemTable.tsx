import { useEffect, useState, type ReactNode } from "react";
import type { SqlValue } from "sql.js";
import { type SearchFilter } from "../utilities/SearchFilter";
import { ItemRow } from "./ItemRow";

// clamp a number between a min and max value
const clamp = (value: number, min: number, max: number): number => (
    Math.max(Math.min(value, max), min)
);

export const ItemTable = ({
    filter,
    itemsPerPage: itemsPerPageProp = 100,
    values,
}: {
    filter: SearchFilter,
    itemsPerPage: number,
    values: SqlValue[][],
}): ReactNode => {
    const [itemsPerPage] = useState<number>(itemsPerPageProp);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        setCurrentPage(1);
        setTotalPages(Math.ceil(values.length / itemsPerPage));
    }, [values]);

    const changePage = (page: number) => {
        setCurrentPage(clamp(page, 1, totalPages));
    };

    return (
        <div>
            <p>{values.length} Results</p>
            <p>{`Showing ${clamp((currentPage - 1) * itemsPerPage + 1, 1, values.length)} to ${clamp(currentPage * itemsPerPage, 1, values.length)}`}</p>
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
                        values.map((row, i) => (i >= (currentPage - 1) * itemsPerPage && i < currentPage * itemsPerPage) && (
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
            <button type="button" onClick={() => changePage(1)}>First Page</button>
            <button type="button" onClick={() => changePage(currentPage - 1)}>Previous Page</button>
            <button type="button" onClick={() => changePage(currentPage + 1)}>Next Page</button>
            <button type="button" onClick={() => changePage(totalPages)}>Last Page</button>
        </div>
    );
};

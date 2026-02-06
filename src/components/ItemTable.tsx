import { useEffect, useState, type ReactNode } from "react";
import type { SqlValue } from "sql.js";
import { useSearchParams } from 'react-router-dom';
import { formatSearchParams, mergeSearchFilter, type SearchFilter } from "../utilities/SearchFilter";
import { ItemRow } from "./ItemRow";

// clamp a number between a min and max value
const clamp = (value: number, min: number, max: number): number => (
    Math.max(Math.min(value, max), min)
);

export const ItemTable = ({
    filter,
    itemsPerPage = 100,
    values,
}: {
    filter: SearchFilter,
    itemsPerPage?: number,
    values: SqlValue[][],
}): ReactNode => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        setCurrentPage(Number(searchParams.get("page")) || 1);
        setTotalPages(Math.ceil(values.length / itemsPerPage));
    }, [itemsPerPage, searchParams, values]);

    const changePage = (page: number) => {
        const newPage = clamp(page, 1, totalPages);
        setCurrentPage(newPage);
        const newFilter = mergeSearchFilter(filter, {
            page: newPage.toString(),
        });
        setSearchParams(formatSearchParams(newFilter));
    };

    return (
        <div>
            <p>{values.length} Results</p>
            <p>{`Showing ${clamp((currentPage - 1) * itemsPerPage + 1, 1, values.length)} to ${clamp(currentPage * itemsPerPage, 1, values.length)}`}</p>
            <div className="results">
                {
                    values.map((row, i) => (i >= (currentPage - 1) * itemsPerPage && i < currentPage * itemsPerPage) && (
                        <ItemRow
                            key={`row-${i}-${row[1]}`}
                            filter={filter}
                            id={row[0]}
                            name={row[1]}
                            itemTypeId={row[2]}
                            itemType={row[3]}
                            buy={row[4]}
                            sell={row[5]}
                            weight={row[6]}
                            mobCount={row[7]}
                            ingredientSum={row[8]}
                            repeatableIngredientSum={row[11]}
                            productSum={row[13]}
                            repeatableProductSum={row[15]}
                        />
                    ))
                }
            </div>
            <button type="button" onClick={() => changePage(1)}>First Page</button>
            <button type="button" onClick={() => changePage(currentPage - 1)}>Previous Page</button>
            <button type="button" onClick={() => changePage(currentPage + 1)}>Next Page</button>
            <button type="button" onClick={() => changePage(totalPages)}>Last Page</button>
        </div>
    );
};

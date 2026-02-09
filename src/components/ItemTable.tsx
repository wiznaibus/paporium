import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { SqlValue } from "sql.js";
import { useSearchParams } from 'react-router-dom';
import { formatSearchParams, mergeSearchFilter, type SearchFilter } from "../utilities/SearchFilter";
import { clamp } from "../utilities/Calculations";
import { ItemRow } from "./ItemRow";
import { Pagination } from "./Pagination";

export const ItemTable = ({
    filter,
    itemsPerPage = 100,
    selectedItem = 0,
    setSelectedItem,
    values,
}: {
    filter: SearchFilter,
    itemsPerPage?: number,
    selectedItem?: number,
    setSelectedItem?: Dispatch<SetStateAction<number>>,
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
            ...(newPage > 1 ? { page: newPage.toString() } : null),
        });
        setSearchParams(formatSearchParams(newFilter));
    };

    const paginationElement = (
        <Pagination
            changePage={changePage}
            currentStartItem={clamp((currentPage - 1) * itemsPerPage + 1, 1, values.length)}
            currentEndItem={clamp(currentPage * itemsPerPage, 1, values.length)}
            totalItems={values.length}
            currentPage={currentPage}
            totalPages={totalPages}
        />
    );

    return (
        <div className="relative">
            {paginationElement}
            <div className="results flex flex-col gap-2">
                {
                    values.map((row, i) => (i >= (currentPage - 1) * itemsPerPage && i < currentPage * itemsPerPage) && (
                        <ItemRow
                            key={`row-${i}-${row[1]}`}
                            id={Number(row[0])}
                            name={row[1]?.toString()}
                            itemTypeId={Number(row[2])}
                            itemType={row[3]?.toString()}
                            buy={Number(row[4])}
                            sell={Number(row[5])}
                            weight={Number(row[6])}
                            mobCount={Number(row[7])}
                            ingredientSum={Number(row[9])}
                            repeatableIngredientSum={Number(row[11])}
                            productSum={Number(row[13])}
                            repeatableProductSum={Number(row[15])}
                            overchargeable={Number(row[16])}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                        />
                    ))
                }
            </div>
            {paginationElement}
        </div>
    );
};

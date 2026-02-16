import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from 'react-router-dom';
import { clamp } from "../../utilities/Calculations";
import { formatSearchParams, mergeSearchFilter, type SearchFilter } from "../../utilities/SearchFilter";
import type { Item } from "../../Items";
import { ItemRow } from "./ItemRow";
import { Pagination } from "../Pagination";

export const ItemTable = ({
    filter,
    items,
    itemsPerPage = 100,
    selectedItem = 0,
    setSelectedItem,
}: {
    filter: SearchFilter,
    items: Item[],
    itemsPerPage?: number,
    selectedItem?: number,
    setSelectedItem?: (item: number) => void,
}): ReactNode => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        setCurrentPage(Number(searchParams.get("page")) || 1);
        setTotalPages(Math.ceil((items?.length ?? 0) / itemsPerPage));
    }, [itemsPerPage, searchParams, items]);

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
            currentStartItem={clamp((currentPage - 1) * itemsPerPage + 1, 1, items?.length ?? 0)}
            currentEndItem={clamp(currentPage * itemsPerPage, 1, items?.length ?? 0)}
            totalItems={items?.length ?? 0}
            currentPage={currentPage}
            totalPages={totalPages}
        />
    );

    return (
        <div className="relative">
            {paginationElement}
            <div className="flex flex-col gap-2">
                {
                    items.map((item, i) => (i >= (currentPage - 1) * itemsPerPage && i < currentPage * itemsPerPage) && (
                        <ItemRow
                            key={`row-${i}-${item.id}`}
                            { ...item }
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

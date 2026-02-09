import { useEffect, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { clamp } from "../utilities/Calculations";

export const Pagination = ({
    changePage,
    currentStartItem = 0,
    currentEndItem = 0,
    totalItems = 0,
    currentPage = 1,
    totalPages = 1,
}: {
    changePage?: (newPage: number) => void,
    currentStartItem?: number,
    currentEndItem?: number
    totalItems?: number,
    currentPage?: number,
    totalPages?: number,
}): ReactNode => {
    const [activePages, setActivePages] = useState<number[]>([]);

    useEffect(() => {
        const pages: number[] = [];
        // get up to 5 pages with the current page centered
        for (let i = -2; i <= 2; i++) {
            if (i > totalPages) {
                break;
            }
            pages.push(clamp(currentPage + i, 1, totalPages));
        }
        setActivePages(Array.from(new Set<number>(pages).values()));
    }, [currentPage, totalPages]);

    return (
        <div className="flex justify-between my-4 text-sm">
            <p>{`Showing ${currentStartItem} to ${currentEndItem} of ${totalItems} results`}</p>
            <div className="flex gap-1">
                <Button type="button" title="First page" onClick={() => changePage?.(1)}><Icon name="double-arrow-left" /></Button>
                <Button type="button" title="Previous page" onClick={() => changePage?.(currentPage - 1)}><Icon name="arrow-left" /></Button>
                {activePages.map(page => (
                    <Button key={page} active={page === currentPage} type="button"  title={`Page ${page}`} onClick={() => changePage?.(page)}>{page}</Button>
                ))}
                <Button type="button" title="Next page" onClick={() => changePage?.(currentPage + 1)}><Icon name="arrow-right" /></Button>
                <Button type="button" title="Last page" onClick={() => changePage?.(totalPages)}><Icon name="double-arrow-right" /></Button>
            </div>
        </div>
    );
};

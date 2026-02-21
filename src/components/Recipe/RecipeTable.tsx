import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from 'react-router-dom';
import { clamp } from "../../utilities/Calculations";
import { formatSearchParams, mergeSearchFilter, type SearchFilter } from "../../utilities/SearchFilter";
import type { Recipe } from "../Item/ItemDetails";
import { RecipeDetails } from "../Recipe/RecipeDetails";
import { Pagination } from "../Pagination";

export const RecipeTable = ({
    filter,
    filteredItemIds,
    recipes,
    recipesPerPage = 100,
    setSelectedItem,
}: {
    filter: SearchFilter,
    filteredItemIds?: number[],
    recipes: Recipe[],
    recipesPerPage?: number,
    setSelectedItem?: (item: number) => void,
}): ReactNode => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        setCurrentPage(Number(searchParams.get("page")) || 1);
        setTotalPages(Math.ceil((recipes?.length ?? 0) / recipesPerPage));
    }, [recipesPerPage, searchParams, recipes]);

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
            currentStartItem={clamp((currentPage - 1) * recipesPerPage + 1, 1, recipes?.length ?? 0)}
            currentEndItem={clamp(currentPage * recipesPerPage, 1, recipes?.length ?? 0)}
            totalItems={recipes?.length ?? 0}
            currentPage={currentPage}
            totalPages={totalPages}
        />
    );

    return (
        <div className="relative">
            {paginationElement}
            <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 gap-2">
                {
                    recipes.map((recipe, i) => (i >= (currentPage - 1) * recipesPerPage && i < currentPage * recipesPerPage) && (
                        <RecipeDetails
                            key={`row-${i}-${recipe.id}`}
                            recipe={recipe}
                            filteredItemIds={filteredItemIds}
                            onItemClick={setSelectedItem}
                        />
                    ))
                }
            </div>
            {paginationElement}
        </div>
    );
};

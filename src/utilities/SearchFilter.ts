export interface FilterItem {
    id: number,
    name?: string,
    checked?: boolean,
};

export interface SearchFilter {
    item?: string;
    itemTypes?: FilterItem[];
    jobs?: FilterItem[];
    recipeItemTypes?: FilterItem[];
    recipeTypes?: FilterItem[];
}

const mergeFilterItems = (oldFilterItems?: FilterItem[], newFilterItems?: FilterItem[]): FilterItem[] => {
    // combine ids from both arrays, get a unique list, and sort it
    const filterIds = Array.from(
        new Set([ ...oldFilterItems?.map(value => value.id) ?? [], ...newFilterItems?.map(value => value.id) ?? [] ]).values()
    ).sort((a, b) => a - b);

    const filterItems: FilterItem[] = filterIds.map(id => ({
        ...oldFilterItems?.find(oldItem => oldItem.id === id) ?? { id: 0 },
        ...newFilterItems?.find(newItem => newItem.id === id)
    }));

    return filterItems;
};

export const mergeSearchFilter = (oldFilter: SearchFilter, newFilter: SearchFilter): SearchFilter => {
    return {
        item: newFilter.item || oldFilter.item,
        itemTypes: mergeFilterItems(oldFilter.itemTypes, newFilter.itemTypes),
        jobs: mergeFilterItems(oldFilter.jobs, newFilter.jobs),
        recipeItemTypes: mergeFilterItems(oldFilter.recipeItemTypes, newFilter.recipeItemTypes),
        recipeTypes: mergeFilterItems(oldFilter.recipeTypes, newFilter.recipeTypes),
    };
};

export const parseSearchParams = (searchParams: URLSearchParams): SearchFilter => {
    const searchParamsObject = Object.fromEntries(searchParams);

    const item = searchParamsObject.item;
    const itemTypes = searchParamsObject.itemType?.split(",").map(Number) ?? [];
    const jobs = searchParamsObject.job?.split(",").map(Number) ?? [];
    const recipeItemTypes = searchParamsObject.recipeItemType?.split(",").map(Number) ?? [];
    const recipeTypes = searchParamsObject.recipeType?.split(",").map(Number) ?? [];

    return {
        item,
        itemTypes: itemTypes.map(value => ({ id: value, checked: true })),
        jobs: jobs.map(value => ({ id: value, checked: true })),
        recipeItemTypes: recipeItemTypes.map(value => ({ id: value, checked: true })),
        recipeTypes: recipeTypes.map(value => ({ id: value, checked: true })),
    };
};

export const formatSearchParams = (searchFilter: SearchFilter): {
    item?: string;
    itemTypes?: string;
    jobs?: string;
    recipeItemTypes?: string;
    recipeTypes?: string;
} => {
    const itemTypes = searchFilter.itemTypes?.filter(value => value.checked).map(value => value.id);
    const jobs = searchFilter.jobs?.filter(value => value.checked).map(value => value.id);
    const recipeItemTypes = searchFilter.recipeItemTypes?.filter(value => value.checked).map(value => value.id);
    const recipeTypes = searchFilter.recipeTypes?.filter(value => value.checked).map(value => value.id);

    return {
        ...(searchFilter.item ? { item: searchFilter.item } : null),
        ...(itemTypes && itemTypes?.length > 0 ? { itemTypes: itemTypes.join(",") } : null),
        ...(jobs && jobs?.length > 0 ? { jobs: jobs.join(",") } : null),
        ...(recipeItemTypes && recipeItemTypes?.length > 0 ? { recipeItemTypes: recipeItemTypes.join(",") } : null),
        ...(recipeTypes && recipeTypes?.length > 0 ? { recipeTypes: recipeTypes.join(",") } : null),
    };
};

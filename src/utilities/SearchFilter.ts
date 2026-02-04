export interface FilterItem {
    name?: string,
    checked?: boolean,
};

export interface SearchFilter {
    item: string;
    itemTypes: Map<number, FilterItem>;
    jobs: Map<number, FilterItem>;
    recipeItemTypes: Map<number, FilterItem>;
    recipeTypes: Map<number, FilterItem>;
}

export const mergeSearchFilter = (oldFilter: SearchFilter, newFilter: SearchFilter): SearchFilter => {
    return {
        item: newFilter.item || oldFilter.item,
        itemTypes: new Map(Array.from(oldFilter.itemTypes.entries()).map(([key, value]) => (
            [key, { ...value, ...newFilter.itemTypes.get(key) }]
        ))),
        jobs: new Map(Array.from(oldFilter.jobs.entries()).map(([key, value]) => (
            [key, { ...value, ...newFilter.jobs.get(key) }]
        ))),
        recipeItemTypes: new Map(Array.from(oldFilter.recipeItemTypes.entries()).map(([key, value]) => (
            [key, { ...value, ...newFilter.recipeItemTypes.get(key) }]
        ))),
        recipeTypes: new Map(Array.from(oldFilter.recipeTypes.entries()).map(([key, value]) => (
            [key, { ...value, ...newFilter.recipeTypes.get(key) }]
        ))),
    };
};

export const parseSearchParams = (searchParams: URLSearchParams) => {
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

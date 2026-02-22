export interface FilterItem {
    id: number,
    name?: string,
    checked?: boolean,
};

export interface SearchFilter {
    item?: string;
    itemTypes?: FilterItem[];
    jobs?: FilterItem[];
    overcharge?: string;
    page?: string;
    pricing?: string;
    recipe?: string;
    recipeItemTypes?: FilterItem[];
    recipeTypes?: FilterItem[];
    repeatable?: FilterItem[];
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
        overcharge: newFilter.overcharge || oldFilter.overcharge,
        page: newFilter.page || oldFilter.page,
        pricing: newFilter.pricing || oldFilter.pricing,
        recipe: newFilter.recipe || oldFilter.recipe,
        recipeItemTypes: mergeFilterItems(oldFilter.recipeItemTypes, newFilter.recipeItemTypes),
        recipeTypes: mergeFilterItems(oldFilter.recipeTypes, newFilter.recipeTypes),
        repeatable: mergeFilterItems(oldFilter.repeatable, newFilter.repeatable),
    };
};

export const parseSearchParams = (searchParams: URLSearchParams): SearchFilter => {
    const searchParamsObject = Object.fromEntries(searchParams);

    const item = searchParamsObject.item;
    const itemTypes = searchParamsObject.itemTypes?.split(",").map(Number) ?? [];
    const jobs = searchParamsObject.jobs?.split(",").map(Number) ?? [];
    const overcharge = searchParamsObject.overcharge;
    const page = searchParamsObject.page;
    const pricing = searchParamsObject.pricing;
    const recipe = searchParamsObject.recipe;
    const recipeItemTypes = searchParamsObject.recipeItemTypes?.split(",").map(Number) ?? [];
    const recipeTypes = searchParamsObject.recipeTypes?.split(",").map(Number) ?? [];
    const repeatable = searchParamsObject.repeatable?.split(",").map(Number) ?? [];

    return {
        item,
        itemTypes: itemTypes.map(value => ({ id: value, checked: true })),
        jobs: jobs.map(value => ({ id: value, checked: true })),
        overcharge,
        page,
        pricing,
        recipe,
        recipeItemTypes: recipeItemTypes.map(value => ({ id: value, checked: true })),
        recipeTypes: recipeTypes.map(value => ({ id: value, checked: true })),
        repeatable: repeatable.map(value => ({ id: value, checked: true })),
    };
};

export const formatSearchParams = (searchFilter: SearchFilter): {
    item?: string;
    itemTypes?: string;
    jobs?: string;
    overcharge?: string;
    page?: string;
    pricing?: string;
    recipe?: string;
    recipeItemTypes?: string;
    recipeTypes?: string;
    repeatable?: string;
} => {
    const itemTypes = searchFilter.itemTypes?.filter(value => value.checked).map(value => value.id);
    const jobs = searchFilter.jobs?.filter(value => value.checked).map(value => value.id);
    const recipeItemTypes = searchFilter.recipeItemTypes?.filter(value => value.checked).map(value => value.id);
    const recipeTypes = searchFilter.recipeTypes?.filter(value => value.checked).map(value => value.id);
    const repeatable = searchFilter.repeatable?.filter(value => value.checked).map(value => value.id);

    return {
        ...(searchFilter.item ? { item: searchFilter.item } : null),
        ...(itemTypes && itemTypes?.length > 0 ? { itemTypes: itemTypes.join(",") } : null),
        ...(jobs && jobs?.length > 0 ? { jobs: jobs.join(",") } : null),
        ...(searchFilter.overcharge ? { overcharge: searchFilter.overcharge } : null),
        ...(searchFilter.page ? { page: searchFilter.page } : null),
        ...(searchFilter.pricing ? { pricing: searchFilter.pricing } : null),
        ...(searchFilter.recipe ? { recipe: searchFilter.recipe } : null),
        ...(recipeItemTypes && recipeItemTypes?.length > 0 ? { recipeItemTypes: recipeItemTypes.join(",") } : null),
        ...(recipeTypes && recipeTypes?.length > 0 ? { recipeTypes: recipeTypes.join(",") } : null),
        ...(repeatable && repeatable?.length > 0 ? { repeatable: repeatable.join(",") } : null),
    };
};

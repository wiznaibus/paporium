import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from 'react-router-dom';
import { formatSearchParams, mergeSearchFilter, type SearchFilter } from "../utilities/SearchFilter";
import { Button } from "./Button";
import { FilterFieldset } from "./FilterFieldset";

export const ItemFilter = ({
    filter,
    filterDataLoaded,
    setFilter
}: {
    filter: SearchFilter,
    filterDataLoaded: boolean,
    setFilter: (newFilter: SearchFilter) => void
}): ReactNode => {
    const [, setSearchParams] = useSearchParams();
    const [itemInputValue, setItemInputValue] = useState<string>("");

    // debounced item input value update
    useEffect(() => {
        const delayInputTimeoutId = setTimeout(() => {
            if (filterDataLoaded) {
                const newFilter = {
                    ...filter,
                    item: itemInputValue,
                };

                setFilter(newFilter);
                setSearchParams(formatSearchParams(newFilter));
            }
        }, 500);
        return () => clearTimeout(delayInputTimeoutId);
    }, [itemInputValue, 500]);

    // reset the form values and reload data
    const handleReset = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setItemInputValue("");
        setFilter({
            item: "",
            itemTypes: filter.itemTypes?.map(value => ({ id: value.id, name: value.name, checked: false })),
            jobs: filter.jobs?.map(value => ({ id: value.id, name: value.name, checked: false })),
            recipeTypes: filter.recipeTypes?.map(value => ({ id: value.id, name: value.name, checked: false })),
            recipeItemTypes: filter.recipeItemTypes?.map(value => ({ id: value.id, name: value.name, checked: false }))
        });
        setSearchParams();
    };

    const handleSelectAll = () => {
        const newFilter = {
            item: filter.item,
            itemTypes: filter.itemTypes?.map(value => ({ id: value.id, name: value.name, checked: true })),
            jobs: filter.jobs?.map(value => ({ id: value.id, name: value.name, checked: true })),
            recipeTypes: filter.recipeTypes?.map(value => ({ id: value.id, name: value.name, checked: true })),
            recipeItemTypes: filter.recipeItemTypes?.map(value => ({ id: value.id, name: value.name, checked: true }))
        };
        setFilter(newFilter);
        setSearchParams(formatSearchParams(newFilter));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setItemInputValue(event.currentTarget.value);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const changedFilter: SearchFilter = {
            [event.currentTarget.name]: [{
                id: Number(event.currentTarget.value) ?? 0,
                checked: event.currentTarget.checked
            }]
        };
        const newFilter = mergeSearchFilter(filter, changedFilter);
        setFilter(newFilter);
        setSearchParams(formatSearchParams(newFilter));
    };

    return (
        <form className="flex flex-col gap-2 text-sm" id="filterForm" onReset={handleReset} onSubmit={(event) => event.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-1 font-semibold">Search
                    <input className="w-full bg-cyan-800 border border-cyan-700 rounded-lg p-2" name="item" onBlur={handleInputChange} onChange={handleInputChange} type="text" value={itemInputValue} />
                </label>
                <FilterFieldset gridClass="grid-cols-2" items={filter.recipeItemTypes} legend="Component type" name="recipeItemTypes" onCheckboxChange={handleCheckboxChange} />
                <FilterFieldset gridClass="grid-cols-3" items={filter.itemTypes} legend="Item type" name="itemTypes" onCheckboxChange={handleCheckboxChange} />
                <FilterFieldset gridClass="grid-cols-2 lg:grid-cols-3" items={filter.recipeTypes} legend="Recipe type" name="recipeTypes" onCheckboxChange={handleCheckboxChange} />
            </div>

            <FilterFieldset gridClass="grid-rows-9 grid-flow-col" items={filter.jobs} legend="Jobs" name="jobs" onCheckboxChange={handleCheckboxChange} />

            <div className="flex items-center gap-2">
                <Button type="button" onClick={handleSelectAll}>Select All</Button>
                <Button type="reset">Select None</Button>
            </div>
        </form>
    );
};

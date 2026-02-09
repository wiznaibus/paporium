import { useEffect, useState, type ReactNode } from "react";
import { mergeSearchFilter, type SearchFilter } from "../utilities/SearchFilter";
import { Button } from "./Button";
import { FilterFieldset } from "./FilterFieldset";

export const ItemFilter = ({
    filter,
    filterDataLoaded,
    setFilter
}: {
    filter: SearchFilter,
    filterDataLoaded: boolean,
    setFilter: (newFilter: SearchFilter, reset?: boolean) => void
}): ReactNode => {
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
            recipeItemTypes: filter.recipeItemTypes?.map(value => ({ id: value.id, name: value.name, checked: false })),
            overcharge: "",
        }, true);
    };

    const handleSelectAll = () => {
        const newFilter = {
            item: filter.item,
            itemTypes: filter.itemTypes?.map(value => ({ id: value.id, name: value.name, checked: true })),
            jobs: filter.jobs?.map(value => ({ id: value.id, name: value.name, checked: true })),
            recipeTypes: filter.recipeTypes?.map(value => ({ id: value.id, name: value.name, checked: true })),
            recipeItemTypes: filter.recipeItemTypes?.map(value => ({ id: value.id, name: value.name, checked: true })),
            overcharge: "true",
        };
        setFilter(newFilter);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setItemInputValue(event.currentTarget.value);
    };

    const handleOverchargeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFilter = {
            ...filter,
            overcharge: event.currentTarget.checked ? event.currentTarget.value : "",
        };

        setFilter(newFilter);
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const changedFilter: SearchFilter = {
            [event.currentTarget.name]: [{
                id: Number(event.currentTarget.value) ?? 0,
                checked: event.currentTarget.checked
            }]
        };
        const newFilter = mergeSearchFilter(filter, changedFilter);
        setFilter(newFilter);
    };

    return (
        <form className="flex flex-col gap-2 text-sm" id="filterForm" onReset={handleReset} onSubmit={(event) => event.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
                <fieldset className={`flex bg-emerald-800 border border-emerald-700 rounded-lg p-2 pt-1`}>
                    <legend className="font-semibold">Search Items</legend>
                    <label className="grow flex items-center gap-1.5 font-semibold">Item name/ID:
                        <input className="grow bg-emerald-700 border border-emerald-600 rounded-sm px-2 py-1 font-normal" name="item" onBlur={handleInputChange} onChange={handleInputChange} type="text" value={itemInputValue} />
                    </label>
                </fieldset>
                <fieldset className={`grid auto-rows-min grid-cols-2 bg-cyan-800 border border-cyan-700 gap-1 rounded-lg p-2 pt-1`}>
                    <legend className="font-semibold">Filter Items by Recipe Components</legend>
                    {filter.recipeItemTypes?.map((value, i) => (
                        <label className="flex items-center gap-1 truncate" key={i}>
                            <input
                                checked={value?.checked}
                                name="recipeItemTypes"
                                onChange={handleCheckboxChange}
                                type="checkbox"
                                value={value?.id}
                            />
                            <span className="overflow-hidden text-ellipsis" title={value.name}>{value.name}</span>
                        </label>
                    ))}
                    <label className="flex items-center gap-1 truncate" key="overcharge-only">
                        <input
                            checked={filter.overcharge === "true"}
                            name="overcharge"
                            onChange={handleOverchargeChange}
                            type="checkbox"
                            value="true"
                        />
                        <span className="overflow-hidden text-ellipsis" title="Overcharge Only">Overcharge Only</span>
                    </label>
                    <label className="flex items-center gap-1 truncate" key="no-overcharge">
                        <input
                            checked={filter.overcharge === "false"}
                            name="overcharge"
                            onChange={handleOverchargeChange}
                            type="checkbox"
                            value="false"
                        />
                        <span className="overflow-hidden text-ellipsis" title="No Overcharge">No Overcharge</span>
                    </label>
                </fieldset>
                <FilterFieldset className="grid-cols-3 bg-emerald-800 border border-emerald-700" items={filter.itemTypes} legend="Filter Items by Type" name="itemTypes" onCheckboxChange={handleCheckboxChange} />
                <FilterFieldset className="grid-cols-2 lg:grid-cols-3 bg-cyan-800 border border-cyan-700" items={filter.recipeTypes} legend="Filter Recipes by Type" name="recipeTypes" onCheckboxChange={handleCheckboxChange} />
            </div>

            <FilterFieldset className="grid-rows-9 grid-flow-col bg-cyan-800 border border-cyan-700" items={filter.jobs} legend="Filter Recipes by job" name="jobs" onCheckboxChange={handleCheckboxChange} />

            <div className="flex items-center gap-2">
                <Button type="button" onClick={handleSelectAll}>Select All</Button>
                <Button type="reset">Select None</Button>
            </div>
        </form>
    );
};

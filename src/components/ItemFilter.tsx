import { useEffect, useState, type ReactNode } from "react";
import { mergeSearchFilter, type SearchFilter } from "../utilities/SearchFilter";
import { Button } from "./Button";
import { FilterFieldset } from "./FilterFieldset";
import { Badge } from "./Badge";

export const ItemFilter = ({
    filter,
    filterDataLoaded,
    setFilter
}: {
    filter: SearchFilter,
    filterDataLoaded: boolean,
    setFilter: (newFilter: SearchFilter, reset?: boolean) => void
}): ReactNode => {
    const [itemInputValue, setItemInputValue] = useState<string>(filter.item ?? "");

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

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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
                <fieldset className={`col-span-2 md:col-span-1 item flex flex-col gap-2 px-3 pt-1 pb-2`}>
                    <legend className="font-semibold">Filter Items</legend>
                    <label className="shrink flex items-center gap-1.5 font-semibold">Search:
                        <textarea
                            className="w-full shrink px-2 py-1 border border-sakura-500 bg-sakura-700/75 rounded-md"
                            name="item"
                            onBlur={handleInputChange}
                            onChange={handleInputChange}
                            placeholder="Enter item name, item ID, or comma-separated list of item IDs"
                            value={itemInputValue}
                        ></textarea>
                    </label>
                </fieldset>
                <fieldset className={`col-span-2 md:col-span-1 recipe recipe-data grid grid-cols-1 sm:grid-cols-2 auto-rows-min gap-1 px-3 pt-1 pb-2`}>
                    <legend className="font-semibold">Filter Items by Recipe Components</legend>
                    {filter.recipeItemTypes?.sort((a, b) => b.id - a.id).map((value, i) => (
                        <label className="flex items-center gap-1 truncate" key={i}>
                            <input
                                checked={value?.checked}
                                name="recipeItemTypes"
                                onChange={handleCheckboxChange}
                                type="checkbox"
                                value={value?.id}
                            />
                            <span className="truncate" title={value.name}>{value.name}</span>
                        </label>
                    ))}
                    <label className="flex items-center gap-1 truncate" key="no-overcharge">
                        <input
                            checked={filter.overcharge === "false"}
                            name="overcharge"
                            onChange={handleOverchargeChange}
                            type="checkbox"
                            value="false"
                        />
                        <span className="truncate" title="Exclude Overcharge">Exclude Overcharge</span>
                    </label>
                    <label className="flex items-center gap-1 truncate" key="overcharge-only">
                        <input
                            checked={filter.overcharge === "true"}
                            name="overcharge"
                            onChange={handleOverchargeChange}
                            type="checkbox"
                            value="true"
                        />
                        <span className="truncate" title="Show Only Overcharge">Show Only Overcharge</span>
                    </label>
                    <div className="col-span-2 p-1 bg-yellow-300/25 border border-yellow-200/25 rounded-md">
                        <img alt="overcharge" className="float-left mr-1" src="./assets/icons/overcharge.png" title="Can be safely sold" />
                        <span className="font-semibold">Overcharge</span> refers to <Badge id={6} type="item" name="Etc" /> items that are not used as ingredients and can be safely sold to a vendor.
                        Please be aware that a quest or recipe may be missing from the database and could result in items erroneously being marked as <span className="font-semibold">overcharge</span>.
                    </div>
                </fieldset>
                <FilterFieldset className="item grid-cols-1 sm:grid-cols-3" items={filter.itemTypes} legend="Filter Items by Type" name="itemTypes" onCheckboxChange={handleCheckboxChange} />
                <FilterFieldset className="recipe grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" items={filter.recipeTypes} legend="Filter Recipes by Type" name="recipeTypes" onCheckboxChange={handleCheckboxChange} />
            </div>

            <FilterFieldset className="recipe grid-rows-21 md:grid-rows-9 grid-flow-col" items={filter.jobs} legend="Filter Recipes by Job" name="jobs" onCheckboxChange={handleCheckboxChange} />

            <div className="flex items-center gap-2">
                <Button type="reset">Clear Filter</Button>
            </div>
        </form>
    );
};

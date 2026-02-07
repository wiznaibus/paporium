import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from 'react-router-dom';
import { formatSearchParams, mergeSearchFilter, type SearchFilter } from "../utilities/SearchFilter";

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
    }, [itemInputValue, filterDataLoaded, 500]);

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
        <form id="filterForm" onReset={handleReset} onSubmit={(event) => event.preventDefault()}>
            <label>Search
                <input name="item" onBlur={handleInputChange} onChange={handleInputChange} type="text" value={itemInputValue} />
            </label>

            <fieldset>
                <legend>Item type</legend>
                {filter.itemTypes?.map((value, i) => (
                    <label key={i}>
                        <input
                            checked={value?.checked}
                            name="itemTypes"
                            onChange={handleCheckboxChange}
                            type="checkbox"
                            value={value?.id}
                        />
                        {value.name}
                    </label>
                ))}
            </fieldset>

            <fieldset>
                <legend>Recipe type</legend>
                {filter.recipeTypes?.map((value, i) => (
                    <label key={i}>
                        <input
                            checked={value?.checked}
                            name="recipeTypes"
                            onChange={handleCheckboxChange}
                            type="checkbox"
                            value={value?.id}
                        />
                        {value.name}
                    </label>
                ))}
            </fieldset>

            <fieldset>
                <legend>Jobs</legend>
                {filter.jobs?.map((value, i) => (
                    <label key={i}>
                        <input
                            checked={value?.checked}
                            name="jobs"
                            onChange={handleCheckboxChange}
                            type="checkbox"
                            value={value?.id}
                        />
                        {value.name}
                    </label>
                ))}
            </fieldset>

            <fieldset>
                <legend>Component type</legend>
                {filter.recipeItemTypes?.map((value, i) => (
                    <label key={i}>
                        <input
                            checked={value?.checked}
                            name="recipeItemTypes"
                            onChange={handleCheckboxChange}
                            type="checkbox"
                            value={value?.id}
                        />
                        {value.name}
                    </label>
                ))}
            </fieldset>

            <button type="button" onClick={handleSelectAll}>Select All</button>
            <button type="reset">Select None</button>
        </form>
    );
};

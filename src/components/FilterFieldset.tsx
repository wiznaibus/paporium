import { type ReactNode } from "react";
import { type FilterItem } from "../utilities/SearchFilter";
import React from "react";

export const FilterFieldset = ({
    gridClass = "grid-cols-2 lg:grid-cols-4",
    items,
    legend,
    name,
    onCheckboxChange,
}: {
    gridClass?: string,
    items?: FilterItem[],
    legend?: string,
    name?: string,
    onCheckboxChange?: React.ChangeEventHandler<HTMLInputElement>
}): ReactNode => {

    return (
        <fieldset className={`grid auto-rows-min ${gridClass} gap-1 bg-cyan-800 border border-cyan-700 rounded-lg p-2 pt-1`}>
            <legend className="font-semibold">{legend}</legend>
            {items?.map((value, i) => (
                <React.Fragment key={i}>
                    {name === "jobs" && [5, 8, 11, 14, 21, 25, 28, 31, 34, 41].includes(i) ? (
                        <span></span>
                    ) : (
                        <></>
                    )}
                    {name === "jobs" && [8, 14, 28, 34].includes(i) ? (
                        <span></span>
                    ) : (
                        <></>
                    )}
                    <label className="flex items-center gap-1 truncate" key={i}>
                        <input
                            checked={value?.checked}
                            name={name}
                            onChange={onCheckboxChange}
                            type="checkbox"
                            value={value?.id}
                        />
                        <span className="overflow-hidden text-ellipsis" title={value.name}>{value.name}</span>
                    </label>
                </React.Fragment>
            ))}
        </fieldset>
    );
};

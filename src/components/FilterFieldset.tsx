import React, { type ReactNode } from "react";
import { type FilterItem } from "../utilities/SearchFilter";

export const FilterFieldset = ({
    className = "grid-cols-2 lg:grid-cols-4",
    items,
    legend,
    name,
    onCheckboxChange,
}: {
    className?: string,
    items?: FilterItem[],
    legend?: string,
    name?: string,
    onCheckboxChange?: React.ChangeEventHandler<HTMLInputElement>
}): ReactNode => {

    return (
        <fieldset className={`grid auto-rows-min ${className} gap-1 px-3 pt-1 pb-2`}>
            <legend className="font-semibold">{legend}</legend>
            {items?.map((value, i) => (
                <React.Fragment key={i}>
                    {name === "jobs" && [5, 8, 11, 14, 21, 25, 28, 31, 34, 41].includes(i) ? (
                        <span className="hidden md:inline"></span>
                    ) : (
                        <></>
                    )}
                    {name === "jobs" && [8, 14, 28, 34].includes(i) ? (
                        <span className="hidden md:inline"></span>
                    ) : (
                        <></>
                    )}
                    {name === "jobs" && [21, 41].includes(i) ? (
                        <span className="md:hidden"></span>
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
                        <span className="truncate" title={value.name}>{value.name}</span>
                    </label>
                </React.Fragment>
            ))}
        </fieldset>
    );
};

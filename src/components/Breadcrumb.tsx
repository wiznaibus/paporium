import type { ReactNode } from "react";
import { Icon } from "./Icon";

export const Breadcrumb = ({
    page = 'items',
    title,
}: {
    page?: 'items' | 'recipes',
    title?: string,
}): ReactNode => {
    /* Hide breadcrumb until detail pages are added */
    return true ? <></> : (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 justify-between">
            <div className="flex items-center gap-0.5 text-base font-semibold">
                The Paporium
                <Icon className="text-sakura-500" name="arrow-right" />
                {`${page.charAt(0).toLocaleUpperCase()}${page.substring(1)}`}
                {title && <>
                    <Icon className="text-sakura-500" name="arrow-right" />
                    {title}
                </>}
            </div>
        </div>
    );
};

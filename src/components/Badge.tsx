import { type ReactNode } from "react";
import { getItemBadgeStyles, getJobBadgeStyles, getRecipeBadgeStyles } from "../utilities/BadgeStyles";

export const Badge = ({
    id = 0,
    name,
    type = 'item',
}: {
    id?: number,
    name?: string,
    type?: 'item' | 'recipe' | 'job'
}): ReactNode => {

    const getBadgeStyles = (id: number, type?: string) => {
        switch (type) {
            case 'recipe':
                return getRecipeBadgeStyles(id);
            case 'job':
                return getJobBadgeStyles(id);
            case 'item':
            default:
                return getItemBadgeStyles(id);
        }
    };

    return (
        <div className={`px-1 text-xs text-stone-700 /25 rounded-sm ${getBadgeStyles(id, type)}`}>
            {name}
        </div>
    );
};

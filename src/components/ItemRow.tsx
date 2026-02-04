import { useState, type ReactNode } from "react";
import { ItemDetails } from "./ItemDetails";

export const ItemRow = ({
    filter,
    id,
    name,
    itemType,
    buy,
    sell,
    weight,
    mobCount,
    ingredientSum,
    repeatableIngredientSum,
    productSum,
    repeatableProductSum
}: any): ReactNode => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleToggle = (event: React.ToggleEvent<HTMLDetailsElement>) => {
        setIsOpen(event.newState === "open");
    };

    return (
    <>
        <tr>
            <td rowSpan={2}>{id}</td>
            <td colSpan={2}>{name}</td>
            <td>{itemType}</td>
            
            <td>
                {mobCount && <>
                    <img height="16" width="16" src="./assets/icons/drop.svg" style={{ verticalAlign: 'text-bottom' }} />
                    {mobCount?.toLocaleString()}
                </>}
            </td>
            <td>
                {ingredientSum && <>
                    <img height="16" width="16" src="./assets/icons/star.svg" style={{ verticalAlign: 'text-bottom' }} />
                    x{ingredientSum?.toLocaleString()}
                </>}
            </td>
            <td>
                {repeatableIngredientSum && <>
                    <img height="16" width="16" src="./assets/icons/repeatable.svg" style={{ verticalAlign: 'text-bottom' }} />
                    x{repeatableIngredientSum?.toLocaleString()}
                </>}
            </td>
            <td>
                {productSum && <>
                    <img height="16" width="16" src="./assets/icons/star.svg" style={{ verticalAlign: 'text-bottom' }} />
                    x{productSum?.toLocaleString()}
                </>}
            </td>
            <td>
                {repeatableProductSum && <>
                    <img height="16" width="16" src="./assets/icons/repeatable.svg" style={{ verticalAlign: 'text-bottom' }} />
                    x{repeatableProductSum?.toLocaleString()}
                </>}
            </td>
        </tr>
        <tr>
            <td>{buy?.toLocaleString()}z</td>
            <td>{sell?.toLocaleString()}z</td>
            <td>{weight?.toLocaleString()}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td colSpan={8}>
                <details onToggle={handleToggle}>
                    <summary>Details</summary>
                    {
                        isOpen && <ItemDetails 
                            key={`${id}-${name}`}
                            id={id} 
                            filter={filter}
                        />
                    }
                </details>
            </td>
        </tr>
    </>
  );
};
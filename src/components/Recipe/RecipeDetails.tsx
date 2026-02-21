import type { Recipe, RecipeItem } from "../Item/ItemDetails";
import { Badge } from "../Badge";
import { Icon } from "../Icon";
import { ItemIcon } from "../Item/ItemIcon";

export const RecipeDetails = ({
    onItemClick,
    recipe,
    filteredItemIds,
}: {
    onItemClick?: (itemId: number) => void,
    recipe: Recipe,
    filteredItemIds?: number[]
}) => {
    const ItemDetails = ({ recipeItem }: { recipeItem: RecipeItem }) => {
        const children = (
            <div className="grow recipe-data flex border-t">
                <div className={`px-0.5 basis-10 emphasis ${filteredItemIds?.includes(recipeItem.id ?? 0) && `recipe-data-emphasis`}`}>{recipeItem.id}</div>
                <div className={`px-0.5 grow truncate ${filteredItemIds?.includes(recipeItem.id ?? 0) && `recipe-data-emphasis`}`} title={recipeItem.name}>
                    {recipeItem.name}
                </div>
                <div className={`px-0.5 ${filteredItemIds?.includes(recipeItem.id ?? 0) && `recipe-data-emphasis`}`}>x{recipeItem.quantity?.toLocaleString()}</div>
            </div>
        );

        return (
            <div className="flex">
                {onItemClick && typeof onItemClick === 'function' ? <button
                    className="grow flex text-left cursor-pointer hover:bg-sakura-400"
                    onClick={() => onItemClick?.(recipeItem.id ?? 0)}
                    type="button"
                >{children}</button> : children}
            </div>
        );
    };

    return recipe && (
        <div className="recipe flex flex-col px-1.5 pt-1 pb-2 overflow-hidden">
            <div className="flex items-center gap-1">
                <div className="hidden md:flex shrink-0">
                    <ItemIcon id={recipe?.products?.[0].id ?? recipe?.ingredients?.[0].id ?? 0} name={recipe?.products?.[0].name} />
                </div>

                <div className="grow text-md font-semibold" title={recipe.name}>{recipe.name}</div>
                <div className="shrink-0 flex gap-1">
                    {(recipe.typeId ?? 0) > 0 && <Badge id={recipe.typeId} name={recipe.type} type="recipe" />}
                    {(recipe.jobId ?? 0) > 0 && <Badge id={recipe.jobId} name={recipe.job} type="job" />}

                </div>
                {recipe.repeatable ? (
                    <div className="shrink-0 flex" title="Repeatable">
                        <Icon className="shrink-0 emphasis" name="repeat" />
                    </div>
                ) : (
                    <div className="shrink-0 flex" title="One-time">
                        <Icon className="shrink-0 emphasis" name="star" />
                    </div>
                )}

            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="grid grid-cols-1 auto-rows-min">
                    <div className="header">Ingredients</div>
                    {recipe.ingredients?.map(ingredient =>
                        <ItemDetails key={ingredient.id} recipeItem={ingredient} />
                    )}
                </div>
                <div className="grid grid-cols-1 auto-rows-min">
                     <div className="header">Products</div>
                    {recipe.products?.map(product =>
                        <ItemDetails key={product.id} recipeItem={product} />
                    )}
                </div>
            </div>
        </div>
    );
};
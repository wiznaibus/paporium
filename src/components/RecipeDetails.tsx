import type { Recipe } from "./ItemDetails";
import { Badge } from "./Badge";
import { Icon } from "./Icon";
import { ItemIcon } from "./ItemIcon";

export const RecipeDetails = ({
    recipe,
    selectedItemId
}: {
    recipe: Recipe,
    selectedItemId?: number
}) => {
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
                        <div key={ingredient.id} className="recipe-data flex border-t">
                            <div className={`px-0.5 basis-10 emphasis ${ingredient.id === selectedItemId && `recipe-data-emphasis`}`}>{ingredient.id}</div>
                            <div className={`px-0.5 grow truncate ${ingredient.id === selectedItemId && `recipe-data-emphasis`}`} title={ingredient.name}>{ingredient.name}</div>
                            <div className={`px-0.5 ${ingredient.id === selectedItemId && `recipe-data-emphasis`}`}>x{ingredient.quantity}</div>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 auto-rows-min">
                     <div className="header">Products</div>
                    {recipe.products?.map(product =>
                        <div key={product.id} className="recipe-data flex border-t">
                            <div className={`px-0.5 basis-10 emphasis ${product.id === selectedItemId && `recipe-data-emphasis`}`}>{product.id}</div>
                            <div className={`px-0.5 grow truncate ${product.id === selectedItemId && `recipe-data-emphasis`}`} title={product.name}>{product.name}</div>
                            <div className={`px-0.5 ${product.id === selectedItemId && `recipe-data-emphasis`}`}>x{product.quantity}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
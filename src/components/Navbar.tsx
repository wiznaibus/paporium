import type { ReactNode } from "react";
import { Link } from "react-router";
import { Icon } from "./Icon";

export const Navbar = ({
    active,
}: {
    active?: string,
}): ReactNode => {
    return (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 justify-between">
            <nav className="flex items-center gap-0.5 text-lg font-bold">
                <img alt="old card album" src="./assets/icons/616.png" title="Old Card Album" />
                <Link className={`px-2 py-1 hover:text-sakura-200`} to="/">The Paporium</Link>
                <Icon className="text-sakura-500" name="arrow-right" />
                <Link className={`px-2 py-1 ${active === "items" && `bg-sakura-800 rounded-md`} hover:text-sakura-200`} to="/items">Items</Link>
                <Icon className="text-sakura-500" name="vertical-bar" />
                <Link className={`px-2 py-1 ${active === "recipes" && `bg-sakura-800 rounded-md`} hover:text-sakura-200`} to="/recipes">Recipes</Link>
            </nav>
            <div className="hidden sm:block relative">
                <button className="white-pot p-3 flex gap-2 items-center text-stone-900 bg-yellow-400 border border-yellow-300 text-base font-semibold rounded-md cursor-pointer" type="button">
                    <img className="h-7" alt="white potion" src="./assets/icons/whitepotion.png" title="White Potion" />
                    Buy me a white pot
                </button>
                <div className="popup absolute p-3 bg-sage-950 border border-sage-900 rounded-lg">
                    Enjoying the Paporium? Holler at us in-game if you see us! Natapata & RubyPaper
                </div>
            </div>
        </div>
    );
};

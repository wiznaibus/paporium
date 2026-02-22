import type { ReactNode } from "react";
import { Link } from "react-router";

export const Navbar = ({
    active,
}: {
    active?: string,
}): ReactNode => {

    const NavItem = ({ icon, name, to = "/" }: { icon?: string, name?: string, to?: string }) => {
        return <Link className={`
            h-full px-2 flex items-center gap-1 border-b
            ${active?.toLocaleLowerCase() === name?.toLocaleLowerCase()
                ? `bg-linear-to-t from-sakura-700 to-sakura-800 border-sakura-400`
                : `border-sakura-800`}
            hover:bg-linear-to-t hover:from-sakura-800 hover:to-sakura-900 hover:border-sakura-600
        `} to={to} reloadDocument>
            <img alt={name} src={`./assets/icons/${icon}.png`} title={name} />
            {name}
        </Link>
    };

    return (
        <nav className="fixed top-0 w-full z-30 h-14 px-2 flex items-center justify-between gap-2 bg-sakura-900 border-b border-sakura-800">
            <nav className="h-full flex items-center text-lg font-bold -mb-0.5">
                <NavItem icon="616" name="The Paporium" to="/" />
                <NavItem icon="509" name="Items" to="/items" />
                <NavItem icon="975" name="Recipes" to="/recipes" />
            </nav>

            <div className="hidden sm:block relative float-right">
                <button className="white-pot p-2 flex gap-2 items-center text-stone-900 bg-yellow-400 border border-yellow-300 text-base font-semibold rounded-md cursor-pointer" type="button">
                    <img className="h-7" alt="white potion" src="./assets/icons/whitepotion.png" title="White Potion" />
                    Buy me a white pot
                </button>
                <div className="popup absolute p-3 text-sm bg-sage-950 border border-sage-900 rounded-lg">
                    Enjoying the Paporium? Holler at us in-game if you see us! Natapata & RubyPaper
                </div>
            </div>
        </nav>
    );
};

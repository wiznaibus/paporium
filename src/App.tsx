import type { ReactElement } from "react";
import { Link } from "react-router";

export const App = () => {

    const NavItem = ({ icon, name, to = "/" }: { icon?: string, name?: string, to?: string }): ReactElement => (
        <Link className={`
            button p-2 flex items-center gap-1 text-lg font-bold
            pb-2.5 mt-1 hover:pb-3 hover:mt-0.5
            md:pl-2.5 md:mr-1 md:hover:pl-3 md:hover:mr-0.5
            md:pb-2 md:mt-0 md:hover:pb-2 md:hover:mt-0
        `} to={to}>
            <img alt={name} src={`./assets/icons/${icon}.png`} title={name} />
            {name}
        </Link>
    );

    const Links = (): ReactElement => (
        <div className="flex md:flex-col ml-2 md:mt-2 -mb-1 md:mb-0 md:-ml-1 gap-2 md:gap-4">
            <NavItem icon="509" name="Items" to="/items" />
            <NavItem icon="975" name="Recipes" to="/recipes" />
        </div>
    );

  return (
   <div className="h-screen w-full p-2 flex flex-col pt-8 md:pt-0 items-center md:justify-center gap-1">
        <h1 className="title text-6xl font-bold mb-4">
            Welcome to the Paporium!
        </h1>
        <div className="flex flex-col md:flex-row">
            <div className="md:hidden">
                <Links />
            </div>
            <div className="flex flex-col items-center">
                <div className="relative max-w-2xl p-1 rounded-lg bg-sakura-800 border border-sakura-600 ">
                    <img className="rounded-lg" src="./assets/images/splash.png" />
                </div>
                <span className="text-sm">Splash by <Link className="underline hover:text-yellow-300" target="_blank" to="https://cara.app/lorettaamaranth">Loretta</Link></span>
            </div>
            <div className="hidden md:block">
                <Links />
            </div>
        </div>
   </div>
  )
};

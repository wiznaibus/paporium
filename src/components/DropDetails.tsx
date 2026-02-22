import { Icon } from "./Icon";

export interface Drop {
    mobId: number;
    mob?: string;
    slot?: number;
    rate?: number;
    stealProtected?: boolean;
}

export const DropDetails = ({
    drops,
    mvpDrops,
}: {
    drops: Drop[],
    mvpDrops: Drop[]
}) => {

    return <>
        {drops && (
            <div className="drop flex flex-col px-1.5 pt-1 pb-2">
                <div className="header flex items-center gap-1 text-md font-semibold">
                    <Icon className="emphasis shrink-0" name="drop" />
                    Mob Drops
                </div>
                <div className="grid grid-cols-2 gap-x-2 auto-rows-min truncate text-sm">
                    {drops.map(drop =>
                        <div key={`${drop.mobId}-${drop.slot}`} className="drop-data flex items-center border-t">
                            <div className={`emphasis px-0.5 basis-10`}>{drop.mobId}</div>
                            <div className={`px-0.5 grow truncate`} title={drop.mob}>{drop.mob}</div>
                            <div className={`px-0.5 `} title="Steal protected">
                                {drop.stealProtected && <Icon className="emphasis shrink-0" name="protected" sizeClass="size-4" />}
                            </div>
                            <div className={`px-0.5 `}>{`${((drop.rate ?? 0) / 100).toFixed(2)}%`}</div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {mvpDrops && (
            <div className="drop flex flex-col px-1.5 pt-1 pb-2">
                <div className="header flex items-center gap-1 text-md font-semibold">
                    <Icon className="emphasis shrink-0" name="mvp" />
                    MVP Drops
                </div>
                <div className="grid grid-cols-2 gap-x-2 auto-rows-min truncate text-sm">
                    {mvpDrops && mvpDrops.map(drop =>
                        <div key={`${drop.mobId}-${drop.slot}`} className="drop-data flex border-t">
                            <div className={`emphasis px-0.5 basis-10`}>{drop.mobId}</div>
                            <div className={`px-0.5 grow truncate`} title={drop.mob}>{drop.mob}</div>
                            <div className={`px-0.5 `}>{`${((drop.rate ?? 0) / 100).toFixed(2)}%`}</div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </>;
};

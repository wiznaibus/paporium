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
            <div className="results flex flex-col px-1.5 pt-1 pb-2 bg-emerald-600 rounded-lg">
                <div className="flex items-center gap-1 text-amber-100 text-md font-semibold">
                    <Icon className="shrink-0 text-amber-100" name="drop" />
                    Mob Drops
                </div>
                <div className="grid grid-cols-2 gap-x-2 auto-rows-min truncate text-sm">
                    {drops.map(drop =>
                        <div key={`${drop.mobId}-${drop.slot}`} className="flex items-center border-t border-emerald-700">
                            <div className={`px-0.5 basis-10 text-amber-200`}>{drop.mobId}</div>
                            <div className={`px-0.5 grow overflow-hidden text-ellipsis`} title={drop.mob}>{drop.mob}</div>
                            <div className={`px-0.5 `}>{`${((drop.rate ?? 0) / 100).toFixed(2)}%`}</div>
                            <div className={`px-0.5 `} title="Steal protected">{drop.stealProtected && <Icon className="shrink-0 text-amber-100" name="protected" sizeClass="size-4" />}</div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {mvpDrops && (
            <div className="results flex flex-col px-1.5 pt-1 pb-2 bg-emerald-600 rounded-lg">
                <div className="flex items-center gap-1 text-amber-100 text-md font-semibold">
                    <Icon className="shrink-0 text-amber-100" name="star" />
                    MVP Drops
                </div>
                <div className="grid grid-cols-2 gap-x-2 auto-rows-min truncate text-sm">
                    {mvpDrops && mvpDrops.map(drop =>
                        <div key={`${drop.mobId}-${drop.slot}`} className="flex border-t border-emerald-700">
                            <div className={`px-0.5 basis-10 text-amber-200`}>{drop.mobId}</div>
                            <div className={`px-0.5 grow overflow-hidden text-ellipsis`} title={drop.mob}>{drop.mob}</div>
                            <div className={`px-0.5 `}>{`${((drop.rate ?? 0) / 100).toFixed(2)}%`}</div>
                            <div className={`px-0.5 `}>{drop.stealProtected && <Icon className="shrink-0 text-amber-100" name="star" />}</div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* <div className="grid grid-cols-2 gap-2 truncate text-sm">
            <div className="grid grid-cols-1 auto-rows-min">
                <div className="text-amber-100 border-t border-emerald-700">Mob</div>
                {drops && drops.map(drop =>
                    <div key={`${drop.mobId}-${drop.slot}`} className="flex border-t border-emerald-700">
                        <div className={`px-0.5 basis-10 text-amber-200`}>{drop.mobId}</div>
                        <div className={`px-0.5 grow overflow-hidden text-ellipsis`} title={drop.mob}>{drop.mob}</div>
                        <div className={`px-0.5 `}>{`${((drop.rate ?? 0) / 100).toFixed(2)}%`}</div>
                        <div className={`px-0.5 `}>{drop.stealProtected && <Icon className="shrink-0 text-amber-100" name="star" />}</div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 auto-rows-min">
                <div className="text-amber-100 border-t border-emerald-700">MVP</div>
                {mvpDrops && mvpDrops.map(drop =>
                    <div key={`${drop.mobId}-${drop.slot}`} className="flex border-t border-emerald-700">
                        <div className={`px-0.5 basis-10 text-amber-200`}>{drop.mobId}</div>
                        <div className={`px-0.5 grow overflow-hidden text-ellipsis`} title={drop.mob}>{drop.mob}</div>
                        <div className={`px-0.5 `}>{`${((drop.rate ?? 0) / 100).toFixed(2)}%`}</div>
                    </div>
                )}
            </div>
        </div> */}
    </>;
};
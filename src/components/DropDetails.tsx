import { useState, useEffect } from "react";
import initSqlJs, { type Database } from "sql.js";
import { useSearchParams } from 'react-router-dom';
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

    return <div className="results flex flex-col px-1.5 pt-1 pb-2 bg-cyan-600 rounded-lg">
        <div className="flex items-center gap-1">
            <div className="grow text-md font-semibold">Drops</div>
        </div>
        <div className="grid grid-cols-2 gap-2 truncate text-sm">
            <div className="grid grid-cols-1 auto-rows-min">
                <div className="text-amber-100 border-b border-cyan-700">Mob</div>
                {drops && drops.map(drop =>
                    <div key={`${drop.mobId}-${drop.slot}`} className="flex border-b border-cyan-700">
                        <div className={`px-0.5 basis-10 text-amber-200`}>{drop.mobId}</div>
                        <div className={`px-0.5 grow overflow-hidden text-ellipsis`} title={drop.mob}>{drop.mob}</div>
                        <div className={`px-0.5 `}>{`${((drop.rate ?? 0) / 100).toFixed(2)}%`}</div>
                        <div className={`px-0.5 `}>{drop.stealProtected && <Icon className="shrink-0 text-amber-100" name="star" />}</div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 auto-rows-min">
                <div className="text-amber-100 border-b border-cyan-700">MVP</div>
                {mvpDrops && mvpDrops.map(drop =>
                    <div key={`${drop.mobId}-${drop.slot}`} className="flex border-b border-cyan-700">
                        <div className={`px-0.5 basis-10 text-amber-200`}>{drop.mobId}</div>
                        <div className={`px-0.5 grow overflow-hidden text-ellipsis`} title={drop.mob}>{drop.mob}</div>
                        <div className={`px-0.5 `}>{`${((drop.rate ?? 0) / 100).toFixed(2)}%`}</div>
                    </div>
                )}
            </div>
        </div>
    </div>;
};
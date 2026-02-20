import { Icon } from "./Icon";

export interface Shop {
    npcId: number;
    npc?: string;
    mapId?: string;
    map?: string;
    x?: number;
    y?: number;
    slot?: number;
}

export const ShopDetails = ({
    shops,
}: {
    shops: Shop[],
}) => {

    return shops && (
        <div className="drop flex flex-col px-1.5 pt-1 pb-2">
            <div className="header flex items-center gap-1 text-md font-semibold">
                <Icon className="emphasis shrink-0" name="shop" />
                Npc Shops
            </div>
            <div className="grid grid-cols-2 gap-x-2 auto-rows-min truncate text-sm">
                {shops.map(shop =>
                    <div key={`${shop.npcId}-${shop.slot}`} className="drop-data grid grid-cols-[1fr_80px_30px_30px] border-t">
                        <div className={`px-0.5 truncate`} title={shop.npc}>{shop.npc}</div>
                        <div className={`px-0.5 truncate text-right`} title={shop.map || shop.mapId}>{shop.mapId}</div>
                        <div className={`px-0.5 text-right`} title={`${shop.x}, ${shop.y}`}><span className="emphasis">{shop.x}</span>,</div>
                        <div className={`px-0.5 emphasis text-right`} title={`${shop.x}, ${shop.y}`}>{shop.y}</div>

                    </div>
                )}
            </div>
        </div>
    );
};

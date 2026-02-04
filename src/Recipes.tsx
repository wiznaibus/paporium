import { useState, useEffect } from "react";
import initSqlJs from "sql.js";
import type { Database, QueryExecResult } from "sql.js";

export const Recipes = () => {
    const [db, setDb] = useState<Database | null>(null);
    const [data, setData] = useState<QueryExecResult[]>([]);

    useEffect(() => {
        const loadDb = async () => {
            try {
                const response = await fetch(`/db/items.sqlite`);
                const buffer = await response.arrayBuffer();

                const SQL = await initSqlJs({
                    locateFile: file => `https://sql.js.org/dist/${file}`
                });

                const loadDb = new SQL.Database(new Uint8Array(buffer));

                setDb(loadDb);
            } catch (error) {
                console.error(error);
            }
        };

        loadDb();
    }, []);

    useEffect(() => {
        if (db) {
            setData(db.exec("SELECT * FROM Recipe;"));
        }
    }, [db]);

    return (
        <div>
            <pre>
                {data.map(({ columns, values }, i) => (
                    <table key={i}>
                        <thead>
                            <tr>
                                {columns.map((columnName, i) => (
                                    <td key={i}>{columnName}</td>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {values.map((row, i) => (
                                <tr key={i}>
                                    {row.map((value, i) => (
                                        <td key={i}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ))}
            </pre>
        </div>
    );
};

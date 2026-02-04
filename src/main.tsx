import { StrictMode } from 'react';
import { HashRouter, Routes, Route } from "react-router";
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { Items } from './Items.tsx';
import { Recipes } from './Recipes.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/items" element={<Items />} />
                <Route path="/recipes" element={<Recipes />} />
            </Routes>
        </HashRouter>
    </StrictMode>
);

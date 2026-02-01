import { StrictMode } from 'react';
import { BrowserRouter, Routes, Route } from "react-router";
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { Recipes } from './Recipes.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/recipes" element={<Recipes />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);

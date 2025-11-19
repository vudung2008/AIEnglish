import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./App.tsx";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Flashcards from "./pages/Flashcards";
import Settings from "./pages/Settings";
import Test from "./pages/Test.tsx";
import Training from "./pages/Training.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "learn", element: <Learn /> },
            { path: "flashcards", element: <Flashcards /> },
            { path: "settings", element: <Settings /> },
            { path: "test", element: <Test /> },
            { path: "training", element: <Training /> },
        ],
    },
]);

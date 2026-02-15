import { createBrowserRouter } from "react-router";
import { Root } from "./components/layout/Root";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { About } from "./pages/About";
import { FAQ } from "./pages/FAQ";
import { Contact } from "./pages/Contact";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "shop/:category", Component: Shop },
      { path: "product/:id", Component: ProductDetail },
      { path: "about", Component: About },
      { path: "faq", Component: FAQ },
      { path: "contact", Component: Contact },
      { path: "*", Component: NotFound },
    ],
  },
]);

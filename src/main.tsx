import React from 'react'
import ReactDOM from 'react-dom/client'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import App from './App.tsx'

import './index.css'

import SwapPage from "@/pages/Swap";
import Page404 from "@/pages/Page404";
import PoolsPage from "@/pages/Pools";
import NewPositionPage from "@/pages/NewPosition";
import PositionPage from "@/pages/Position";

import { SWAP_PAGE_TYPE } from "@/pages/Swap/types";
import PoolPage from "@/pages/Pool/index";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App> Hello </App>,
    errorElement: <Page404 />
  },
  {
    path: '/swap',
    element: <App> <SwapPage type={SWAP_PAGE_TYPE.SWAP} /> </App>,
  },
  {
    path: '/limit-order',
    element: <App> <SwapPage type={SWAP_PAGE_TYPE.LIMIT_ORDER} /> </App>
  },
  {
    path: '/pools',
    element: <App> <PoolsPage /> </App>
  },
  {
    path: '/pools/:pool',
    element: <App> <PoolPage /> </App>
  },
  {
    path: '/pools/:pool/new-position',
    element: <App> <NewPositionPage/> </App>
  },
  {
    path: '/positions/:position',
    element: <App> <PositionPage/> </App>
  }
]);

const client = new ApolloClient({
  uri: import.meta.env.VITE_INFO_GRAPH,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>,
)

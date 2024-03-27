import React from 'react';
import ReactDOM from 'react-dom/client';

import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from 'react-router-dom';

import App from './App.tsx';

import './index.css';

import SwapPage from '@/pages/Swap';
import Page404 from '@/pages/Page404';
import PoolsPage from '@/pages/Pools';
import PoolPage from '@/pages/Pool';
import NewPositionPage from '@/pages/NewPosition';
import CreatePoolPage from '@/pages/CreatePool/index.tsx';

import { ApolloProvider } from '@apollo/client';
import { infoClient } from './graphql/clients/index.tsx';
const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate replace to={'/swap'} />,
        errorElement: <Page404 />,
    },
    {
        path: '/swap',
        element: (
            <App>
                <SwapPage />
            </App>
        ),
    },
    {
        path: '/pools',
        element: (
            <App>
                <PoolsPage />
            </App>
        ),
    },
    {
        path: '/pools/create',
        element: (
            <App>
                <CreatePoolPage />
            </App>
        ),
    },
    {
        path: '/pool/:pool',
        element: (
            <App>
                <PoolPage />
            </App>
        ),
    },
    {
        path: '/pool/:pool/new-position',
        element: (
            <App>
                <NewPositionPage />
            </App>
        ),
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ApolloProvider client={infoClient}>
            <RouterProvider router={router} />
        </ApolloProvider>
    </React.StrictMode>
);

import App from "@/App";
import PoolsList from "@/components/pools/PoolsList";
import AnalyticsPage from "@/pages/Analytics";
import CreatePoolPage from "@/pages/CreatePool";
import NewPositionPage from "@/pages/NewPosition";
import Page404 from "@/pages/Page404";
import PoolPage from "@/pages/Pool";
import PoolsPage from "@/pages/Pools";
import SwapPage from "@/pages/Swap";
import { SwapPageView } from "@/pages/Swap/types";
import { enabledModules } from "config/app-modules";
import { createBrowserRouter, Navigate, RouterProvider as _RouterProvider, RouteObject } from "react-router-dom";

import AnalyticsModule from "@/modules/AnalyticsModule";
import VeALGBPage from "@/pages/VeALGB";
import VotePage from "@/pages/Vote";
const { AnalyticsPoolPage, TransactionsList, TokensList, AnalyticsTokenPage } = AnalyticsModule.components;

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate replace to="/swap" />,
        errorElement: <Page404 />,
    },
    {
        element: <App />,
        children: [
            {
                path: "swap",
                element: <SwapPage type={SwapPageView.SWAP} />,
            },
            enabledModules.limitOrders && {
                path: "limit-order",
                element: <SwapPage type={SwapPageView.LIMIT_ORDER} />,
            },
            {
                path: "pools",
                element: <PoolsPage />,
            },
            {
                path: "pools/create",
                element: <CreatePoolPage />,
            },
            {
                path: "pool/:pool",
                element: <PoolPage />,
            },
            {
                path: "pool/:pool/new-position",
                element: <NewPositionPage />,
            },

            ...(enabledModules.analytics
                ? [
                      {
                          path: "/analytics",
                          element: (
                              <AnalyticsPage>
                                  <PoolsList isExplore />
                              </AnalyticsPage>
                          ),
                      },
                      {
                          path: "/analytics/tokens",
                          element: (
                              <AnalyticsPage>
                                  <TokensList />
                              </AnalyticsPage>
                          ),
                      },
                      {
                          path: "/analytics/transactions",
                          element: (
                              <AnalyticsPage>
                                  <TransactionsList />
                              </AnalyticsPage>
                          ),
                      },
                      {
                          path: "/analytics/tokens/:tokenId",
                          element: <AnalyticsTokenPage />,
                      },
                      {
                          path: "/analytics/pools/:poolId",
                          element: <AnalyticsPoolPage />,
                      },
                  ]
                : []),

            ...(enabledModules.ve33
                ? [
                      {
                          path: "vealgb",
                          element: <VeALGBPage />,
                      },
                      {
                          path: "vote",
                          element: <VotePage />,
                      },
                  ]
                : []),
        ].filter(Boolean) as RouteObject[],
    },
]);

export default function RouterProvider() {
    return <_RouterProvider router={router} />;
}

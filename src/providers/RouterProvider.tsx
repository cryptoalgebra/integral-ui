import App from "@/App";
import PoolsList from "@/components/pools/PoolsList";
import AnalyticsPage from "@/pages/Analytics";
import CreatePoolPage from "@/pages/CreatePool";
import Page404 from "@/pages/Page404";
import SwapPage from "@/pages/Swap";
import { SwapPageView } from "@/pages/Swap/types";
import { enabledModules } from "config/app-modules";
import { createBrowserRouter, Navigate, RouterProvider as _RouterProvider, RouteObject } from "react-router-dom";

import AnalyticsModule from "@/modules/AnalyticsModule";
import VeTOKENPage from "@/pages/VeTOKEN";
import VotePage from "@/pages/Vote";
import ExplorePage from "@/pages/Explore";
import PoolsPage from "@/pages/Pools";
const { ExplorePoolPage, TransactionsList, TokensList, AnalyticsTokenPage } = AnalyticsModule.components;

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
            enabledModules.LimitOrdersModule && {
                path: "limit-order",
                element: <SwapPage type={SwapPageView.LIMIT_ORDER} />,
            },
            {
                path: "explore",
                element: <ExplorePage />,
            },
            {
                path: "explore/tokens",
                element: <ExplorePage />,
            },
            {
                path: "explore/transactions",
                element: <ExplorePage />,
            },
            {
                path: "create-pool",
                element: <CreatePoolPage />,
            },
            {
                path: "pools",
                element: <PoolsPage />,
            },
            {
                path: "explore/pool/:poolId",
                element: <ExplorePoolPage />,
            },
            {
                path: "explore/token/:tokenId",
                element: <AnalyticsTokenPage />,
            },

            ...(enabledModules.AnalyticsModule
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
                      //   {
                      //       path: "/analytics/pools/:poolId",
                      //       element: <AnalyticsPoolPage />,
                      //   },
                  ]
                : []),

            ...(enabledModules.Ve33Module
                ? [
                      {
                          path: "vetoken",
                          element: <VeTOKENPage />,
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

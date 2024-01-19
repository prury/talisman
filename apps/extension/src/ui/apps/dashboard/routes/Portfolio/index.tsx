import { balancesFilterQuery } from "@ui/atoms"
import { stakingBannerState } from "@ui/atoms/stakingBanners"
import { useBuyTokensModal } from "@ui/domains/Asset/Buy/useBuyTokensModal"
import { useRecoilPreload } from "@ui/hooks/useRecoilPreload"
import { useEffect } from "react"
import { Route, Routes, useSearchParams } from "react-router-dom"

import { DashboardLayout } from "../../layout/DashboardLayout"
import { PortfolioAsset } from "./PortfolioAsset"
import { PortfolioAssets } from "./PortfolioAssets"

export const PortfolioRoutesInner = () => {
  useRecoilPreload(balancesFilterQuery("all"), stakingBannerState)

  return (
    <Routes>
      {/* To match popup structure, in case of expand */}
      <Route path="/assets" element={<PortfolioAssets />} />
      <Route path=":symbol" element={<PortfolioAsset />} />
      <Route path="" element={<PortfolioAssets />} />
    </Routes>
  )
}

export const PortfolioRoutes = () => {
  const [searchParams, updateSearchParams] = useSearchParams()
  const { open: openBuyTokensModal } = useBuyTokensModal()

  useEffect(() => {
    const buyTokens = searchParams.get("buyTokens")
    if (buyTokens === null) return

    openBuyTokensModal()
    searchParams.delete("buyTokens")
    updateSearchParams(searchParams, { replace: true })
  }, [openBuyTokensModal, searchParams, updateSearchParams])

  return (
    // share layout to prevent sidebar flickering when navigating between the 2 pages
    <DashboardLayout centered large>
      <PortfolioRoutesInner />
    </DashboardLayout>
  )
}

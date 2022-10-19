import { Balances } from "@core/domains/balances/types"
import { Box } from "@talisman/components/Box"
import { IconButton } from "@talisman/components/IconButton"
import PopNav from "@talisman/components/PopNav"
import { useOpenClose } from "@talisman/hooks/useOpenClose"
import { IconMore } from "@talisman/theme/icons"
import { useAccountRemoveModal } from "@ui/domains/Account/AccountRemoveModal"
import { useAccountRenameModal } from "@ui/domains/Account/AccountRenameModal"
import { useAddressFormatterModal } from "@ui/domains/Account/AddressFormatterModal"
import { ExportAccountModal } from "@ui/domains/Account/ExportJsonModal"
import { useSendTokensModal } from "@ui/domains/Asset/Send"
import { DashboardAssetsTable } from "@ui/domains/Portfolio/AssetsTable"
import { usePortfolio } from "@ui/domains/Portfolio/context"
import { FundYourWallet } from "@ui/domains/Portfolio/FundYourWallet"
import { NetworkPicker } from "@ui/domains/Portfolio/NetworkPicker"
import { useSelectedAccount } from "@ui/domains/Portfolio/SelectedAccountContext"
import { Statistics } from "@ui/domains/Portfolio/Statistics"
import { useDisplayBalances } from "@ui/domains/Portfolio/useDisplayBalances"
import { useAccountExport } from "@ui/hooks/useAccountExport"
import { useAnalytics } from "@ui/hooks/useAnalytics"
import { useAppState } from "@ui/hooks/useAppState"
import { useIsFeatureEnabled } from "@ui/hooks/useFeatures"
import React, { useCallback, useEffect, useMemo } from "react"
import styled from "styled-components"

const Stats = styled(Statistics)`
  max-width: 40%;
`
// memoise to re-render only if balances object changes
const PageContent = React.memo(({ balances }: { balances: Balances }) => {
  const { showWalletFunding } = useAppState()
  const balancesToDisplay = useDisplayBalances(balances)
  const { account } = useSelectedAccount()
  const { canExportAccount, exportAccount } = useAccountExport(account)
  const {
    open: openAccountExportModal,
    close: closeAccountExportModal,
    isOpen: isOpenAccountExportModal,
  } = useOpenClose()
  const { canRemove, open: openAccountRemoveModal } = useAccountRemoveModal()
  const { canRename, open: openAccountRenameModal } = useAccountRenameModal()
  const { open: openAddressFormatterModal } = useAddressFormatterModal()
  const { open: openSendFundsModal } = useSendTokensModal()
  const { genericEvent } = useAnalytics()

  const sendFunds = useCallback(() => {
    openSendFundsModal({ from: account?.address })
    genericEvent("open send funds", { from: "dashboard portfolio" })
  }, [account?.address, genericEvent, openSendFundsModal])

  const { portfolio, available, locked } = useMemo(() => {
    const { total, frozen, reserved, transferable } = balancesToDisplay.sum.fiat("usd")
    return {
      portfolio: total,
      available: transferable,
      locked: frozen + reserved,
    }
  }, [balancesToDisplay.sum])

  const copyAddress = useCallback(() => {
    if (!account) return
    openAddressFormatterModal(account.address)
    genericEvent("open copy address", { from: "dashboard portfolio" })
  }, [account, genericEvent, openAddressFormatterModal])

  const enableWalletFunding = useIsFeatureEnabled("WALLET_FUNDING")
  const displayWalletFunding = useMemo(
    () => !account && Boolean(showWalletFunding && enableWalletFunding),
    [account, showWalletFunding, enableWalletFunding]
  )

  return (
    <>
      {canExportAccount && account && (
        <ExportAccountModal
          close={closeAccountExportModal}
          account={account}
          isOpen={isOpenAccountExportModal}
        />
      )}

      <Box flex column fullheight>
        {displayWalletFunding ? (
          <Box margin="3.8rem 0 0 0" grow flex justify="center" align="center">
            <FundYourWallet />
          </Box>
        ) : (
          <>
            <Box flex fullwidth gap={1.6}>
              <Stats title="Total Portfolio Value" fiat={portfolio} />
              <Stats title="Locked" fiat={locked} locked />
              <Stats title="Available" fiat={available} />
              <Box grow flex justify="flex-end" align="center" gap={1.6}>
                {account && (
                  <PopNav
                    trigger={
                      <IconButton>
                        <IconMore />
                      </IconButton>
                    }
                    className="icon more"
                    closeOnMouseOut
                  >
                    <PopNav.Item onClick={sendFunds}>Send funds</PopNav.Item>
                    <PopNav.Item onClick={copyAddress}>Copy address</PopNav.Item>
                    {canRename && (
                      <PopNav.Item onClick={openAccountRenameModal}>Rename</PopNav.Item>
                    )}
                    {canExportAccount && (
                      <PopNav.Item onClick={openAccountExportModal}>Export Private Key</PopNav.Item>
                    )}
                    {canRemove && (
                      <PopNav.Item onClick={openAccountRemoveModal}>Remove Account</PopNav.Item>
                    )}
                  </PopNav>
                )}
              </Box>
            </Box>
            <Box margin="3.8rem 0 0 0">
              <NetworkPicker />
            </Box>
            <Box margin="1.2rem 0 0 0">
              <DashboardAssetsTable balances={balancesToDisplay} />
            </Box>
          </>
        )}
      </Box>
    </>
  )
})

export const PortfolioAssets = () => {
  const { networkBalances } = usePortfolio()
  const { pageOpenEvent } = useAnalytics()

  useEffect(() => {
    pageOpenEvent("portfolio assets")
  }, [pageOpenEvent])

  return <PageContent balances={networkBalances} />
}

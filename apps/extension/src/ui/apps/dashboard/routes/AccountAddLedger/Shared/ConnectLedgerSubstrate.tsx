import Spacer from "@talisman/components/Spacer"
import { LedgerConnectionStatus } from "@ui/domains/Account/LedgerConnectionStatus"
import { useLedgerSubstrate } from "@ui/hooks/ledger/useLedgerSubstrate"
import { useLedgerSubstrateApp } from "@ui/hooks/ledger/useLedgerSubstrateApp"
import useChain from "@ui/hooks/useChain"
import useToken from "@ui/hooks/useToken"
import { useEffect } from "react"

export const ConnectLedgerSubstrate = ({
  chainId,
  onReadyChanged,
  className,
}: {
  chainId: string
  onReadyChanged?: (ready: boolean) => void
  className?: string
}) => {
  const chain = useChain(chainId)
  const token = useToken(chain?.nativeToken?.id)
  const ledger = useLedgerSubstrate(chain?.genesisHash, true)
  const app = useLedgerSubstrateApp(chain?.genesisHash)

  useEffect(() => {
    onReadyChanged?.(ledger.isReady)

    return () => {
      onReadyChanged?.(false)
    }
  }, [ledger.isReady, onReadyChanged])

  if (!app) return null

  return (
    <div className={className}>
      <div className="text-body-secondary m-0">
        Connect and unlock your Ledger, then open the{" "}
        <span className="text-body">
          {app.label} {token?.symbol ? `(${token.symbol})` : null}
        </span>{" "}
        app on your Ledger.
      </div>
      <Spacer small />
      <LedgerConnectionStatus {...ledger} />
    </div>
  )
}

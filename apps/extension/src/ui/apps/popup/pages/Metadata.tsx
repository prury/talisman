import { KnownRequestIdOnly } from "@core/libs/requests/types"
import Button from "@talisman/components/Button"
import Grid from "@talisman/components/Grid"
import { notify } from "@talisman/components/Notifications"
import { api } from "@ui/api"
import { useAnalytics } from "@ui/hooks/useAnalytics"
import { useRequest } from "@ui/hooks/useRequest"
import { FC, useCallback, useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"

import Layout, { Content, Footer, Header } from "../Layout"

export const Metadata: FC<{ className?: string }> = ({ className }) => {
  const { id } = useParams<"id">() as KnownRequestIdOnly<"metadata">
  const metadataRequest = useRequest(id)
  const { popupOpenEvent } = useAnalytics()
  useEffect(() => {
    popupOpenEvent("metadata")
  }, [popupOpenEvent])

  const approve = useCallback(async () => {
    if (!metadataRequest) return
    try {
      await api.approveMetaRequest(metadataRequest.id)
      window.close()
    } catch (err) {
      notify({ type: "error", title: "Failed to update", subtitle: (err as Error).message })
    }
  }, [metadataRequest])

  const reject = useCallback(() => {
    if (!metadataRequest) return
    api.rejectMetaRequest(metadataRequest.id)
    window.close()
  }, [metadataRequest])

  const displayUrl = useMemo(
    () =>
      metadataRequest?.url
        ? new URL(metadataRequest?.url || "").origin // use origin to keep the prefixed protocol
        : metadataRequest?.url ?? "",
    [metadataRequest?.url]
  )

  if (!metadataRequest) return null

  const { request } = metadataRequest

  return (
    <Layout className={className}>
      <Header text={"Update Metadata"} />
      <Content>
        <div>
          <div className="px-4 text-center">
            <h1 className="my-8 text-lg">Your metadata is out of date</h1>
            <p className="text-body-secondary mt-16">
              Approving this update will sync your metadata for the{" "}
              <span className="text-body">{request.chain}</span> chain
              {displayUrl && (
                <>
                  {" "}
                  from <span className="text-body">{displayUrl}</span>
                </>
              )}
            </p>
          </div>
          <hr className="text-grey-700 my-20" />
          <div className="text-left">
            <div className="ml-16 inline-grid grid-cols-2 gap-x-8 gap-y-2">
              <div className="text-body-secondary">Symbol:</div>
              <div>{request.tokenSymbol}</div>
              <div className="text-body-secondary">Decimals:</div>
              <div>{request.tokenDecimals}</div>
            </div>
          </div>
        </div>
      </Content>
      <Footer>
        <Grid>
          <Button onClick={reject}>Cancel</Button>
          <Button primary onClick={approve}>
            Approve
          </Button>
        </Grid>
      </Footer>{" "}
    </Layout>
  )
}

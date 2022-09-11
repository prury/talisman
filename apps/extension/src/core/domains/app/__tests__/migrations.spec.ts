import { AccountAddressType, AccountMeta } from "@core/domains/accounts/types"
import { passwordStore } from "@core/domains/app"
import { getEthDerivationPath } from "@core/domains/ethereum/helpers"
import { AccountsStore } from "@polkadot/extension-base/stores"
import keyring from "@polkadot/ui-keyring"
import { cryptoWaitReady } from "@polkadot/util-crypto"

import { migratePasswordV1ToV2 } from "../migrations"

const mnemonic = "seed sock milk update focus rotate barely fade car face mechanic mercy"
const password = "passw0rd"

const createPair = (
  origin: AccountMeta["origin"] = "ROOT",
  derivationPath = "",
  parent?: string,
  type: AccountAddressType = "sr25519"
) => {
  const slashDerivationPath = `${type === "sr25519" ? "//" : ""}${derivationPath}`
  const options = {
    parent: origin === "ROOT" ? undefined : parent,
    derivationPath: origin === "ROOT" ? undefined : slashDerivationPath,
  }

  const { pair } = keyring.addUri(
    `${mnemonic}${origin === "DERIVED" ? slashDerivationPath : ""}`,
    password,
    {
      name: `Test Account: ${derivationPath}`,
      origin,
      ...options,
    },
    type
  )
  return pair
}

describe("App migrations", () => {
  beforeAll(async () => {
    await cryptoWaitReady()

    keyring.loadAll({ store: new AccountsStore() })
  })

  test("migrate password v1 -> v2", async () => {
    expect(await passwordStore.get("passwordVersion")).toBe(1)

    // create 4 substrate accounts
    const rootAccount = createPair()
    const indices = [1, 2, 3]
    indices.forEach((index) => {
      createPair("DERIVED", `${index}`, rootAccount.address)
    })
    // create an ethereum account
    createPair("DERIVED", getEthDerivationPath(), rootAccount.address, "ethereum")

    // ensure can decrypt keypair
    rootAccount.decodePkcs8(password)
    rootAccount.lock()

    //run migration
    const result = await migratePasswordV1ToV2(password)
    expect(result).toBeTruthy()

    expect(await passwordStore.get("passwordVersion")).toBe(2)

    const hashedPw = passwordStore.getPassword()
    expect(hashedPw === "$2a$13$7AHTA/Vs6L.Yhj0P12wlo.nV9cP0/YiID9TtHCjLroCQdETKafqVa")
    expect(hashedPw !== password)
    const newRootAccounts = keyring.getPairs().filter(({ meta }) => meta.origin === "ROOT")
    expect(newRootAccounts.length === 1)
    const newRootAccount = newRootAccounts[0]

    newRootAccount.decodePkcs8(hashedPw)
    expect(!newRootAccount.isLocked)
  })
})

// load bearing export
export {}

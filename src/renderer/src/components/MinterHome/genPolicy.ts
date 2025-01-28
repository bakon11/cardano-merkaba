import {
  Address,
  PScriptContext,
  PTokenName,
  ScriptType,
  Credential,
  Script,
  compile,
  pfn,
  unit,
  passert,
  NetworkT,
  pmatch,
  pBool,
  pisEmpty
} from '@harmoniclabs/plu-ts'
import { toUtf8, fromHex, toHex, fromAscii, toAscii } from '@harmoniclabs/uint8array-utils'

export const genPolicy = (tokenPolicyName) => {
  const network = localStorage.getItem('networkSelect') || 'testnet'
  const namedTokenPolicy = pfn(
    [PTokenName.type, PScriptContext.type],
    unit
  )((tn, { redeemer, tx, purpose }) => {
    return passert.$(true)
  })

  const policySrc = namedTokenPolicy.$(fromAscii(tokenPolicyName))

  const scriptCompiled = new Script(ScriptType.PlutusV3, compile(policySrc))
  console.log('policy: ', scriptCompiled.toCbor().toString())

  const scriptAddr = new Address(network as NetworkT, Credential.script(scriptCompiled.hash))
  console.log('Script address: ', scriptAddr)

  return { scriptCompiled, scriptAddr, policyID: scriptAddr.paymentCreds.hash }
}

export const genPolicy2 = (tokenPolicyName) => {
  const network = localStorage.getItem('networkSelect') || 'testnet'

  const namedTokenPolicy = pfn(
    [PTokenName.type, PScriptContext.type],
    unit
  )((tn, { tx, purpose }) =>
    passert.$(
      pmatch(purpose)
        .onSpending(() => pBool(false))
        .onMinting(({ currencySym }) =>
          tx.mint.some(({ fst: policy, snd: assets }) =>
            policy.eq(currencySym).and(pisEmpty.$(assets.tail).strictAnd(assets.head.fst.eq(tn)))
          )
        )
        ._((_) => pBool(false))
    )
  )
  const aPolicySrc = namedTokenPolicy.$(fromAscii(tokenPolicyName))

  const scriptCompiled = new Script(ScriptType.PlutusV3, compile(aPolicySrc))
  console.log('Script: ', scriptCompiled)

  const scriptAddr = new Address(network as NetworkT, Credential.script(scriptCompiled.hash))
  console.log('Script address: ', scriptAddr)

  return { scriptCompiled, scriptAddr, policyID: scriptAddr.paymentCreds.hash }
}

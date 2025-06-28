import { PScriptContext, PTokenName, compile, pfn, unit, passert, pmatch, pBool, pisEmpty } from '@harmoniclabs/plu-ts'
import { Script, ScriptType, Hash28, Address, Credential, NetworkT } from '@harmoniclabs/buildooor'
import { fromAscii } from '@harmoniclabs/uint8array-utils'

export const genPolicy = (tokenPolicyName) => {
  const network = localStorage.getItem('networkSelect') || 'testnet';

  const namedTokenPolicy = pfn(
    [PTokenName.type, PScriptContext.type],
    unit
  )((tn, { redeemer, tx, purpose }) => {
    return passert.$(true)
  })

  const policySrc = namedTokenPolicy.$(fromAscii(tokenPolicyName))

  const scriptCompiled = new Script(
    ScriptType.PlutusV3, 
    compile(policySrc)
  )
  console.log('policy: ', new Hash28(scriptCompiled.hash).toString())

  const scriptAddr = new Address({
      network: "testnet",
      paymentCreds: Credential.script(scriptCompiled.hash),
    })

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

  const scriptCompiled = new Script(
      ScriptType.PlutusV3, 
       compile(aPolicySrc)
  )
  console.log('Script: ', scriptCompiled)

  const scriptAddr = new Address({
    network: network as NetworkT, 
    paymentCreds: Credential.script(scriptCompiled.hash.toString())
  })
  console.log('Script address: ', scriptAddr)

  return { scriptCompiled, scriptAddr, policyID: scriptAddr.paymentCreds.hash }
}

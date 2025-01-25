import {
  Address,
  PScriptContext,
  ScriptType,
  Credential,
  Script,
  compile,
  pfn,
  unit,
  passert
} from '@harmoniclabs/plu-ts'

const contract = pfn(
  [PScriptContext.type],
  unit
)(({ redeemer, tx, purpose }) => {
  return passert.$(true)
})

export const compiledContract = compile(contract, [1,1,5])
// console.log("Compiled contract: ", compiledContract)

export const script = new Script(ScriptType.PlutusV3, compiledContract)
// console.log("Script: ", script)

export const scriptAddr = new Address('testnet', Credential.script(script.hash))
// console.log("Script address: ", scriptAddr)

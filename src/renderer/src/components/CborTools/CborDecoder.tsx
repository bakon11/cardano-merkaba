import * as React from 'react';
import { Sheet, Typography, Button } from '@mui/joy';
import { Cbor, CborString, CborText } from '@harmoniclabs/cbor';
import { toHex } from '@harmoniclabs/buildooor';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-ambiance';
import 'ace-builds/src-noconflict/theme-terminal';

export const CborDecoder: React.FC = () => {
  const [cborHex, setCborHex] = React.useState<string>("");
  const [decoded, setDecoded] = React.useState<string>("");
  const [decodedFontSize, setDecodedFontSize] = React.useState<number>(10);

  async function decodeCbor() {
    console.log(cborHex);
    const cborObj = Cbor.parse(cborHex.trim() as string);
    const cborObjParsed = JSON.stringify(
      cborObj.toRawObj(),
      (k, v) => {
        if (typeof v === "bigint") return v.toString();
        if (v instanceof Uint8Array) return toHex(v);
        return v;
      },
      2 // indentation
    );
    setDecoded(cborObjParsed);
    console.log(cborObjParsed);
  };

  React.useEffect(() => {
    // decodeCbor();
  }, [cborHex])

  return (
    <Sheet sx={{ width: '100%', height: '100%', bgcolor: 'background.level1', borderRadius: 'sm', p: 2 }}>
      <Typography level="h4">CBOR Decoder</Typography>
      {decoded ? (
        <>
        <AceEditor
            mode="json"
            theme="terminal"
            value={decoded}
            onChange={setDecoded}
            name="decoded-editor"
            editorProps={{ $blockScrolling: true }}
            style={{ 
                width: '100%',
                maxHeight: 1200,
                minHeight: 1000,
                fontSize: decodedFontSize,
            }}
            wrapEnabled={true}
            
        />
          <Button onClick={() => setDecoded("")}>CLEAR</Button>
        </>
      ) : (
        <>
        <AceEditor
            mode="hex" // You can set to "hex" if supported, or use "text" for raw input
            theme="terminal"
            value={cborHex}
            onChange={setCborHex}
            name="hex-editor"
            editorProps={{ $blockScrolling: true }}
            style={{ 
                width: '100%',
                maxHeight: 1200,
                minHeight: 1000,
                fontSize: decodedFontSize,
            }}
            wrapEnabled={true}
        />    
          <Button onClick={() => decodeCbor()}>Decode CBOR</Button>
        
        </>
      )}
      <Button onClick={() => setDecodedFontSize(decodedFontSize + 1)}>+</Button>
      <Button onClick={() => setDecodedFontSize(decodedFontSize - 1)}>-</Button>
    </Sheet>
  );
};
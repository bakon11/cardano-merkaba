import * as React from 'react'
import Sheet from '@mui/joy/Sheet'

export const TemplateView: React.FC = () => {
  return (
    <Sheet
      sx={{
        top: 60,
        left: 60,
        width: 1200,
        height: 800,
        overflowY: 'auto',
        p: 4,
        bgcolor: 'background.body',
        color: 'text.primary'
      }}
    ></Sheet>
  )
}

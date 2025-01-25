import * as React from 'react'
import { Sheet, Typography } from '@mui/joy'

export const TemplateView: React.FC = () => {
  return (
    <>
      <Typography level="h4">Title</Typography>
      <Sheet
        sx={{
          top: 60,
          left: 60,
          width: 1200,
          height: 'auto',
          maxHeight: 800,
          overflowY: 'scroll',
          p: 4,
          bgcolor: 'background.body',
          color: 'text.primary'
        }}
      ></Sheet>
    </>
  )
}

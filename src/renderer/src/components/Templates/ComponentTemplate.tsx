import * as React from 'react'
import { Sheet, Typography } from '@mui/joy'

export const TemplateView: React.FC = () => {
  return (
    <>
      <Typography level="h4">Title</Typography>
      <Sheet
        sx={{
          top: 30,
          left: 60,
          width: "80vw",
          height: "90vh",
          overflowY: 'auto',
          p: 4,
          bgcolor: 'background.body',
          color: 'text.primary'
        }}
      >

        
      </Sheet>
    </>
  )
}

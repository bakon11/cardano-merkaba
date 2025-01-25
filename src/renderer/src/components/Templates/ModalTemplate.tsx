import * as React from 'react';
import { Modal, ModalClose, ModalDialog, Typography, Sheet } from '@mui/joy';

export const ModalTemplate: React.FC = () => {
  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <>
      <Typography 
        level="h4" 
        onClick={() => setOpen(true)}
        style={{ cursor: 'pointer' }}
      >
        Open Modal
      </Typography>
      <Modal 
        open={open} 
        onClose={() => setOpen(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <ModalDialog 
          sx={{
            width: '1200px',
            maxWidth: '100%',
            maxHeight: '800px',
            overflowY: 'auto',
            p: 4,
            bgcolor: 'background.body',
            color: 'text.primary'
          }}
        >
          <ModalClose />
          <Typography level="h4">Modal Title</Typography>
          <Sheet 
            sx={{
              height: 'auto',
              // Add any additional styling for content within the modal here
            }}
          >
            {/* Modal content can go here */}
          </Sheet>
        </ModalDialog>
      </Modal>
    </>
  );
};
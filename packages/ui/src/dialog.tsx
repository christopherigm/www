import MUIDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Languages from '@repo/interfaces/languages';

type Props = {
  children?: any;
  language: Languages;
  title: string;
  text?: string;
  open: boolean;
  onAgreed: () => void;
  onCancel?: () => void;
  cancelEnabled?: boolean;
};

const Dialog = ({
  children,
  language,
  title,
  text,
  open,
  onAgreed,
  onCancel,
  cancelEnabled = true,
}: Props) => {
  return (
    <>
      {open ? (
        <MUIDialog
          open={open}
          keepMounted
          onClose={() => (onCancel !== undefined ? onCancel() : null)}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {children}
              {text}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {cancelEnabled ? (
              <Button
                onClick={() => (onCancel !== undefined ? onCancel() : null)}
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
            ) : null}
            <Button onClick={() => onAgreed()}>
              {language === 'en' ? 'OK' : 'Aceptar'}
            </Button>
          </DialogActions>
        </MUIDialog>
      ) : null}
    </>
  );
};

export default Dialog;

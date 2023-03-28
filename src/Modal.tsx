import { useEffect } from 'react';

function Modal({ children, visibility, setVisibility }: any) {

  const modalStyle = {
    top: 0,
    position: 'fixed',
    minHeight: '100vh',
    minWidth: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItem: 'center',
  };

  const modalContainer = {
    padding: '50px 50px 0px 50px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    minHeight: '100vh',
    minWidth: '100vw',
  }

  const modalContent = {
    backgroundColor: 'white',
    width: 'calc(100vw - 100px)',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'scroll',
  }

  useEffect(() => {
    if (visibility)
      document.documentElement.style.overflow = 'hidden';
    else
      document.documentElement.style.overflow = 'auto';
  }, [visibility]);

  function close(evt: any) {
    setVisibility(false);
  }

  function stopBubble(evt: any) {
    evt.preventDefault();
    evt.stopPropagation();
  }
  return (
    <div style={{ ...modalStyle, visibility: visibility ? 'visible' : 'hidden' }} onClick={close}>
      {
        visibility &&
        <div style={modalContainer}>
          <div onClick={stopBubble} style={modalContent}>{children}</div>
        </div>
      }
    </div>
  )
}

export default Modal

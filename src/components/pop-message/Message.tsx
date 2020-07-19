import React, { useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

const MessageBox = styled.div`
  min-width: 8rem;
  max-width: 12rem;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  border-radius: 0.5rem;
  text-align: center;
  padding: 0.5rem 1rem;
  pointer-events: all;
`;

export interface MessageProps {
  className?: string;
  duration?: number | null;
  children?: React.ReactNode;
  closable?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onClose?: () => void;

  container?: HTMLDivElement;
}

const Message: React.FC<MessageProps> = ({ closable, duration, onClick, children, container, onClose }) => {
  let closeTimer = useRef<number | null>(null);
  let onCloseRef = useRef(onClose || (() => {}));

  const clearTimerClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const close = useCallback(() => {
    clearTimerClose();
    onCloseRef.current();
  }, [clearTimerClose]);

  const startTimerClose = useCallback(() => {
    if (duration) {
      closeTimer.current = window.setTimeout(() => {
        close();
      }, duration);
    }
  }, [duration, close]);

  React.useEffect(() => {
    startTimerClose();
    return () => {
      clearTimerClose();
    };
  }, [startTimerClose, clearTimerClose]);

  //fixme...事件没生效
  const node = (
    <MessageBox onMouseEnter={clearTimerClose} onMouseLeave={startTimerClose} onClick={onClick}>
      <div>{children}</div>
      {closable ? (
        <div onClick={close}>
          <span />
        </div>
      ) : null}
    </MessageBox>
  );

  return container ? ReactDOM.createPortal(node, container) : node;
};

export default Message;

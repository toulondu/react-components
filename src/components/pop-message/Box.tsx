import React from "react";
import ReactDOM from "react-dom";
import Message, { MessageProps } from "./Message";
import styled from "styled-components";

const MessageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1020;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`;

let seed = 0;

const getKey = () => {
  seed += 1;
  return `message_${seed}`;
};

export interface BoxProps {
  maxCount?: number;
}

//MessageBox内可以装载多个MessageItem
export interface MessageItem extends Omit<MessageProps, "children"> {
  content?: React.ReactNode;
  key?: React.Key;
}

interface BoxState {
  msgs: MessageItem[];
}

export interface MessageBoxInstance {
  hint: (msg: MessageItem) => void;
  removeMsg: (key: React.Key) => void;
  destroy: () => void;
}

class MessageBox extends React.Component<BoxProps, BoxState> {
  state: BoxState = {
    msgs: [],
  };
  static newBoxInstance: (
    props: BoxProps & { getContainer?: () => HTMLElement },
    callback: (instance: MessageBoxInstance) => void
  ) => void;

  add(msg: MessageItem) {
    msg.key = msg.key || getKey();
    let newMsgs = this.state.msgs.concat();
    newMsgs.push(msg);
    this.setState({
      msgs: newMsgs,
    });
  }

  remove(key: React.Key) {
    this.setState((preState) => ({
      msgs: preState.msgs.filter((msg) => msg.key !== key),
    }));
  }

  render() {
    const { msgs } = this.state;
    const nodes = msgs.map((msg) => {
      const closeMsg = () => {
        this.remove.call(this, msg.key!);
        msg.onClose && msg.onClose();
      };

      const msgProps = {
        ...msg,
        onClose: closeMsg,
        children: msg.content,
      };

      return <Message {...msgProps} />;
    });

    return <MessageContainer>{nodes}</MessageContainer>;
  }
}

MessageBox.newBoxInstance = (props, callBack) => {
  const { getContainer, ...otherProps } = props || {};
  const div = document.createElement("div");
  if (getContainer) {
    const root = getContainer();
    root.appendChild(div);
  } else {
    document.body.appendChild(div);
  }

  let called = false;
  function ref(box: MessageBox) {
    if (called) return;
    called = true;

    callBack({
      hint(msgProps) {
        box.add(msgProps);
      },
      removeMsg(key) {
        box.remove(key);
      },
      destroy() {
        ReactDOM.unmountComponentAtNode(div);
        if (div.parentNode) div.parentNode.removeChild(div);
      },
    });
  }

  ReactDOM.render(<MessageBox {...otherProps} ref={ref} />, div);
};

export default MessageBox;

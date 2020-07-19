import React from "react";
import MessageBox from "./Box";
import { MessageBoxInstance } from "./Box";
import styled from "styled-components";
import success_icon from "./success_icon.png";
import warning_icon from "./exception_icon.png";

const DivOut = styled.div`
  p {
    margin: 0;
  }
  img {
    width: 2rem;
    height: 2rem;
  }
`;

let msgInstance: MessageBoxInstance | null;
let seed = 0;
const DEFAULT_DURATION = 3000; //message默认存在时间
type msgType = "info" | "success" | "error";

//不同类型msg对应的图标资源名称
const msgIcons = {
  info: success_icon,
  success: success_icon,
  error: warning_icon,
};

export interface ConfigOptions {
  duration?: number;
  getContainer?: () => HTMLElement;
  maxCount?: number;
}

type contentType = React.ReactNode | string;
type durationType = number | (() => void);
export interface MessageApi {
  info(content: contentType, duration?: durationType, onClose?: () => void): () => void;
  success(content: React.ReactNode | string, duration?: durationType, onClose?: () => void): () => void;
  error(content: React.ReactNode | string, duration?: durationType, onClose?: () => void): () => void;
  warn(content: React.ReactNode | string, duration?: durationType, onClose?: () => void): () => void;
  warning(content: React.ReactNode | string, duration?: durationType, onClose?: () => void): () => void;
  open(args: HintArgs): void;

  //销毁注册在DOM上的元素
  destroy(): void;
}

function getBoxInstance(callback: (instance: MessageBoxInstance) => void) {
  if (msgInstance) {
    callback(msgInstance);
    return;
  }

  MessageBox.newBoxInstance({}, (instance: MessageBoxInstance) => {
    if (msgInstance) {
      callback(msgInstance);
      return;
    }
    msgInstance = instance;
    callback(instance);
  });
}

export interface HintArgs {
  content: React.ReactNode;
  duration: number | undefined;
  type: msgType;
  onClose?: () => void;
  key?: number | string;
}

function hint(args: HintArgs) {
  const { content, duration = DEFAULT_DURATION, type, onClose, key = ++seed } = args;

  const closePromise = new Promise((resolve) => {
    const callback = () => {
      onClose && onClose();
      return resolve(true);
    };
    getBoxInstance((instance) => {
      instance.hint({
        key: key,
        duration,
        content: (
          <DivOut>
            <img src={msgIcons[type]} alt="icon" />
            <p>{content}</p>
          </DivOut>
        ),
        onClose: callback,
      });
    });
  });
  const res: any = () => {
    if (msgInstance) {
      msgInstance.removeMsg(key);
    }
  };
  res.then = (filled: any, rejected: any) => closePromise.then(filled, rejected);
  return res;
}

const msg: any = {
  open: hint,
  destroy() {
    if (msgInstance) {
      msgInstance.destroy();
      msgInstance = null;
    }
  },
};

const types = ["info", "success", "error"];
for (let type of types) {
  msg[type] = (content: contentType, duration?: number | (() => void), onClose?: () => void) => {
    if (typeof duration === "function") {
      onClose = duration;
      duration = undefined;
    }

    msg.open({
      content,
      duration,
      type: type as msgType,
      onClose,
    });
  };
}

msg.warning = msg.warn = msg.error;

export default msg as MessageApi;

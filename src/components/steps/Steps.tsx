//todo unit test
import React, { FC, cloneElement } from "react";
import styled from "styled-components";

export interface IStepsProps {
  direction?: "horizontal" | "vertical"; //预留：指定步骤条方向。
  labelPlacement?: "horizontal" | "vertical"; //预留：指定标签放置位置，horizontal水平放图标，vertical 放图标下方
  size?: "default" | "small" | "big"; //预留：指定大小
  current?: number; //指定当前步骤，从 0 开始记数。在子 Step 元素中，可以通过 status 属性覆盖状态
  onChange?: (current: number) => void; //点击切换步骤时触发
  children?: React.ReactNode;
  className?: string; //最外层元素className
}

enum stepStatus {
  WAIT = "wait",
  PROCESS = "process",
  FINISH = "finish",
  ERROR = "error",
}

function getStatus(current: number, stepNumber: number): string {
  if (current === stepNumber) return stepStatus.PROCESS;
  if (current > stepNumber) return stepStatus.FINISH;
  if (current < stepNumber) return stepStatus.WAIT;
  return stepStatus.ERROR;
}

const Steps: FC<IStepsProps> = ({ current = 0, onChange, children, className }) => {
  const filteredChildren = React.Children.toArray(children).filter((c) => !!c);

  const onStepClick = (next: number) => {
    if (onChange && current !== next) {
      onChange(next);
    }
  };

  return (
    <FlexContainer className={className}>
      {filteredChildren
        ? filteredChildren.map((child, index) => {
            let status = getStatus(current, index);

            let childProps = {
              stepNumber: `${index + 1}`,
              stepIndex: index,
              key: index,
              onClick: onChange && onStepClick,
              ...(child as any).props,
              status,
            };

            return cloneElement(child as any, childProps);
          })
        : null}
    </FlexContainer>
  );
};

export default Steps;

const FlexContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

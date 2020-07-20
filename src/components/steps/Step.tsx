import React, { FC, ReactNode } from "react";
import styled, { css } from "styled-components";

export interface IStepProps {
  status?: "wait" | "process" | "finish" | "error"; //指定状态
  icon?: ReactNode;
  description?: string | ReactNode;
  title?: string | ReactNode;
  stepNumber?: number;
  stepIndex?: number;
  disabled?: boolean; //预留
  onClick?: (next: number) => void;
}

const Step: FC<IStepProps> = ({
  status = "wait",
  icon,
  description = null,
  stepNumber,
  stepIndex,
  title = null,
  onClick,
}) => {
  if (!icon) {
    icon = (
      <StepIcon
        status={status}
        onClick={() => {
          onClick && onClick(stepIndex as number);
        }}
      >
        {stepNumber}
      </StepIcon>
    );
  }
  return (
    <FlexItem>
      <InlineDiv className="icon">
        {icon}
        <ContentDiv>
          {title ? <div>{title}</div> : null}
          <div>{description}</div>
        </ContentDiv>
      </InlineDiv>
    </FlexItem>
  );
};

export default Step;

interface IColor {
  [key: string]: string;
}

const iconColor: IColor = {
  error: "#D83A22",
  wait: "#D6D6D6",
  process: "#428DF4",
  finish: "#428DF4",
};

const lineColor: IColor = {
  error: "#D83A22",
  wait: "#D6D6D6",
  process: "#D6D6D6",
  finish: "#428DF4",
};

export const StepIcon = styled.span<{ status: string }>`
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  line-height: 1.5rem;
  text-align: center;
  color: #ffffff;
  margin: 0 auto;
  position: relative;
  ${(props) =>
    props.status &&
    css`
      background: ${iconColor[props.status]};
      ::after {
        background: ${lineColor[props.status]};
      }
    `};
`;

const InlineDiv = styled.div`
  display: inline-block;
`;

const ContentDiv = styled.div`
  div {
    margin-top: 0.5rem;
  }
`;

const FlexItem = styled.div`
  overflow: hidden;
  :not(:last-child) {
    flex: 1;
    span {
      &::after {
        content: "";
        position: absolute;
        padding-right: 100%;
        width: 9999px;
        height: 1px;
        top: 0.75rem;
        left: 2rem;
      }
    }
  }
`;

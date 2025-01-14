import React, { ReactNode } from "react";

interface InfoMessageProps {
  title: string;
  children: React.ReactNode;
}
interface ErrorMessageProps {
  title: string;
  children: React.ReactNode;
}
interface SuccessMessageProps {
  title: string;
  children: React.ReactNode;
}
// TODO Delete if past october and not used
/* eslint-disable @typescript-eslint/no-unused-vars */
const ErrorMessage = ({ title, children }: ErrorMessageProps) => (
  <>
    <div role="alert" className="fr-alert fr-alert--error">
      <p className="fr-alert__title">{title}</p>
      <p>{children}</p>
    </div>
  </>
);

// TODO Delete if past october and not used
/* eslint-disable @typescript-eslint/no-unused-vars */
const InfoMessage = ({ children, title }: InfoMessageProps) => (
  <>
    <div role="alert" className="fr-alert fr-alert--info">
      <p className="fr-alert__title">{title}</p>
      <p>{children}</p>
    </div>
  </>
);

// TODO Delete if past october and not used
/* eslint-disable @typescript-eslint/no-unused-vars */
const SuccessMessage = ({ title, children }: SuccessMessageProps) => (
  <div role="alert" className="fr-alert fr-alert--success">
    <p className="fr-alert__title">{title}</p>
    {children}
  </div>
);

type NotificationType = "success" | "info" | "error" | "warning";

export type NotificationProperties = {
  title: string;
  type: NotificationType;
  children: ReactNode;
  className?: string;
};
export const Notification = ({
  title,
  type,
  children,
  className,
}: NotificationProperties) => (
  <div
    role="alert"
    className={`fr-alert fr-alert--${type} ${className ? className : ""}`}
  >
    {title !== "" && <p className="fr-alert__title">{title}</p>}
    {children}
  </div>
);

import React from "react";

type AvatarProps = React.HTMLAttributes<HTMLDivElement>;

type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

type AvatarFallbackProps = React.HTMLAttributes<HTMLSpanElement>;

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ children, ...props }, ref) => (
    <div
      ref={ref}
      data-testid="avatar-root"
      {...props}
    >
      {children}
    </div>
  )
);
Avatar.displayName = "AvatarMock";

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  (props, ref) => (
    <img
      ref={ref}
      data-testid="avatar-image"
      {...props}
    />
  )
);
AvatarImage.displayName = "AvatarImageMock";

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ children, ...props }, ref) => (
    <span
      ref={ref}
      data-testid="avatar-fallback"
      {...props}
    >
      {children}
    </span>
  )
);
AvatarFallback.displayName = "AvatarFallbackMock";

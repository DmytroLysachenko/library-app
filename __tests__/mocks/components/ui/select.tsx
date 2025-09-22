import React from "react";

type SelectContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const SelectContext = React.createContext<SelectContextValue>({});

export const Select = ({
  value,
  onValueChange,
  children,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}) => (
  <SelectContext.Provider value={{ value, onValueChange }}>
    <div data-testid="select-root">{children}</div>
  </SelectContext.Provider>
);

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    data-testid="select-trigger"
    {...props}
  >
    {children}
  </button>
));
SelectTrigger.displayName = "SelectTriggerMock";

export const SelectValue = ({
  placeholder,
}: {
  placeholder?: string;
}) => {
  const { value } = React.useContext(SelectContext);
  return (
    <span data-testid="select-value">{value || placeholder || null}</span>
  );
};

export const SelectContent = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-testid="select-content"
    {...props}
  >
    {children}
  </div>
);

export const SelectItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ value, children, onClick, type = "button", ...props }, ref) => {
  const { onValueChange } = React.useContext(SelectContext);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onValueChange?.(value);
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type={type}
      data-testid={`select-item-${value}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});
SelectItem.displayName = "SelectItemMock";

export const SelectGroup = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="select-group">{children}</div>
);

export const SelectSeparator = () => (
  <div data-testid="select-separator" />
);

export const SelectScrollUpButton = () => (
  <button data-testid="select-scroll-up" />
);

export const SelectScrollDownButton = () => (
  <button data-testid="select-scroll-down" />
);

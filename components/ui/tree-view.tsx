"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Types and Interfaces
interface TreeViewElement {
  id: string;
  name: string;
  isSelectable?: boolean;
  children?: TreeViewElement[];
}

interface TreeContextProps {
  selectedId: string | undefined;
  expandedItems: string[];  // Remove undefined
  indicator: boolean;
  handleExpand: (id: string) => void;
  selectItem: (id: string) => void;
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
  openIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  direction: "rtl" | "ltr";
}

interface TreeViewProps extends React.HTMLAttributes<HTMLDivElement> {
  initialSelectedId?: string;
  indicator?: boolean;
  elements: TreeViewElement[];
  initialExpandedItems?: string[];
  openIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
}

// Context
const TreeContext = createContext<TreeContextProps | null>(null);

const useTree = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("useTree must be used within a TreeProvider");
  }
  return context;
};

// Main Tree Component
const Tree = forwardRef<HTMLDivElement, TreeViewProps>(
  (
    {
      className,
      elements,
      initialSelectedId,
      initialExpandedItems = [],
      children,
      indicator = true,
      openIcon,
      closeIcon,
      dir,
    },
    ref
  ) => {
    const [selectedId, setSelectedId] = useState<string | undefined>(
      initialSelectedId
    );
    const [expandedItems, setExpandedItems] =
      useState<string[]>(initialExpandedItems);

    const selectItem = useCallback((id: string) => {
      setSelectedId(id);
    }, []);

    const handleExpand = useCallback((id: string) => {
      setExpandedItems((prev) => {
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        }
        return [...prev, id];
      });
    }, []);

    const expandSpecificTargetedElements = useCallback(
      (elements: TreeViewElement[], selectId: string) => {
        const findParent = (
          currentElement: TreeViewElement,
          currentPath: string[] = []
        ) => {
          const isSelectable = currentElement.isSelectable ?? true;
          const newPath = [...currentPath, currentElement.id];

          if (currentElement.id === selectId) {
            if (isSelectable) {
              setExpandedItems((prev) => [...prev, ...newPath]);
            } else {
              if (newPath.includes(currentElement.id)) {
                newPath.pop();
                setExpandedItems((prev) => [...prev, ...newPath]);
              }
            }
            return;
          }

          if (isSelectable && currentElement.children?.length) {
            currentElement.children.forEach((child) => {
              findParent(child, newPath);
            });
          }
        };

        elements.forEach((element) => {
          findParent(element);
        });
      },
      []
    );

    useEffect(() => {
      if (initialSelectedId && elements) {
        expandSpecificTargetedElements(elements, initialSelectedId);
      }
    }, [initialSelectedId, elements, expandSpecificTargetedElements]);

    const direction = dir === "rtl" ? "rtl" : "ltr";

    return (
      <TreeContext.Provider
        value={{
          selectedId,
          expandedItems,
          handleExpand,
          selectItem,
          setExpandedItems,
          indicator,
          openIcon,
          closeIcon,
          direction,
        }}
      >
        <div className={cn("size-full", className)}>
          <ScrollArea
            ref={ref}
            className="relative h-full px-2"
            dir={direction}
          >
            <AccordionPrimitive.Root
              type="multiple"
              value={expandedItems ?? []}
              defaultValue={initialExpandedItems}
              className="flex flex-col gap-1"
              onValueChange={(value: string[]) => {
                setExpandedItems(value);
              }}
              dir={direction}
            >
              {children}
            </AccordionPrimitive.Root>
          </ScrollArea>
        </div>
      </TreeContext.Provider>
    );
  }
);

Tree.displayName = "Tree";

// TreeIndicator Component
const TreeIndicator = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { direction } = useTree();

  return (
    <div
      dir={direction}
      ref={ref}
      className={cn(
        "absolute left-1.5 h-full w-px rounded-md bg-muted py-3 duration-300 ease-in-out hover:bg-slate-300 rtl:right-1.5",
        className
      )}
      {...props}
    />
  );
});

TreeIndicator.displayName = "TreeIndicator";

// Folder Component
interface FolderProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  element: string;
  value: string;
  isSelectable?: boolean;
  isSelect?: boolean;
}

const Folder = forwardRef<HTMLDivElement, FolderProps>(
  (
    {
      className,
      element,
      value,
      isSelectable = true,
      isSelect,
      children,
      ...props
    },
    ref
  ) => {
    const {
      direction,
      handleExpand,
      expandedItems,
      indicator,
      setExpandedItems,
      openIcon,
      closeIcon,
    } = useTree();

    return (
      <AccordionPrimitive.Item
        {...props}
        value={value}
        className="relative h-full overflow-hidden"
        ref={ref}
      >
        <AccordionPrimitive.Trigger
          className={cn(
            `flex items-center gap-1 rounded-md text-sm`,
            className,
            {
              "bg-muted rounded-md": isSelect && isSelectable,
              "cursor-pointer": isSelectable,
              "cursor-not-allowed opacity-50": !isSelectable,
            }
          )}
          disabled={!isSelectable}
          onClick={() => handleExpand(value)}
        >
          {expandedItems.includes(value)
            ? openIcon ?? <FolderOpenIcon className="size-4" />
            : closeIcon ?? <FolderIcon className="size-4" />}
          <span>{element}</span>
        </AccordionPrimitive.Trigger>
        <AccordionPrimitive.Content className="relative h-full overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          {element && indicator && <TreeIndicator aria-hidden="true" />}
          <AccordionPrimitive.Root
            dir={direction}
            type="multiple"
            className="ml-5 flex flex-col gap-1 py-1 rtl:mr-5"
            value={expandedItems}
            onValueChange={(value) => {
              setExpandedItems((prev) => [...prev, value[0]]);
            }}
          >
            {children}
          </AccordionPrimitive.Root>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    );
  }
);

Folder.displayName = "Folder";

// File Component
interface FileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  isSelectable?: boolean;
  isSelect?: boolean;
  fileIcon?: React.ReactNode;
}

const File = forwardRef<HTMLButtonElement, FileProps>(
  (
    {
      value,
      className,
      isSelectable = true,
      isSelect,
      fileIcon,
      children,
      ...props
    },
    ref
  ) => {
    const { direction, selectedId, selectItem } = useTree();
    const isSelected = isSelect ?? selectedId === value;

    return (
      <button
        ref={ref}
        type="button"
        disabled={!isSelectable}
        className={cn(
          "flex w-fit items-center gap-1 rounded-md pr-1 text-sm duration-200 ease-in-out rtl:pl-1 rtl:pr-0",
          {
            "bg-muted": isSelected && isSelectable,
          },
          isSelectable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
          direction === "rtl" ? "rtl" : "ltr",
          className
        )}
        onClick={() => selectItem(value)}
        {...props}
      >
        {fileIcon ?? <FileIcon className="size-4" />}
        {children}
      </button>
    );
  }
);

File.displayName = "File";

// CollapseButton Component
interface CollapseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  elements: TreeViewElement[];
  expandAll?: boolean;
}

const CollapseButton = forwardRef<HTMLButtonElement, CollapseButtonProps>(
  ({ className, elements, expandAll = false, children, ...props }, ref) => {
    const { expandedItems, setExpandedItems } = useTree();

    const expandAllTree = useCallback(
      (elements: TreeViewElement[]) => {
        const expandTree = (element: TreeViewElement) => {
          const isSelectable = element.isSelectable ?? true;
          if (isSelectable && element.children?.length) {
            setExpandedItems((prev) => [...prev, element.id]);
            element.children.forEach(expandTree);
          }
        };

        elements.forEach(expandTree);
      },
      [setExpandedItems]
    );

    const closeAll = useCallback(() => {
      setExpandedItems([]);
    }, [setExpandedItems]);

    useEffect(() => {
      if (expandAll) {
        expandAllTree(elements);
      }
    }, [expandAll, expandAllTree, elements]);

    return (
      <Button
        variant="ghost"
        className={cn("absolute bottom-1 right-2 h-8 w-fit p-1", className)}
        onClick={
          expandedItems.length > 0 ? closeAll : () => expandAllTree(elements)
        }
        ref={ref}
        {...props}
      >
        {children}
        <span className="sr-only">Toggle</span>
      </Button>
    );
  }
);

CollapseButton.displayName = "CollapseButton";

export { CollapseButton, File, Folder, Tree, type TreeViewElement };

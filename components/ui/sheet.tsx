"use client";

import { Drawer } from "@base-ui/react/drawer";
import { cn } from "@/lib/utils";

const Sheet = Drawer.Root;
const SheetTrigger = Drawer.Trigger;
const SheetClose = Drawer.Close;

function SheetContent({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Drawer.Portal>
      <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black opacity-[calc(0.35*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 dark:opacity-[calc(0.7*(1-var(--drawer-swipe-progress)))] supports-[-webkit-touch-callout:none]:absolute" />
      <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
        <Drawer.Popup
          className={cn(
            "-mb-12 max-h-[calc(85dvh+3rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl bg-popover px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+3rem)] text-popover-foreground shadow-xl outline-none transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] [transform:translateY(var(--drawer-swipe-movement-y))] data-ending-style:[transform:translateY(calc(100%-3rem+2px))] data-starting-style:[transform:translateY(calc(100%-3rem+2px))] data-swiping:select-none",
            className,
          )}
        >
          <div
            aria-hidden="true"
            className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted-foreground/30"
          />
          <Drawer.Content className="flex flex-col gap-5">
            <div className="flex flex-col gap-1 text-center">
              <Drawer.Title className="text-title3 font-semibold">
                {title}
              </Drawer.Title>
              {description && (
                <Drawer.Description className="text-subhead text-muted-foreground">
                  {description}
                </Drawer.Description>
              )}
            </div>
            {children}
          </Drawer.Content>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  );
}

export { Sheet, SheetClose, SheetContent, SheetTrigger };

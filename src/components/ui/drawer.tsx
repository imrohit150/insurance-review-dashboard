import * as React from 'react'
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer'
import { cn } from '../../lib/utils'

type DrawerContextProps = {
  hasSnapPoints: boolean
  modal: DrawerPrimitive.Root.Props['modal']
  showSwipeHandle: boolean
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props['swipeDirection']>
}

const DrawerContext = React.createContext<DrawerContextProps | null>(null)

function useDrawer() {
  const context = React.useContext(DrawerContext)
  if (!context) throw new Error('useDrawer must be used within a Drawer.')
  return context
}

function Drawer({ modal = true, showSwipeHandle = false, snapPoints, swipeDirection = 'down', ...props }: DrawerPrimitive.Root.Props & { showSwipeHandle?: boolean }) {
  const hasSnapPoints = snapPoints != null && snapPoints.length > 0
  const contextValue = React.useMemo(() => ({ hasSnapPoints, modal, showSwipeHandle, swipeDirection }), [hasSnapPoints, modal, showSwipeHandle, swipeDirection])
  return <DrawerContext.Provider value={contextValue}><DrawerPrimitive.Root data-slot="drawer" modal={modal} snapPoints={snapPoints} swipeDirection={swipeDirection} {...props} /></DrawerContext.Provider>
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) { return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} /> }
function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) { return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} /> }
function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) { return <DrawerPrimitive.Close data-slot="drawer-close" {...props} /> }

function DrawerOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return <DrawerPrimitive.Backdrop data-slot="drawer-overlay" className={cn('fixed inset-0 z-50 min-h-dvh bg-black/20 opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))] transition-opacity duration-300 data-ending-style:pointer-events-none data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs', className)} {...props} />
}

function DrawerContent({ className, children, ...props }: DrawerPrimitive.Popup.Props) {
  const { hasSnapPoints, modal, showSwipeHandle, swipeDirection } = useDrawer()
  const swipeAxis = swipeDirection === 'down' || swipeDirection === 'up' ? 'y' : 'x'
  return <DrawerPortal data-slot="drawer-portal">
    {modal === true && <DrawerOverlay data-snap-points={hasSnapPoints ? '' : undefined} />}
    <DrawerPrimitive.Viewport data-slot="drawer-viewport" data-modal={modal} className="pointer-events-none fixed inset-0 z-50 select-none data-[modal=true]:pointer-events-auto">
      <DrawerPrimitive.Popup data-slot="drawer-popup" data-swipe-axis={swipeAxis} className={cn('pointer-events-auto fixed z-50 flex min-h-0 flex-col bg-[#fffdf8] text-sm text-[#18231e] shadow-xl outline-none transition-transform duration-300 data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:w-[min(100%,560px)] data-[swipe-axis=x]:flex-row data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:rounded-l-xl data-[swipe-direction=right]:border-l data-[swipe-direction=right]:border-[#d8ded6] data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:rounded-r-xl data-[swipe-direction=left]:border-r data-[swipe-direction=left]:border-[#d8ded6] data-[swipe-axis=y]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:max-h-[calc(100dvh-3rem)] data-[swipe-direction=down]:rounded-t-xl data-[swipe-direction=down]:border-t data-[swipe-direction=down]:border-[#d8ded6]', className)} {...props}>
        {showSwipeHandle && <div className="h-1 w-16 self-center rounded-full bg-[#cbd8cc]" aria-hidden="true" />}
        <DrawerPrimitive.Content data-slot="drawer-content" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[inherit]">{children}</DrawerPrimitive.Content>
      </DrawerPrimitive.Popup>
    </DrawerPrimitive.Viewport>
  </DrawerPortal>
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) { return <div data-slot="drawer-header" className={cn('flex shrink-0 flex-col gap-1 p-5', className)} {...props} /> }
function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) { return <div data-slot="drawer-footer" className={cn('mt-auto flex shrink-0 flex-col gap-2 p-5', className)} {...props} /> }
function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) { return <DrawerPrimitive.Title data-slot="drawer-title" className={cn('text-xl font-medium text-[#18231e]', className)} {...props} /> }
function DrawerDescription({ className, ...props }: DrawerPrimitive.Description.Props) { return <DrawerPrimitive.Description data-slot="drawer-description" className={cn('text-sm text-[#637066]', className)} {...props} /> }

export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription }
# Sidebar Implementation in the Next.js AI Chatbot

## Core Structure

The sidebar is implemented using a combination of components that work together to create a responsive, collapsible sidebar with various features:

1. **Base Components**: 
   - `AppSidebar` - The main sidebar container component
   - `SidebarToggle` - Button to toggle the sidebar visibility
   - `SidebarHistory` - Displays chat history organized by time periods
   - `SidebarUserNav` - Shows user account information at the bottom

```tsx
// components/app-sidebar.tsx
export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        {/* Header content */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
```

2. **UI Framework**:
   - The sidebar uses a custom UI component system built with Radix UI primitives
   - The implementation is in `components/ui/sidebar.tsx` which provides a comprehensive set of components for building the sidebar

```tsx
// components/ui/sidebar.tsx (exports)
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
```

## Sidebar Appearance

The sidebar has a clean, modern design with the following visual characteristics:

1. **Header**:
   - Contains the application title "Technology Training AI Playground"
   - Includes a "New Chat" button with a plus icon and tooltip

```tsx
// components/app-sidebar.tsx (header section)
<SidebarHeader>
  <SidebarMenu>
    <div className="flex flex-row justify-between items-center">
      <Link
        href="/"
        onClick={() => {
          setOpenMobile(false);
        }}
        className="flex flex-row gap-3 items-center"
      >
        <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
          Technology Training AI Playground
        </span>
      </Link>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            className="p-2 h-fit"
            onClick={() => {
              setOpenMobile(false);
              router.push('/');
              router.refresh();
            }}
          >
            <PlusIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent align="end">New Chat</TooltipContent>
      </Tooltip>
    </div>
  </SidebarMenu>
</SidebarHeader>
```

2. **Content Area**:
   - Displays chat history organized chronologically
   - Chat entries are grouped into sections: Today, Yesterday, Last 7 days, Last 30 days, and Older
   - Each chat entry shows the chat title and has a context menu for actions

```tsx
// components/sidebar-history.tsx (content section)
{groupedChats.today.length > 0 && (
  <>
    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
      Today
    </div>
    {groupedChats.today.map((chat) => (
      <ChatItem
        key={chat.id}
        chat={chat}
        isActive={chat.id === id}
        onDelete={(chatId) => {
          setDeleteId(chatId);
          setShowDeleteDialog(true);
        }}
        setOpenMobile={setOpenMobile}
      />
    ))}
  </>
)}
```

3. **Footer**:
   - Shows user information with avatar and email
   - Provides a dropdown menu with options to toggle dark/light mode and sign out

```tsx
// components/sidebar-user-nav.tsx
export function SidebarUserNav({ user }: { user: User }) {
  const { setTheme, theme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <Image
                src={`https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{user?.email}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={() => {
                  signOut({
                    redirectTo: '/',
                  });
                }}
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
```

4. **Styling**:
   - Uses Tailwind CSS for styling
   - Adapts to light/dark mode themes
   - Has responsive design for mobile and desktop views

## Toggling Functionality

The sidebar can be toggled between expanded and collapsed states:

1. **Toggle Mechanism**:
   - The `SidebarToggle` component provides a button to toggle the sidebar
   - Uses the `toggleSidebar` function from the `useSidebar` hook
   - Keyboard shortcut (Ctrl/Cmd + B) is available for toggling

```tsx
// components/sidebar-toggle.tsx
export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={toggleSidebar}
          variant="outline"
          className="md:px-2 md:h-fit"
        >
          <SidebarLeftIcon size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">Toggle Sidebar</TooltipContent>
    </Tooltip>
  );
}
```

2. **State Management**:
   - The sidebar state (expanded/collapsed) is managed by the `SidebarContext`
   - State is persisted using cookies (`SIDEBAR_COOKIE_NAME`) with a 7-day expiration
   - Different behavior for mobile vs. desktop:
     - On mobile: Opens as a slide-out sheet
     - On desktop: Collapses to the side or shows as icon-only view

```tsx
// components/ui/sidebar.tsx (context and state management)
const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type SidebarContext = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

// Setting cookie to persist state
const setOpen = React.useCallback(
  (value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === 'function' ? value(open) : value;
    if (setOpenProp) {
      setOpenProp(openState);
    } else {
      _setOpen(openState);
    }

    // This sets the cookie to keep the sidebar state.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  },
  [setOpenProp, open],
);
```

3. **Responsive Behavior**:
   - On mobile: Sidebar becomes a sheet that slides in from the side
   - On desktop: Sidebar can be collapsed to save space
   - Width constants define the dimensions:
     - `SIDEBAR_WIDTH`: "16rem" (expanded)
     - `SIDEBAR_WIDTH_MOBILE`: "18rem" (mobile view)
     - `SIDEBAR_WIDTH_ICON`: "3rem" (collapsed icon view)

```tsx
// components/ui/sidebar.tsx (responsive behavior)
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';

// Mobile implementation
if (isMobile) {
  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
      <SheetContent
        data-sidebar="sidebar"
        data-mobile="true"
        className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
          } as React.CSSProperties
        }
        side={side}
      >
        <div className="flex h-full w-full flex-col">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

// Desktop implementation with collapsible behavior
return (
  <div
    ref={ref}
    className="group peer hidden md:block text-sidebar-foreground"
    data-state={state}
    data-collapsible={state === 'collapsed' ? collapsible : ''}
    data-variant={variant}
    data-side={side}
  >
    {/* Width transitions based on state */}
    <div
      className={cn(
        'duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear',
        'group-data-[collapsible=offcanvas]:w-0',
        'group-data-[side=right]:rotate-180',
        variant === 'floating' || variant === 'inset'
          ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
          : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon]',
      )}
    />
    {/* Rest of implementation */}
  </div>
);
```

## Chat History Entries

The sidebar displays chat history with the following features:

1. **Organization**:
   - Chats are grouped by time periods using the `groupChatsByDate` function
   - Categories: Today, Yesterday, Last 7 days, Last 30 days, and Older
   - Uses date-fns library functions like `isToday`, `isYesterday`, `subWeeks`, and `subMonths`

```tsx
// components/sidebar-history.tsx (grouping function)
const groupChatsByDate = (chats: Chat[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats,
  );
};
```

2. **Chat Item Features**:
   - Each chat entry shows the chat title
   - Active chat is highlighted
   - Context menu with options:
     - Share options (Private/Public visibility)
     - Delete option with confirmation dialog

```tsx
// components/sidebar-history.tsx (chat item component)
const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId: chat.id,
    initialVisibility: chat.visibility,
  });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
          <span>{chat.title}</span>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
            showOnHover={!isActive}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end">
          {/* Share options */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <ShareIcon />
              <span>Share</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {/* Private option */}
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between"
                  onClick={() => {
                    setVisibilityType('private');
                  }}
                >
                  {/* ... */}
                </DropdownMenuItem>
                {/* Public option */}
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between"
                  onClick={() => {
                    setVisibilityType('public');
                  }}
                >
                  {/* ... */}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Delete option */}
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
            onSelect={() => onDelete(chat.id)}
          >
            <TrashIcon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

// Memoized component for performance
export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});
```

3. **Loading States**:
   - Shows skeleton loaders while fetching chat history
   - Displays appropriate messages when no chats exist or user is not logged in

```tsx
// components/sidebar-history.tsx (loading state)
if (isLoading) {
  return (
    <SidebarGroup>
      <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
        Today
      </div>
      <SidebarGroupContent>
        <div className="flex flex-col">
          {[44, 32, 28, 64, 52].map((item) => (
            <div
              key={item}
              className="rounded-md h-8 flex gap-2 px-2 items-center"
            >
              <div
                className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
                style={
                  {
                    '--skeleton-width': `${item}%`,
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// Empty state
if (history?.length === 0) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
          Your conversations will appear here once you start chatting!
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
```

## User Account Section

The user account section at the bottom of the sidebar provides:

1. **User Information**:
   - Displays user avatar generated from email using Vercel's avatar service
   - Shows user email with truncation for long emails

2. **User Actions**:
   - Dropdown menu with options:
     - Toggle between dark and light mode
     - Sign out option

3. **Styling**:
   - Clean, minimal design with rounded avatar
   - Dropdown opens upward (side="top") to avoid going off-screen

```tsx
// components/sidebar-user-nav.tsx (full component)
export function SidebarUserNav({ user }: { user: User }) {
  const { setTheme, theme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <Image
                src={`https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{user?.email}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={() => {
                  signOut({
                    redirectTo: '/',
                  });
                }}
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
```

## Technical Implementation Details

1. **Context and Hooks**:
   - `SidebarContext` and `useSidebar` hook for state management
   - Provides values like `state`, `open`, `setOpen`, `openMobile`, `setOpenMobile`, `isMobile`, and `toggleSidebar`

```tsx
// components/ui/sidebar.tsx (context implementation)
const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

// Keyboard shortcut implementation
React.useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();
      toggleSidebar();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [toggleSidebar]);
```

2. **Component Composition**:
   - Uses a modular approach with many small, focused components
   - Components are built using Radix UI primitives and Tailwind CSS

```tsx
// Example of component composition in app-sidebar.tsx
export function AppSidebar({ user }: { user: User | undefined }) {
  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>{/* Header content */}</SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
```

3. **Accessibility**:
   - Includes proper ARIA attributes
   - Keyboard navigation support
   - Screen reader friendly with appropriate labels

```tsx
// Accessibility examples from sidebar components
<Button
  onClick={toggleSidebar}
  variant="outline"
  className="md:px-2 md:h-fit"
>
  <SidebarLeftIcon size={16} />
  <span className="sr-only">Toggle Sidebar</span>
</Button>

// ARIA attributes
<button
  ref={ref}
  data-sidebar="rail"
  aria-label="Toggle Sidebar"
  tabIndex={-1}
  onClick={toggleSidebar}
  title="Toggle Sidebar"
  className={cn(/* ... */)}
  {...props}
/>
```

4. **Performance Considerations**:
   - Memoization of components (using React.memo)
   - Conditional rendering based on state
   - Efficient state updates

```tsx
// Memoization example
export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});

// Efficient context value creation with useMemo
const contextValue = React.useMemo<SidebarContext>(
  () => ({
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  }),
  [
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  ],
);
```

This sidebar implementation provides a comprehensive, responsive, and feature-rich navigation system for the AI chatbot application, with careful attention to user experience across different devices and screen sizes.

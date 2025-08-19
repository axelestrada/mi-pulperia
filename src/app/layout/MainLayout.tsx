export const MainLayout = () => (
  <SidebarProvider>
    <AppSidebar />

    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Panel Principal</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

       <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
           <Placeholder className="aspect-video" />
           <Placeholder className="aspect-video" />
           <Placeholder className="aspect-video" />
          </div>
          <Placeholder className="flex-1 min-h-[100vh] md:min-h-min" />
        </div>
    </SidebarInset>
  </SidebarProvider>
);

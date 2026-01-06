<script lang="ts">
	import '../app.css';
	import '@fontsource/geist-sans';
	import '@fontsource/geist-mono';
    import { page } from '$app/state';
    import { navItems } from '$lib/config';
    import { ModeWatcher } from "mode-watcher";

    import AppSidebar from '$lib/components/app-sidebar.svelte';
    import * as Sidebar from '$lib/components/ui/sidebar';
    import { Separator } from '$lib/components/ui/separator';

    const { children } = $props();
    let title = $derived(
        navItems.find(item => item.href === page.url.pathname)?.label ?? 'Sumi'
    );
</script>

<ModeWatcher />

<div class="flex h-screen flex-col overflow-hidden bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">

    <div class="flex-1 overflow-hidden">
        <Sidebar.Provider>
            <AppSidebar />
            <Sidebar.Inset>
                <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <Sidebar.Trigger class="-ml-1" />
                    <Separator orientation="vertical" class="mr-2 h-4" />
                    <h1 class="font-medium text-sm tracking-wide">{title}</h1>
                </header>
                <div class="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
                    {@render children()}
                </div>
            </Sidebar.Inset>
        </Sidebar.Provider>
    </div>
</div>

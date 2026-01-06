<script lang="ts">
  import { page } from '$app/state';
  import { navItems } from '$lib/config';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import IconSumi from '~icons/ph/drop-light';

  let currentPath = $derived(page.url.pathname);
</script>

<Sidebar.Root collapsible="icon">
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <IconSumi class="size-5" />
          </div>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-bold text-xl">sumi.</span>
          </div>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>

  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
      <Sidebar.Content>
        <Sidebar.Menu>
          {#each navItems as item}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive={currentPath === item.href}>
                {#snippet child({ props })}
                  <a href={item.href} {...props}>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.Content>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Footer />
</Sidebar.Root>

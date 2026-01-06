<script lang="ts">
    import IconGear from '~icons/ph/gear-light';
    import ThemeToggle from '$lib/components/theme-toggle.svelte';
    import { Separator } from '$lib/components/ui/separator';
</script>

<div class="container mx-auto max-w-2xl space-y-8">
    <div class="flex items-center gap-3 border-b pb-4">
        <IconGear class="h-6 w-6" />
        <h1 class="text-2xl font-light">Settings</h1>
    </div>

    <div class="space-y-6">
        <section class="space-y-4">
            <h2 class="text-lg font-medium">Appearance</h2>
            <Separator />
            <div class="flex items-center justify-between">
                <div class="space-y-1">
                    <p class="font-medium leading-none">Theme</p>
                    <p class="text-sm text-muted-foreground">
                        Select your preferred interface theme.
                    </p>
                </div>
                <ThemeToggle />
            </div>
        </section>
    </div>
</div>

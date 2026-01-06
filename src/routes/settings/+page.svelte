<script lang="ts">
    import IconGear from '~icons/ph/gear-light';
    import IconTextT from '~icons/ph/text-t-light';
    import ThemeToggle from '$lib/components/theme-toggle.svelte';
    import { Separator } from '$lib/components/ui/separator';
    import { Label } from '$lib/components/ui/label';
    import { Slider } from '$lib/components/ui/slider';
    import * as Select from '$lib/components/ui/select';
    import { Button } from '$lib/components/ui/button';
    import { 
        settingsStore, 
        FONT_SIZE_MIN, 
        FONT_SIZE_MAX, 
        LINE_HEIGHT_MIN, 
        LINE_HEIGHT_MAX,
        MARGIN_MIN,
        MARGIN_MAX
    } from '$lib/stores/settings.svelte';

    const fontFamilies = [
        { value: 'sans', label: 'Sans Serif' },
        { value: 'serif', label: 'Serif' },
        { value: 'monospace', label: 'Monospace' }
    ];

    const textAlignments = [
        { value: 'left', label: 'Left' },
        { value: 'justify', label: 'Justified' }
    ];

    function handleReset() {
        if (confirm('Are you sure you want to reset all reader settings to defaults?')) {
            settingsStore.resetGlobal();
        }
    }
</script>

<div class="container mx-auto max-w-2xl p-6 pb-20 space-y-10">
    <div class="flex items-center gap-3 border-b pb-4">
        <IconGear class="h-6 w-6 text-primary" />
        <h1 class="text-2xl font-light">Settings</h1>
    </div>

    <div class="space-y-10">
        <!-- Appearance -->
        <section class="space-y-4">
            <h2 class="text-lg font-medium">Appearance</h2>
            <Separator />
            <div class="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div class="space-y-1">
                    <p class="font-medium leading-none">Interface Theme</p>
                    <p class="text-sm text-muted-foreground">
                        Select your preferred interface theme.
                    </p>
                </div>
                <ThemeToggle />
            </div>
        </section>

        <!-- Reader Defaults -->
        <section class="space-y-6">
            <div class="flex items-center justify-between">
                <h2 class="text-lg font-medium flex items-center gap-2">
                    <IconTextT class="h-5 w-5" />
                    Reader Defaults
                </h2>
                <Button variant="ghost" size="sm" onclick={handleReset} class="text-xs text-muted-foreground hover:text-destructive">
                    Reset to Defaults
                </Button>
            </div>
            <Separator />
            
            <div class="grid gap-8 p-6 rounded-xl border bg-card shadow-sm">
                <!-- Font Family -->
                <div class="space-y-3">
                    <Label>Font Family</Label>
                    <Select.Root 
                        type="single" 
                        value={settingsStore.globalSettings.fontFamily} 
                        onValueChange={(v) => settingsStore.updateGlobal({ fontFamily: v as any })}
                    >
                        <Select.Trigger class="w-full">
                            {fontFamilies.find(f => f.value === settingsStore.globalSettings.fontFamily)?.label}
                        </Select.Trigger>
                        <Select.Content>
                            {#each fontFamilies as font}
                                <Select.Item value={font.value}>{font.label}</Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>

                <!-- Font Size -->
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <Label>Font Size</Label>
                        <span class="text-sm font-medium">{settingsStore.globalSettings.fontSize}px</span>
                    </div>
                    <Slider 
                        type="single"
                        value={settingsStore.globalSettings.fontSize} 
                        onValueChange={(v) => settingsStore.updateGlobal({ fontSize: v[0] })}
                        min={FONT_SIZE_MIN} 
                        max={FONT_SIZE_MAX} 
                        step={1} 
                    />
                </div>

                <!-- Line Height -->
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <Label>Line Height</Label>
                        <span class="text-sm font-medium">{settingsStore.globalSettings.lineHeight}</span>
                    </div>
                    <Slider 
                        type="single"
                        value={settingsStore.globalSettings.lineHeight} 
                        onValueChange={(v) => settingsStore.updateGlobal({ lineHeight: v[0] })}
                        min={LINE_HEIGHT_MIN} 
                        max={LINE_HEIGHT_MAX} 
                        step={0.1} 
                    />
                </div>

                <!-- Text Align -->
                <div class="space-y-3">
                    <Label>Text Alignment</Label>
                    <Select.Root 
                        type="single" 
                        value={settingsStore.globalSettings.textAlign} 
                        onValueChange={(v) => settingsStore.updateGlobal({ textAlign: v as any })}
                    >
                        <Select.Trigger class="w-full">
                            {textAlignments.find(a => a.value === settingsStore.globalSettings.textAlign)?.label}
                        </Select.Trigger>
                        <Select.Content>
                            {#each textAlignments as align}
                                <Select.Item value={align.value}>{align.label}</Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>

                <!-- Margins -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <Label>Side Margins</Label>
                            <span class="text-sm font-medium">{settingsStore.globalSettings.marginHorizontal}px</span>
                        </div>
                        <Slider 
                            type="single"
                            value={settingsStore.globalSettings.marginHorizontal} 
                            onValueChange={(v) => settingsStore.updateGlobal({ marginHorizontal: v[0] })}
                            min={MARGIN_MIN} 
                            max={MARGIN_MAX} 
                            step={4} 
                        />
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <Label>Vertical Margins</Label>
                            <span class="text-sm font-medium">{settingsStore.globalSettings.marginVertical}px</span>
                        </div>
                        <Slider 
                            type="single"
                            value={settingsStore.globalSettings.marginVertical} 
                            onValueChange={(v) => settingsStore.updateGlobal({ marginVertical: v[0] })}
                            min={MARGIN_MIN} 
                            max={MARGIN_MAX} 
                            step={4} 
                        />
                    </div>
                </div>
            </div>
        </section>

        <!-- About / Help -->
        <section class="space-y-4 pt-10">
            <div class="rounded-lg bg-muted/20 p-6 border border-dashed text-center">
                <p class="text-sm text-muted-foreground">
                    Sumi Reader v0.1.0 • Sprint 2
                </p>
                <p class="text-xs text-muted-foreground/60 mt-1">
                    Minimalist ebook reading experience.
                </p>
            </div>
        </section>
    </div>
</div>
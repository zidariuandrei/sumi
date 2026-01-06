<script lang="ts">
    import * as Sheet from "$lib/components/ui/sheet";
    import * as Select from "$lib/components/ui/select";
    import { Button } from "$lib/components/ui/button";
    import { Slider } from "$lib/components/ui/slider";
    import { Label } from "$lib/components/ui/label";
    import { Separator } from "$lib/components/ui/separator";
    import { 
        settingsStore, 
        FONT_SIZE_MIN, 
        FONT_SIZE_MAX, 
        FONT_SIZE_STEP,
        LINE_HEIGHT_MIN, 
        LINE_HEIGHT_MAX,
        MARGIN_MIN, 
        MARGIN_MAX
    } from "$lib/stores/settings.svelte";
    import IconX from "~icons/ph/x";
    import IconTextAlignLeft from "~icons/ph/text-align-left";
    import IconTextAlignJustify from "~icons/ph/text-align-justify";
    import IconMinus from "~icons/ph/minus";
    import IconPlus from "~icons/ph/plus";

    let { open = $bindable(false), onClose }: { open: boolean; onClose: () => void } = $props();

    let settings = $derived(settingsStore.activeSettings);
    
    // Select options
    const fontFamilies = [
        { value: "sans-serif", label: "Sans Serif" },
        { value: "serif", label: "Serif" },
        { value: "monospace", label: "Monospace" }
    ];

    function update(key: string, value: any) {
        if (settingsStore.activeBookPath) {
            settingsStore.updateForBook(settingsStore.activeBookPath, { [key]: value });
        } else {
            settingsStore.updateGlobal({ [key]: value });
        }
    }
    
    // Handlers
    const handleFontFamilyChange = (value: string) => update("fontFamily", value);
    const handleFontSizeChange = (value: number) => update("fontSize", value);
    const handleLineHeightChange = (value: number) => update("lineHeight", value);
    const handleMarginHChange = (value: number) => update("marginHorizontal", value);
    const handleMarginVChange = (value: number) => update("marginVertical", value);
    const handleTextAlignChange = (value: 'left' | 'justify') => update("textAlign", value);
    
    function resetSettings() {
        if (settingsStore.activeBookPath) {
            settingsStore.clearBookSettings(settingsStore.activeBookPath);
        } else {
            settingsStore.resetGlobal();
        }
    }
</script>

<Sheet.Root bind:open={open} onOpenChange={(v) => !v && onClose()}>
    <Sheet.Content class="w-[300px] sm:w-[350px] overflow-y-auto">
        <Sheet.Header class="flex flex-row items-center justify-between space-y-0 pb-4 border-b mb-4">
            <Sheet.Title>Reader Settings</Sheet.Title>
            <Button variant="ghost" size="icon" onclick={onClose} class="h-8 w-8">
                <IconX class="h-4 w-4" />
                <span class="sr-only">Close</span>
            </Button>
        </Sheet.Header>

        <div class="grid gap-6 py-4">
            <!-- Font Family -->
            <div class="grid gap-2">
                <Label>Font Family</Label>
                <Select.Root type="single" value={settings.fontFamily} onValueChange={handleFontFamilyChange}>
                    <Select.Trigger>
                        {fontFamilies.find(f => f.value === settings.fontFamily)?.label ?? settings.fontFamily}
                    </Select.Trigger>
                    <Select.Content>
                        {#each fontFamilies as font}
                            <Select.Item value={font.value}>{font.label}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            <Separator />

            <!-- Font Size -->
            <div class="grid gap-2">
                <div class="flex items-center justify-between">
                    <Label>Font Size</Label>
                    <span class="text-xs text-muted-foreground tabular-nums">{settings.fontSize}px</span>
                </div>
                <div class="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        class="h-8 w-8 shrink-0"
                        disabled={settings.fontSize <= FONT_SIZE_MIN}
                        onclick={() => update("fontSize", settings.fontSize - FONT_SIZE_STEP)}
                    >
                        <IconMinus class="h-3 w-3" />
                    </Button>
                    <Slider 
                        type="single"
                        value={settings.fontSize} 
                        min={FONT_SIZE_MIN} 
                        max={FONT_SIZE_MAX} 
                        step={FONT_SIZE_STEP}
                        onValueChange={handleFontSizeChange}
                        class="flex-1"
                    />
                    <Button 
                        variant="outline" 
                        size="icon" 
                        class="h-8 w-8 shrink-0"
                        disabled={settings.fontSize >= FONT_SIZE_MAX}
                        onclick={() => update("fontSize", settings.fontSize + FONT_SIZE_STEP)}
                    >
                        <IconPlus class="h-3 w-3" />
                    </Button>
                </div>
            </div>

            <!-- Line Height -->
            <div class="grid gap-2">
                <div class="flex items-center justify-between">
                    <Label>Line Height</Label>
                    <span class="text-xs text-muted-foreground tabular-nums">{settings.lineHeight.toFixed(1)}</span>
                </div>
                <Slider 
                    type="single"
                    value={settings.lineHeight} 
                    min={LINE_HEIGHT_MIN} 
                    max={LINE_HEIGHT_MAX} 
                    step={0.1}
                    onValueChange={handleLineHeightChange}
                />
            </div>

            <Separator />

            <!-- Margins -->
            <div class="grid gap-4">
                <div class="grid gap-2">
                    <div class="flex items-center justify-between">
                        <Label>Horizontal Margin</Label>
                        <span class="text-xs text-muted-foreground tabular-nums">{settings.marginHorizontal}px</span>
                    </div>
                    <Slider 
                        type="single"
                        value={settings.marginHorizontal} 
                        min={MARGIN_MIN} 
                        max={MARGIN_MAX} 
                        step={4}
                        onValueChange={handleMarginHChange}
                    />
                </div>
                
                <div class="grid gap-2">
                    <div class="flex items-center justify-between">
                        <Label>Vertical Margin</Label>
                        <span class="text-xs text-muted-foreground tabular-nums">{settings.marginVertical}px</span>
                    </div>
                    <Slider 
                        type="single"
                        value={settings.marginVertical} 
                        min={MARGIN_MIN} 
                        max={MARGIN_MAX} 
                        step={4}
                        onValueChange={handleMarginVChange}
                    />
                </div>
            </div>

            <Separator />

            <!-- Text Align -->
            <div class="grid gap-2">
                <Label>Text Alignment</Label>
                <div class="grid grid-cols-2 gap-2">
                    <Button 
                        variant={settings.textAlign === 'left' ? "default" : "outline"} 
                        onclick={() => handleTextAlignChange('left')}
                        class="flex gap-2"
                    >
                        <IconTextAlignLeft class="h-4 w-4" />
                        Left
                    </Button>
                    <Button 
                        variant={settings.textAlign === 'justify' ? "default" : "outline"} 
                        onclick={() => handleTextAlignChange('justify')}
                        class="flex gap-2"
                    >
                        <IconTextAlignJustify class="h-4 w-4" />
                        Justify
                    </Button>
                </div>
            </div>

            <Separator />

            <Button variant="destructive" onclick={resetSettings} class="w-full">
                Reset to Defaults
            </Button>
        </div>
    </Sheet.Content>
</Sheet.Root>

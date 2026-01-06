<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { onMount } from "svelte";

  let { 
    open = $bindable(false),
    totalPages,
    currentPage,
    onNavigate
  }: {
    open: boolean;
    totalPages?: number;
    currentPage?: number;
    onNavigate: (target: { page?: number; percentage?: number }) => void;
  } = $props();

  let inputValue = $state("");
  let inputMode = $state<"page" | "percent">("page");
  let error = $state<string | null>(null);
  let inputRef = $state<HTMLInputElement | null>(null);

  // Initialize input mode based on available data
  $effect(() => {
    if (open) {
      if (totalPages) {
        inputMode = "page";
        inputValue = currentPage ? currentPage.toString() : "";
      } else {
        inputMode = "percent";
        inputValue = "";
      }
      error = null;
      // Focus input when dialog opens
      setTimeout(() => inputRef?.focus(), 50);
    }
  });

  function validateInput(): boolean {
    if (!inputValue) {
      error = "Please enter a value";
      return false;
    }

    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      error = "Invalid number";
      return false;
    }

    if (inputMode === "page") {
      if (!Number.isInteger(num)) {
        error = "Page number must be an integer";
        return false;
      }
      if (num < 1) {
        error = "Page number must be at least 1";
        return false;
      }
      if (totalPages && num > totalPages) {
        error = `Page number cannot exceed ${totalPages}`;
        return false;
      }
    } else {
      if (num < 0 || num > 100) {
        error = "Percentage must be between 0 and 100";
        return false;
      }
    }

    error = null;
    return true;
  }

  function handleSubmit() {
    if (validateInput()) {
      const num = parseFloat(inputValue);
      if (inputMode === "page") {
        onNavigate({ page: num });
      } else {
        onNavigate({ percentage: num / 100 });
      }
      open = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  function toggleMode() {
    inputMode = inputMode === "page" ? "percent" : "page";
    inputValue = "";
    error = null;
    inputRef?.focus();
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Go to {inputMode === "page" ? "Page" : "Percentage"}</Dialog.Title>
      <Dialog.Description>
        {#if inputMode === "page" && totalPages}
          Enter a page number between 1 and {totalPages}.
          {#if currentPage}
            (Currently on page {currentPage})
          {/if}
        {:else}
          Enter a percentage to jump to a specific location.
        {/if}
      </Dialog.Description>
    </Dialog.Header>

    <div class="grid gap-4 py-4">
      <div class="flex items-center gap-4">
        <div class="relative w-full">
          <Input
            bind:ref={inputRef}
            bind:value={inputValue}
            placeholder={inputMode === "page" ? "Page number" : "Percentage (0-100)"}
            onkeydown={handleKeydown}
            class={error ? "border-destructive" : ""}
          />
          {#if inputMode === "percent"}
            <span class="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
          {/if}
        </div>
      </div>
      
      {#if error}
        <p class="text-sm text-destructive font-medium">{error}</p>
      {/if}

      {#if totalPages}
        <Button variant="ghost" size="sm" class="w-fit px-0 h-auto text-muted-foreground hover:text-foreground" onclick={toggleMode}>
          Switch to {inputMode === "page" ? "percentage" : "page number"}
        </Button>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => open = false}>Cancel</Button>
      <Button onclick={handleSubmit}>Go</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

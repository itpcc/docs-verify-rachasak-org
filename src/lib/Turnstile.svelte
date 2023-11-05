<script lang="ts">
	import type { SvelteComponent } from 'svelte';
	import { Turnstile } from 'svelte-turnstile';

	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	const modalStore = getModalStore();

	const cButton = 'fixed top-4 right-4 z-50 font-bold shadow-xl';
</script>

{#if $modalStore[0]}
	<!-- Button -->
	<button class="btn-icon variant-filled {cButton}" on:click={parent.onClose}>×</button>
	<div class="card">
		<header class="card-header"><h2 class="h2">กรุณายืนยันตัว</h2></header>
		<section class="p-4 my-4">
			<Turnstile
				siteKey={$modalStore[0]?.meta?.siteKey}
				forms={false}
				on:turnstile-error={$modalStore[0]?.meta?.onError}
				on:turnstile-expired={$modalStore[0]?.meta?.onError}
				on:turnstile-timeout={$modalStore[0]?.meta?.onError}
				on:turnstile-callback={$modalStore[0]?.meta?.onCallback}
			/>
		</section>
	</div>
{/if}
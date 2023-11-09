<script lang="ts">
	import { FileDropzone, getModalStore, getToastStore, popup } from "@skeletonlabs/skeleton";
	import type { ModalComponent, ModalSettings, PopupSettings } from '@skeletonlabs/skeleton';
	import { fetchDocByText } from '$lib';
	import {
		article26VrfInfo,
		verifyArticle26Signature
	} from '$lib/worker-art26';
	import {
		article28VrfInfo,
		verifyArticle28Signature
	} from '$lib/worker-art28';
	import TurnstileComponent from '$lib/Turnstile.svelte';
	// * Type definition
	import type { DocVrfRes } from "$lib/types";
	import { PUBLIC_TRUNSTILE_CLIENT_KEY } from '$env/static/public';
	import { page } from '$app/stores';

	// * Page resource
	let files: FileList;
	let docVrfRes: DocVrfRes | null;
	// NOTE: To retrieve the store, getToastStore must be invoked at the top level of your component!
	// @see: https://www.skeleton.dev/utilities/toasts
	const toastStore = getToastStore();
	const modalStore = getModalStore();
	const popupTextInfo: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: 'hover',
		// Matches the data-popup value on your popup element
		target: 'popupTextInfo',
		// Defines which side of your trigger the popup will appear
		placement: 'top',
	};
	// / Page resource

	const verifyWrapper = async (
		docResFnc: { (tstToken: string): Promise<DocVrfRes | null> }
	) => {
		const turnstileModalComponent: ModalComponent = { ref: TurnstileComponent };
		const turnstilePromise = new Promise<string>((resolve, reject) => {
			const modal: ModalSettings = {
				type: 'component',
				component: turnstileModalComponent,
				meta: {
					siteKey: PUBLIC_TRUNSTILE_CLIENT_KEY,
					onError: () => {
						reject();
					},
					onCallback: ({ detail: { token }}: {
						detail: { token: string }
						[key: string]: any
					}) => {
						resolve(token);
					}
				},
				response: (r: boolean) => {
					if (! r) reject();
				}
			};
			modalStore.trigger(modal);
		});

		let tstToken: string;

		try {
			tstToken = await turnstilePromise;
		} catch (e) {
			toastStore.trigger({
				message: 'ไม่สามารถยืนยันตัวตนได้ กรุณาลองใหม่อีกครั้ง',
				background: 'variant-filled-error',
			});
			return;
		} finally {
			modalStore.close();
		}

		modalStore.close();
		const loadToastId = toastStore.trigger({
			message: 'กำลังตรวจสอบ...',
			background: 'variant-filled-tertiary',
		});

		const docRes = await docResFnc(tstToken);

		toastStore.close(loadToastId);

		if (docRes) {
			docVrfRes = docRes;
			return;
		}

		toastStore.trigger({
			message: 'ไม่พบเอกสารที่ตรวจสอบ',
			background: 'variant-filled-error',
		});
	};

	const verifyByPDFFile = async (
		f: File,
		tstToken: string
	): Promise<DocVrfRes | null> => {
		const pdfBuf = await f.arrayBuffer();

		// Check for metadata
		const [ art26Res, art28Res  ] = await Promise.all([
			verifyArticle26Signature(pdfBuf, tstToken),
			verifyArticle28Signature(pdfBuf, tstToken)
		]);

		console.log('verifyByPDFFile | art26Res, art28Res', art26Res, art28Res);

		if (art26Res?.ok) {
			return article26VrfInfo(
				(art26Res.docVrf?.[0]) ? art26Res.docVrf?.[1] : undefined,
				art26Res.metadata
			);
		}

		if (art28Res?.ok) {
			const [ _certKeyName, certInfo ] = (art28Res.certRes?.[0] && art28Res.verifiedInfo) ?
				(
					(Object.entries(art28Res.certRes[1])
						.filter(certEntry => certEntry[0] in art28Res.verifiedInfo)
					?? []).pop() ??
						[ undefined, undefined]
				) :
				[ undefined, undefined];
			return article28VrfInfo(
				(art28Res.docVrf?.[0]) ? (art28Res.docVrf?.[1]) : undefined,
				certInfo
			);
		}

		return null;
	};

	const verifyByDocCode = async (
		sign_method: string,
		request_code: string
	) => {
		await verifyWrapper(
			(tstToken: string) => fetchDocByText(
				sign_method,
				request_code,
				tstToken
			)
		);
	};

	// * Event functions
	async function onTextInputSubmit(e: SubmitEvent & {
		currentTarget: EventTarget & HTMLFormElement;
	}) {
		const formData = new FormData(e.currentTarget);
		await verifyByDocCode(
			formData.get('request-prefix') as string,
			formData.get('request-id') as string
		);
	};

	async function onChangeHandler(e: Event) {
		console.log('file data:', e);
		console.log('files:', files);

		await verifyWrapper((tstToken) => verifyByPDFFile(files[0], tstToken));
	};

	async function clearPage() {
		docVrfRes = null;
	};
	// / Event functions

    const queryMethod = $page.url.searchParams.get('s');
    const queryCode = $page.url.searchParams.get('c');

	if (queryMethod && queryCode) {
		(async() => await verifyByDocCode(
			queryMethod,
			queryCode
		))();
	}

</script>
<div class="
	container h-full w-xl py-8
	mx-auto max-w-none
	flex flex-col flex-nowrap justify-center items-start
	relative
">
	{#if docVrfRes}
		<div
			id="docverify-result"
			class="w-full space-y-5 flex gap-8 content-around justify-center px-8 py-8"
		>
			<div class="w-full">
				<div class="card card-hover">
					<header class="card-header">
						<h2 class="h2"><span
							class="
								bg-gradient-to-br
								from-green-300
								to-green-400
								bg-clip-text
								text-transparent
								box-decoration-clone
								drop-shadow-lg
							"
						>
							เอกสารถูกต้อง
						</span></h2>
					</header>
					<section class="p-4 clear-left">
						{#if docVrfRes.docImg}
							<img
								alt="Document preview"
								class="float-right "
								src="{`data:image/png;base64,${docVrfRes.docImg}`}"
							/>
						{/if}
						<div class="container clear-left">
							<article>
								<p>
									<!-- cspell:disable -->
									เอกสารฉบับนี้ <q class="italic">นายราชศักดิ์ รักษ์กำเนิด</q> ได้รับรองว่าเป็นเอกสารอิเล็กทรอนิกส์ต้นฉบับ และลงลายมือชื่ออิเล็กทรอนิกส์ที่เชื่อถือได้ตามมาตรา
									<span id="docverify-authorise-article-number">{docVrfRes.articleType}</span>
									แห่งพระราชบัญญัติว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. 2544
									<!-- cspell:enable -->
								</p>
								<p class="italic">
									รายละเอียดปรากฏตาม
									<span id="docverify-authorise-detail-art26">{docVrfRes.dclrText}</span>
								</p>
							</article>
							<details open class="my-8 variant-glass-secondary p-2">
								<summary class="h3 drop-shadow-md">รายละเอียดการรับรอง</summary>
								<dl class="list-dl">
									{#each docVrfRes.vrfInfo as vrfInfo }
										<div>
											<span class="badge-icon p-4 variant-soft-secondary">
												<i class="fa-solid fa-{vrfInfo.icon ?? 'circle-info'}" />
											</span>
											<span class="flex-auto">
												<dt class="font-bold">{vrfInfo.header}</dt>
												<dd class="text-sm">
													{#if vrfInfo?.asHTML}
														{@html vrfInfo.detail}
													{:else}
														{vrfInfo.detail}
													{/if}
												</dd>
											</span>
										</div>
									{/each}
								</dl>
							</details>
						</div>
					</section>
					<footer class="card-footer flex justify-end">
						<div class="flex-none">
							<button type="button" class="btn variant-ghost-primary" on:click|preventDefault={clearPage}>
								<i class="fa-sharp fa-regular fa-house mr-1"></i> กลับ
							</button>
						</div>
					</footer>
				</div>
			</div>
		</div>
	{:else}
		<div
			id="docverify-form"
			class="h-full min-h-[80vh] w-full space-y-5 grid grid-cols-2 gap-8 content-around justify-center px-8 py-8"
		>
			<div class="w-full lg:py-10">
				<header>
					<h2 class="h2">
						<span class="text-2xl">ตรวจสอบด้วยรหัสท้ายเอกสาร </span>
						<button
							class="btn variant-glass-surface mx-2 [&>*]:pointer-events-none"
							use:popup={popupTextInfo}
						>
							<i class="fa-solid fa-info"></i>
						</button>
					</h2>
					<div class="card p-4 w-3/5 shadow-xl variant-ghost-surface" data-popup="popupTextInfo">
						<header>
							<img src="/howto-check.png" class="w-full" alt="How to check code" />
						</header>
						<div class="space-y-4 my-3">
							<p>ท่านสามารถตรวจสอบวิธีรับรองเอกสารและรหัสรับรองเอกสารได้จากท้ายเอกสารหน้าแรก</p>
						</div>
						<div class="arrow bg-surface-100-800-token" />
					</div>
				</header>
				<p class="mb-4">โปรดตรวจสอบรหัสให้ถูกต้องก่อนกดปุ่ม "ตรวจสอบ"</p>
				<form
					method="POST"
					class="input-group input-group-divider grid-cols-[auto_1fr_auto]"
					on:submit|preventDefault={onTextInputSubmit}
				>
					<select class="input-group-shim" name="request-prefix">
						<option>-- โปรดเลือกวิธีรับรอง --</option>
						<option value="art26">Blockchain มาตรา 26 (art26)</option>
						<option value="art28">ใบรับรอง มาตรา 28 (art28)</option>
					</select>
					<input type="text" placeholder="รหัสใบรับรอง" name="request-id" />
					<button class="variant-filled-secondary">ตรวจสอบ</button>
				</form>
			</div>
			<div class="w-full">
				<h2 class="text-2xl my-2 h2">ตรวจสอบด้วยการส่งไฟล์เอกสาร</h2>
				<FileDropzone bind:files name="files" on:change={onChangeHandler}>
					<svelte:fragment slot="lead"><i class="fa-solid fa-file-arrow-up text-3xl"></i></svelte:fragment>
					<svelte:fragment slot="message">ลากไฟล์และวางที่นี่หรือคลิกเพื่ออัปโหลดไฟล์</svelte:fragment>
					<svelte:fragment slot="meta">ส่งไฟล์</svelte:fragment>
				</FileDropzone>
			</div>
		</div>
	{/if}
</div>

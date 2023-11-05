import type {
	GeneralObject,
	DocVerifyResult,
	FetchMetadataFromServerResult,
	DocVrfRes,
} from "$lib/types";
import { PDFDocument } from 'pdf-lib';
import { extractAttachments } from '$lib/utils';
import { hashPDFFile, fetchMetadataFromServer, fetchWithRetry } from '$lib/worker-common';

type SolanaRes = GeneralObject & {
	result?: GeneralObject & {
		transaction: GeneralObject & {
			message: GeneralObject & {
				accountKeys: string[]
			}
		},
		meta: GeneralObject & {
			logMessages: string[]
		}
	}
};

export const checkWithSolana = async (
	metadata: GeneralObject & {
		signature: string,
		blockchain_network: string,
		solana_rpc: string
	}
): Promise<DocVerifyResult<GeneralObject>> => {
	try {
		const [ slnJsn, cfgJsn ] = await Promise.all([
			(async(): Promise<DocVerifyResult<SolanaRes>> => {
				let attempt = 1;
				let fetchRes;

				while (attempt <= 3) {
					fetchRes = await fetchWithRetry<SolanaRes>(
						`https://api.${metadata.solana_rpc}.solana.com/`, {
							method: 'POST',
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								"jsonrpc": "2.0",
								"id": 1,
								"method": "getTransaction",
								"params": [
									metadata.signature,
									"json"
								]
							}),
						}
					);

					if (! fetchRes[0]) return fetchRes;

					if (! fetchRes[1]?.result) {
						console.log('checkWithSolana::slnJsn | attemp failed', attempt);
						attempt += 1;
						continue;
					}

					return fetchRes;
				}

				// @ts-ignore TS2322
				return fetchRes;
			})(),
			fetchWithRetry<{
				[key: string]: {
					[key: string]: GeneralObject & {
						tx_pub_key: string,
						tx_program: string,
					}
				}
			}>(
				'https://raw.githubusercontent.com/itpcc/docs-verify-rachasak-org-public-keys/main/public/art26-keys.json'
			)
		]);

		if (! cfgJsn[0]) return cfgJsn;
		if (! slnJsn[0]) return slnJsn;

		const txPubKey = slnJsn[1]?.result?.transaction?.message?.accountKeys?.[0];
		const txProgram = slnJsn[1]?.result?.transaction?.message?.accountKeys?.[2];
		const logMsgList = slnJsn[1]?.result?.meta?.logMessages;

		console.log('checkWithSolana | slnJsn', slnJsn, txPubKey, txProgram, logMsgList);

		if (! (txPubKey && txProgram && logMsgList)) {
			return [ false, {
				err_cde: 4000,
				err_desc: 'No data to verified',
				err_meta: slnJsn[1]?.result
			} ];
		}

		const cfgTxPubKey = cfgJsn[1]
			?.[metadata?.blockchain_network as string]
			?.[metadata?.solana_rpc as string]
			?.tx_pub_key;
		const cfgTxProgram = cfgJsn[1]
			?.[metadata?.blockchain_network as string]
			?.[metadata?.solana_rpc as string]
			?.tx_program;

		if (! (cfgTxPubKey && cfgTxProgram)) {
			return [ false, {
				err_cde: 4003,
				err_desc: 'No config data to verified',
				err_meta: cfgJsn[1]
			} ];
		}

		if (txPubKey !== cfgTxPubKey) return [ false, {
			err_cde: 4030,
			err_desc: 'Publisher key is unmatch with registered Key',
			err_meta: { txPubKey }
		} ];

		if (txProgram !== cfgTxProgram) return [ false, {
			err_cde: 4031,
			err_desc: 'Publisher program is unmatch with registered program',
			err_meta: { txProgram }
		} ];

		const memoMsg = logMsgList.find(msg => msg.indexOf('Program log: Memo') === 0);
		if (! memoMsg) return [ false, {
			err_cde: 4001,
			err_desc: 'No memo found',
			err_meta: slnJsn[1]?.result
		} ];

		const memoRegex = /^Program log\: Memo \(len (\d+)\):\s*(.*)$/gi.exec(memoMsg);
		if (! memoRegex || ! memoRegex[2]) {
			return [ false, {
				err_cde: 4002,
				err_desc: 'No memo found',
				err_meta: slnJsn[1]?.result
			} ];
		}

		const memoJsn = memoRegex[2]
			.replace(/^\"{1}|\"{1}$/g, '')
			.replace(/\\\"/g, '"')
			.replace(/\\{2}u/g, '\\u');
		const memo = JSON.parse(memoJsn);

		if (memo?.file_hash !== metadata?.file_hash) {
			return [ false, {
				err_cde: 4121,
				err_desc: 'Blockchain memo\'s file hash unmatch with the original file hash',
				err_meta: { memo, metadata }
			} ];
		}
		if (memo?.request_code !== metadata?.request_code) {
			return [ false, {
				err_cde: 4122,
				err_desc: 'Blockchain memo\'s Request ID unmatch with the metadata Request ID',
				err_meta: { memo, metadata }
			} ];
		}

		return [ true, memo ];
	} catch (e) {
		return [ false, {
			err_cde: 5000,
			err_desc: 'Unable to fetch confirmation',
			err_meta: e
		} ];
	}
};

export const verifyArticle26Signature = async (
	pdfArrBuf: ArrayBuffer,
	tstToken: string
): Promise<null | {
	ok: boolean,
	metadata: GeneralObject,
	blockChain: DocVerifyResult<GeneralObject>,
	docVrf: DocVerifyResult<FetchMetadataFromServerResult> | null,
	fullFileHash: DocVerifyResult<{ file_hash: string }>,
	orgiFileHash: DocVerifyResult<{ file_hash: string }>
}> => {
	const pdfDoc = await PDFDocument.load(pdfArrBuf);
	const attachments = extractAttachments(pdfDoc);
	if (attachments.length < 1) return null;

	const metadataFile = attachments.find((fNf) => fNf.name === 'metadata.json');
	const originalFile = attachments.find((fNf) => fNf.name === 'original.pdf');
	if (! metadataFile || ! originalFile) return null;

	const metadata = JSON.parse(new TextDecoder().decode(metadataFile.data));
	if (! metadata) return null;

	const [ blockChainRes, fullFileHashRes, origFileHashRes ] = await Promise.all([
		checkWithSolana(metadata),
		hashPDFFile(pdfArrBuf),
		hashPDFFile(originalFile.data).then(ofhr => {
			if (! ofhr[0]) return ofhr;

			if (ofhr[1].file_hash !== metadata?.file_hash) {
				return [ false, {
					err_cde: 4124,
					err_desc: 'Metadata\'s file hash unmatch with the original file hash',
					err_meta: ofhr[1]
				} ];
			}

			return ofhr;
		}) as Promise<DocVerifyResult<{ file_hash: string }>>
	]);

	if (! (blockChainRes[0] && fullFileHashRes[0] && origFileHashRes[0])) return {
		ok: false,
		metadata,
		blockChain: blockChainRes,
		fullFileHash: fullFileHashRes,
		orgiFileHash: origFileHashRes,
		docVrf: null,
	};

	const docVrfRes = await fetchMetadataFromServer(
		'art26',
		metadata.request_code,
		fullFileHashRes[1].file_hash,
		tstToken
	);

	if (! docVrfRes[0]) return {
		ok: false,
		metadata,
		blockChain: blockChainRes,
		fullFileHash: fullFileHashRes,
		orgiFileHash: origFileHashRes,
		docVrf: docVrfRes,
	};

	if (
		! docVrfRes[1]?.signing_info?.file_hash ||
		docVrfRes[1]?.signing_info?.file_hash !== metadata?.file_hash
	) return {
		ok: false,
		metadata,
		blockChain: blockChainRes,
		fullFileHash: fullFileHashRes,
		orgiFileHash: origFileHashRes,
		docVrf: [ false, {
			err_cde: 4125,
			err_desc: 'Record\'s file hash unmatch with the original file hash',
			err_meta: {
				signing_info: docVrfRes[1]?.signing_info,
				metadata
			}
		} ]
	};

	return {
		ok: true,
		metadata,
		blockChain: blockChainRes,
		fullFileHash: fullFileHashRes,
		orgiFileHash: origFileHashRes,
		docVrf: docVrfRes,
	}
};

export const article26VrfInfo = (
	docVrf: FetchMetadataFromServerResult | undefined,
	docMetadata: GeneralObject | undefined,
): DocVrfRes => {
	return {
		articleType: 26,
		dclrText: 'บันทึกประจำวันที่แจ้งไว้ต่อสถานีตำรวจนครบาลภาษีเจริญ เลขที่ xxx/2566 ลงวันที่ 12 พฤศจิกายน 2566',
		docImg: docVrf?.preview_png ?? undefined,
		vrfInfo: [
			{
				header: 'รหัสเอกสาร',
				detail: docVrf?.signing_info.request_code as string ?? '-ไม่ทราบ-',
				asHTML: false,
				icon: 'id-badge'
			},
			{
				header: 'ประเภทเอกสาร',
				detail: docVrf?.tmpl_name as string ?? '-ไม่ทราบ-',
				asHTML: false,
				icon: 'book'
			},
			{
				header: 'วันเวลาสร้างเอกสาร',
				detail: docVrf?.gen_at.toLocaleString('th-TH') ?? '-ไม่ทราบ-',
				asHTML: false,
				icon: 'calendar-days'
			},
			{
				header: 'วันเวลานำส่งตัวอย่างเอกสารยังเครือข่าย IPFS',
				detail: docVrf?.signing_info?.upld_at as string ?? '-ไม่ทราบ-',
				asHTML: false,
				icon: 'cloud-arrow-up'
			},
			{
				header: 'วันเวลารับรองเอกสาร',
				detail: docVrf?.signing_info?.sign_at as string ?? '-ไม่ทราบ-',
				asHTML: false,
				icon: 'stamp'
			},
			{
				header: 'วิธีรับรองเอกสาร',
				detail: `ส่งตัวอย่างเอกสารยังเครือข่าย IPFS และรายงานรับรองการนำส่งบน Blockchain ${
					(docVrf?.signing_info?.blockchain_network as string)}` +
					(
						(
							docVrf?.signing_info?.blockchain_network === 'solana' &&
							docVrf?.signing_info?.solana_rpc
						) ?
							` เครือข่าย ${docVrf?.signing_info?.solana_rpc}` :
							''
					),
				asHTML: false,
				icon: 'pen-nib'
			},
			{
				header: 'รหัสไฟล์ตัวอย่างใน NFT',
				detail: (docVrf?.signing_info?.cid) ?
					(
						`<a
							href="https://ipfs.io/ipfs/${docVrf?.signing_info?.cid as string}/"
							target="_blank"
						>
							${docVrf?.signing_info?.cid as string}
						</a>
						<i class="fa-solid fa-link"></i>` + (
							(docMetadata && docMetadata?.password) ?
								`<i> (เปิดเอกสารต้นฉบับด้วยรหัสผ่าน <code class="variant-glass-surface">${docMetadata.password}</code>)</i>` :
								''
						)
					) :
					'-ไม่ทราบ-',
				asHTML: true,
				icon: 'id-card'
			},
			{
				header: 'รหัสยืนยันธุรกรรมบน Blockchain',
				detail: (docVrf?.signing_info?.signature) ?
					`<a
						href="https://explorer.solana.com/tx/${docVrf?.signing_info?.signature as string}?cluster=devnet"
						target="_blank"
					>
						${docVrf?.signing_info?.signature as string}
					</a>
					<i class="fa-solid fa-link"></i>`:
					'-ไม่ทราบ-',
				asHTML: true,
				icon: 'link'
			}
		]
	};
};

import { Buffer } from 'buffer';
import type {
	GeneralObject,
	DocVerifyResult,
	FetchMetadataFromServerResult,
	CertInfo,
	ErrorInfo
} from "$lib/types";
import { sha256 } from '$lib/utils';
import { PUBLIC_DOC_API_DOMAIN } from '$env/static/public';

export const hashPDFFile = async (pdfArrBuf: ArrayBuffer | Uint8Array): Promise<
	DocVerifyResult<{ file_hash: string }>
> => {
	try {
		const fileHash = await sha256(
			pdfArrBuf instanceof Uint8Array ?
				pdfArrBuf :
				Buffer.from(pdfArrBuf)
		);

		return [ true, { file_hash: fileHash } ];
	} catch (e) {
		return [ false, {
			err_cde: 5001,
			err_desc: 'Unable to hash original file',
			err_meta: e
		} ];
	}
};

export const fetchWithRetry = async<T extends object>(
	url: string,
	init?: RequestInit | undefined,
	onReceive?: ((jsn: any) => Promise<DocVerifyResult<T>>) | undefined,
): Promise<DocVerifyResult<T>> => {
	let attempt = 1;
	let err: ErrorInfo | undefined;

	while (attempt <= 3) {
		try {
			const res = await fetch(url, init);
			const jsn = await res.json();

			if (res.status > 300) {
				err = {
					err_cde: jsn?.err_cde ?? (res.status * 10),
					err_desc: (jsn?.msg ?? res.statusText) ?? 'Internal server error',
					err_meta: jsn
				};
				attempt += 1;
				continue;
			}

			if (onReceive) {
				return await onReceive(jsn);
			}

			return [ true, jsn as T ];
		} catch (e) {
			err = {
				err_cde: 5002,
				err_desc: 'Unable to fetch confirmation',
				err_meta: e
			};
			attempt += 1;
			continue;
		}
	}

	return [ false, err ?? {
		err_cde: 5055,
		err_desc: 'Unable to fetch confirmation',
		err_meta: {}
	} ];
}

export const fetchMetadataFromServer = async (
	sign_method: string,
	request_code: string,
	file_hash: string | null,
	tstToken: string
): Promise<DocVerifyResult<FetchMetadataFromServerResult>> => {
	return await fetchWithRetry<FetchMetadataFromServerResult>(
		`https://${PUBLIC_DOC_API_DOMAIN}/doc-gen/verify`,
		{
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				request_code,
				sign_method,
				'cf-turnstile-response': tstToken
			}),
		},
		async (
			jsn: GeneralObject
		): Promise<DocVerifyResult<FetchMetadataFromServerResult>> => {
			const respRes = {
				req_id: jsn.req_id as string,
				sign_method: jsn.sign_method as string,
				tmpl_name: jsn.tmpl_name as string,
				input_data: jsn.input_data as GeneralObject,
				req_from: jsn.req_from as string,
				gen_at: new Date(jsn.gen_at as string),
				signing_info: jsn.signing_info as GeneralObject,
				preview_png: jsn.preview_png as string,
				file_hash: jsn.file_hash as string,
			};

			if (file_hash && respRes.file_hash !== file_hash) {
				return [ false, {
					err_cde: 4123,
					err_desc: 'Record\'s file hash unmatch with the original file hash',
					err_meta: {
						respRes,
						file_hash
					}
				} ];
			}

			return [ true, respRes ];
		}
	);
};

export const fetchDocCerts = async (): Promise<DocVerifyResult<{
	[key: string]: CertInfo
}>> => {
	return await fetchWithRetry<{
		[key: string]: CertInfo
	}>(
		'https://raw.githubusercontent.com/itpcc/docs-verify-rachasak-org-public-keys/main/public/art28-keys.json'
	);
};


import type {
	DocVerifyResult,
	FetchMetadataFromServerResult,
	CertInfo,
	DocVrfRes,
} from "$lib/types";
import verifyPDF from 'pdf-signature-reader';
import { extractSignature } from 'pdf-signature-reader/helpers';
import { Buffer } from 'buffer';
import { pki } from 'node-forge';
import {
	fetchDocCerts,
	hashPDFFile,
	fetchMetadataFromServer
} from '$lib/worker-common';

export const verifyArticle28Signature = async (
	pdfArrBuf: ArrayBuffer,
	tstToken: string
) => {
	try {
		const [
			signatureRes,
			certRes,
			fileHashRes
		] = await Promise.all([
			(async() => {
				const signedPdfBuffer = Buffer.from(pdfArrBuf);

				const [ signatures, rawSignature ] = await Promise.all([
					verifyPDF(signedPdfBuffer)?.signatures as
						{ [key: string]: any } | undefined,
					extractSignature(signedPdfBuffer)
				]);

				if (! signatures || signatures?.length < 1) {
					return [ false, {
						err_cde: 4040,
						err_desc: 'No signature found',
						err_meta: signatures
					} ];
				}

				return [ true, { signatures, rawSignature } ];
			})().catch(e => [ false, {
				err_cde: 4041,
				err_desc: 'Unable to fetch signature from the PDF file',
				err_meta: e
			}]) as Promise<DocVerifyResult<{
				signatures?: {
					meta: {
						certs: {
							pemCertificate: string,
							[key: string]: any
						}[],
						[key: string]: any
					},
					[key: string]: any
				}[],
				rawSignature: {
					signedData: Uint8Array[]
					[key: string]: any
				}
			}>>,
			fetchDocCerts(),
			hashPDFFile(pdfArrBuf),
		]);

		if (
			! signatureRes[0] ||
			! certRes[0] ||
			! fileHashRes[0] ||
			! signatureRes[1].signatures
		) return {
			ok: false,
			signatureRes,
			certRes,
			fileHashRes,
			verifiedInfo: null,
			signatureMeta: null,
			docVrf: null,
		};

		const { rawSignature } = signatureRes[1];
		const certList = certRes[1];

		// Verify cert from List of CA
		const verifiedInfo = signatureRes[1].signatures.map(({ meta: { certs } }) =>
			Object.entries(certList).reduce((verifyRes, [ certKey, certInfo ]) => {
				let caStore = pki.createCaStore();
				Object.entries(certInfo.certificate).forEach(([ _certType, certPEM ]) => {
					caStore.addCertificate(certPEM);
				});

				certs.forEach((sigCrt, i) => {
					try {
						const sigPem = pki.certificateFromPem(sigCrt.pemCertificate);

						if (pki.verifyCertificateChain(caStore, [ sigPem ])) {
							verifyRes[certKey] = {
								sigCrt: sigCrt,
								i
							};
						}
					} catch (e) {
						console.log('caRes E', certKey, i, e);
					}
				});

				return verifyRes;
			}, {} as { [key: string]: {
				sigCrt: any,
				i: number,
				[key: string]: any
			} })
		)?.[0];

		// * The library's intepretation of the signature's metadata is problematic
		//     with the special characters. So we need to do it our own
		const signatureMeta = rawSignature.signedData.map((signedData: Uint8Array) => {
			return Object.fromEntries(Object.entries({
				reason: 'Reason',
				contactInfo: 'ContactInfo',
				location: 'Location',
				name: 'Name',
			}).map(([ metaKey, metaPDFKeyword ]) => {
				const signedStr = signedData.toString();
				// const regex = new RegExp(''/Location\\s*\\(([\\w.\\s@,]*)`, 'g');
				// const matches = /\n\/Location\s*\((.*)\)\n/gi
				const matches = (new RegExp(`\\n\/${metaPDFKeyword}\\s*\\((.*)\\)\\n`, 'gi')).exec(signedStr);

				return [
					metaKey,
					matches && matches?.index >= 2
						? matches[1].replaceAll(
							/\\0(\d{2})/g,
							(_str, i) => decodeURIComponent(`%${parseInt(i, 8).toString(16)}`)
						)
						: null
				];
			}));
		})?.[0] as {
			reason?: string,
			contactInfo?: string,
			location?: string,
			name?: string,
		} | undefined;

		if (! verifiedInfo || ! signatureMeta || ! signatureMeta.location) return {
			ok: false,
			signatureRes,
			certRes,
			fileHashRes,
			verifiedInfo,
			signatureMeta: null,
			docVrf: null,
		};

		// * Fetch from docVrf
		const url = new URL(signatureMeta.location);
		const requestCode = url.searchParams.get('c');
		const signMethod = url.searchParams.get('s');

		if (! requestCode || signMethod === null) return {
			ok: false,
			signatureRes,
			certRes,
			fileHashRes,
			verifiedInfo,
			signatureMeta,
			docVrf: null
		};

		const docVrf = await fetchMetadataFromServer(
			signMethod,
			requestCode,
			fileHashRes[1].file_hash,
			tstToken
		);

		return {
			ok: docVrf[0],
			signatureRes,
			certRes,
			fileHashRes,
			verifiedInfo,
			signatureMeta,
			docVrf
		};
	} catch (e) {
		return null;
	}
};

export const article28VrfInfo = (
	docVrf: FetchMetadataFromServerResult | undefined,
	certInfo: CertInfo | undefined
): DocVrfRes => {
	return {
		articleType: 28,
		dclrText: certInfo ?
			`คำขอรับใบรับรองอิเล็กทรอนิกส์ ${certInfo.authoriser_name} เลขที่ ${certInfo.cert_request_id} ลงวันที่ ${certInfo.cert_request_date}` :
			'-ไม่ทราบ-',
		docImg: docVrf ? (docVrf?.preview_png) : undefined,
		vrfInfo: [
			{
				header: 'รหัสเอกสาร',
				detail: docVrf?.signing_info?.request_code as string ?? '-ไม่ทราบ-',
				asHTML: false,
				icon: 'id-badge'
			},
			{
				header: 'ประเภทเอกสาร',
				detail: docVrf?.tmpl_name ?? '-ไม่ทราบ-',
				asHTML: false,
				icon: 'book'
			},
			{
				header: 'วันเวลาสร้างเอกสาร',
				detail: (
					(docVrf?.signing_info?.gen_at) ?
						(new Date(docVrf?.signing_info?.gen_at as string)) :
						docVrf?.gen_at
				)?.toLocaleString('th-TH') ?? '-ไม่ทราบ-',
				asHTML: false,
				icon: 'calendar-days'
			},
			{
				header: 'วันเวลารับรองเอกสาร',
				detail: docVrf?.signing_info?.sign_at as string ?? '-ไม่ทราบ-',
				asHTML: false,
				icon: 'stamp'
			},
			{
				header: 'วิธีรับรองเอกสาร',
				detail: certInfo ?
					`ใบรับรองอิเล็กทรอนิกส์ ออกโดย ${certInfo.authoriser_name} เลขที่ ${certInfo.cert_request_id} ลงวันที่ ${certInfo.cert_request_date}` :
					'-ไม่ทราบ-',
				asHTML: false,
				icon: 'pen-nib'
			},
			{
				header: 'ชื่อผู้ลงนามตามใบรับรอง',
				detail: docVrf?.signing_info?.signer_name as string ?? '-ไม่ทราบ-',
				asHTML: false,
				icon: 'user'
			},
			{
				header: 'ชื่อจำเพาะของใบรับรอง',
				detail: docVrf?.signing_info?.distinguished_name as string ?? '-ไม่ทราบ-',
				asHTML: false,
				icon: 'clipboard'
			},
			{
				header: 'ประเภทขั้นตอนวิธีในการลงนาม',
				detail: docVrf?.signing_info?.sign_algo as string ?? '-ไม่ทราบ-',
				asHTML: false,
				icon: 'code'
			},
		]
	};
};